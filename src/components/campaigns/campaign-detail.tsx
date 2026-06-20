import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ChevronLeft, CirclePause, CirclePlay, CircleStop, Pencil } from 'lucide-react'
import type { OpportunityStatus } from '@/hooks/use-opportunities'
import {
  toOpportunityType,
  useContest,
  useCpmDeal,
  useOpportunityTransitions,
  useUgcOrder,
} from '@/hooks/use-opportunities'
import type {
  ContestDetail,
  CpmDealDetail,
  UgcOrderDetail,
} from '@/hooks/use-opportunities'
import { Button } from '@/components/ui/button'
import { Tabs, type Tab } from '@/components/ui/tabs'
import { BriefField, BriefProse, BriefSection } from '@/components/campaigns/brief-field'
import { DotBadge } from '@/components/ui/dot-badge'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingView } from '@/components/ui/view-state'
import { useWallet } from '@/contexts/wallet-context'

const CAMPAIGN_STATUS_STYLES: Record<
  OpportunityStatus,
  { label: string; badge: string; dot: string }
> = {
  draft: {
    label: 'Draft',
    badge: 'bg-zinc-100 text-zinc-600 ring-zinc-200',
    dot: 'bg-zinc-400',
  },
  pending_approval: {
    label: 'Pending approval',
    badge: 'bg-amber-50 text-amber-700 ring-amber-100',
    dot: 'bg-amber-500',
  },
  live: {
    label: 'Live',
    badge: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    dot: 'bg-emerald-500',
  },
  paused: {
    label: 'Paused',
    badge: 'bg-orange-50 text-orange-700 ring-orange-100',
    dot: 'bg-orange-500',
  },
  closed: {
    label: 'Closed',
    badge: 'bg-slate-100 text-slate-600 ring-slate-200',
    dot: 'bg-slate-400',
  },
  cancelled: {
    label: 'Cancelled',
    badge: 'bg-red-50 text-red-700 ring-red-100',
    dot: 'bg-red-500',
  },
  completed: {
    label: 'Completed',
    badge: 'bg-blue-50 text-blue-700 ring-blue-100',
    dot: 'bg-blue-500',
  },
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function typeLabel(type: 'UGC' | 'CPM' | 'Contest') {
  return type === 'UGC' ? 'UGC Order' : type === 'CPM' ? 'CPM Deal' : 'Contest'
}

function isEditableCampaignStatus(status: OpportunityStatus) {
  return status === 'draft' || status === 'pending_approval'
}

function CampaignDetailActions({
  opportunityId,
  opportunityType,
  status,
}: {
  opportunityId: string
  opportunityType: 'UGC' | 'CPM' | 'Contest'
  status: OpportunityStatus
}) {
  const {
    pauseOpportunity,
    resumeOpportunity,
    closeOpportunity,
    loading: transitioning,
  } = useOpportunityTransitions()

  const backendType = toOpportunityType(opportunityType)

  if (isEditableCampaignStatus(status)) {
    return (
      <Link
        to="/dashboard/campaigns"
        search={{ action: 'edit', campaign_type: opportunityType, opportunity_id: opportunityId }}
      >
        <Button variant="outline" size="sm">
          <Pencil className="h-3.5 w-3.5" />
          Edit campaign
        </Button>
      </Link>
    )
  }

  if (status === 'live') {
    return (
      <div className="flex flex-wrap justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => pauseOpportunity(backendType, opportunityId)}
          isLoading={transitioning}
        >
          <CirclePause className="h-3.5 w-3.5" />
          Pause
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => closeOpportunity(backendType, opportunityId)}
          disabled={transitioning}
        >
          <CircleStop className="h-3.5 w-3.5" />
          Close
        </Button>
      </div>
    )
  }

  if (status === 'paused') {
    return (
      <div className="flex flex-wrap justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => resumeOpportunity(backendType, opportunityId)}
          isLoading={transitioning}
        >
          <CirclePlay className="h-3.5 w-3.5" />
          Resume
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => closeOpportunity(backendType, opportunityId)}
          disabled={transitioning}
        >
          <CircleStop className="h-3.5 w-3.5" />
          Close
        </Button>
      </div>
    )
  }

  return null
}

