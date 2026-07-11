import { useMemo } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { differenceInDays, differenceInHours, format } from 'date-fns'
import {
  AlertTriangle,
  AlertCircle,
  Clock,
  Eye,
  Trophy,
  Users,
  Plus,
  ChevronRight,
  Wallet,
  CheckCircle2,
  ExternalLink,
  Video,
  Briefcase,
} from 'lucide-react'
import { useWallet } from '@/contexts/wallet-context'
import { useMe } from '@/hooks/use-auth'
import {
  useMyUgcOrders,
  useMyCpmDeals,
  useMyContests,
} from '@/hooks/use-opportunities'
import { useContestSubmissions } from '@/hooks/use-contest-board'
import { parseWalletAmount } from '@/lib/currency'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { CreateCampaignButton } from '@/components/create-campaign-button'
import { EmptyState } from '@/components/ui/empty-state'
import { EmptyStateUsersIllustration } from '@/components/ui/empty-state-illustration'
import { LoadingView } from '@/components/ui/view-state'

export const Route = createFileRoute('/dashboard/overview')({
  component: OverviewPage,
})

const LOW_BALANCE_THRESHOLD = 500

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

type CampaignDisplayType = 'UGC' | 'CPM' | 'Contest'

interface CampaignCardData {
  id: string
  type: CampaignDisplayType
  title: string
  deadline: string
  submissionsCount?: number
  budgetSpent: number
  budgetTotal: number
  status: string
}

const TYPE_BADGE_STYLES: Record<CampaignDisplayType, { label: string; className: string }> = {
  UGC: { label: 'UGC', className: 'bg-blue-50 text-blue-700 ring-blue-200' },
  CPM: { label: 'CPM', className: 'bg-purple-50 text-purple-700 ring-purple-200' },
  Contest: { label: 'Contest', className: 'bg-amber-50 text-amber-700 ring-amber-200' },
}

const TYPE_ICONS: Record<CampaignDisplayType, React.ElementType> = {
  UGC: Video,
  CPM: Briefcase,
  Contest: Trophy,
}

function OverviewPage() {
  const { formatMoney, availableBalance, wallet, openFundModal, loading: walletLoading } = useWallet()
  const { data: meData } = useMe()

  const brandName = meData?.me?.brand?.brandName ?? 'your brand'
  const currencySymbol = wallet?.currency ?? '$'
  const reservedBalance = parseWalletAmount(wallet?.reservedBalance)
  const totalSpent = parseWalletAmount(wallet?.totalSpent)

  const ugcQuery = useMyUgcOrders('live')
  const cpmQuery = useMyCpmDeals('live')
  const contestQuery = useMyContests('live')

  const loadingCampaigns = ugcQuery.loading || cpmQuery.loading || contestQuery.loading

  const activeCampaigns = useMemo<CampaignCardData[]>(() => {
    const campaigns: CampaignCardData[] = []

    for (const item of (ugcQuery.data?.myUgcOrders ?? [])) {
      campaigns.push({
        id: item.id,
        type: 'UGC',
        title: item.title,
        deadline: item.deadline,
        submissionsCount: 0,
        budgetSpent: 0,
        budgetTotal: Number(item.totalBudget) || 0,
        status: item.status,
      })
    }

    for (const item of (cpmQuery.data?.myCpmDeals ?? [])) {
      campaigns.push({
        id: item.id,
        type: 'CPM',
        title: item.title,
        deadline: item.postingDeadline,
        submissionsCount: 0,
        budgetSpent: 0,
        budgetTotal: Number(item.maxCampaignBudget) || 0,
        status: item.status,
      })
    }

    for (const item of (contestQuery.data?.myContests ?? [])) {
      campaigns.push({
        id: item.id,
        type: 'Contest',
        title: item.title,
        deadline: item.submissionDeadline,
        submissionsCount: 0,
        budgetSpent: 0,
        budgetTotal: Number(item.totalContestBudget) || 0,
        status: item.status,
      })
    }

    return campaigns
  }, [ugcQuery.data, cpmQuery.data, contestQuery.data])

  const isLowBalance = !walletLoading && availableBalance > 0 && availableBalance < LOW_BALANCE_THRESHOLD
  const isEmptyBalance = !walletLoading && availableBalance <= 0
  const urgentDeadlines = useMemo(() => {
    return activeCampaigns.filter((c) => {
      if (!c.deadline) return false
      const hours = differenceInHours(new Date(c.deadline), new Date())
      return hours > 0 && hours <= 48
    })
  }, [activeCampaigns])

  const hasUrgentDeadline = urgentDeadlines.length > 0

  const navigate = useNavigate()

  return (
    <div className="space-y-8">
      {/* Welcome Line */}
      <WelcomeLine
        brandName={brandName}
        hasUrgentDeadline={hasUrgentDeadline}
        urgentCount={urgentDeadlines.length}
        isLowBalance={isLowBalance}
        isEmptyBalance={isEmptyBalance}
      />

      {/* Wallet Strip */}
      <section>
        <WalletStrip
          availableBalance={availableBalance}
          reservedBalance={reservedBalance}
          totalSpent={totalSpent}
          currencySymbol={currencySymbol}
          formatMoney={formatMoney}
          isLowBalance={isLowBalance}
          isEmptyBalance={isEmptyBalance}
          walletLoading={walletLoading}
          onFundWallet={openFundModal}
        />
      </section>

      {/* Active Campaigns + Sidebar Layout */}
      <div className="flex gap-8">
        <div className="min-w-0 flex-1 space-y-8">
          <ActiveCampaignsSection
            campaigns={activeCampaigns}
            loading={loadingCampaigns}
            formatMoney={formatMoney}
            navigate={navigate}
          />

          <PendingActionsSection
            isLowBalance={isLowBalance}
            isEmptyBalance={isEmptyBalance}
            availableBalance={availableBalance}
            onFundWallet={openFundModal}
            campaigns={activeCampaigns}
          />

          <SubmissionsOverview />
        </div>

        {/* Right Sidebar */}
        <aside className="hidden w-72 shrink-0 lg:block">
          <RightSidebar />
        </aside>
      </div>
    </div>
  )
}

