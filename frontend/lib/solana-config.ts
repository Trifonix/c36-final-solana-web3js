import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";

export const SOLANA_NETWORK = WalletAdapterNetwork.Devnet;

export const NETWORK_LABELS: Record<WalletAdapterNetwork, string> = {
  [WalletAdapterNetwork.Devnet]: "Devnet",
  [WalletAdapterNetwork.Testnet]: "Testnet",
  [WalletAdapterNetwork.Mainnet]: "Mainnet",
};
