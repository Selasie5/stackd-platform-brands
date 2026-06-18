import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/contest-board')({
  component: ContestBoardPage,
})

function ContestBoardPage() {
  return <div />
}