function WelcomeLine({
  brandName,
  hasUrgentDeadline,
  urgentCount,
  isLowBalance,
  isEmptyBalance,
}: {
  brandName: string
  hasUrgentDeadline: boolean
  urgentCount: number
  isLowBalance: boolean
  isEmptyBalance: boolean
}) {
  if (hasUrgentDeadline) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
        <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
        <p className="text-sm font-medium text-red-800">
          {urgentCount} campaign{urgentCount > 1 ? 's' : ''} closing soon — submissions due within 48 hours.
        </p>
      </div>
    )
  }

  if (isEmptyBalance) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
        <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
        <p className="text-sm font-medium text-amber-800">
          Your wallet is empty. Add funds to launch a campaign.
        </p>
      </div>
    )
  }

  if (isLowBalance) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
        <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
        <p className="text-sm font-medium text-amber-800">
          Your wallet balance is running low. Fund it to keep your campaigns live.
        </p>
      </div>
    )
  }

  return (
    <p className="text-sm text-zinc-600">
      {getGreeting()}, <span className="font-semibold text-zinc-900">{brandName}</span> — here is what is happening today.
    </p>
  )
}

function WalletStrip({
  availableBalance,
  reservedBalance,
  totalSpent,
  currencySymbol,
  formatMoney,
  isLowBalance,
  isEmptyBalance,
  walletLoading,
  onFundWallet,
}: {
  availableBalance: number
  reservedBalance: number
  totalSpent: number
  currencySymbol: string
  formatMoney: (amount: number) => string
  isLowBalance: boolean
  isEmptyBalance: boolean
  walletLoading: boolean
  onFundWallet: () => void
}) {
  const availableVariant = isEmptyBalance ? 'empty' : isLowBalance ? 'low' : 'healthy'

  return (
    <div className="flex flex-wrap items-stretch gap-4">
      <div
        className={cn(
          'flex flex-1 flex-col justify-between rounded-xl border p-5 min-w-[180px]',
          availableVariant === 'empty' && 'border-red-200 bg-red-50',
          availableVariant === 'low' && 'border-amber-200 bg-amber-50',
          availableVariant === 'healthy' && 'border-zinc-200 bg-white'
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <span className="text-xs font-medium text-zinc-500">Available Balance</span>
          <Wallet className="h-4 w-4 text-zinc-400" />
        </div>
        <div className="mt-2">
          <span className="text-3xl font-semibold tracking-tight text-zinc-900">
            {walletLoading ? '...' : formatMoney(availableBalance)}
          </span>
          <span className="ml-1 text-xs text-zinc-400">{currencySymbol}</span>
        </div>
        {isEmptyBalance && (
          <p className="mt-2 text-xs font-medium text-red-600 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Add funds to launch a campaign
          </p>
        )}
        {isLowBalance && (
          <p className="mt-2 text-xs font-medium text-amber-600 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Low balance
          </p>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between rounded-xl border border-zinc-200 bg-white p-5 min-w-[140px]">
        <span className="text-xs font-medium text-zinc-500">Reserved Balance</span>
        <div className="mt-2">
          <span className="text-xl font-semibold tracking-tight text-zinc-900">
            {walletLoading ? '...' : formatMoney(reservedBalance)}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between rounded-xl border border-zinc-200 bg-white p-5 min-w-[140px]">
        <span className="text-xs font-medium text-zinc-500">Total Spent</span>
        <div className="mt-2">
          <span className="text-xl font-semibold tracking-tight text-zinc-900">
            {walletLoading ? '...' : formatMoney(totalSpent)}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between rounded-xl border border-zinc-200 bg-white p-5 min-w-[140px]">
        <span className="text-xs font-medium text-zinc-500">&nbsp;</span>
        <Button onClick={onFundWallet} disabled={walletLoading} className="w-full">
          <Plus className="h-4 w-4" />
          Fund wallet
        </Button>
      </div>
    </div>
  )
}

function ActiveCampaignsSection({
  campaigns,
  loading,
  formatMoney,
  navigate,
}: {
  campaigns: CampaignCardData[]
  loading: boolean
  formatMoney: (amount: number) => string
  navigate: ReturnType<typeof useNavigate>
}) {
  if (loading) {
    return (
      <section>
        <h2 className="mb-4 text-lg font-semibold text-zinc-900">Your active campaigns</h2>
        <LoadingView label="Loading campaigns…" tone="primary" />
      </section>
    )
  }

  if (campaigns.length === 0) {
    return (
      <section>
        <h2 className="mb-4 text-lg font-semibold text-zinc-900">Your active campaigns</h2>
        <EmptyState
          compact
          embedded
          title="No active campaigns"
          description="Create your first opportunity to start receiving content."
          action={<CreateCampaignButton />}
        />
      </section>
    )
  }

  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold text-zinc-900">Your active campaigns</h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {campaigns.map((campaign) => (
          <CampaignCard
            key={`${campaign.type}-${campaign.id}`}
            campaign={campaign}
            formatMoney={formatMoney}
            navigate={navigate}
          />
        ))}
      </div>
    </section>
  )
}

