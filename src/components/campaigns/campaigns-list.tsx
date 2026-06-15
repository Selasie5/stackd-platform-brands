import { Briefcase, Trophy, Video } from 'lucide-react'
import type { OpportunityStatus } from '@/hooks/use-opportunities'
import {
  useMyContests,
  useMyCpmDeals,
  useMyUgcOrders,
} from '@/hooks/use-opportunities'
import { CampaignsEmptyState } from '@/components/campaigns/campaigns-empty-state'
import { LoadingView } from '@/components/ui/view-state'
import { useWallet } from '@/contexts/wallet-context'
import { cn } from '@/lib/utils'

type CampaignListItem = {
  id: string
  type: 'UGC' | 'CPM' | 'Contest'
  title: string
  productName: string
  status: OpportunityStatus
  budget: number
  createdAt: string
}

const STATUS_LABELS: Record<OpportunityStatus, string> = {
  draft: 'Draft',
  pending_approval: 'Pending approval',
  live: 'Live',
  paused: 'Paused',
  closed: 'Closed',
  cancelled: 'Cancelled',
  completed: 'Completed',
}

const STATUS_STYLES: Record<OpportunityStatus, string> = {
  draft: 'bg-zinc-100 text-zinc-600',
  pending_approval: 'bg-amber-50 text-amber-700',
  live: 'bg-emerald-50 text-emerald-700',
  paused: 'bg-orange-50 text-orange-700',
  closed: 'bg-slate-100 text-slate-600',
  cancelled: 'bg-red-50 text-red-700',
  completed: 'bg-blue-50 text-blue-700',
}

const TYPE_ICONS = {
  UGC: Video,
  CPM: Briefcase,
  Contest: Trophy,
} as const

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function CampaignsList() {
  const { formatMoney } = useWallet()
  const ugcQuery = useMyUgcOrders()
  const cpmQuery = useMyCpmDeals()
  const contestQuery = useMyContests()

  const loading = ugcQuery.loading || cpmQuery.loading || contestQuery.loading

  const campaigns: CampaignListItem[] = [
    ...(ugcQuery.data?.myUgcOrders ?? []).map((item) => ({
      id: item.id,
      type: 'UGC' as const,
      title: item.title,
      productName: item.productName,
      status: item.status,
      budget: Number(item.totalBudget) || 0,
      createdAt: item.createdAt,
    })),
    ...(cpmQuery.data?.myCpmDeals ?? []).map((item) => ({
      id: item.id,
      type: 'CPM' as const,
      title: item.title,
      productName: item.productName,
      status: item.status,
      budget: Number(item.maxCampaignBudget) || 0,
      createdAt: item.createdAt,
    })),
    ...(contestQuery.data?.myContests ?? []).map((item) => ({
      id: item.id,
      type: 'Contest' as const,
      title: item.title,
      productName: item.productName,
      status: item.status,
      budget: Number(item.totalContestBudget) || 0,
      createdAt: item.createdAt,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  if (loading && campaigns.length === 0) {
    return <LoadingView label="Loading campaigns…" tone="primary" />
  }

  if (campaigns.length === 0) {
    return <CampaignsEmptyState />
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="border-b border-zinc-100 bg-zinc-50/80 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3">Campaign</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Budget</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {campaigns.map((campaign) => {
              const Icon = TYPE_ICONS[campaign.type]
              return (
                <tr key={`${campaign.type}-${campaign.id}`} className="hover:bg-zinc-50/60">
                  <td className="px-4 py-3">
                    <p className="font-medium text-zinc-900">{campaign.title}</p>
                    <p className="text-xs text-zinc-500">{campaign.productName}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 text-zinc-700">
                      <Icon className="h-3.5 w-3.5 text-zinc-400" aria-hidden="true" />
                      {campaign.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex rounded-full px-2.5 py-1 text-xs font-medium',
                        STATUS_STYLES[campaign.status]
                      )}
                    >
                      {STATUS_LABELS[campaign.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-zinc-800">
                    {formatMoney(campaign.budget)}
                  </td>
                  <td className="px-4 py-3 text-zinc-500">{formatDate(campaign.createdAt)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
