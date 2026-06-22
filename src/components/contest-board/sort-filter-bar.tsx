import { cn } from '@/lib/utils'
import { Select } from '@/components/ui/select'

type SortOption = 'newest' | 'score' | 'views' | 'engagement' | 'shortlisted' | 'winners'

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: 'newest', label: 'Newest' },
  { value: 'views', label: 'Most viewed' },
  { value: 'engagement', label: 'Most engaged' },
  { value: 'score', label: 'Highest score' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'winners', label: 'Winners' },
]

const STATUS_FILTERS: Array<{ value: string; label: string }> = [
  { value: '', label: 'All statuses' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'under_review', label: 'Under review' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'winner', label: 'Winners' },
  { value: 'approved', label: 'Approved' },
  { value: 'disqualified', label: 'Disqualified' },
]

const PLATFORM_FILTERS: Array<{ value: string; label: string }> = [
  { value: '', label: 'All platforms' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'youtube_shorts', label: 'YouTube' },
]

export function SortFilterBar({
  sort,
  onSortChange,
  statusFilter,
  onStatusFilterChange,
  platformFilter,
  onPlatformFilterChange,
}: {
  sort: SortOption
  onSortChange: (sort: SortOption) => void
  statusFilter: string
  onStatusFilterChange: (status: string) => void
  platformFilter: string
  onPlatformFilterChange: (platform: string) => void
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-zinc-500">Sort by</span>
        <div className="flex flex-wrap gap-1">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onSortChange(option.value)}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                sort === option.value
                  ? 'bg-zinc-900 text-white'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-800'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="w-[160px]">
          <Select
            value={statusFilter}
            onChange={onStatusFilterChange}
            options={STATUS_FILTERS}
            placeholder="All statuses"
          />
        </div>

        <div className="w-[160px]">
          <Select
            value={platformFilter}
            onChange={onPlatformFilterChange}
            options={PLATFORM_FILTERS}
            placeholder="All platforms"
          />
        </div>
      </div>
    </div>
  )
}

export type { SortOption }