function CampaignCard({
  campaign,
  formatMoney,
  navigate,
}: {
  campaign: CampaignCardData
  formatMoney: (amount: number) => string
  navigate: ReturnType<typeof useNavigate>
}) {
  const badge = TYPE_BADGE_STYLES[campaign.type]
  const Icon = TYPE_ICONS[campaign.type]

  const deadline = campaign.deadline ? new Date(campaign.deadline) : null
  const daysRemaining = deadline ? Math.max(0, differenceInDays(deadline, new Date())) : null
  const hoursRemaining = deadline ? Math.max(0, differenceInHours(deadline, new Date())) : null
  const isUrgent = hoursRemaining !== null && hoursRemaining <= 48

  const budgetProgress = campaign.budgetTotal > 0 ? (campaign.budgetSpent / campaign.budgetTotal) * 100 : 0

  return (
    <article className="flex flex-col rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
            badge.className
          )}
        >
          <Icon className="h-3 w-3" />
          {badge.label}
        </span>
        {daysRemaining !== null && (
          <span
            className={cn(
              'inline-flex items-center gap-1 text-xs font-medium',
              isUrgent ? 'text-red-600' : 'text-zinc-500'
            )}
          >
            <Clock className="h-3 w-3" />
            {daysRemaining === 0
              ? 'Due today'
              : `${daysRemaining}d remaining`}
          </span>
        )}
      </div>

      <h3 className="mt-3 text-sm font-semibold text-zinc-900 line-clamp-2">{campaign.title}</h3>

      <div className="mt-3 flex items-center gap-4 text-xs text-zinc-500">
        <span className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          {campaign.submissionsCount ?? 0} submissions
        </span>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>Budget</span>
          <span>
            {formatMoney(campaign.budgetSpent)} / {formatMoney(campaign.budgetTotal)}
          </span>
        </div>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${Math.min(budgetProgress, 100)}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        {campaign.type === 'Contest' ? (
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={() =>
              navigate({
                to: '/dashboard/campaigns/$id/board',
                params: { id: campaign.id },
              })
            }
          >
            <Trophy className="h-3.5 w-3.5" />
            View contest board
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={() =>
              navigate({
                to: '/dashboard/campaigns',
                search: { action: 'expand', opportunity_id: campaign.id, opportunity_type: campaign.type, campaign_title: campaign.title },
              })
            }
          >
            <Eye className="h-3.5 w-3.5" />
            Review submissions
          </Button>
        )}
      </div>
    </article>
  )
}

