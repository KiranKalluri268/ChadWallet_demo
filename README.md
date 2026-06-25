# ChadWallet Demo

A polished Next.js + Tailwind preview for ChadWallet: FOMO-style landing page, rotating Solana token banners, Privy sign-in shell, and a lightweight trading page powered by live data when keys are available.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Privy auth shell
- BirdEye market-data adapters with curated fallback data
- Jupiter quote API bridge
- Vercel-ready deployment

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment

Copy `.env.example` to `.env.local` and fill in the keys available for the preview:

```bash
NEXT_PUBLIC_PRIVY_APP_ID=
NEXT_PUBLIC_PRIVY_LOGIN_METHODS=email
BIRDEYE_API_KEY=
ALCHEMY_SOLANA_RPC_URL=
NEXT_PUBLIC_JUPITER_API_BASE=https://quote-api.jup.ag/v6
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

The app still works without keys by using curated Solana meme-token fallback data.

To enable Google or Apple login, first enable the matching OAuth provider in the Privy dashboard for this app, then set:

```bash
NEXT_PUBLIC_PRIVY_LOGIN_METHODS=google,apple,email
```

## Routes

- `/` - ChadWallet landing page.
- `/trade` - redirects to the first trending token.
- `/trade/[tokenAddress]` - token-specific trading view.

## Deploy

Deploy the repository to Vercel, add the same environment variables in Project Settings, and publish the generated preview URL.
