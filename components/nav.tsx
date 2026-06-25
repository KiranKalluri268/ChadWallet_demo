import Image from "next/image";
import Link from "next/link";
import { AuthButton } from "@/components/auth-button";

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/brand/logo-light.png" alt="ChadWallet" width={138} height={36} className="h-8 w-auto" priority />
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-semibold text-white/70 md:flex">
          <Link href="/#social" className="hover:text-white">
            Social
          </Link>
          <Link href="/#signals" className="hover:text-white">
            Signals
          </Link>
          <Link href="/trade" className="hover:text-white">
            Trading
          </Link>
        </nav>
        <AuthButton compact />
      </div>
    </header>
  );
}
