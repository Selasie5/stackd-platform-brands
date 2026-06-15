import { calculateCpmMaxBudget } from '@/components/campaigns/campaign-constants'

export function CpmCalculator({
  payPerThousandViews,
  maxViewsPerCreator,
  creatorsCount,
  formatMoney,
}: {
  payPerThousandViews: number
  maxViewsPerCreator: number
  creatorsCount: number
  formatMoney: (amount: number) => string
}) {
  const maxBudget = calculateCpmMaxBudget(
    payPerThousandViews,
    maxViewsPerCreator,
    creatorsCount
  )
  const perCreatorMax = calculateCpmMaxBudget(
    payPerThousandViews,
    maxViewsPerCreator,
    1
  )

  return (
    <div className="rounded-lg border border-zinc-100 bg-zinc-50/80 px-3 py-3 text-xs text-zinc-600">
      <p className="font-medium text-zinc-800">Live budget estimate</p>
      <p className="mt-2  text-[11px] leading-relaxed text-zinc-500">
        ({formatMoney(payPerThousandViews)} × {maxViewsPerCreator.toLocaleString()} ÷ 1,000) ×{' '}
        {creatorsCount} creator{creatorsCount === 1 ? '' : 's'}
      </p>
      <dl className="mt-3 space-y-1.5">
        <div className="flex justify-between">
          <dt>Max per creator</dt>
          <dd className="font-semibold text-zinc-800">{formatMoney(perCreatorMax)}</dd>
        </div>
        <div className="flex justify-between border-t border-zinc-200/80 pt-1.5">
          <dt>Max campaign budget</dt>
          <dd className="font-semibold text-zinc-900">{formatMoney(maxBudget)}</dd>
        </div>
      </dl>
    </div>
  )
}
