import Image from "next/image";
import { Bell, ChartCandlestick, ShieldCheck, Sparkles, Users, Zap } from "lucide-react";
import { Nav } from "@/components/nav";
import { StoreButtons } from "@/components/store-buttons";
import { TokenBanner } from "@/components/token-banner";
import { getTrendingTokens } from "@/lib/market-data";
import { formatCompact } from "@/lib/format";

const features = [
  { icon: Users, label: "Social Trading", text: "Watch what top Solana traders are buying in real time." },
  { icon: Zap, label: "Trade Instantly", text: "Jump from trend discovery to token action in seconds." },
  { icon: ChartCandlestick, label: "Research Smarter", text: "Token analytics, live trades, holders, and launch signals in one flow." },
  { icon: ShieldCheck, label: "Self Custody", text: "Fast onboarding while keeping ownership of your crypto." },
  { icon: Bell, label: "Real Alerts", text: "Never miss the tokens moving across the ChadWallet feed." },
  { icon: Sparkles, label: "Meme Native", text: "Built for launches, KOL moves, and the speed of Solana culture." }
];

export default async function Home() {
  const tokens = await getTrendingTokens();
  const leader = tokens[0];

  return (
    <main className="min-h-screen bg-ink text-shell">
      <Nav />
      <section className="relative overflow-hidden">
        <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-acid/30 bg-acid/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-acid">
              Solana, all in one app
            </div>
            <h1 className="text-5xl font-black leading-[0.92] text-white sm:text-7xl lg:text-8xl">
              ChadWallet
              <span className="block text-acid">catches memes early.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/72 sm:text-xl">
              The social-first Solana trading app for meme coin hunters. Discover top traders, track launches, and buy trending tokens before the move gets crowded.
            </p>
            <div className="mt-8">
              <StoreButtons />
            </div>
            <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
              <Stat label="Trending vol" value={`$${formatCompact(leader.volume24h)}`} />
              <Stat label="Top token" value={`$${leader.symbol}`} />
              <Stat label="24h move" value={`${leader.change24h >= 0 ? "+" : ""}${leader.change24h.toFixed(1)}%`} />
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-[34rem]">
            <div className="absolute inset-8 rounded-[4rem] bg-acid/25 blur-3xl" />
            <video
              className="relative aspect-[9/16] w-full rounded-[2rem] border border-white/10 object-cover shadow-glow"
              src="/video/chadwallet.mp4"
              poster="/screens/splash.png"
              autoPlay
              loop
              muted
              playsInline
            />
          </div>
        </div>
      </section>

      <section id="social" className="border-y border-white/10 bg-shell py-16 text-ink">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-moss/60">Never miss out again</p>
              <h2 className="mt-3 text-4xl font-black leading-tight sm:text-6xl">Trade where the signal starts.</h2>
              <p className="mt-5 text-lg leading-8 text-ink/65">
                ChadWallet turns the messy meme coin firehose into a fast feed of launches, KOL moves, trader flows, and token analytics.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <ImageTile src="/screens/discover.png" alt="Discover tokens" />
              <ImageTile src="/screens/kol.png" alt="KOL feed" />
              <ImageTile src="/screens/token.png" alt="Token analytics" />
            </div>
          </div>
        </div>
      </section>

      <section id="signals" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-acid">Built for Solana speed</p>
            <h2 className="mt-3 text-4xl font-black sm:text-6xl">From feed to fill.</h2>
          </div>
          <p className="max-w-xl text-white/60">A focused demo of the core ChadWallet promise: discover, evaluate, and act while a token is still moving.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.label} className="rounded-lg border border-white/10 bg-white/[0.04] p-6">
              <feature.icon className="h-7 w-7 text-acid" />
              <h3 className="mt-5 text-xl font-black">{feature.label}</h3>
              <p className="mt-3 leading-7 text-white/62">{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.04] py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-4">
          {["launch-4", "buy-sell-4", "portfolio-4", "relaunch-4"].map((name) => (
            <div key={name} className="overflow-hidden rounded-lg border border-white/10 bg-ink">
              <Image src={`/flow/${name}.png`} alt={name.replaceAll("-", " ")} width={420} height={760} className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-8 rounded-lg border border-acid/25 bg-acid p-8 text-ink sm:p-10 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-4xl font-black sm:text-6xl">Ready to hunt?</h2>
            <p className="mt-4 max-w-2xl text-lg font-semibold text-ink/70">Open the trading demo, pick a Solana token, and preview the flow from signal to quote.</p>
          </div>
          <StoreButtons />
        </div>
      </section>
      <TokenBanner tokens={tokens} reverse />
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
      <div className="text-xs font-bold uppercase tracking-[0.14em] text-white/45">{label}</div>
      <div className="mt-2 text-xl font-black text-white">{value}</div>
    </div>
  );
}

function ImageTile({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-ink/10 bg-ink">
      <Image src={src} alt={alt} width={360} height={740} className="h-full w-full object-cover" />
    </div>
  );
}
