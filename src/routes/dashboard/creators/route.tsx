import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/creators')({
  component: CreatorsPage,
})

function CreatorsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Creators</h1>
      <p className="text-slate-600">Discover and manage creators.</p>
    </div>
  )
}