function PendingActionsSection({
  isLowBalance,
  isEmptyBalance,
  availableBalance,
  onFundWallet,
  campaigns,
}: {
  isLowBalance: boolean
  isEmptyBalance: boolean
  availableBalance: number
  onFundWallet: () => void
  campaigns: CampaignCardData[]
}) {
  const items = useMemo(() => {
    const result: Array<{
      id: string
      icon: React.ElementType
      iconClass: string
      message: string
      action: string
      onClick?: () => void
      to?: { path: string; params?: Record<string, string>; search?: Record<string, string> }
    }> = []

    if (isEmptyBalance) {
      result.push({
        id: 'wallet-empty',
        icon: AlertCircle,
        iconClass: 'text-red-500',
        message: 'Your wallet is empty. Add funds to launch a campaign.',
        action: 'Fund wallet',
        onClick: onFundWallet,
      })
    } else if (isLowBalance) {
      result.push({
        id: 'wallet-low',
        icon: AlertTriangle,
        iconClass: 'text-amber-500',
        message: 'Your wallet balance is running low. Fund it to keep your campaigns live.',
        action: 'Fund wallet',
        onClick: onFundWallet,
      })
    }

    for (const campaign of campaigns) {
      if (campaign.type === 'Contest' && campaign.deadline) {
        const hours = differenceInHours(new Date(campaign.deadline), new Date())
        if (hours <= 48 && hours > 0) {
          result.push({
            id: `contest-ending-${campaign.id}`,
            icon: Clock,
            iconClass: 'text-red-500',
            message: `Your contest closes in ${hours}h. You have not selected winners yet.`,
            action: 'Select winners',
            to: {
              path: '/dashboard/campaigns/$id/select-winners',
              params: { id: campaign.id },
            },
          })
        }
      }
    }

    return result
  }, [isLowBalance, isEmptyBalance, availableBalance, campaigns, onFundWallet])

  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <section>
        <h2 className="mb-4 text-lg font-semibold text-zinc-900">Needs your attention</h2>
        <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-5 py-6">
          <CheckCircle2 className="h-8 w-8 shrink-0 text-emerald-500" />
          <div>
            <p className="text-sm font-medium text-zinc-900">You are all caught up.</p>
            <p className="text-xs text-zinc-500">Nothing needs your attention right now.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold text-zinc-900">Needs your attention</h2>
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white px-5 py-4"
          >
            <item.icon className={cn('h-5 w-5 shrink-0', item.iconClass)} />
            <p className="flex-1 text-sm text-zinc-700">{item.message}</p>
            <Button
              size="sm"
              onClick={() => {
                if (item.onClick) {
                  item.onClick()
                } else if (item.to) {
                  const navTo = item.to
                  if (navTo.search) {
                    navigate({ to: navTo.path as any, search: navTo.search as any })
                  } else if (navTo.params) {
                    navigate({ to: navTo.path as any, params: navTo.params as any })
                  } else {
                    navigate({ to: navTo.path as any })
                  }
                }
              }}
            >
              {item.action}
            </Button>
          </div>
        ))}
      </div>
    </section>
  )
}

