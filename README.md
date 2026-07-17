# Solana Counter dApp

Учебное dApp на Solana: Anchor-программа управляет общим счётчиком, а интерфейс на Next.js подключает браузерный кошелёк и отправляет транзакции.

- `Increment` увеличивает счётчик и переводит `0.001 SOL` в персональный Vault PDA пользователя.
- `Decrement` уменьшает счётчик и возвращает `0.001 SOL`.
- Состояние обновляется в реальном времени через подписку.

Проект предназначен только для обучения и настроен на **Solana Devnet**.

## Стек

Anchor, Rust, Solana Web3.js, Next.js 15, React 19, TypeScript, Tailwind CSS и Wallet Adapter.

## Структура

```text
program/   — Anchor-программа и интеграционные тесты
frontend/  — веб-интерфейс и IDL программы
```

## Требования

- Node.js 18+ и pnpm
- Rust, Solana CLI и Anchor CLI
- браузерный Solana-кошелёк, переключённый на Devnet
- Yarn — только для `anchor test` согласно текущему `Anchor.toml`

## Запуск

Установите зависимости программы и разверните её в Devnet:

```bash
cd program
pnpm install
anchor build
anchor keys sync
anchor build
anchor deploy
cd ..
```

Кошелёк Solana CLI (`~/.config/solana/id.json`) должен иметь достаточно devnet SOL.

Скопируйте актуальный IDL и запустите интерфейс:

```bash
cp program/target/idl/counter.json frontend/anchor-idl/idl.json
cp program/target/types/counter.ts frontend/anchor-idl/idl.ts
cd frontend
pnpm install
pnpm dev
```

Приложение откроется по адресу [http://localhost:3000](http://localhost:3000). Переменные окружения не требуются.

## Деплой на Vercel

Next.js-приложение лежит в каталоге `frontend/`, поэтому в настройках проекта Vercel нужно указать:

- **Framework Preset:** Next.js
- **Root Directory:** `frontend`
- **Install Command / Build Command / Output Directory:** оставить по умолчанию

Без Root Directory = `frontend` деплой либо падает за пару секунд, либо отдаёт `404: NOT_FOUND`.

## Проверки

```bash
cd program
anchor test
pnpm lint

cd ../frontend
pnpm lint
pnpm build
```
