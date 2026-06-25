export type Token = {
  address: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  liquidity: number;
  holders: number;
  decimals: number;
  image?: string;
};

export type Holder = {
  owner: string;
  amount: number;
  valueUsd: number;
  share: number;
};

export type Trade = {
  id: string;
  side: "buy" | "sell";
  wallet: string;
  amount: number;
  valueUsd: number;
  timestamp: string;
};

export type QuoteInput = {
  inputMint: string;
  outputMint: string;
  amount: number;
};
