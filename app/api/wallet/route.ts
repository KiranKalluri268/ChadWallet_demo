import { NextResponse } from "next/server";

const LAMPORTS_PER_SOL = 1_000_000_000;

export async function GET(request: Request) {
  const rpcUrl = process.env.ALCHEMY_SOLANA_RPC_URL;
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get("wallet");
  const token = searchParams.get("token");

  if (!rpcUrl) {
    return NextResponse.json({ source: "fallback", sol: null, token: null });
  }

  if (!wallet) {
    return NextResponse.json({ error: "wallet is required" }, { status: 400 });
  }

  try {
    const [solResponse, tokenResponse] = await Promise.all([
      rpc(rpcUrl, "getBalance", [wallet]),
      token
        ? rpc(rpcUrl, "getTokenAccountsByOwner", [
            wallet,
            { mint: token },
            { encoding: "jsonParsed" }
          ])
        : Promise.resolve(null)
    ]);

    const solLamports = solResponse?.result?.value;
    const tokenAccount = tokenResponse?.result?.value?.[0]?.account?.data?.parsed?.info?.tokenAmount;

    return NextResponse.json({
      source: "alchemy",
      sol: typeof solLamports === "number" ? solLamports / LAMPORTS_PER_SOL : null,
      token: tokenAccount
        ? {
            amount: Number(tokenAccount.uiAmount ?? 0),
            decimals: tokenAccount.decimals
          }
        : null
    });
  } catch {
    return NextResponse.json({ source: "fallback", sol: null, token: null });
  }
}

async function rpc(rpcUrl: string, method: string, params: unknown[]) {
  const response = await fetch(rpcUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: method,
      method,
      params
    }),
    next: { revalidate: 10 }
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}
