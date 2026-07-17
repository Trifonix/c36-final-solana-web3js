"use client";

import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  ExtensionType,
  TOKEN_2022_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createInitializeMetadataPointerInstruction,
  createInitializeMintInstruction,
  createMintToInstruction,
  getAssociatedTokenAddressSync,
  getMintLen,
} from "@solana/spl-token";
import {
  createInitializeInstruction,
  pack,
  type TokenMetadata,
} from "@solana/spl-token-metadata";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";

import { formatError } from "@/lib/format-error";

const TOKEN_DECIMALS = 9;
const TOKEN_SYMBOL = "CVT";
const TOKEN_URI = "";
const MAX_TOKEN_AMOUNT = 18_446_744_073_709_551_615n;

type CreationResult = {
  mint: string;
  signature: string;
};

function parseTokenAmount(value: string): bigint {
  const normalized = value.trim();
  const match = normalized.match(/^(0|[1-9]\d*)(?:\.(\d{1,9}))?$/);

  if (!match) {
    throw new Error(
      `Введите положительное число, используя не более ${TOKEN_DECIMALS} знаков после точки.`
    );
  }

  const scale = 10n ** BigInt(TOKEN_DECIMALS);
  const fraction = (match[2] ?? "").padEnd(TOKEN_DECIMALS, "0");
  const amount = BigInt(match[1]) * scale + BigInt(fraction || "0");

  if (amount <= 0n) {
    throw new Error("Количество токенов должно быть больше нуля.");
  }

  if (amount > MAX_TOKEN_AMOUNT) {
    throw new Error("Количество токенов превышает допустимый лимит.");
  }

  return amount;
}

function withDevnetHint(message: string): string {
  if (/insufficient|0x1|нехват|balance|funds/i.test(message)) {
    return `${message} Убедитесь, что на кошельке есть Devnet SOL.`;
  }

  return message;
}

