import Image from "next/image";
import { ChartCandlestick, Users, Zap } from "lucide-react";
import { Nav } from "@/components/nav";
import { StoreButtons } from "@/components/store-buttons";
import { TokenBanner } from "@/components/token-banner";
import { DesktopFlowShowcase } from "@/components/desktop-flow-showcase";
import { getTrendingTokens } from "@/lib/market-data";
import { clsx, formatCompact } from "@/lib/format";
import type { Token } from "@/lib/types";

const featureCards = [
  {
    eyebrow: "Social signal",
    title: "follow traders before the crowd",
    body: "Track what wallets and KOLs are buying while the chart is still forming.",
    image: "/screens/discover.png",
    icon: Users
  },
  {
    eyebrow: "Token intelligence",
    title: "see the move, then inspect the token",
    body: "Price action, holders, liquidity, and live trades sit one click away.",
    image: "/screens/token.png",
    icon: ChartCandlestick
  },
  {
    eyebrow: "Preview mode",
    title: "quote fast without signing a thing",
    body: "Jupiter quote previews keep the demo real while transaction execution stays disabled.",
    image: "/flow/buy-sell-4.png",
    icon: Zap
  }
];

const footerLinks = [
  {
    title: "About",
    links: [
      { label: "Blog", href: "#" },
      { label: "FAQ", href: "#" },
      { label: "Affiliates", href: "#" }
    ]
  },
  {
    title: "Social",
    links: [
      { label: "Discord", href: "#" },
      { label: "X/Twitter", href: "#" },
      { label: "Instagram", href: "#" },
      { label: "Youtube", href: "#" },
      { label: "LinkedIn", href: "#" }
    ]
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" }
    ]
  }
];

export default async function Home() {
  const tokens = await getTrendingTokens();
  const leader = tokens[0];

  return (
    <main className="bg-night min-h-screen overflow-hidden text-shell">
      <div className="relative">
        <Nav />
      </div>
      <Hero tokens={tokens} leader={leader} />
      <SignalSection />
      <FeatureCards />
      <EverywhereSection />
      <FinalCta leader={leader} />
      <TokenBanner tokens={tokens} reverse subtle />
    </main>
  );
}

function Hero({ tokens, leader }: { tokens: Token[]; leader: Token }) {
  return (
    <section className="hero-full relative overflow-hidden border-b border-white/10">
      <div className="cinematic-hero absolute inset-0" />
      <div className="hero-orbit-wide" />
      <div className="hero-orbit-inner" />
      <div className="hero-soft-left" />
      <div className="hero-soft-right" />

      <OrbitToken token={tokens[0]} className="hero-token-1" size="lg" />
      <OrbitToken token={tokens[1]} className="hero-token-2" />
      <OrbitToken token={tokens[2]} className="hero-token-3" />
      <OrbitToken token={tokens[3]} className="hero-token-4" size="lg" />
      <OrbitToken token={tokens[4]} className="hero-token-5" size="sm" />

      <div className="relative z-20">
        <TokenBanner tokens={tokens} subtle withHeaderGutters />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4.5rem)] max-w-6xl -translate-y-8 flex-col items-center justify-center px-4 py-20 text-center sm:px-6 lg:-translate-y-12">
        <p className="mb-5 rounded-full border border-acid/30 bg-acid/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-acid">
          now hunting on solana
        </p>
        <h1 className="max-w-5xl font-black leading-[0.96] text-white">
          <span className="block text-6xl sm:text-8xl lg:text-[7rem]">
            ChadWallet
          </span>
          <span className="mt-2 block text-5xl text-white/92 sm:text-7xl lg:whitespace-nowrap lg:text-[5.25rem]">
            <span className="text-acid">catches</span> memes early.
          </span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg font-semibold leading-8 text-white/62 sm:text-xl">
          Join the social-first Solana trading app built for launches, top-trader signals, and previewing the next token before it gets crowded.
        </p>
        <div className="mt-8">
          <StoreButtons />
        </div>
        <div className="mt-10 grid w-full max-w-xl grid-cols-3 gap-3">
          <Stat label="Trending vol" value={`$${formatCompact(leader.volume24h)}`} />
          <Stat label="Top token" value={`$${leader.symbol}`} />
          <Stat label="24h move" value={`${leader.change24h >= 0 ? "+" : ""}${leader.change24h.toFixed(1)}%`} />
        </div>
      </div>
    </section>
  );
}

