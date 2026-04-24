import type { Locale } from "@/lib/locale";

export const BANK_PAYMENT_DETAILS = {
  bank: "Banco Popular",
  beneficiary: "Sr Reynold L Cuevas Santos",
  accountNumber: "0789171071",
  currency: "RD$",
};

export function getPaymentLines(locale: Locale = "es") {
  if (locale === "en") {
    return [
      "Bank transfer details, use after confirming item availability:",
      `${BANK_PAYMENT_DETAILS.bank}`,
      `Beneficiary: ${BANK_PAYMENT_DETAILS.beneficiary}`,
      `Account: ${BANK_PAYMENT_DETAILS.accountNumber}`,
      `Currency: ${BANK_PAYMENT_DETAILS.currency}`,
    ];
  }

  return [
    "Datos de transferencia, usar luego de confirmar disponibilidad:",
    `${BANK_PAYMENT_DETAILS.bank}`,
    `Beneficiario: ${BANK_PAYMENT_DETAILS.beneficiary}`,
    `Cuenta: ${BANK_PAYMENT_DETAILS.accountNumber}`,
    `Moneda: ${BANK_PAYMENT_DETAILS.currency}`,
  ];
}
