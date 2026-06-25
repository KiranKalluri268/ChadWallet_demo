import { Nav } from "@/components/nav";
import { TokenBanner } from "@/components/token-banner";
import { TradingPage } from "@/components/trading-page";
import { getTokenDetails, getTokenHolders, getTokenTrades, getTrendingTokens } from "@/lib/market-data";

export default async function TokenTradePage({ params }: { params: { tokenAddress: string } }) {
  const [tokens, token, holders, trades] = await Promise.all([
    getTrendingTokens(),
    getTokenDetails(params.tokenAddress),
    getTokenHolders(params.tokenAddress),
    getTokenTrades(params.tokenAddress)
  ]);

  return (
    <main className="min-h-screen bg-ink text-shell">
      <TokenBanner tokens={tokens} subtle />
      <div className="relative">
        <Nav />
      </div>
      <TradingPage tokens={tokens} token={token} holders={holders} trades={trades} />
      <TokenBanner tokens={tokens} reverse />
    </main>
  );
}