function SignalSection() {
  return (
    <section id="social" className="bg-night relative py-24">
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-[#11134A] to-transparent opacity-35" />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.22em] text-acid">never miss out again</p>
          <h2 className="mt-4 max-w-xl text-5xl font-black leading-none text-white sm:text-7xl">trade where the signal starts.</h2>
          <p className="mt-6 max-w-xl text-lg leading-8 text-white/56">
            ChadWallet turns the messy meme coin firehose into a focused feed of launches, KOL moves, trader flows, and token analytics.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <PhoneCard src="/screens/discover.png" title="Discover" />
          <PhoneCard src="/screens/kol.png" title="Traders" lift />
          <PhoneCard src="/screens/token.png" title="Analyze" />
        </div>
      </div>
    </section>
  );
}

function FeatureCards() {
  return (
    <section id="signals" className="bg-night py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10 text-center">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-acid">from feed to fill</p>
          <h2 className="mt-4 text-5xl font-black leading-none text-white sm:text-7xl">built for the token hunt.</h2>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {featureCards.map((card) => (
            <article key={card.title} className="bg-card-night relative overflow-hidden rounded-lg border border-white/10 p-7">
              <div className="feature-card-glow absolute inset-0" />
              <div className="relative z-10 flex min-h-[35rem] flex-col">
                <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-full bg-acid text-ink">
                  <card.icon className="h-5 w-5" />
                </div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-acid">{card.eyebrow}</p>
                <h3 className="mt-4 text-3xl font-black leading-tight text-white">{card.title}</h3>
                <p className="mt-2 leading-7 text-white/55">{card.body}</p>
                <div className="feature-card-media relative mt-2">
                  <Image
                    src={card.image}
                    alt={card.title}
                    width={520}
                    height={760}
                    className="feature-card-image"
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function EverywhereSection() {
  return (
    <section className="cinematic-section relative overflow-hidden border-y border-white/10 pb-10 pt-24">
      <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-acid">now available on mobile</p>
        <h2 className="mx-auto mt-4 max-w-4xl text-5xl font-black leading-none text-white sm:text-7xl">
          open the feed on your phone. preview the trade on web.
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/56">
          A landing-page demo with real market data, Privy auth, and a preview-only trading surface for safe review.
        </p>
        <div className="relative mx-auto mt-14 max-w-5xl">
          <div className="absolute inset-x-8 top-10 h-64 rounded-full bg-acid/10 blur-3xl" />
          <div className="relative grid gap-5 sm:grid-cols-4 lg:hidden">
            {["launch-4", "buy-sell-4", "portfolio-4", "relaunch-4"].map((name) => (
              <div key={name} className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]">
                <Image src={`/flow/${name}.png`} alt={name.replaceAll("-", " ")} width={420} height={760} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
          <DesktopFlowShowcase />
        </div>
      </div>
    </section>
  );
}

function FinalCta({ leader }: { leader: Token }) {
  return (
    <section className="bg-night relative px-4 pb-10 pt-0 sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-12 border-t border-white/10 pt-14 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.22em] text-acid">preview the hunt</p>
          <h2 className="mt-4 max-w-3xl text-5xl font-black leading-none text-white sm:text-7xl">ready to chase ${leader.symbol}?</h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/56">
            Open the trading demo, pick a Solana token, and inspect the preview flow from signal to quote.
          </p>
        </div>
        <div className="flex flex-col gap-8 lg:min-w-[32rem]">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {footerLinks.map((group) => (
              <div key={group.title}>
                <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-white/28">{group.title}</p>
                <div className="flex flex-col gap-3">
                  {group.links.map((link) => (
                    <a key={link.label} href={link.href} className="text-sm font-black text-white transition hover:text-acid">
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <StoreButtons storeBadges />
        </div>
      </div>
    </section>
  );
}

function OrbitToken({ token, className, size = "md" }: { token: Token; className: string; size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "lg" ? "h-16 w-16 text-base" : size === "sm" ? "h-8 w-8 text-[10px]" : "h-12 w-12 text-sm";

  return (
    <div className={clsx("absolute z-10 hidden rounded-full border border-white/15 bg-white/10 p-1 shadow-2xl backdrop-blur md:block", className)}>
      <div className={clsx("grid place-items-center rounded-full bg-acid font-black leading-none text-ink", sizeClass)}>{token.symbol.slice(0, 2).toUpperCase()}</div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.05] p-4 backdrop-blur">
      <div className="text-xs font-bold uppercase tracking-[0.14em] text-white/40">{label}</div>
      <div className="mt-2 text-xl font-black text-white">{value}</div>
    </div>
  );
}

function PhoneCard({ src, title, lift = false }: { src: string; title: string; lift?: boolean }) {
  return (
    <div className={clsx("overflow-hidden rounded-lg border border-white/10 bg-white/[0.04] p-3", lift && "sm:-translate-y-8")}>
      <Image src={src} alt={title} width={360} height={740} className="h-full w-full rounded-md object-cover" />
    </div>
  );
}
