import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Bell, ChevronRight, Lock, ShieldCheck, UserRound } from 'lucide-react'
import type { ElementType, ReactNode } from 'react'
import { z } from 'zod'
import { KycVerificationTab } from '@/components/kyc/kyc-verification-tab'
import { LoadingView } from '@/components/ui/view-state'
import { useMe } from '@/hooks/use-auth'
import { KYC_STATUS_LABELS, resolveEffectiveKycStatus } from '@/lib/kyc'
import type { KycStatus } from '@/lib/kyc'
import { useMyKycApplication } from '@/hooks/use-kyc'
import { cn } from '@/lib/utils'

const settingsSearchSchema = z.object({
  tab: z.enum(['profile', 'kyc', 'notifications', 'security']).optional().default('profile'),
})

export const Route = createFileRoute('/dashboard/settings')({
  validateSearch: settingsSearchSchema,
  component: SettingsPage,
})

type SettingsTab = 'profile' | 'kyc' | 'notifications' | 'security'

const SETTINGS_TABS: Array<{
  id: SettingsTab
  label: string
  icon: ElementType
  disabled?: boolean
}> = [
  { id: 'profile', label: 'Profile', icon: UserRound },
  { id: 'kyc', label: 'KYC verification', icon: ShieldCheck },
  { id: 'notifications', label: 'Notifications', icon: Bell, disabled: true },
  { id: 'security', label: 'Security', icon: Lock, disabled: true },
]

function SettingsPage() {
  const { tab } = Route.useSearch()
  const navigate = useNavigate()

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
          <nav className="space-y-0.5">
            {SETTINGS_TABS.map((item) => {
              const Icon = item.icon
              const isActive = tab === item.id

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => !item.disabled && setTab(item.id)}
                  disabled={item.disabled}
                  className={cn(
                    'group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] transition-all duration-150',
                    item.disabled
                      ? 'cursor-not-allowed text-zinc-300'
                      : isActive
                        ? 'bg-blue-50/80 font-medium text-blue-700'
                        : 'font-normal text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-4 w-4 shrink-0',
                      item.disabled
                        ? 'text-zinc-200'
                        : isActive
                          ? 'text-blue-600'
                          : 'text-zinc-400 group-hover:text-zinc-600'
                    )}
                  />
                  <span className="flex-1">{item.label}</span>
                  {item.disabled && (
                    <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-400">
                      Soon
                    </span>
                  )}
                  {isActive && !item.disabled && (
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
        {tab === 'profile' && <ProfilePanel />}
        {tab === 'kyc' && <KycVerificationTab />}
        {tab === 'notifications' && <PlaceholderPanel title="Notifications" />}
        {tab === 'security' && <PlaceholderPanel title="Security" />}
      </div>
    </div>
  )
}

/* ─── Placeholder ────────────────────────────────────────── */

function PlaceholderPanel({ title }: { title: string }) {
  return (
    <section className="overflow-hidden rounded-xl border border-zinc-200/90 bg-white px-5 py-12 text-center shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <p className="text-sm font-medium text-zinc-900">{title}</p>
      <p className="mt-1 text-xs text-zinc-400">This section is coming soon.</p>
    </section>
  )
}

/* ─── Profile ────────────────────────────────────────────── */

function ProfilePanel() {
  const { data: meData, loading: userLoading } = useMe()
  const { data: kycData } = useMyKycApplication()
  const navigate = useNavigate()

  const user = meData?.me
  const brand = user?.brand
  const effectiveKycStatus = resolveEffectiveKycStatus(
    brand?.kycStatus,
    kycData?.myKycApplication?.status
  )
  const statusLabel = formatKycStatusLabel(effectiveKycStatus)

  if (userLoading && !user) {
    return <LoadingView label="Loading profile…" tone="primary" />
  }

  if (!user) {
    return (
      <section className="overflow-hidden rounded-xl border border-zinc-200/90 bg-white px-5 py-8 text-center text-sm text-zinc-500 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        Unable to load profile.
      </section>
    )
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-xl border border-zinc-200/90 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <SettingsRow
          label="Email address"
          description="Used for sign-in and account notifications."
          value={user.email ?? '—'}
        />
        <SettingsRow
          label="Account role"
          description="Your access level on the platform."
          value={user.role ?? '—'}
          capitalize
        />
        <SettingsRow
          label="Brand name"
          description="Your registered brand name."
          value={brand?.brandName ?? '—'}
        />
        <SettingsRow
          label="KYC status"
          description="Business verification status for wallet and campaign access."
          value={statusLabel}
          action={
            <button
              type="button"
              onClick={() =>
                navigate({ to: '/dashboard/settings', search: { tab: 'kyc' } })
              }
              className="inline-flex items-center gap-0.5 text-xs font-medium text-blue-600 transition-colors hover:text-blue-700"
            >
              View
              <ChevronRight className="h-3 w-3" />
            </button>
          }
          isLast
        />
      </section>
    </div>
  )
}

/* ─── Shared ──────────────────────────────────────────────── */

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
