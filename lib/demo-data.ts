import type { Holder, Token, Trade } from "@/lib/types";

export const SOL_MINT = "So11111111111111111111111111111111111111112";

export const demoTokens: Token[] = [
  {
    address: "DezXAZ8z7PnrnRJjz3hUFKXKqAkJ1VdJDbYpPB2639p",
    symbol: "BONK",
    name: "Bonk",
    price: 0.000021,
    change24h: 18.4,
    volume24h: 49200000,
    marketCap: 1540000000,
    liquidity: 18500000,
    holders: 824100,
    decimals: 5
  },
  {
    address: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLJpq9Kk2pump",
    symbol: "WIF",
    name: "dogwifhat",
    price: 1.87,
    change24h: 9.8,
    volume24h: 87300000,
    marketCap: 1870000000,
    liquidity: 42100000,
    holders: 196500,
    decimals: 6
  },
  {
    address: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
    symbol: "JUP",
    name: "Jupiter",
    price: 0.84,
    change24h: -2.1,
    volume24h: 65800000,
    marketCap: 1130000000,
    liquidity: 53500000,
    holders: 687200,
    decimals: 6
  },
  {
    address: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgS5u",
    symbol: "SAMO",
    name: "Samoyedcoin",
    price: 0.0063,
    change24h: 14.2,
    volume24h: 7800000,
    marketCap: 26200000,
    liquidity: 2100000,
    holders: 75800,
    decimals: 9
  },
  {
    address: "HhJpBhKYe3H9pLMLYtF4Y7N7N9Q3SdrJhj5M5PQEbonk",
    symbol: "CHAD",
    name: "Chad Index",
    price: 0.0047,
    change24h: 36.5,
    volume24h: 15300000,
    marketCap: 47000000,
    liquidity: 6200000,
    holders: 42800,
    decimals: 6
  }
];

export const demoHolders: Holder[] = [
  { owner: "8k3a...9QrP", amount: 21840000, valueUsd: 45864, share: 4.8 },
  { owner: "Bv12...mE2s", amount: 18890000, valueUsd: 39669, share: 4.1 },
  { owner: "H7dn...p91A", amount: 14220000, valueUsd: 29862, share: 3.3 },
  { owner: "3xLc...Qa8w", amount: 9700000, valueUsd: 20370, share: 2.4 }
];

export const demoTrades: Trade[] = [
  { id: "1", side: "buy", wallet: "7Fs9...km2A", amount: 822000, valueUsd: 1726, timestamp: "just now" },
  { id: "2", side: "sell", wallet: "AvP4...19zQ", amount: 310000, valueUsd: 651, timestamp: "14s ago" },
  { id: "3", side: "buy", wallet: "Fr22...Mt7L", amount: 1260000, valueUsd: 2646, timestamp: "31s ago" },
  { id: "4", side: "buy", wallet: "9Qbk...A8pR", amount: 475000, valueUsd: 998, timestamp: "47s ago" },
  { id: "5", side: "sell", wallet: "Gp01...zV5n", amount: 190000, valueUsd: 399, timestamp: "1m ago" }
];
