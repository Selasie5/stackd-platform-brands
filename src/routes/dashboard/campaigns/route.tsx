import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { UgcCreateBrief } from '@/components/campaigns/ugc-create-brief'

const campaignsSearchSchema = z.object({
  action: z.enum(['create']).optional(),
  campaign_type: z.enum(['UGC', 'CPM', 'Contest']).optional(),
})

export const Route = createFileRoute('/dashboard/campaigns')({
  validateSearch: campaignsSearchSchema,
  component: CampaignsPage,
})

function CampaignsPage() {
  const { action, campaign_type } = Route.useSearch()

  if (action === 'create' && campaign_type === 'UGC') {
    return <UgcCreateBrief />
  }

  return <CampaignsListPlaceholder campaignType={campaign_type} action={action} />
}

function CampaignsListPlaceholder({
  action,
  campaignType,
}: {
  action?: 'create'
  campaignType?: 'UGC' | 'CPM' | 'Contest'
}) {
  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">Campaigns</h1>
      <p className="text-slate-600">Manage your campaigns here.</p>
      {action === 'create' && campaignType && campaignType !== 'UGC' && (
        <p className="mt-4 text-sm text-zinc-500">
          {campaignType} campaign creation is coming soon.
        </p>
      )}
    </div>
  )
}
