import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/campaigns')({
  component: CampaignsPage,
})

function CampaignsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Campaigns</h1>
      <p className="text-slate-600">Manage your campaigns here.</p>
    </div>
  )
}