export function CreateTokenForm() {
  const { connection } = useConnection();
  const { connected, publicKey, sendTransaction } = useWallet();
  const [tokenName, setTokenName] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<CreationResult | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setResult(null);

    if (!publicKey) {
      setErrorMessage("Сначала подключите Solana-кошелёк.");
      return;
    }

    const name = tokenName.trim();

    if (!name) {
      setErrorMessage("Введите название токена.");
      return;
    }

    if (name.length > 32) {
      setErrorMessage("Название токена должно содержать не более 32 символов.");
      return;
    }

    try {
      setIsLoading(true);
      const mintAmount = parseTokenAmount(amount);
      const mintKeypair = Keypair.generate();
      const mint = mintKeypair.publicKey;

      const metadata: TokenMetadata = {
        updateAuthority: publicKey,
        mint,
        name,
        symbol: TOKEN_SYMBOL,
        uri: TOKEN_URI,
        additionalMetadata: [],
      };
      const metadataBytes = pack(metadata);

      const mintSpace = getMintLen([ExtensionType.MetadataPointer]);
      const fullMintSpace = getMintLen([ExtensionType.MetadataPointer], {
        [ExtensionType.TokenMetadata]: metadataBytes.length,
      });
      const lamports =
        await connection.getMinimumBalanceForRentExemption(fullMintSpace);
      const associatedTokenAccount = getAssociatedTokenAddressSync(
        mint,
        publicKey,
        false,
        TOKEN_2022_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      const transaction = new Transaction();

      // 1. Создаём аккаунт минта: место только под MetadataPointer,
      // а рента рассчитана с учётом будущих TokenMetadata.
      transaction.add(
        SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: mint,
          space: mintSpace,
          lamports,
          programId: TOKEN_2022_PROGRAM_ID,
        })
      );

      // 2. Инициализируем MetadataPointer на метаданные внутри самого минта.
      transaction.add(
        createInitializeMetadataPointerInstruction(
          mint,
          publicKey,
          mint,
          TOKEN_2022_PROGRAM_ID
        )
      );

      // 3. Инициализируем Token-2022 mint без freeze authority.
      transaction.add(
        createInitializeMintInstruction(
          mint,
          TOKEN_DECIMALS,
          publicKey,
          null,
          TOKEN_2022_PROGRAM_ID
        )
      );

      // 4. Записываем имя, символ и URI в TokenMetadata минта.
      transaction.add(
        createInitializeInstruction({
          programId: TOKEN_2022_PROGRAM_ID,
          metadata: mint,
          updateAuthority: publicKey,
          mint,
          mintAuthority: publicKey,
          name,
          symbol: TOKEN_SYMBOL,
          uri: TOKEN_URI,
        })
      );

      // 5. Создаём ATA владельца с явно указанной Token-2022 программой.
      transaction.add(
        createAssociatedTokenAccountInstruction(
          publicKey,
          associatedTokenAccount,
          publicKey,
          mint,
          TOKEN_2022_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        )
      );

      // 6. Выпускаем указанное количество токенов на созданный ATA.
      transaction.add(
        createMintToInstruction(
          mint,
          associatedTokenAccount,
          publicKey,
          mintAmount,
          [],
          TOKEN_2022_PROGRAM_ID
        )
      );

      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash("confirmed");
      transaction.feePayer = publicKey;
      transaction.recentBlockhash = blockhash;

      const signature = await sendTransaction(transaction, connection, {
        signers: [mintKeypair],
        skipPreflight: true,
        preflightCommitment: "confirmed",
      });
      const confirmation = await connection.confirmTransaction(
        { signature, blockhash, lastValidBlockHeight },
        "confirmed"
      );

      if (confirmation.value.err) {
        throw new Error(
          `Транзакция отклонена: ${JSON.stringify(confirmation.value.err)}`
        );
      }

      const mintAccount = await connection.getAccountInfo(mint, "confirmed");

      if (!mintAccount || !mintAccount.owner.equals(TOKEN_2022_PROGRAM_ID)) {
        throw new Error("Созданный mint не найден в Devnet.");
      }

      setResult({ mint: mint.toBase58(), signature });
      toast.success("Токен создан и выпущен", {
        description: mint.toBase58(),
        duration: 8000,
      });
    } catch (error) {
      const message = withDevnetHint(formatError(error));
      setErrorMessage(message);
      toast.error("Не удалось создать токен", {
        description: message,
        duration: 8000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1.5">
          <label
            className="block text-sm font-bold text-slate-800"
            htmlFor="token-name"
          >
            Имя токена
          </label>
          <input
            id="token-name"
            type="text"
            maxLength={32}
            value={tokenName}
            onChange={(event) => setTokenName(event.target.value)}
            disabled={isLoading}
            placeholder="Мой токен"
            autoComplete="off"
            className="h-11 w-full rounded-md border-2 border-slate-300 bg-white px-3 text-slate-950 outline-none placeholder:text-slate-500 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20 disabled:opacity-60"
          />
        </div>

        <div className="space-y-1.5">
          <label
            className="block text-sm font-bold text-slate-800"
            htmlFor="token-amount"
          >
            Количество
          </label>
          <input
            id="token-amount"
            type="number"
            min="0"
            step="0.000000001"
            inputMode="decimal"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            disabled={isLoading}
            placeholder="1000"
            className="h-11 w-full rounded-md border-2 border-slate-300 bg-white px-3 text-slate-950 outline-none placeholder:text-slate-500 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20 disabled:opacity-60"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !connected}
          className="flex h-11 w-full items-center justify-center rounded-md bg-emerald-700 px-4 text-sm font-bold text-white shadow-md transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "Создание и выпуск…" : "Создать и выпустить токен"}
        </button>
      </form>

      <p className="mt-3 text-xs leading-5 text-slate-700">
        Только Devnet. Для комиссии нужны Devnet SOL:{" "}
        <a
          href="https://faucet.solana.com"
          target="_blank"
          rel="noreferrer"
          className="font-bold text-emerald-800 underline underline-offset-2"
        >
          получить в кране
        </a>
        .
      </p>

      {errorMessage && (
        <p
          role="alert"
          className="mt-3 rounded-md border border-red-300 bg-red-50 p-3 text-sm font-medium text-red-900"
        >
          {errorMessage}
        </p>
      )}

      {result && (
        <div className="mt-3 space-y-2 rounded-md border border-emerald-300 bg-emerald-50 p-3 text-sm text-slate-900">
          <p className="font-bold text-emerald-900">Токен создан</p>
          <p className="break-all font-mono text-xs">{result.mint}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <a
              href={`https://explorer.solana.com/address/${result.mint}?cluster=devnet`}
              target="_blank"
              rel="noreferrer"
              className="font-bold text-emerald-800 underline"
            >
              Адрес в Explorer
            </a>
            <a
              href={`https://explorer.solana.com/tx/${result.signature}?cluster=devnet`}
              target="_blank"
              rel="noreferrer"
              className="font-bold text-emerald-800 underline"
            >
              Транзакция
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
