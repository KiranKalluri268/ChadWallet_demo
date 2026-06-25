import { NextResponse } from "next/server";
import { getJupiterQuote } from "@/lib/market-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const inputMint = searchParams.get("inputMint");
  const outputMint = searchParams.get("outputMint");
  const amount = Number(searchParams.get("amount"));

  if (!inputMint || !outputMint || !Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "inputMint, outputMint, and positive amount are required" }, { status: 400 });
  }

  const quote = await getJupiterQuote({ inputMint, outputMint, amount });

  if (!quote) {
    return NextResponse.json({ quote: null, source: "fallback" });
  }

  return NextResponse.json({ quote, source: "jupiter" });
}
