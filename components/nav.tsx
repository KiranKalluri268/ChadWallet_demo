import Image from "next/image";
import Link from "next/link";
import { AuthButton } from "@/components/auth-button";

export function Nav() {
  return (
    <header className="pointer-events-none absolute left-0 right-0 top-3 z-40 bg-transparent">
      <div className="mx-auto grid h-16 max-w-[calc(100%-2rem)] grid-cols-[11rem_1fr_11rem] items-center px-4 sm:max-w-[calc(100%-3rem)] md:grid-cols-[15rem_1fr_15rem] lg:grid-cols-[22rem_1fr_22rem]">
        <Link href="/" className="logo-blur pointer-events-auto flex h-[52px] w-[52px] items-center justify-center overflow-hidden rounded-full bg-white mt-3 -ml-1">
          <Image src="/brand/logo-light.png" alt="ChadWallet" width={138} height={36} className="h-12 w-auto" priority />
        </Link>
        <div />
        <div className="pointer-events-auto justify-self-end mt-3.5">
          <AuthButton compact />
        </div>
      </div>
    </header>
  );
}
