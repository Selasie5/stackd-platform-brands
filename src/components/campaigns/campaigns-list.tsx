import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  Briefcase,
  CirclePause,
  CirclePlay,
  CircleStop,
  Expand,
  Eye,
  Pencil,
  Trophy,
  Video,
} from 'lucide-react'
import type {
  CampaignDisplayType,
  OpportunityStatus,
  OpportunityType,
} from '@/hooks/use-opportunities'
import {
  toOpportunityType,
  useMyContests,
  useMyCpmDeals,
  useMyUgcOrders,
  useOpportunityTransitions,
} from '@/hooks/use-opportunities'
import { CampaignsEmptyState } from '@/components/campaigns/campaigns-empty-state'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import type { DataTableColumn } from '@/components/ui/data-table'
import { Input } from '@/components/ui/input'
import { DatePicker } from '@/components/ui/date-picker'
import { DotBadge } from '@/components/ui/dot-badge'
import { LoadingView } from '@/components/ui/view-state'
import { Select } from '@/components/ui/select'
import { Tooltip } from '@/components/ui/tooltip'
import { useWallet } from '@/contexts/wallet-context'

type CampaignListItem = {
  id: string
  type: CampaignDisplayType
  title: string
  productName: string
  status: OpportunityStatus
  budget: number
  createdAt: string
}

type CampaignTransitionAction = (type: OpportunityType, id: string) => Promise<unknown>

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

const TYPE_ICONS = {
  UGC: Video,
  CPM: Briefcase,
  Contest: Trophy,
} as const

const TYPE_FILTER_OPTIONS = [
  { value: '', label: 'All types' },
  { value: 'UGC', label: 'UGC' },
  { value: 'CPM', label: 'CPM' },
  { value: 'Contest', label: 'Contest' },
]

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'All statuses' },
  ...Object.entries(CAMPAIGN_STATUS_STYLES).map(([value, style]) => ({
    value,
    label: style.label,
  })),
]

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function isEditableCampaignStatus(status: OpportunityStatus) {
  return status === 'draft' || status === 'pending_approval'
}

const ACTION_BUTTON_CLASS =
  'rounded p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 disabled:cursor-not-allowed disabled:opacity-40'

function buildCampaignColumns(
  formatMoney: (amount: number) => string,
  navigate: ReturnType<typeof useNavigate>,
  actions: {
    pauseOpportunity: CampaignTransitionAction
    resumeOpportunity: CampaignTransitionAction
    closeOpportunity: CampaignTransitionAction
    transitioning: boolean
  }
): DataTableColumn<CampaignListItem>[] {
  return [
    {
      id: 'title',
      header: 'Campaign',
      sortable: true,
      sortValue: (row) => row.title,
      cell: (row) => (
        <>
          <p className="font-medium text-zinc-900">{row.title}</p>
          <p className="text-xs text-zinc-500">{row.productName}</p>
        </>
      ),
    },
    {
      id: 'type',
      header: 'Type',
      sortable: true,
      sortValue: (row) => row.type,
      cell: (row) => {
        const Icon = TYPE_ICONS[row.type]
        return (
          <span className="inline-flex items-center gap-1.5 text-zinc-700">
            <Icon className="h-3.5 w-3.5 text-zinc-400" aria-hidden="true" />
            {row.type}
          </span>
        )
      },
    },
    {
      id: 'status',
      header: 'Status',
      sortable: true,
      sortValue: (row) => row.status,
      cell: (row) => {
        const status = CAMPAIGN_STATUS_STYLES[row.status]
        return (
          <DotBadge
            label={status.label}
            badgeClassName={status.badge}
            dotClassName={status.dot}
          />
        )
      },
    },
    {
      id: 'budget',
      header: 'Budget',
      sortable: true,
      sortValue: (row) => row.budget,
      cellClassName: 'font-medium text-zinc-800',
      cell: (row) => formatMoney(row.budget),
    },
    {
      id: 'createdAt',
      header: 'Created',
      sortable: true,
      sortValue: (row) => new Date(row.createdAt).getTime(),
      cellClassName: 'text-zinc-500',
      cell: (row) => formatDate(row.createdAt),
    },
    {
      id: 'actions',
      header: '',
      cell: (row) => {
        const backendType = toOpportunityType(row.type)

        return (
          <div className="flex items-center gap-1">
            <Tooltip content="View campaign">
              <button
                type="button"
                aria-label="View campaign"
                onClick={() =>
                  navigate({
                    to: '/dashboard/campaigns',
                    search: { action: 'expand', opportunity_id: row.id, opportunity_type: row.type, campaign_title: row.title },
                  })
                }
                className={ACTION_BUTTON_CLASS}
              >
                <Eye className="h-4 w-4" />
              </button>
            </Tooltip>

            {isEditableCampaignStatus(row.status) && (
              <Tooltip content="Edit campaign">
                <button
                  type="button"
                  aria-label="Edit campaign"
                onClick={() =>
                  navigate({
                    to: '/dashboard/campaigns',
                    search: { action: 'edit', campaign_type: row.type, opportunity_id: row.id, campaign_title: row.title },
                  })
                }
                  className={ACTION_BUTTON_CLASS}
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </Tooltip>
            )}

            {row.status === 'live' && (
              <>
                <Tooltip content="Pause campaign">
                  <button
                    type="button"
                    aria-label="Pause campaign"
                    onClick={() => actions.pauseOpportunity(backendType, row.id)}
                    disabled={actions.transitioning}
                    className={ACTION_BUTTON_CLASS}
                  >
                    <CirclePause className="h-4 w-4" />
                  </button>
                </Tooltip>
                <Tooltip content="Close campaign">
                  <button
                    type="button"
                    aria-label="Close campaign"
                    onClick={() => actions.closeOpportunity(backendType, row.id)}
                    disabled={actions.transitioning}
                    className={ACTION_BUTTON_CLASS}
                  >
                    <CircleStop className="h-4 w-4" />
                  </button>
                </Tooltip>
              </>
            )}

            {row.status === 'paused' && (
              <>
                <Tooltip content="Resume campaign">
                  <button
                    type="button"
                    aria-label="Resume campaign"
                    onClick={() => actions.resumeOpportunity(backendType, row.id)}
                    disabled={actions.transitioning}
                    className={ACTION_BUTTON_CLASS}
                  >
                    <CirclePlay className="h-4 w-4" />
                  </button>
                </Tooltip>
                <Tooltip content="Close campaign">
                  <button
                    type="button"
                    aria-label="Close campaign"
                    onClick={() => actions.closeOpportunity(backendType, row.id)}
                    disabled={actions.transitioning}
                    className={ACTION_BUTTON_CLASS}
                  >
                    <CircleStop className="h-4 w-4" />
                  </button>
                </Tooltip>
              </>
            )}

            <Tooltip content="Open detail view">
              <button
                type="button"
                aria-label="Open detail view"
                onClick={() =>
                  navigate({
                    to: '/dashboard/campaigns',
                    search: { action: 'view', opportunity_id: row.id, opportunity_type: row.type, campaign_title: row.title },
                  })
                }
                className={ACTION_BUTTON_CLASS}
              >
                <Expand className="h-4 w-4" />
              </button>
            </Tooltip>
          </div>
        )
      },
    },
  ]
}

