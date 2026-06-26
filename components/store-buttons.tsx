import { Download, TrendingUp } from "lucide-react";
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
        {/* Store badges: bordered + divided on mobile (matches footer links style), plain row on desktop */}
        <div className="grid grid-cols-2 divide-x divide-white/10 overflow-hidden rounded-lg border border-white/10 sm:flex sm:flex-row sm:items-center sm:gap-3 sm:divide-x-0 sm:overflow-visible sm:rounded-none sm:border-0">
          <a
            href={iphoneUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center py-3 px-4 transition hover:bg-white/[0.04] hover:shadow-[0_0_34px_rgba(184,255,60,0.2)] sm:inline-flex sm:overflow-hidden sm:rounded-lg sm:py-0 sm:px-0 sm:hover:bg-transparent"
          >
            <Image
              src="/appstore-button.png"
              alt="Download on the App Store"
              width={156}
              height={48}
              className="h-10 w-auto object-contain sm:h-12"
            />
          </a>
          <a
            href={androidUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center py-3 px-4 transition hover:bg-white/[0.04] hover:shadow-[0_0_34px_rgba(184,255,60,0.2)] sm:inline-flex sm:overflow-hidden sm:rounded-lg sm:py-0 sm:px-0 sm:hover:bg-transparent"
          >
            <Image
              src="/playstore-button.png"
              alt="Get it on Google Play"
              width={176}
              height={48}
              className="h-10 w-auto object-contain sm:h-12"
            />
          </a>
        </div>
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
        className="group inline-flex h-12 items-center justify-center rounded-full border border-white/15 px-5 text-sm font-bold text-white transition hover:border-acid/55 hover:bg-white/[0.06] hover:shadow-[0_0_34px_rgba(184,255,60,0.24)] focus:outline-none focus-visible:outline-none"
      >
        {/* Hidden on mobile (w-0 mr-0), slides in with spacing on desktop hover */}
        <Download className="h-4 w-4 shrink-0 transition-all duration-200 w-0 opacity-0 overflow-hidden mr-0 sm:group-hover:w-4 sm:group-hover:opacity-100 sm:group-hover:mr-2" />
        iPhone
      </a>
      <a
        href={androidUrl}
        target="_blank"
        rel="noreferrer"
        className="group inline-flex h-12 items-center justify-center rounded-full border border-white/15 px-5 text-sm font-bold text-white transition hover:border-acid/55 hover:bg-white/[0.06] hover:shadow-[0_0_34px_rgba(184,255,60,0.24)] focus:outline-none focus-visible:outline-none"
      >
        {/* Hidden on mobile (w-0 mr-0), slides in with spacing on desktop hover */}
        <Download className="h-4 w-4 shrink-0 transition-all duration-200 w-0 opacity-0 overflow-hidden mr-0 sm:group-hover:w-4 sm:group-hover:opacity-100 sm:group-hover:mr-2" />
        Android
      </a>
    </div>
  );
}
