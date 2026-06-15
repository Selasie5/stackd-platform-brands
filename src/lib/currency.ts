const DEFAULT_CURRENCY = 'USD'

/** Platform-supported currencies — Intl narrowSymbol can include country prefixes (e.g. GH₵). */
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  GHS: '₵',
  NGN: '₦',
}

export function normalizeCurrencyCode(currency?: string | null) {
  return (currency ?? DEFAULT_CURRENCY).toUpperCase()
}

export function getCurrencySymbol(currency?: string | null) {
  const code = normalizeCurrencyCode(currency)

  if (CURRENCY_SYMBOLS[code]) {
    return CURRENCY_SYMBOLS[code]
  }

  try {
    const parts = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: code,
      currencyDisplay: 'narrowSymbol',
    }).formatToParts(0)

    return parts.find((part) => part.type === 'currency')?.value ?? code
  } catch {
    return code
  }
}

export function formatCurrency(
  amount: number,
  currency?: string | null,
  options?: { maximumFractionDigits?: number; minimumFractionDigits?: number }
) {
  const code = normalizeCurrencyCode(currency)

  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: code,
      maximumFractionDigits: options?.maximumFractionDigits ?? 0,
      minimumFractionDigits: options?.minimumFractionDigits,
    }).format(amount)
  } catch {
    return `${getCurrencySymbol(code)}${amount.toLocaleString()}`
  }
}

export function parseWalletAmount(value?: number | string | null) {
  if (value == null) return 0
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}
