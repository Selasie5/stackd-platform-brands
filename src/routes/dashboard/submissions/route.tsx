import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/submissions')({
  component: SubmissionsPage,
})

function SubmissionsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Submissions</h1>
      <p className="text-slate-600">Review creator submissions.</p>
    </div>
  )
}
