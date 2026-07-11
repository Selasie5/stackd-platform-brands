import { Eye, Heart, Calendar, Bookmark, Trophy } from 'lucide-react'
import type { ContestSubmission } from '@/hooks/use-contest-board'
import { WatermarkedPlayer } from '@/components/contest-board/watermarked-player'
import { VerifiedBadge } from '@/components/contest-board/verified-badge'
import { DotBadge } from '@/components/ui/dot-badge'
import { Tooltip } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatCompactNumber(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

const STATUS_BADGE_STYLES: Record<string, { label: string; badge: string; dot: string }> = {
  submitted: {
    label: 'Submitted',
    badge: 'bg-blue-50 text-blue-700 ring-blue-100',
    dot: 'bg-blue-500',
  },
  under_review: {
    label: 'Under review',
    badge: 'bg-purple-50 text-purple-700 ring-purple-100',
    dot: 'bg-purple-500',
  },
  shortlisted: {
    label: 'Shortlisted',
    badge: 'bg-amber-50 text-amber-700 ring-amber-100',
    dot: 'bg-amber-500',
  },
  revision_requested: {
    label: 'Revision requested',
    badge: 'bg-orange-50 text-orange-700 ring-orange-100',
    dot: 'bg-orange-500',
  },
  winner: {
    label: 'Winner',
    badge: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    dot: 'bg-emerald-500',
  },
  approved: {
    label: 'Approved',
    badge: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    dot: 'bg-emerald-500',
  },
  rejected: {
    label: 'Rejected',
    badge: 'bg-red-50 text-red-700 ring-red-100',
    dot: 'bg-red-500',
  },
  disqualified: {
    label: 'Disqualified',
    badge: 'bg-red-50 text-red-700 ring-red-100',
    dot: 'bg-red-500',
  },
  paid: {
    label: 'Paid',
    badge: 'bg-green-50 text-green-700 ring-green-100',
    dot: 'bg-green-500',
  },
}

export function SubmissionCard({
  submission,
  onShortlist,
  onViewDetail,
}: {
  submission: ContestSubmission
  onShortlist?: (id: string) => void
  onViewDetail?: (id: string) => void
}) {
  const statusStyle = STATUS_BADGE_STYLES[submission.status] ?? STATUS_BADGE_STYLES.submitted
  const isDisqualified = submission.status === 'disqualified'
  const isShortlisted = submission.status === 'shortlisted'
  const isWinner = submission.status === 'winner'

  return (
    <div
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-shadow hover:shadow-[0_2px_4px_rgba(15,23,42,0.08)]',
        isDisqualified && 'opacity-60'
      )}
    >
      {isWinner && (
        <div className="absolute left-2 top-2 z-10 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
          <Trophy className="h-3 w-3" />
          {submission.placement ? `#${submission.placement} Winner` : 'Winner'}
        </div>
      )}

      <WatermarkedPlayer
        watermarkedPreviewUrl={submission.watermarkedPreviewUrl}
        thumbnailUrl={submission.thumbnailUrl}
        title={submission.submissionNote ?? `Submission ${submission.id.slice(0, 8)}`}
      />

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-medium text-zinc-500">
            Creator ID: {submission.creatorId.slice(0, 8)}…
          </p>
          <DotBadge
            label={statusStyle.label}
            badgeClassName={statusStyle.badge}
            dotClassName={statusStyle.dot}
          />
        </div>

        {submission.submissionNote && (
          <p className="line-clamp-1 text-xs text-zinc-700">{submission.submissionNote}</p>
        )}

        {submission.platform && (
          <span className="text-[11px] capitalize text-zinc-400">{submission.platform.replace(/_/g, ' ')}</span>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
          <span className="inline-flex items-center gap-1">
            <Eye className="h-3 w-3" aria-hidden="true" />
            {formatCompactNumber(submission.submittedViews)}
          </span>
          <VerifiedBadge
            approvedViews={submission.approvedViews}
            submittedViews={submission.submittedViews}
          />
          <span className="inline-flex items-center gap-1">
            <Heart className="h-3 w-3" aria-hidden="true" />
            {formatCompactNumber(submission.engagementCount)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3 w-3" aria-hidden="true" />
            {formatDate(submission.createdAt)}
          </span>
        </div>

        {isDisqualified && (
          <p className="rounded bg-red-50 px-2 py-1 text-[11px] text-red-700">
            This submission has been disqualified.
          </p>
        )}

        <div className="mt-1 flex items-center gap-1 border-t border-zinc-100 pt-2">
          <Tooltip content={isShortlisted ? 'Shortlisted' : 'Add to shortlist'}>
            <button
              type="button"
              aria-label={isShortlisted ? 'Shortlisted' : 'Add to shortlist'}
              onClick={() => onShortlist?.(submission.id)}
              disabled={isShortlisted}
              className={cn(
                'rounded p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700',
                isShortlisted && 'text-amber-500'
              )}
            >
              <Bookmark className={cn('h-4 w-4', isShortlisted && 'fill-amber-500')} />
            </button>
          </Tooltip>

          <Tooltip content="View submission detail">
            <button
              type="button"
              aria-label="View submission detail"
              onClick={() => onViewDetail?.(submission.id)}
              className="rounded p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
            >
              <Eye className="h-4 w-4" />
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  )
}
