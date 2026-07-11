import { createFileRoute } from '@tanstack/react-router'
import { ContestBoardPage } from '@/components/contest-board/contest-board-page'

export const Route = createFileRoute('/dashboard/campaigns/$id/board')({
  component: BoardRoute,
})

function BoardRoute() {
  const { id } = Route.useParams()
  return <ContestBoardPage contestId={id} />
}
