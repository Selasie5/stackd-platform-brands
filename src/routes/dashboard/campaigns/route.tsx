import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { CampaignDetail } from '@/components/campaigns/campaign-detail'
import { UgcCreateBrief } from '@/components/campaigns/ugc-create-brief'
import { CpmCreateBrief } from '@/components/campaigns/cpm-create-brief'
import { ContestCreateBrief } from '@/components/campaigns/contest-create-brief'
import { CampaignsList } from '@/components/campaigns/campaigns-list'

const campaignsSearchSchema = z.object({
  action: z.enum(['create', 'view', 'edit']).optional(),
  campaign_type: z.enum(['UGC', 'CPM', 'Contest']).optional(),
  opportunity_id: z.string().optional(),
  opportunity_type: z.enum(['UGC', 'CPM', 'Contest']).optional(),
})

export const Route = createFileRoute('/dashboard/campaigns')({
  validateSearch: campaignsSearchSchema,
  component: CampaignsPage,
})

function CampaignsPage() {
  const { action, campaign_type, opportunity_id, opportunity_type } = Route.useSearch()

  if (action === 'view' && opportunity_id && opportunity_type) {
    return <CampaignDetail opportunityId={opportunity_id} opportunityType={opportunity_type} />
  }

  if (action === 'edit' && campaign_type === 'UGC') {
    return <UgcCreateBrief existingId={opportunity_id} />
  }

  if (action === 'edit' && campaign_type === 'CPM') {
    return <CpmCreateBrief existingId={opportunity_id} />
  }

  if (action === 'edit' && campaign_type === 'Contest') {
    return <ContestCreateBrief existingId={opportunity_id} />
  }

  if (action === 'create' && campaign_type === 'UGC') {
    return <UgcCreateBrief />
  }

  if (action === 'create' && campaign_type === 'CPM') {
    return <CpmCreateBrief />
  }

  if (action === 'create' && campaign_type === 'Contest') {
    return <ContestCreateBrief />
  }

  return <CampaignsList />
}
