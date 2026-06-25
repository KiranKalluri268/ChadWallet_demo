import { Play, TrendingUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const androidUrl = "https://play.google.com/store/apps/details?id=xyz.chadwallet.www";
const iphoneUrl = "https://apps.apple.com/us/app/chadwallet/id6757367474";

export function StoreButtons({ storeBadges = false }: { storeBadges?: boolean }) {
  if (storeBadges) {
    return (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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
          className="inline-flex h-12 overflow-hidden rounded-lg transition hover:shadow-[0_0_34px_rgba(184,255,60,0.2)]"
        >
          <Image src="/appstore-button.png" alt="Download on the App Store" width={156} height={48} className="h-12 w-auto object-contain" />
        </a>
        <a
          href={androidUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-12 overflow-hidden rounded-lg transition hover:shadow-[0_0_34px_rgba(184,255,60,0.2)]"
        >
          <Image src="/playstore-button.png" alt="Get it on Google Play" width={176} height={48} className="h-12 w-auto object-contain" />
        </a>
      </div>
    );
  }

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
        className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/15 px-5 text-sm font-bold text-white transition hover:border-acid/55 hover:bg-white/[0.06] hover:shadow-[0_0_34px_rgba(184,255,60,0.24)]"
      >
        iPhone
      </a>
      <a
        href={androidUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/15 px-5 text-sm font-bold text-white transition hover:border-acid/55 hover:bg-white/[0.06] hover:shadow-[0_0_34px_rgba(184,255,60,0.24)]"
      >
        Android
      </a>
    </div>
  );
}
