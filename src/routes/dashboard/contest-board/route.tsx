import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Trophy, Calendar, ArrowRight } from 'lucide-react'
import { useMyContests } from '@/hooks/use-opportunities'
import type { ContestSummary } from '@/hooks/use-opportunities'
import { LoadingView } from '@/components/ui/view-state'
import { EmptyState } from '@/components/ui/empty-state'

export const Route = createFileRoute('/dashboard/contest-board')({
  component: ContestBoardPage,
})

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function ContestCard({ contest }: { contest: ContestSummary }) {
  const navigate = useNavigate()

  return (
    <div
      className="group cursor-pointer rounded-lg border border-zinc-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all hover:shadow-[0_2px_4px_rgba(15,23,42,0.08)] hover:border-zinc-300"
      onClick={() => navigate({ to: '/dashboard/campaigns', search: { action: 'view', opportunity_id: contest.id, opportunity_type: 'Contest', tab: 'contest-board', campaign_title: contest.title } })}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          navigate({ to: '/dashboard/campaigns', search: { action: 'view', opportunity_id: contest.id, opportunity_type: 'Contest', tab: 'contest-board', campaign_title: contest.title } })
        }
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-medium text-zinc-900 group-hover:text-zinc-700 transition-colors">
            {contest.title}
          </h3>
          <p className="mt-0.5 text-xs text-zinc-500 line-clamp-1">{contest.shortDescription}</p>
        </div>
        <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-zinc-300 group-hover:text-zinc-500 transition-colors" />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
        <span className="inline-flex items-center gap-1">
          <Calendar className="h-3 w-3" aria-hidden="true" />
          Submissions due {formatDate(contest.submissionDeadline)}
        </span>
        <span className="inline-flex items-center gap-1">
          <Trophy className="h-3 w-3" aria-hidden="true" />
          Min. {contest.minimumWinners} winner{contest.minimumWinners !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  )
}

function ContestBoardPage() {
  const { data, loading } = useMyContests()
  const navigate = useNavigate()

  const contests = data?.myContests ?? []

  if (loading && contests.length === 0) {
    return <LoadingView label="Loading contest board…" tone="primary" />
  }

  if (contests.length === 0) {
    return (
      <div className="px-6 py-8">
        <EmptyState
          title="No contests yet"
          description="Create a contest campaign to start receiving submissions from creators."
          action={
            <button
              type="button"
              onClick={() => navigate({ to: '/dashboard/campaigns', search: { action: 'create', campaign_type: 'Contest' } })}
              className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
            >
              Create contest
            </button>
          }
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.03em] text-zinc-900">Contest board</h1>
        <p className="mt-0.5 text-sm text-zinc-500">
          View submissions, shortlist entries, and select winners for your contests.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {contests.map((contest) => (
          <ContestCard key={contest.id} contest={contest} />
        ))}
      </div>
    </div>
  )
}
