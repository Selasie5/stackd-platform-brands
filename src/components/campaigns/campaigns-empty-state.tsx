import { CreateCampaignButton } from '@/components/create-campaign-button'
import { EmptyState } from '@/components/ui/empty-state'

export function CampaignsEmptyState() {
  return (
    <EmptyState
      title="Expect to see your campaigns appear here soon!"
      description="Here is where you'll manage campaign creation, creator matching, and campaign progress tracking."
      action={<CreateCampaignButton />}
    />
  )
}
