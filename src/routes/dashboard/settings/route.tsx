import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ChevronRight, ShieldCheck, UserRound } from 'lucide-react'
import type { ElementType, ReactNode } from 'react'
import { z } from 'zod'
import { KycVerificationTab } from '@/components/kyc/kyc-verification-tab'
import { useMe } from '@/hooks/use-auth'
import { KYC_STATUS_LABELS, resolveEffectiveKycStatus } from '@/lib/kyc'
import type { KycStatus } from '@/lib/kyc'
import { useMyKycApplication } from '@/hooks/use-kyc'
import { cn } from '@/lib/utils'

const settingsSearchSchema = z.object({
  tab: z.enum(['general', 'kyc']).optional().default('general'),
})

export const Route = createFileRoute('/dashboard/settings')({
  validateSearch: settingsSearchSchema,
  component: SettingsPage,
})

type SettingsTab = 'general' | 'kyc'

const SETTINGS_TABS: Array<{
  id: SettingsTab
  label: string
  icon: ElementType
  title: string
  description: string
}> = [
  {
    id: 'general',
    label: 'General',
    icon: UserRound,
    title: 'General settings',
    description: 'View and manage your brand account details.',
  },
  {
    id: 'kyc',
    label: 'KYC verification',
    icon: ShieldCheck,
    title: 'KYC verification',
    description: 'Upload business documents and track your verification status.',
  },
]

function SettingsPage() {
  const { tab } = Route.useSearch()
  const navigate = useNavigate()
  const { data: meData, loading } = useMe()
  const { data: kycData } = useMyKycApplication()

  const user = meData?.me
  const brandName = user?.brand?.brandName ?? '—'
  const email = user?.email ?? '—'
  const effectiveKycStatus = resolveEffectiveKycStatus(
    user?.brand?.kycStatus,
    kycData?.myKycApplication?.status
  )
  const activeTab = SETTINGS_TABS.find((item) => item.id === tab) ?? SETTINGS_TABS[0]

  const setTab = (nextTab: SettingsTab) => {
    navigate({
      to: '/dashboard/settings',
      search: { tab: nextTab },
    })
  }

  return (
    <div className="mx-auto flex max-w-6xl gap-0 text-zinc-950">
      <aside className="w-[220px] shrink-0 pr-6">
        <div className="sticky top-0">
          <h1 className="text-[15px] font-semibold tracking-[-0.02em] text-zinc-900">Settings</h1>
          <p className="mt-1 text-[11px] text-zinc-400">Choose between categories.</p>

          <nav className="mt-5 space-y-0.5">
            {SETTINGS_TABS.map((item) => {
              const Icon = item.icon
              const isActive = tab === item.id

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={cn(
                    'group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] transition-all duration-150',
                    isActive
                      ? 'bg-blue-50/80 font-medium text-blue-700'
                      : 'font-normal text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-4 w-4 shrink-0',
                      isActive ? 'text-blue-600' : 'text-zinc-400 group-hover:text-zinc-600'
                    )}
                  />
                  <span className="flex-1">{item.label}</span>
                  {isActive && (
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-blue-500/70" />
                  )}
                </button>
              )
            })}
          </nav>
        </div>
      </aside>

      <div className="w-px shrink-0 self-stretch bg-zinc-200/80" />

      <div className="min-w-0 flex-1 pl-8">
        <SettingsContentHeader
          icon={activeTab.icon}
          title={activeTab.title}
          description={activeTab.description}
        />

        {tab === 'general' ? (
          <GeneralSettingsPanel
            loading={loading}
            brandName={brandName}
            email={email}
            role={user?.role}
            kycStatus={effectiveKycStatus}
            onOpenKyc={() => setTab('kyc')}
          />
        ) : (
          <KycVerificationTab />
        )}
      </div>
    </div>
  )
}

function SettingsContentHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: ElementType
  title: string
  description: string
}) {
  return (
    <div className="mb-6 flex items-start gap-3 border-b border-zinc-200/80 pb-5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 ring-1 ring-zinc-200/80">
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <div className="min-w-0 pt-0.5">
        <h2 className="text-[15px] font-semibold tracking-[-0.02em] text-zinc-900">{title}</h2>
        <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-400">{description}</p>
      </div>
    </div>
  )
}

function GeneralSettingsPanel({
  loading,
  brandName,
  email,
  role,
  kycStatus,
  onOpenKyc,
}: {
  loading: boolean
  brandName: string
  email: string
  role?: string
  kycStatus?: string | null | KycStatus
  onOpenKyc: () => void
}) {
  const statusLabel = formatKycStatusLabel(kycStatus)

  return (
    <section className="overflow-hidden rounded-xl border border-zinc-200/90 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <SettingsRow
        label="Brand name"
        description="The name displayed across your brand profile."
        value={loading ? 'Loading…' : brandName}
      />
      <SettingsRow
        label="Email address"
        description="Used for sign-in and account notifications."
        value={loading ? 'Loading…' : email}
      />
      <SettingsRow
        label="Account role"
        description="Your access level on the platform."
        value={loading ? 'Loading…' : (role ?? '—')}
        capitalize
      />
      <SettingsRow
        label="KYC status"
        description="Business verification status for wallet and campaign access."
        value={loading ? 'Loading…' : statusLabel}
        action={
          <button
            type="button"
            onClick={onOpenKyc}
            className="inline-flex items-center gap-0.5 text-xs font-medium text-blue-600 transition-colors hover:text-blue-700"
          >
            View
            <ChevronRight className="h-3 w-3" />
          </button>
        }
        isLast
      />
    </section>
  )
}

function SettingsRow({
  label,
  description,
  value,
  action,
  capitalize = false,
  isLast = false,
}: {
  label: string
  description: string
  value: ReactNode
  action?: ReactNode
  capitalize?: boolean
  isLast?: boolean
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between',
        !isLast && 'border-b border-zinc-100'
      )}
    >
      <div className="min-w-0 sm:max-w-[280px]">
        <p className="text-[13px] font-medium text-zinc-900">{label}</p>
        <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-400">{description}</p>
      </div>

      <div className="flex min-w-0 items-center gap-4 sm:justify-end">
        <span
          className={cn(
            'text-[13px] text-zinc-700',
            capitalize && 'capitalize'
          )}
        >
          {value}
        </span>
        {action}
      </div>
    </div>
  )
}

function formatKycStatusLabel(status?: string | null | KycStatus) {
  if (!status) return KYC_STATUS_LABELS.not_started
  const normalized = String(status).toLowerCase() as KycStatus
  if (Object.prototype.hasOwnProperty.call(KYC_STATUS_LABELS, normalized)) {
    return KYC_STATUS_LABELS[normalized]
  }
  return String(status).replace(/_/g, ' ')
}
