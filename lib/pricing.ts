export function formatCurrency(amount: number, currency: string): string {
  if (Number.isNaN(amount)) {
    return amount.toString();
  }
  try {
    return new Intl.NumberFormat("es-DO", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString("es-DO")}`;
  }
}
