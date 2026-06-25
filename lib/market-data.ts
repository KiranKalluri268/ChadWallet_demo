import { demoHolders, demoTokens, demoTrades, SOL_MINT } from "@/lib/demo-data";
import type { Holder, QuoteInput, Token, Trade } from "@/lib/types";

const birdEyeBase = "https://public-api.birdeye.so";

async function birdEyeFetch<T>(path: string): Promise<T | null> {
  const apiKey = process.env.BIRDEYE_API_KEY;

  if (!apiKey) {
    return null;
  }

  try {
    const response = await fetch(`${birdEyeBase}${path}`, {
      headers: {
        "X-API-KEY": apiKey,
        "x-chain": "solana"
      },
      next: { revalidate: 30 }
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function getTrendingTokens(): Promise<Token[]> {
  const result = await birdEyeFetch<{
    data?: {
      tokens?: Array<{
        address: string;
        symbol: string;
        name: string;
        price?: number;
        price24hChangePercent?: number;
        volume24hUSD?: number;
        mc?: number;
        liquidity?: number;
        holder?: number;
        decimals?: number;
        logoURI?: string;
      }>;
    };
  }>("/defi/token_trending?sort_by=rank&sort_type=asc&offset=0&limit=12");

  const liveTokens = result?.data?.tokens?.map((token) => ({
    address: token.address,
    symbol: token.symbol,
    name: token.name,
    price: token.price ?? 0,
    change24h: token.price24hChangePercent ?? 0,
    volume24h: token.volume24hUSD ?? 0,
    marketCap: token.mc ?? 0,
    liquidity: token.liquidity ?? 0,
    holders: token.holder ?? 0,
    decimals: token.decimals ?? 6,
    image: token.logoURI
  }));

  return liveTokens?.length ? liveTokens : demoTokens;
}

export async function getTokenDetails(tokenAddress: string): Promise<Token> {
  const trending = await getTrendingTokens();
  const match = trending.find((token) => token.address === tokenAddress);

  if (match) {
    return match;
  }

  const result = await birdEyeFetch<{
    data?: {
      address: string;
      symbol: string;
      name: string;
      price?: number;
      priceChange24hPercent?: number;
      v24hUSD?: number;
      mc?: number;
      liquidity?: number;
      holder?: number;
      decimals?: number;
      logoURI?: string;
    };
  }>(`/defi/token_overview?address=${tokenAddress}`);

  if (result?.data) {
    return {
      address: result.data.address,
      symbol: result.data.symbol,
      name: result.data.name,
      price: result.data.price ?? 0,
      change24h: result.data.priceChange24hPercent ?? 0,
      volume24h: result.data.v24hUSD ?? 0,
      marketCap: result.data.mc ?? 0,
      liquidity: result.data.liquidity ?? 0,
      holders: result.data.holder ?? 0,
      decimals: result.data.decimals ?? 6,
      image: result.data.logoURI
    };
  }

  return demoTokens[0];
}

export async function getTokenHolders(tokenAddress: string): Promise<Holder[]> {
  const result = await birdEyeFetch<{
    data?: {
      items?: Array<{ owner: string; amount: number; uiAmount?: number; valueUsd?: number; percentage?: number }>;
    };
  }>(`/defi/v3/token/holder?address=${tokenAddress}&offset=0&limit=10`);

  const holders = result?.data?.items?.map((holder) => ({
    owner: `${holder.owner.slice(0, 4)}...${holder.owner.slice(-4)}`,
    amount: holder.uiAmount ?? holder.amount,
    valueUsd: holder.valueUsd ?? 0,
    share: holder.percentage ?? 0
  }));

  return holders?.length ? holders : demoHolders;
}

export async function getTokenTrades(tokenAddress: string): Promise<Trade[]> {
  const result = await birdEyeFetch<{
    data?: {
      items?: Array<{
        txHash: string;
        side: "buy" | "sell";
        owner: string;
        amount: number;
        volumeUSD: number;
        blockUnixTime: number;
      }>;
    };
  }>(`/defi/txs/token?address=${tokenAddress}&offset=0&limit=12&tx_type=swap`);

  const trades = result?.data?.items?.map((trade) => ({
    id: trade.txHash,
    side: trade.side,
    wallet: `${trade.owner.slice(0, 4)}...${trade.owner.slice(-4)}`,
    amount: trade.amount,
    valueUsd: trade.volumeUSD,
    timestamp: new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
      Math.round((trade.blockUnixTime * 1000 - Date.now()) / 60000),
      "minute"
    )
  }));

  return trades?.length ? trades : demoTrades;
}

export async function getJupiterQuote({ inputMint, outputMint, amount }: QuoteInput) {
  const base = process.env.NEXT_PUBLIC_JUPITER_API_BASE || "https://quote-api.jup.ag/v6";

  try {
    const query = new URLSearchParams({
      inputMint,
      outputMint,
      amount: String(amount),
      slippageBps: "100"
    });
    const response = await fetch(`${base}/quote?${query}`, { next: { revalidate: 10 } });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch {
    return null;
  }
}

export { SOL_MINT };
