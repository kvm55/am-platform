// ============================================================
// Propwell AM — Shared Format Utilities
// Canonical formatting functions used across all tool pages
// ============================================================

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatNumber(value: number, decimals = 2): string {
  return value.toFixed(decimals);
}

export function gradeColorClass(grade: string): string {
  switch (grade) {
    case "A":
      return "bg-green-100 text-green-700";
    case "B":
      return "bg-teal/10 text-teal";
    case "C":
      return "bg-yellow-100 text-yellow-700";
    default:
      return "bg-red-100 text-red-700";
  }
}
