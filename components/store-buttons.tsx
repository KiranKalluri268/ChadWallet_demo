import { Apple, Play, TrendingUp } from "lucide-react";
import Link from "next/link";

const androidUrl = "https://play.google.com/store/apps/details?id=xyz.chadwallet.www";
const iphoneUrl = "https://apps.apple.com/us/app/chadwallet/id6757367474";

export function StoreButtons() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Link
        href="/trade"
        className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-acid px-6 text-sm font-black text-ink transition hover:bg-mint"
      >
        <TrendingUp className="h-4 w-4" />
        Start trading
      </Link>
      <a
        href={iphoneUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/15 px-5 text-sm font-bold text-white transition hover:border-white/35"
      >
        <Apple className="h-4 w-4" />
        iPhone
      </a>
      <a
        href={androidUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/15 px-5 text-sm font-bold text-white transition hover:border-white/35"
      >
        <Play className="h-4 w-4" />
        Android
      </a>
    </div>
  );
}
