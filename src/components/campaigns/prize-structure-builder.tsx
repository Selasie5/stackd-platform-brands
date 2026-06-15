import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BriefField } from '@/components/campaigns/brief-field'
import { getPlacementLabel } from '@/components/campaigns/campaign-constants'

export type PrizePlacement = {
  id: string
  amount: string
}

function createDefaultPlacements(): PrizePlacement[] {
  return [0, 1, 2].map(() => ({
    id: crypto.randomUUID(),
    amount: '',
  }))
}

export function createInitialPrizePlacements() {
  return createDefaultPlacements()
}

export function PrizeStructureBuilder({
  placements,
  onChange,
  currencySymbol,
  minimumWinners,
  onMinimumWinnersChange,
  minimumWinnersId,
  firstPlaceError,
}: {
  placements: PrizePlacement[]
  onChange: (placements: PrizePlacement[]) => void
  currencySymbol: string
  minimumWinners: string
  onMinimumWinnersChange: (value: string) => void
  minimumWinnersId: string
  firstPlaceError?: string | null
}) {
  const updateAmount = (id: string, amount: string) => {
    onChange(
      placements.map((item) => (item.id === id ? { ...item, amount } : item))
    )
  }

  const addPlacement = () => {
    onChange([...placements, { id: crypto.randomUUID(), amount: '' }])
  }

  const removePlacement = (id: string) => {
    if (placements.length <= 1) return
    onChange(placements.filter((item) => item.id !== id))
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3" role="list" aria-label="Prize placements">
        {placements.map((placement, index) => {
          const label = getPlacementLabel(index)
          const amountId = `prize-amount-${placement.id}`

          return (
            <div
              key={placement.id}
              role="listitem"
              className="flex flex-col gap-2 sm:flex-row sm:items-end"
            >
              <div className="sm:w-36">
                <span className="text-sm font-medium text-zinc-800">{label}</span>
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <div className="flex h-9 w-full overflow-hidden rounded-md border border-input bg-transparent focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 dark:bg-input/30">
                  <span className="flex shrink-0 items-center border-r border-input bg-zinc-50 px-3 text-sm text-zinc-500 dark:bg-zinc-900/50">
                    {currencySymbol}
                  </span>
                  <Input
                    id={index === 0 ? amountId : undefined}
                    type="number"
                    min={0}
                    step="0.01"
                    value={placement.amount}
                    onChange={(e) => updateAmount(placement.id, e.target.value)}
                    placeholder={index === 0 ? '5000' : '0'}
                    className="rounded-none border-0 bg-transparent shadow-none focus-visible:border-transparent focus-visible:ring-0"
                    aria-label={`${label} prize amount`}
                    aria-invalid={index === 0 && Boolean(firstPlaceError)}
                    aria-describedby={
                      index === 0 && firstPlaceError ? `${amountId}-error` : undefined
                    }
                  />
                </div>
                {index === 0 && firstPlaceError && (
                  <p id={`${amountId}-error`} className="text-xs text-red-600" role="alert">
                    {firstPlaceError}
                  </p>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={() => removePlacement(placement.id)}
                disabled={placements.length <= 1}
                aria-label={`Remove ${label}`}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          )
        })}
      </div>

      <Button type="button" variant="outline" size="sm" onClick={addPlacement}>
        <Plus className="h-4 w-4" />
        Add more placements
      </Button>

      <BriefField
        id={minimumWinnersId}
        label="Minimum winners"
        required
        hint="Minimum number of creators who receive a prize."
      >
        <Input
          id={minimumWinnersId}
          type="number"
          min={1}
          value={minimumWinners}
          onChange={(e) => onMinimumWinnersChange(e.target.value)}
        />
      </BriefField>
    </div>
  )
}