function UgcDetails({ detail }: { detail: UgcOrderDetail }) {
  return (
    <>
      <BriefSection title="Campaign settings">
        <div className="grid grid-cols-2 gap-x-6 gap-y-6">
          <BriefField label="Creators needed">
            <p className="text-sm text-zinc-900">{detail.numberOfCreators}</p>
          </BriefField>
          <BriefField label="Flat rate per creator">
            <p className="text-sm text-zinc-900">
              {detail.flatRatePerCreator
                ? new Intl.NumberFormat(undefined, {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(Number(detail.flatRatePerCreator))
                : '-'}
            </p>
          </BriefField>
        </div>
        <BriefField label="Deadline">
          <p className="text-sm text-zinc-600">{formatDateTime(detail.deadline)}</p>
        </BriefField>
      </BriefSection>

      {detail.fullDescription && (
        <BriefSection title="Full description">
          <p className="text-sm leading-relaxed text-zinc-600">{detail.fullDescription}</p>
        </BriefSection>
      )}

      {detail.externalBriefLink && (
        <BriefSection title="External brief link">
          <a
            href={detail.externalBriefLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary underline hover:text-primary/80"
          >
            {detail.externalBriefLink}
          </a>
        </BriefSection>
      )}
    </>
  )
}

function CpmDetails({ detail }: { detail: CpmDealDetail }) {
  return (
    <>
      <BriefSection title="Campaign settings">
        <BriefField label="Creators needed">
          <p className="text-sm text-zinc-900">{detail.numberOfCreators}</p>
        </BriefField>
        <div className="grid grid-cols-2 gap-x-6 gap-y-6">
          <BriefField label="Posting deadline">
            <p className="text-sm text-zinc-600">{formatDateTime(detail.postingDeadline)}</p>
          </BriefField>
          <BriefField label="View count deadline">
            <p className="text-sm text-zinc-600">{formatDateTime(detail.finalViewCountDeadline)}</p>
          </BriefField>
        </div>
      </BriefSection>

      {detail.fullDescription && (
        <BriefSection title="Full description">
          <p className="text-sm leading-relaxed text-zinc-600">{detail.fullDescription}</p>
        </BriefSection>
      )}

      {detail.externalBriefLink && (
        <BriefSection title="External brief link">
          <a
            href={detail.externalBriefLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary underline hover:text-primary/80"
          >
            {detail.externalBriefLink}
          </a>
        </BriefSection>
      )}
    </>
  )
}

function ContestDetails({ detail }: { detail: ContestDetail }) {
  return (
    <>
      <BriefSection title="Campaign settings">
        <BriefField label="Minimum winners">
          <p className="text-sm text-zinc-900">{detail.minimumWinners}</p>
        </BriefField>
        <div className="grid grid-cols-2 gap-x-6 gap-y-6">
          <BriefField label="Submission deadline">
            <p className="text-sm text-zinc-600">{formatDateTime(detail.submissionDeadline)}</p>
          </BriefField>
          <BriefField label="Winner announcement">
            <p className="text-sm text-zinc-600">{formatDateTime(detail.winnerAnnouncementDate)}</p>
          </BriefField>
        </div>
      </BriefSection>

      {detail.fullDescription && (
        <BriefSection title="Full description">
          <p className="text-sm leading-relaxed text-zinc-600">{detail.fullDescription}</p>
        </BriefSection>
      )}

      {detail.externalBriefLink && (
        <BriefSection title="External brief link">
          <a
            href={detail.externalBriefLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary underline hover:text-primary/80"
          >
            {detail.externalBriefLink}
          </a>
        </BriefSection>
      )}

      {detail.rewards && detail.rewards.length > 0 && (
        <BriefSection title="Prizes">
          <div className="space-y-2">
            {detail.rewards.map((reward, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-zinc-100 bg-zinc-50 px-4 py-2.5">
                <span className="text-sm font-medium text-zinc-900">
                  {reward.label ? `${reward.label} place` : `#${reward.placement}`}
                </span>
                <span className="text-sm font-semibold text-zinc-900">
                  {new Intl.NumberFormat(undefined, {
                    style: 'currency',
                    currency: reward.currency,
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(Number(reward.amount))}
                </span>
              </div>
            ))}
          </div>
        </BriefSection>
      )}
    </>
  )
}

function GeneralTab({
  detail,
  opportunityType,
  formatMoney,
}: {
  detail: UgcOrderDetail | CpmDealDetail | ContestDetail
  opportunityType: 'UGC' | 'CPM' | 'Contest'
  formatMoney: (amount: number) => string
}) {
  const status = CAMPAIGN_STATUS_STYLES[detail.status]

  return (
    <div className="flex flex-col gap-8 xl:flex-row xl:items-start">
      <article className="min-w-0 flex-1 space-y-10">
        <BriefSection title="Details">
          <div className="grid grid-cols-2 gap-x-6 gap-y-6">
            <BriefField label="Campaign title">
              <p className="text-sm text-zinc-900">{detail.title}</p>
            </BriefField>
            <BriefField label="Product or service name">
              <p className="text-sm text-zinc-900">{detail.productName}</p>
            </BriefField>
          </div>

          {detail.shortDescription && (
            <BriefField label="Short description">
              <p className="text-sm leading-relaxed text-zinc-600">{detail.shortDescription}</p>
            </BriefField>
          )}

          <div className="grid grid-cols-2 gap-x-6 gap-y-6">
            <BriefField label="Status">
              <div className="pt-0.5">
                <DotBadge
                  label={status.label}
                  badgeClassName={status.badge}
                  dotClassName={status.dot}
                />
              </div>
            </BriefField>

            <BriefField label="Budget">
              <p className="text-sm font-medium text-zinc-900">
                {'totalBudget' in detail
                  ? formatMoney(Number(detail.totalBudget) || 0)
                  : 'maxCampaignBudget' in detail
                    ? formatMoney(Number(detail.maxCampaignBudget) || 0)
                    : formatMoney(Number(detail.totalContestBudget) || 0)}
              </p>
            </BriefField>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-6">
            <BriefField label="Created">
              <p className="text-sm text-zinc-600">{formatDate(detail.createdAt)}</p>
            </BriefField>
            <BriefField label="Last updated">
              <p className="text-sm text-zinc-600">{formatDate(detail.updatedAt)}</p>
            </BriefField>
          </div>
        </BriefSection>

        {opportunityType === 'UGC' && <UgcDetails detail={detail as UgcOrderDetail} />}
        {opportunityType === 'CPM' && <CpmDetails detail={detail as CpmDealDetail} />}
        {opportunityType === 'Contest' && <ContestDetails detail={detail as ContestDetail} />}
      </article>

      <aside className="w-full shrink-0 xl:sticky xl:top-0 xl:w-80">
        <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">Summary</h3>
            <p className="mt-1 text-xs text-zinc-500">{typeLabel(opportunityType)}</p>
          </div>

          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-zinc-500">Budget</dt>
              <dd className="font-semibold text-zinc-900">
                {formatMoney(
                  Number(
                    (detail as UgcOrderDetail).totalBudget ??
                      (detail as CpmDealDetail).maxCampaignBudget ??
                      (detail as ContestDetail).totalContestBudget ??
                      0
                  ) || 0
                )}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500">Status</dt>
              <dd>
                <DotBadge
                  label={status.label}
                  badgeClassName={status.badge}
                  dotClassName={status.dot}
                />
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500">Created</dt>
              <dd className="font-medium text-zinc-800">{formatDate(detail.createdAt)}</dd>
            </div>
          </dl>
        </div>
      </aside>
    </div>
  )
}

function SubmissionsTab() {
  return (
    <EmptyState
      title="No submissions yet"
      description="Creator submissions will appear here once the campaign is live and creators start submitting their work."
      compact
    />
  )
}

function ContestBoardTab() {
  return (
    <EmptyState
      title="Contest board"
      description="Track ranked creator entries and leaderboard standings here once submissions come in."
      compact
    />
  )
}

function AnalyticsTab() {
  return (
    <EmptyState
      title="Coming soon"
      description="Campaign analytics will be available here once the feature launches."
      compact
    />
  )
}

export function CampaignDetail({
  opportunityId,
  opportunityType,
}: {
  opportunityId: string
  opportunityType: 'UGC' | 'CPM' | 'Contest'
}) {
  const { formatMoney } = useWallet()

  const ugcQuery = useUgcOrder(opportunityType === 'UGC' ? opportunityId : undefined)
  const cpmQuery = useCpmDeal(opportunityType === 'CPM' ? opportunityId : undefined)
  const contestQuery = useContest(opportunityType === 'Contest' ? opportunityId : undefined)

  const loading = ugcQuery.loading || cpmQuery.loading || contestQuery.loading
  const detail =
    ugcQuery.data?.ugcOrder ?? cpmQuery.data?.cpmDeal ?? contestQuery.data?.contest

  const [activeTab, setActiveTab] = useState<'general' | 'submissions' | 'contest-board' | 'analytics'>('general')

  if (loading && !detail) {
    return <LoadingView label="Loading campaign…" tone="primary" />
  }

  if (!detail) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <Link
          to="/dashboard/campaigns"
          className="inline-flex w-fit items-center gap-1 rounded-full bg-zinc-100 px-3 py-1.5 text-[11px] font-semibold text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-900"
        >
          <ChevronLeft className="h-3 w-3" />
          Back to campaigns
        </Link>
        <p className="text-sm text-zinc-500">Campaign not found.</p>
      </div>
    )
  }

  const tabs: Tab<'general' | 'submissions' | 'contest-board' | 'analytics'>[] = [
    { id: 'general', label: 'General details', content: <GeneralTab detail={detail} opportunityType={opportunityType} formatMoney={formatMoney} /> },
    { id: 'submissions', label: 'Submissions', content: <SubmissionsTab /> },
    ...(opportunityType === 'Contest' ? [{ id: 'contest-board' as const, label: 'Contest board', content: <ContestBoardTab /> }] : []),
    { id: 'analytics', label: 'Analytics', content: <AnalyticsTab /> },
  ]

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <div className="flex items-center justify-between">
        <Link
          to="/dashboard/campaigns"
          className="inline-flex w-fit items-center gap-1 rounded-full bg-zinc-100 px-3 py-1.5 text-[11px] font-semibold text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-900"
        >
          <ChevronLeft className="h-3 w-3" />
          Back to campaigns
        </Link>
        <CampaignDetailActions
          opportunityId={opportunityId}
          opportunityType={opportunityType}
          status={detail.status}
        />
      </div>

      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.03em] text-zinc-900">
          {detail.title}
        </h1>
        <BriefProse>{typeLabel(opportunityType)}</BriefProse>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white px-6 py-8 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>
    </div>
  )
}
