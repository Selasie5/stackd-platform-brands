import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { UgcCreateBrief } from '@/components/campaigns/ugc-create-brief'
import { CpmCreateBrief } from '@/components/campaigns/cpm-create-brief'
import { ContestCreateBrief } from '@/components/campaigns/contest-create-brief'
import { CampaignsList } from '@/components/campaigns/campaigns-list'

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

  if (action === 'create' && campaign_type === 'CPM') {
    return <CpmCreateBrief />
  }

  if (action === 'create' && campaign_type === 'Contest') {
    return <ContestCreateBrief />
  }

  return <CampaignsList />
}
