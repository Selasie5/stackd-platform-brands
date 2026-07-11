import { createFileRoute } from '@tanstack/react-router'
import { WinnerSelectionPage } from '@/components/winner-selection/winner-selection-page'

export const Route = createFileRoute('/dashboard/campaigns/$id/select-winners')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  return <WinnerSelectionPage contestId={id} />
}
