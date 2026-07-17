# Промпт: Реализовать создание и минт Token-2022 (Devnet) с MetadataPointer

Используй этот промпт, чтобы с нуля реализовать фичу «Create Token-2022». Скопируй весь блок ниже для ИИ/разработчика.

---

## Задача

Реализовать сценарий **создания и минта Token-2022** в **Devnet** в существующем приложении на Next.js с подключением кошелька Solana.

### Интерфейс

- Форма с двумя полями:
  - **Token Name** (текст)
  - **Amount** (число)
- Кнопка: **«Create & Mint Token»**
- Пока транзакция выполняется — показывать состояние загрузки (например, неактивная кнопка и текст «Creating & minting…»).
- При успехе: показать **адрес нового минта** и ссылку в **Solana Explorer (Devnet)** на этот адрес и на **подпись транзакции**.
- При ошибке: показывать понятное пользователю сообщение (никогда не выводить `[object Object]`; приводить ошибки к строке).
- Добавить короткое предупреждение, что приложение работает в **Devnet** и пользователю нужны **Devnet SOL** (ссылка на faucet.solana.com).

### Логика транзакции

Использовать **@solana/web3.js**, **@solana/spl-token** и **@solana/spl-token-metadata** (для метаданных). **connection** и **sendTransaction** брать из **useConnection()** и **useWallet()**.

**Важные детали реализации (соблюдать строго, чтобы избежать типичных ошибок):**

1. **Размер и рента аккаунта минта**
   - Создавать **аккаунт минта** с **space = только MetadataPointer**:  
     `getMintLen([ExtensionType.MetadataPointer])`.  
     Это нужно, чтобы **InitializeMint** не падал с `InvalidAccountData` (программа проверяет, что длина аккаунта совпадает с текущим набором расширений).
   - **Lamports** для этого аккаунта должны быть рассчитаны на **полный** размер (MetadataPointer + TokenMetadata), чтобы после расширения минта в **Initialize TokenMetadata** аккаунт оставался rent-exempt.  
     Полный размер:  
     `getMintLen([ExtensionType.MetadataPointer], { [ExtensionType.TokenMetadata]: metadataBytes.length })`  
     и для **lamports** в **createAccount** использовать **getMinimumBalanceForRentExemption(fullMintSpace)**.  
     **Не** передавать TokenMetadata в первом аргументе getMintLen (расширение переменной длины, тип 19, указывать только во втором аргументе).

2. **Сборка транзакции**
   - Перед отправкой задать **transaction.feePayer** и **transaction.recentBlockhash** (например, из **connection.getLatestBlockhash("confirmed")**). Иначе кошелёк может выбросить «Transaction recentBlockhash required».
   - Передавать **keypair минта** в **signers** в опциях **sendTransaction**, чтобы адаптер подписал его после **prepareTransaction** (рекомендуется). При нестабильной симуляции на Devnet использовать **skipPreflight: true**.

3. **Associated Token Account (ATA) для Token-2022**
   - Считать ATA с программой **Token-2022**:  
     **getAssociatedTokenAddressSync(mint, owner, false, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID)**.
   - **Не** использовать **createAssociatedTokenAccountIdempotentInstructionWithDerivation**: внутри вызывается **getAssociatedTokenAddressSync** без **programId**, поэтому адрес получается для **legacy** Token program и для минтов Token-2022 возникает **InvalidSeeds**.
   - **Рекомендуемый способ:** использовать **createAssociatedTokenAccountInstruction(payer, ata, owner, mint, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID)** с **заранее посчитанным** адресом ATA (из пункта выше). Импортировать именно **createAssociatedTokenAccountInstruction** из **@solana/spl-token** — в ряде сборок/окружений вариант **createAssociatedTokenAccountIdempotentInstruction** может не экспортироваться из пакета и давать ошибку «is not defined».
   - Альтернатива: вручную собрать инструкцию CreateAssociatedTokenAccount (ключи: payer, associatedToken, owner, mint, SystemProgram, tokenProgramId; programId: ASSOCIATED_TOKEN_PROGRAM_ID; data: Buffer.from([1]) для идемпотентности).

4. **Порядок инструкций в транзакции**
   - CreateAccount (минт; space = только MetadataPointer; lamports = рента на полный размер).
   - Initialize MetadataPointer (mint, authority, mint).
   - Initialize Mint (decimals, mint authority, без freeze authority).
   - Initialize TokenMetadata (name, symbol, uri) через **createInitializeInstruction** из **@solana/spl-token-metadata** с **programId: TOKEN_2022_PROGRAM_ID**.
   - Create ATA (с корректным адресом и программой Token-2022).
   - MintTo (mint, ATA, authority, amount; TOKEN_2022_PROGRAM_ID).

5. **Подтверждение и UX**
   - После **sendTransaction** подтверждать через **connection.confirmTransaction**, используя **blockhash** и **lastValidBlockHeight** из **getLatestBlockhash**.
   - По желанию проверять **getSignatureStatus** и **getAccountInfo(mint)** перед показом успеха.
   - Показывать **toast** при успехе; при ошибках в духе **InsufficientFunds** добавлять подсказку, что приложение в Devnet и нужно использовать faucet.solana.com.

### Зависимости

- Добавить в фронтенд **@solana/spl-token** и **@solana/spl-token-metadata**.
- Использовать **TOKEN_2022_PROGRAM_ID** и **ASSOCIATED_TOKEN_PROGRAM_ID** из **@solana/spl-token** там, где нужно.

### Комментарии в коде

Добавить краткие комментарии к каждому шагу: создание аккаунта минта, Initialize MetadataPointer, Initialize Mint, Initialize TokenMetadata, создание ATA, Mint To.

---

## Чеклист

- [ ] Минт создаётся с **space** = только MetadataPointer, **lamports** = рента на полный размер (MetadataPointer + TokenMetadata).
- [ ] В **getMintLen** для переменной длины: **ExtensionType.TokenMetadata** только во втором аргументе **variableLengthExtensions**, не в массиве типов расширений.
- [ ] **transaction.feePayer** и **transaction.recentBlockhash** заданы перед отправкой.
- [ ] Keypair минта передаётся в **signers** в опциях **sendTransaction**.
- [ ] ATA считается через **getAssociatedTokenAddressSync(..., TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID)** и создаётся через **createAssociatedTokenAccountInstruction** с этим адресом (не IdempotentInstructionWithDerivation и не полагаться на IdempotentInstruction из корня пакета — возможна ошибка «is not defined»).
- [ ] В UI есть предупреждение про Devnet и ссылка на кран; понятные сообщения об ошибках и ссылки на Explorer при успехе.
