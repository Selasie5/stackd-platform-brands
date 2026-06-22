import type { ContestSubmission } from '@/hooks/use-contest-board'
import { SubmissionCard } from '@/components/contest-board/submission-card'

export function ContestBoardGrid({
  submissions,
  onShortlist,
  onViewDetail,
}: {
  submissions: ContestSubmission[]
  onShortlist?: (id: string) => void
  onViewDetail?: (id: string) => void
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {submissions.map((submission) => (
        <SubmissionCard
          key={submission.id}
          submission={submission}
          onShortlist={onShortlist}
          onViewDetail={onViewDetail}
        />
      ))}
    </div>
  )
}
