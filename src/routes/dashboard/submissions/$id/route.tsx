import { createFileRoute } from '@tanstack/react-router'
import { SubmissionDetailPage } from '@/components/submission-detail/submission-detail-page'

export const Route = createFileRoute('/dashboard/submissions/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  return <SubmissionDetailPage submissionId={id} />
}
