import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'
import {
  useContestSubmissions,
  useShortlistContestSubmission,
} from '@/hooks/use-contest-board'
import { useContest } from '@/hooks/use-opportunities'
import { SortFilterBar } from '@/components/contest-board/sort-filter-bar'
import type { SortOption } from '@/components/contest-board/sort-filter-bar'
import { ContestBoardGrid } from '@/components/contest-board/contest-board-grid'
import { LeaderboardSidebar } from '@/components/contest-board/leaderboard-sidebar'
import { LoadingView } from '@/components/ui/view-state'
import { EmptyState } from '@/components/ui/empty-state'

export function ContestBoardPage({ contestId }: { contestId: string }) {
  const { data: contestData, loading: contestLoading } = useContest(contestId)
  const [sort, setSort] = useState<SortOption>('newest')
  const [statusFilter, setStatusFilter] = useState('')
  const [platformFilter, setPlatformFilter] = useState('')

  const {
    data: submissionsData,
    loading: submissionsLoading,
    refetch: refetchSubmissions,
  } = useContestSubmissions(contestId)

  const { shortlist } = useShortlistContestSubmission()

  const contest = contestData?.contest
  const allSubmissions = submissionsData?.contestSubmissions ?? []
  const initialLoading = contestLoading && contest === undefined

  const filtered = useMemo(() => {
    let result = [...allSubmissions]

    if (statusFilter) {
      result = result.filter((s) => s.status === statusFilter)
    }

    if (platformFilter) {
      result = result.filter((s) => s.platform === platformFilter)
    }

    switch (sort) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'views':
        result.sort((a, b) => b.submittedViews - a.submittedViews)
        break
      case 'engagement':
        result.sort((a, b) => b.engagementCount - a.engagementCount)
        break
      case 'score':
        result.sort((a, b) => b.leaderboardScore - a.leaderboardScore)
        break
      case 'shortlisted':
        result = result.filter((s) => s.status === 'shortlisted')
        break
      case 'winners':
        result = result.filter((s) => s.status === 'winner')
        break
    }

    return result
  }, [allSubmissions, sort, statusFilter, platformFilter])

  const handleShortlist = async (id: string) => {
    await shortlist(id)
    refetchSubmissions()
  }

  const handleViewDetail = (id: string) => {
    window.open(`/dashboard/campaigns/${contestId}/submission/${id}`, '_blank')
  }

  if (initialLoading) {
    return <LoadingView label="Loading contest board…" tone="primary" />
  }

  if (!contest) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-8">
        <Link
          to="/dashboard/campaigns"
          className="inline-flex w-fit items-center gap-1 rounded-full bg-zinc-100 px-3 py-1.5 text-[11px] font-semibold text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-900"
        >
          <ChevronLeft className="h-3 w-3" />
          Back to campaigns
        </Link>
        <p className="text-sm text-zinc-500">Contest not found.</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-full flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            to="/dashboard/campaigns"
            search={{ action: 'view', opportunity_id: contestId, opportunity_type: 'Contest' }}
            className="inline-flex w-fit items-center gap-1 rounded-full bg-zinc-100 px-3 py-1.5 text-[11px] font-semibold text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-900"
          >
            <ChevronLeft className="h-3 w-3" />
            Back to contest
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-zinc-900">
            {contest.title}
          </h1>
          <p className="mt-0.5 text-sm text-zinc-500">Contest board</p>
        </div>
      </div>

      <SortFilterBar
        sort={sort}
        onSortChange={setSort}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        platformFilter={platformFilter}
        onPlatformFilterChange={setPlatformFilter}
      />

      {filtered.length === 0 && allSubmissions.length === 0 ? (
        <EmptyState
          title="No submissions yet"
          description="Creator submissions will appear here once creators start submitting their work."
          compact
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No submissions match your filters"
          description="Try adjusting your filters to find the submission you are looking for."
          compact
        />
      ) : (
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="min-w-0 flex-1">
            <ContestBoardGrid
              submissions={filtered}
              onShortlist={handleShortlist}
              onViewDetail={handleViewDetail}
            />
          </div>
          <LeaderboardSidebar
            entries={allSubmissions}
            loading={submissionsLoading}
          />
        </div>
      )}
    </div>
  )
}
