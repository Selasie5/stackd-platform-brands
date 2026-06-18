import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/submissions')({
  component: SubmissionsPage,
})

function SubmissionsPage() {
  return <div />
}
