export function formatUsd(value: number, maximumFractionDigits = 2) {
  if (value <= 0 || !isFinite(value)) return "$0.00";

  if (value < 0.01) {
    // Show actual decimal with real zeros — readable by anyone
    // e.g. 0.0000000689 → $0.000000069  (3 significant digits, actual zeros)
    const str = value.toFixed(20);
    const match = str.match(/^0\.(0*)([1-9]\d*)/);
    if (match) {
      const zeros = match[1].length;
      const significant = match[2].slice(0, 3).replace(/0+$/, "");
      return `$0.${"0".repeat(zeros)}${significant}`;
    }
  }

  // Auto-pick precision based on magnitude — avoids long trailing digits
  const smartDigits =
    value < 0.1  ? 4   // e.g. $0.0489
    : value < 1  ? 3   // e.g. $0.902
    : value < 10 ? 3   // e.g. $7.542
    : maximumFractionDigits; // $12.34, $1,234.00, etc.

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: smartDigits
  }).format(value);
}

export function formatCompact(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value);
}

export function clsx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
