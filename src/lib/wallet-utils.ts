export type WalletTransactionType =
  | 'credit'
  | 'debit'
  | 'reserve'
  | 'release'
  | 'payout'
  | 'refund'
  | 'adjustment'

export type WalletStatus = 'active' | 'frozen' | 'closed'

export interface BrandWalletTransaction {
  id: string
  transactionType: WalletTransactionType
  amount: string
  currency: string
  balanceBefore: string
  balanceAfter: string
  reservedBefore: string
  reservedAfter: string
  description: string | null
  referenceType: string | null
  referenceId: string | null
  createdAt: string
}

export const TRANSACTIONS_PAGE_SIZE = 10

export const TRANSACTION_TYPE_LABELS: Record<WalletTransactionType, string> = {
  credit: 'Credit',
  debit: 'Debit',
  reserve: 'Reserve',
  release: 'Release',
  payout: 'Payout',
  refund: 'Refund',
  adjustment: 'Adjustment',
}

export const TRANSACTION_TYPE_DOT_COLORS: Record<WalletTransactionType, string> = {
  credit: 'bg-emerald-500',
  debit: 'bg-zinc-500',
  reserve: 'bg-amber-500',
  release: 'bg-blue-500',
  payout: 'bg-red-500',
  refund: 'bg-violet-500',
  adjustment: 'bg-orange-500',
}

export const TRANSACTION_STATUS_STYLES: Record<
  WalletTransactionType,
  { label: string; badge: string; dot: string }
> = {
  credit: {
    label: 'Completed',
    badge: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    dot: 'bg-emerald-500',
  },
  debit: {
    label: 'Completed',
    badge: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    dot: 'bg-emerald-500',
  },
  reserve: {
    label: 'Reserved',
    badge: 'bg-amber-50 text-amber-700 ring-amber-100',
    dot: 'bg-amber-500',
  },
  release: {
    label: 'Released',
    badge: 'bg-blue-50 text-blue-700 ring-blue-100',
    dot: 'bg-blue-500',
  },
  payout: {
    label: 'Paid out',
    badge: 'bg-red-50 text-red-700 ring-red-100',
    dot: 'bg-red-500',
  },
  refund: {
    label: 'Refunded',
    badge: 'bg-violet-50 text-violet-700 ring-violet-100',
    dot: 'bg-violet-500',
  },
  adjustment: {
    label: 'Adjusted',
    badge: 'bg-orange-50 text-orange-700 ring-orange-100',
    dot: 'bg-orange-500',
  },
}

export const TRANSACTION_TYPE_STYLES: Record<
  WalletTransactionType,
  { badge: string; amount: string }
> = {
  credit: {
    badge: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    amount: 'text-emerald-600',
  },
  debit: {
    badge: 'bg-zinc-100 text-zinc-600 ring-zinc-200',
    amount: 'text-zinc-700',
  },
  reserve: {
    badge: 'bg-amber-50 text-amber-700 ring-amber-100',
    amount: 'text-amber-600',
  },
  release: {
    badge: 'bg-blue-50 text-blue-700 ring-blue-100',
    amount: 'text-blue-600',
  },
  payout: {
    badge: 'bg-red-50 text-red-700 ring-red-100',
    amount: 'text-red-600',
  },
  refund: {
    badge: 'bg-violet-50 text-violet-700 ring-violet-100',
    amount: 'text-violet-600',
  },
  adjustment: {
    badge: 'bg-orange-50 text-orange-700 ring-orange-100',
    amount: 'text-orange-600',
  },
}

const OPPORTUNITY_REFERENCE_TYPES = new Set(['ugc_order', 'cpm_deal', 'contest'])

export function getTransactionReferenceLink(
  referenceType: string | null,
  referenceId: string | null
) {
  if (!referenceType || !referenceId || !OPPORTUNITY_REFERENCE_TYPES.has(referenceType)) {
    return null
  }

  const campaignType: 'UGC' | 'CPM' | 'Contest' =
    referenceType === 'ugc_order' ? 'UGC' : referenceType === 'cpm_deal' ? 'CPM' : 'Contest'

  return {
    to: '/dashboard/campaigns' as const,
    search: { opportunity_id: referenceId, opportunity_type: campaignType },
    label: referenceType.replace(/_/g, ' '),
  }
}

export function formatTransactionReferenceCode(referenceId: string | null) {
  if (!referenceId) return '—'
  return referenceId.slice(0, 8)
}

export function formatTransactionReference(
  referenceType: string | null,
  referenceId: string | null
) {
  if (!referenceType) return '—'
  if (!referenceId) return referenceType.replace(/_/g, ' ')
  return `${referenceType.replace(/_/g, ' ')} · ${referenceId.slice(0, 8)}`
}

export function isCreditType(type: WalletTransactionType) {
  return type === 'credit' || type === 'release' || type === 'refund'
}
