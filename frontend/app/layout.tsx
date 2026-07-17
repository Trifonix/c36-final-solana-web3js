import "./globals.css";
import "@solana/wallet-adapter-react-ui/styles.css";

import { Geist, Geist_Mono } from "next/font/google";

import type { Metadata } from "next";
import { SolanaProvider } from "@/components/counter/provider/Solana";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Solana Counter App",
  description: "Учебный интерфейс для Anchor-счётчика на Solana",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-slate-50 text-slate-950 antialiased`}
      >
        <SolanaProvider>
          {children}
          <Toaster
            position="bottom-right"
            theme="light"
            closeButton
            richColors={false}
            toastOptions={{
              style: {
                background: "#ffffff",
                color: "#0f172a",
                border: "1px solid #cbd5e1",
                borderRadius: "0.5rem",
                padding: "0.75rem 1rem",
                boxShadow: "0 10px 30px -3px rgba(15, 23, 42, 0.18)",
              },
              className: "toast-container",
            }}
          />
        </SolanaProvider>
      </body>
    </html>
  );
}
