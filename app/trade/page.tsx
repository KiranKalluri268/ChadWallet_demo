import { redirect } from "next/navigation";
import { getTrendingTokens } from "@/lib/market-data";

export default async function TradeIndex() {
  const tokens = await getTrendingTokens();
  redirect(`/trade/${tokens[0].address}`);
}
