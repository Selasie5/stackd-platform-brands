import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { BriefField } from '@/components/campaigns/brief-field'
import { CpmCalculator } from '@/components/campaigns/cpm-calculator'
import { cn } from '@/lib/utils'

export function CpmLayerToggle({
  enabled,
  onEnabledChange,
  payPerThousand,
  onPayPerThousandChange,
  maxViewsPerCreator,
  onMaxViewsPerCreatorChange,
  currencySymbol,
  currency,
  minimumWinners,
  formatMoney,
  toggleId,
  payPerThousandId,
  maxViewsId,
}: {
  enabled: boolean
  onEnabledChange: (enabled: boolean) => void
  payPerThousand: string
  onPayPerThousandChange: (value: string) => void
  maxViewsPerCreator: string
  onMaxViewsPerCreatorChange: (value: string) => void
  currencySymbol: string
  currency: string
  minimumWinners: number
  formatMoney: (amount: number) => string
  toggleId: string
  payPerThousandId: string
  maxViewsId: string
}) {
  const payRate = Math.max(0, Number(payPerThousand) || 0)
  const maxViews = Math.max(0, Number(maxViewsPerCreator) || 0)

  return (
    <div className="space-y-4 rounded-lg border border-zinc-200 bg-zinc-50/40 p-4">
      <div className="flex items-start gap-3">
        <Checkbox
          id={toggleId}
          checked={enabled}
          onCheckedChange={(checked) => onEnabledChange(checked === true)}
          aria-controls={`${toggleId}-panel`}
        />
        <div className="space-y-1">
          <label htmlFor={toggleId} className="cursor-pointer text-sm font-medium text-zinc-800">
            CPM layer
          </label>
          <p className="text-xs leading-relaxed text-zinc-500">
            Optionally pay creators per 1,000 views on top of contest prizes.
          </p>
        </div>
      </div>

      <div
        id={`${toggleId}-panel`}
        className={cn('space-y-4', !enabled && 'hidden')}
        aria-hidden={!enabled}
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <BriefField
            id={payPerThousandId}
            label="Pay per 1,000 views"
            required={enabled}
            hint={`Currency: ${currency} (from wallet).`}
          >
            <div className="flex h-9 w-full overflow-hidden rounded-md border border-input bg-transparent focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 dark:bg-input/30">
              <span className="flex shrink-0 items-center border-r border-input bg-zinc-50 px-3 text-sm text-zinc-500 dark:bg-zinc-900/50">
                {currencySymbol}
              </span>
              <Input
                id={payPerThousandId}
                type="number"
                min={0}
                step="0.01"
                value={payPerThousand}
                onChange={(e) => onPayPerThousandChange(e.target.value)}
                placeholder="5"
                disabled={!enabled}
                className="rounded-none border-0 bg-transparent shadow-none focus-visible:border-transparent focus-visible:ring-0"
              />
            </div>
          </BriefField>

          <BriefField
            id={maxViewsId}
            label="Maximum payable views per creator"
            required={enabled}
            hint="Cap on views that count toward CPM payout."
          >
            <Input
              id={maxViewsId}
              type="number"
              min={1}
              value={maxViewsPerCreator}
              onChange={(e) => onMaxViewsPerCreatorChange(e.target.value)}
              placeholder="100000"
              disabled={!enabled}
            />
          </BriefField>
        </div>

        {enabled && payRate > 0 && maxViews > 0 && minimumWinners > 0 && (
          <CpmCalculator
            payPerThousandViews={payRate}
            maxViewsPerCreator={maxViews}
            creatorsCount={minimumWinners}
            formatMoney={formatMoney}
          />
        )}
      </div>
    </div>
  )
}
