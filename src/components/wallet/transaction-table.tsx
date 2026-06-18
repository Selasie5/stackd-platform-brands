import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { DatePicker } from '@/components/ui/date-picker'
import { DotBadge } from '@/components/ui/dot-badge'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table'
import { Select } from '@/components/ui/select'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingView } from '@/components/ui/view-state'
import {
  TRANSACTIONS_PAGE_SIZE,
  TRANSACTION_TYPE_DOT_COLORS,
  TRANSACTION_TYPE_LABELS,
  TRANSACTION_STATUS_STYLES,
  formatTransactionReferenceCode,
  getTransactionReferenceLink,
  type BrandWalletTransaction,
} from '@/lib/wallet-utils'

const TYPE_FILTER_OPTIONS = [
  { value: '', label: 'All types' },
  ...Object.entries(TRANSACTION_TYPE_LABELS).map(([value, label]) => ({ value, label })),
]

function buildTransactionColumns(
  formatMoney: (amount: number) => string
): DataTableColumn<BrandWalletTransaction>[] {
  return [
    {
      id: 'createdAt',
      header: 'Date',
      sortable: true,
      sortValue: (row) => new Date(row.createdAt).getTime(),
      cellClassName: 'whitespace-nowrap text-zinc-600',
      cell: (row) =>
        new Date(row.createdAt).toLocaleString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
    },
    {
      id: 'transactionType',
      header: 'Type',
      sortable: true,
      sortValue: (row) => row.transactionType,
      cell: (row) => {
        const type = row.transactionType 
        return (
          <DotBadge
            label={TRANSACTION_TYPE_LABELS[type]}
            badgeClassName="bg-zinc-100 text-zinc-700 ring-zinc-200"
            dotClassName={TRANSACTION_TYPE_DOT_COLORS[type]}
          />
        )
      },
    },
    {
      id: 'amount',
      header: 'Amount',
      sortable: true,
      sortValue: (row) => Number(row.amount) || 0,
      cellClassName: 'text-zinc-900',
      cell: (row) => formatMoney(Number(row.amount) || 0),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row) => {
        const type = row.transactionType 
        const status = TRANSACTION_STATUS_STYLES[type]
        return (
          <DotBadge
            label={status.label}
            badgeClassName={status.badge}
            dotClassName={status.dot}
          />
        )
      },
    },
    {
      id: 'reference',
      header: 'Reference',
      cell: (row) => {
        const referenceLink = getTransactionReferenceLink(row.referenceType, row.referenceId)
        const referenceCode = formatTransactionReferenceCode(row.referenceId)

        if (referenceLink) {
          return (
            <Link
              to={referenceLink.to}
              search={referenceLink.search}
              className="font-mono text-sm text-primary hover:underline"
            >
              {referenceCode}
            </Link>
          )
        }

        return <span className="font-mono uppercase  font-semibold text-sm text-zinc-600">{referenceCode}</span>
      },
    },
    {
      id: 'balanceAfter',
      header: 'Balance after',
      cellClassName: 'whitespace-nowrap text-zinc-900',
      cell: (row) => formatMoney(Number(row.balanceAfter) || 0),
    },
  ]
}

export function TransactionTable({
  transactions,
  loading,
  formatMoney,
}: {
  transactions: BrandWalletTransaction[]
  loading: boolean
  formatMoney: (amount: number) => string
}) {
  const [typeFilter, setTypeFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const columns = useMemo(() => buildTransactionColumns(formatMoney), [formatMoney])

  const filtered = useMemo(() => {
    let rows = [...transactions]

    if (typeFilter) {
      rows = rows.filter((row) => row.transactionType === typeFilter)
    }

    if (dateFrom) {
      const from = new Date(`${dateFrom}T00:00:00`)
      rows = rows.filter((row) => new Date(row.createdAt) >= from)
    }

    if (dateTo) {
      const to = new Date(`${dateTo}T23:59:59`)
      rows = rows.filter((row) => new Date(row.createdAt) <= to)
    }

    return rows
  }, [transactions, typeFilter, dateFrom, dateTo])

  const dateFromValue = dateFrom ? new Date(`${dateFrom}T00:00:00`) : undefined

  if (loading) {
    return <LoadingView label="Loading transactions…" tone="primary" />
  }

  if (transactions.length === 0) {
    return (
      <EmptyState
        title="No transactions yet"
        description="Wallet top-ups, campaign reservations, and payouts will appear here."
      />
    )
  }

  return (
    <DataTable
      data={filtered}
      columns={columns}
      getRowKey={(row) => row.id}
      pageSize={TRANSACTIONS_PAGE_SIZE}
      defaultSort={{ columnId: 'createdAt', direction: 'desc' }}
      toolbar={
        <div className="grid gap-3 sm:grid-cols-3 lg:w-[520px]">
          <Select
            id="transaction-type-filter"
            value={typeFilter}
            onChange={setTypeFilter}
            options={TYPE_FILTER_OPTIONS}
            placeholder="Filter by type"
          />
          <DatePicker
            id="transaction-date-from"
            value={dateFrom}
            onChange={setDateFrom}
            placeholder="From date"
          />
          <DatePicker
            id="transaction-date-to"
            value={dateTo}
            onChange={setDateTo}
            placeholder="To date"
            fromDate={dateFromValue}
          />
        </div>
      }
      emptyState={{
        title: 'No transactions match your filters',
        description: 'Try adjusting your filters to find the transaction you are looking for.',
      }}
    />
  )
}
