import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/contest-board')({
  component: ContestBoardPage,
})

function ContestBoardPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Contest Board</h1>
      <p className="text-slate-600">View and manage contests.</p>
    </div>
  )
}
