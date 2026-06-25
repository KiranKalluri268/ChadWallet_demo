"use client";

import { PrivyProvider } from "@privy-io/react-auth";

const demoPrivyAppId = "cldemo00000000000000000000";

export function PrivyShell({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || demoPrivyAppId;
  const loginMethods = (process.env.NEXT_PUBLIC_PRIVY_LOGIN_METHODS || "email")
    .split(",")
    .map((method) => method.trim())
    .filter(Boolean);
  const privyConfig = {
    loginMethods,
    appearance: {
      theme: "dark",
      accentColor: "#B8FF3C",
      logo: "/brand/logo-light.png"
    },
    embeddedWallets: {
      createOnLogin: "users-without-wallets"
    }
  } as any;

  return (
    <PrivyProvider appId={appId} config={privyConfig}>
      {children}
    </PrivyProvider>
  );
}
