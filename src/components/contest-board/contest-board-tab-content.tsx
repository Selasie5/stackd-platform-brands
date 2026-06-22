import { useMemo, useState } from 'react'
import { useContestSubmissions, useShortlistContestSubmission } from '@/hooks/use-contest-board'
import { SortFilterBar } from '@/components/contest-board/sort-filter-bar'
import type { SortOption } from '@/components/contest-board/sort-filter-bar'
import { ContestBoardGrid } from '@/components/contest-board/contest-board-grid'
import { LeaderboardSidebar } from '@/components/contest-board/leaderboard-sidebar'
import { EmptyState } from '@/components/ui/empty-state'

export function ContestBoardTabContent({ contestId }: { contestId: string }) {
  const { data, loading, refetch } = useContestSubmissions(contestId)
  const { shortlist } = useShortlistContestSubmission()
  const [sort, setSort] = useState<SortOption>('newest')
  const [statusFilter, setStatusFilter] = useState('')
  const [platformFilter, setPlatformFilter] = useState('')

  const allSubmissions = data?.contestSubmissions ?? []

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
    refetch()
  }

  if (allSubmissions.length === 0 && !loading) {
    return (
      <EmptyState
        title="No submissions yet"
        description="Creator submissions will appear here once creators start submitting their work for this contest."
        compact
      />
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <SortFilterBar
        sort={sort}
        onSortChange={setSort}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        platformFilter={platformFilter}
        onPlatformFilterChange={setPlatformFilter}
      />

      {filtered.length === 0 ? (
        <EmptyState
          title={statusFilter || platformFilter ? 'No submissions match your filters' : 'No submissions yet'}
          description={
            statusFilter || platformFilter
              ? 'Try adjusting your filters to find the submission you are looking for.'
              : 'Creator submissions will appear here once creators start submitting their work.'
          }
          compact
        />
      ) : (
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="min-w-0 flex-1">
            <ContestBoardGrid
              submissions={filtered}
              onShortlist={handleShortlist}
            />
          </div>
          <LeaderboardSidebar
            entries={allSubmissions}
            loading={loading}
          />
        </div>
      )}
    </div>
  )
}