function formatCompactNumber(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

function SubmissionsOverview() {
  const { data: walletData } = useMyContests('live')
  const liveContests = walletData?.myContests ?? []

  const firstContestId = liveContests[0]?.id
  const { data: submissionsData, loading: submissionsLoading } = useContestSubmissions(firstContestId)

  const submissions = submissionsData?.contestSubmissions ?? []
  const hasSubmissions = submissions.length > 0

  if (submissionsLoading && !hasSubmissions) {
    return (
      <section>
        <h2 className="mb-4 text-lg font-semibold text-zinc-900">Recent submissions</h2>
        <LoadingView label="Loading submissions…" tone="primary" />
      </section>
    )
  }

  if (!hasSubmissions) {
    return (
      <section>
        <h2 className="mb-4 text-lg font-semibold text-zinc-900">Recent submissions</h2>
        <EmptyState
          compact
          embedded
          title="No submissions yet"
          description="Your opportunities are live and creators will start submitting soon."
        />
      </section>
    )
  }

  const recentSubmissions = submissions.slice(0, 6)
  const contestTitle = liveContests.find((c) => c.id === firstContestId)?.title ?? 'Unknown campaign'

  const STATUS_BADGES: Record<string, { label: string; className: string }> = {
    submitted: { label: 'Submitted', className: 'bg-blue-50 text-blue-700 ring-blue-200' },
    under_review: { label: 'Under review', className: 'bg-amber-50 text-amber-700 ring-amber-200' },
    shortlisted: { label: 'Shortlisted', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
    revision_requested: { label: 'Revision requested', className: 'bg-purple-50 text-purple-700 ring-purple-200' },
    resubmitted: { label: 'Resubmitted', className: 'bg-indigo-50 text-indigo-700 ring-indigo-200' },
    winner: { label: 'Winner', className: 'bg-amber-50 text-amber-700 ring-amber-200' },
    approved: { label: 'Approved', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
    rejected: { label: 'Rejected', className: 'bg-red-50 text-red-700 ring-red-200' },
    paid: { label: 'Paid', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  }

  const navigate = useNavigate()

  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold text-zinc-900">Recent submissions</h2>
      <div className="overflow-hidden rounded-xl border border-zinc-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50">
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">Creator</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">Campaign</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">Status</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {recentSubmissions.map((sub) => {
              const statusBadge = STATUS_BADGES[sub.status] ?? {
                label: sub.status,
                className: 'bg-zinc-50 text-zinc-600 ring-zinc-200',
              }

              return (
                <tr key={sub.id} className="group hover:bg-zinc-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                        {sub.thumbnailUrl ? (
                          <img
                            src={sub.thumbnailUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Video className="h-4 w-4 text-zinc-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-900">{sub.creator?.fullName ?? `Creator #${sub.creatorId.slice(0, 6)}`}</p>
                        {sub.creator && (sub.creator.youtubeSubscriberCount != null || sub.creator.instagramFollowerCount != null || sub.creator.tiktokFollowerCount != null) && (
                          <p className="mt-0.5 text-xs text-zinc-400">
                            {sub.creator.instagramFollowerCount != null && `IG ${formatCompactNumber(sub.creator.instagramFollowerCount)} `}
                            {sub.creator.tiktokFollowerCount != null && `TT ${formatCompactNumber(sub.creator.tiktokFollowerCount)} `}
                            {sub.creator.youtubeSubscriberCount != null && `YT ${formatCompactNumber(sub.creator.youtubeSubscriberCount)}`}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-600">{contestTitle}</td>
                  <td className="px-4 py-3 text-sm text-zinc-500">
                    {format(new Date(sub.createdAt), 'MMM d, yyyy h:mm a')}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
                        statusBadge.className
                      )}
                    >
                      {statusBadge.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        navigate({
                          to: '/dashboard/submissions/$id',
                          params: { id: sub.id },
                        })
                      }
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      View
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-3 text-right">
        <Button
          variant="link"
          size="sm"
          onClick={() => navigate({ to: '/dashboard/submissions' })}
        >
          View all submissions
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </section>
  )
}

function RightSidebar() {
  return (
    <div className="sticky top-6 space-y-6">
      {/* Top Creators */}
      <div className="rounded-xl border border-zinc-200 bg-white">
          <div className="flex flex-col items-center px-5 pb-6 pt-10 text-center min-h-[280px] justify-center">
          <EmptyStateUsersIllustration className="scale-[0.75] -mb-2" />
          <h3 className="text-sm font-semibold text-zinc-900">Top creators</h3>
          <p className="mt-1.5 text-xs leading-relaxed text-zinc-500 max-w-[200px]">
            When creators submit to your campaigns, their profiles will appear here ranked by quality and volume.
          </p>
        </div>
      </div>

      {/* Platform Announcements */}
      <div className="rounded-xl border border-zinc-200 bg-white">
          <div className="flex flex-col items-center px-5 pb-6 pt-10 text-center min-h-[280px] justify-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A1A1AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-zinc-900">Announcements</h3>
          <p className="mt-1.5 text-xs leading-relaxed text-zinc-500 max-w-[200px]">
            Platform updates, new features, and maintenance notices from Splennet will appear here.
          </p>
        </div>
      </div>
    </div>
  )
}