export function CampaignsList() {
  const { formatMoney } = useWallet()
  const {
    pauseOpportunity,
    resumeOpportunity,
    closeOpportunity,
    loading: transitioningCampaign,
  } = useOpportunityTransitions()
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
  ]

  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!searchInput.trim()) {
      setSearchQuery('')
    }
  }, [searchInput])

  const navigate = useNavigate()

  const columns = useMemo(
    () =>
      buildCampaignColumns(formatMoney, navigate, {
        pauseOpportunity,
        resumeOpportunity,
        closeOpportunity,
        transitioning: transitioningCampaign,
      }),
    [
      closeOpportunity,
      formatMoney,
      navigate,
      pauseOpportunity,
      resumeOpportunity,
      transitioningCampaign,
    ]
  )

  const filtered = useMemo(() => {
    let rows = [...campaigns]

    if (typeFilter) {
      rows = rows.filter((row) => row.type === typeFilter)
    }

    if (statusFilter) {
      rows = rows.filter((row) => row.status === statusFilter)
    }

    if (dateFrom) {
      const from = new Date(`${dateFrom}T00:00:00`)
      rows = rows.filter((row) => new Date(row.createdAt) >= from)
    }

    if (dateTo) {
      const to = new Date(`${dateTo}T23:59:59`)
      rows = rows.filter((row) => new Date(row.createdAt) <= to)
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      rows = rows.filter(
        (row) =>
          row.title.toLowerCase().includes(q) ||
          row.productName.toLowerCase().includes(q)
      )
    }

    return rows
  }, [campaigns, typeFilter, statusFilter, dateFrom, dateTo, searchQuery])

  const dateFromValue = dateFrom ? new Date(`${dateFrom}T00:00:00`) : undefined

  if (loading && campaigns.length === 0) {
    return <LoadingView label="Loading campaigns…" tone="primary" />
  }

  if (campaigns.length === 0) {
    return <CampaignsEmptyState />
  }

  const handleSearch = () => {
    setSearchQuery(searchInput)
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <DataTable
      data={filtered}
      columns={columns}
      getRowKey={(row) => `${row.type}-${row.id}`}
      defaultSort={{ columnId: 'createdAt', direction: 'desc' }}
      height={520}
      title={
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search campaigns…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="w-[220px]"
          />
          <Button size="sm" onClick={handleSearch} disabled={!searchInput.trim()}>
            Search
          </Button>
        </div>
      }
      toolbar={
        <div className="flex flex-wrap gap-3">
          <div className="w-[160px]">
            <Select
              id="campaign-type-filter"
              value={typeFilter}
              onChange={setTypeFilter}
              options={TYPE_FILTER_OPTIONS}
              placeholder="Filter by type"
            />
          </div>
          <div className="w-[180px]">
            <Select
              id="campaign-status-filter"
              value={statusFilter}
              onChange={setStatusFilter}
              options={STATUS_FILTER_OPTIONS}
              placeholder="Filter by status"
            />
          </div>
          <div className="w-[160px]">
            <DatePicker
              id="campaign-date-from"
              value={dateFrom}
              onChange={setDateFrom}
              placeholder="From date"
            />
          </div>
          <div className="w-[160px]">
            <DatePicker
              id="campaign-date-to"
              value={dateTo}
              onChange={setDateTo}
              placeholder="To date"
              fromDate={dateFromValue}
            />
          </div>
        </div>
      }
      emptyState={{
        title: 'No campaigns match your filters',
        description: 'Try adjusting your filters to find the campaign you are looking for.',
      }}
    />
  )
}
