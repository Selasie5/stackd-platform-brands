import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Bell, ChevronRight, Lock, ShieldCheck, UserRound } from 'lucide-react'
import type { ElementType, ReactNode } from 'react'
import { z } from 'zod'
import { KycVerificationTab } from '@/components/kyc/kyc-verification-tab'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/ui/password-input'
import { Select } from '@/components/ui/select'
import { LoadingView } from '@/components/ui/view-state'
import { DotBadge } from '@/components/ui/dot-badge'
import { useMe } from '@/hooks/use-auth'
import {
  useBrand,
  useUpdateBrand,
  useChangePassword,
  useActiveSessions,
  useRevokeSession,
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from '@/hooks/use-settings'
import type {
  BrandProfile,
  UpdateBrandInput,
  ActiveSession,
  NotificationPreferences,
} from '@/hooks/use-settings'
import { KYC_STATUS_LABELS, resolveEffectiveKycStatus } from '@/lib/kyc'
import type { KycStatus } from '@/lib/kyc'
import { useMyKycApplication } from '@/hooks/use-kyc'
import { cn } from '@/lib/utils'

const COUNTRIES = [
  { value: 'Ghana', currency: 'GHS', flag: 'https://flagcdn.com/w40/gh.png', label: 'Ghana' },
  { value: 'Nigeria', currency: 'NGN', flag: 'https://flagcdn.com/w40/ng.png', label: 'Nigeria' },
  { value: 'USA', currency: 'USD', flag: 'https://flagcdn.com/w40/us.png', label: 'USA' },
]

const INDUSTRIES = [
  'Technology',
  'Fashion & Apparel',
  'Beauty & Cosmetics',
  'Food & Beverage',
  'Health & Wellness',
  'Entertainment',
  'E-commerce',
  'Other',
]

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
}> = [
  { id: 'profile', label: 'Profile', icon: UserRound },
  { id: 'kyc', label: 'KYC verification', icon: ShieldCheck },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Lock },
]

/* ─── Shared card wrapper ────────────────────────────────── */

function SettingsCard({
  title,
  description,
  children,
  danger,
}: {
  title: string
  description?: string
  children: ReactNode
  danger?: boolean
}) {
  return (
    <section
      className={cn(
        'rounded-lg border bg-white',
        danger
          ? 'border-red-200/70 shadow-[0_0_0_1px_rgba(239,68,68,0.08)]'
          : 'border-zinc-200/70 shadow-[0_1px_2px_rgba(0,0,0,0.04)]'
      )}
    >
      <div className={cn('px-5 py-4', !danger && 'border-b border-zinc-100')}>
        <h3 className={cn('text-sm font-semibold', danger ? 'text-red-600' : 'text-zinc-900')}>
          {title}
        </h3>
        {description && (
          <p className="mt-0.5 text-xs text-zinc-500">{description}</p>
        )}
      </div>
      <div className="px-5 py-4">{children}</div>
    </section>
  )
}

/* ─── Sidebar + Page ─────────────────────────────────────── */

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
    <div className="flex min-h-full text-zinc-950">
      <aside className="flex flex-col w-56 shrink-0 border-r border-zinc-200/70">
        <div className="sticky top-0 py-6 pr-5">
          <nav className="space-y-0.5">
            {SETTINGS_TABS.map((item) => {
              const Icon = item.icon
              const isActive = tab === item.id

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={cn(
                    'group relative flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-[13px] transition-all duration-150',
                    isActive
                      ? 'bg-zinc-100 font-medium text-zinc-900'
                      : 'font-normal text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700'
                  )}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-zinc-900" />
                  )}
                  <Icon
                    className={cn(
                      'h-4 w-4 shrink-0',
                      isActive ? 'text-zinc-700' : 'text-zinc-400'
                    )}
                  />
                  <span className="flex-1">{item.label}</span>
                  {isActive && (
                    <ChevronRight className="h-3 w-3 shrink-0 text-zinc-300" />
                  )}
                </button>
              )
            })}
          </nav>
        </div>
        <div className="flex-1" />
      </aside>

      <div className="min-w-0 flex-1 overflow-y-auto py-6 pl-8">
        <div className="max-w-2xl">
          {tab === 'profile' && <ProfilePanel />}
          {tab === 'kyc' && <KycVerificationTab />}
          {tab === 'notifications' && <NotificationTogglesPanel />}
          {tab === 'security' && <SecurityPanel />}
        </div>
      </div>
    </div>
  )
}

/* ─── Profile ────────────────────────────────────────────── */

function ProfilePanel() {
  const { data: meData } = useMe()
  const { data: brandData, loading: brandLoading } = useBrand()
  const { data: kycData } = useMyKycApplication()
  const navigate = useNavigate()

  const user = meData?.me
  const brand = brandData?.brand
  const effectiveKycStatus = resolveEffectiveKycStatus(
    user?.brand?.kycStatus,
    kycData?.myKycApplication?.status
  )
  const statusLabel = formatKycStatusLabel(effectiveKycStatus)

  if (brandLoading && !brand) {
    return <LoadingView label="Loading profile…" tone="primary" />
  }

  if (!brand) {
    return (
      <SettingsCard title="Profile">
        <p className="py-4 text-center text-sm text-zinc-400">Unable to load profile.</p>
      </SettingsCard>
    )
  }

  return (
    <div className="space-y-6">
      <SettingsCard title="Account" description="Your account information and verification status.">
        <div className="divide-y divide-zinc-100">
          <SummaryRow label="Email" value={user?.email ?? '—'} />
          <SummaryRow label="Role" value={user?.role ?? '—'} capitalize />
          <SummaryRow
            label="KYC status"
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
          />
        </div>
      </SettingsCard>

      <SettingsCard title="Edit details" description="Update your brand profile information.">
        <ProfileEditForm brand={brand} />
      </SettingsCard>
    </div>
  )
}

/* ─── Profile (edit) ──────────────────────────────────────── */

function ProfileEditForm({ brand }: { brand: BrandProfile }) {
  const { updateBrand, loading } = useUpdateBrand()

  const [form, setForm] = useState<UpdateBrandInput>({
    brandName: brand.brandName ?? '',
    contactName: brand.contactName ?? '',
    city: brand.city ?? '',
    country: brand.country ?? '',
    industry: brand.industry ?? '',
    description: brand.description ?? '',
    website: brand.website ?? '',
  })

  const hasChanges =
    form.brandName !== brand.brandName ||
    form.contactName !== brand.contactName ||
    form.city !== brand.city ||
    form.country !== brand.country ||
    form.industry !== brand.industry ||
    form.description !== brand.description ||
    form.website !== (brand.website ?? '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await updateBrand(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-x-5 gap-y-5">
        <Field label="Brand name" required id="brand-name">
          <Input
            id="brand-name"
            value={form.brandName ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, brandName: e.target.value }))}
          />
        </Field>
        <Field label="Contact name" required id="contact-name">
          <Input
            id="contact-name"
            value={form.contactName ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, contactName: e.target.value }))}
          />
        </Field>
        <Field label="City" id="city">
          <Input
            id="city"
            value={form.city ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
          />
        </Field>
        <Field label="Country" id="country">
          <Select
            id="country"
            value={form.country ?? ''}
            onChange={(val) => setForm((f) => ({ ...f, country: val }))}
            options={COUNTRIES.map((c) => ({
              value: c.value,
              label: c.label,
              icon: <img src={c.flag} alt="" className="w-5 h-auto rounded-[2px]" />,
            }))}
            placeholder="Select country"
          />
        </Field>
        <Field label="Industry" id="industry">
          <Select
            id="industry"
            value={form.industry ?? ''}
            onChange={(val) => setForm((f) => ({ ...f, industry: val }))}
            options={INDUSTRIES.map((ind) => ({ value: ind, label: ind }))}
            placeholder="Select industry"
          />
        </Field>
        <Field label="Website" id="website">
          <Input
            id="website"
            placeholder="https://example.com"
            value={form.website ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, website: e.target.value || null }))}
          />
        </Field>
      </div>
      <Field label="Description" id="description">
        <textarea
          id="description"
          rows={3}
          value={form.description ?? ''}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          className="w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm text-zinc-800 outline-none transition-[color,box-shadow] placeholder:text-zinc-400 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
      </Field>
      <div className="flex items-center gap-3 pt-1">
        <Button type="submit" isLoading={loading} disabled={!hasChanges || loading} size="sm">
          Save changes
        </Button>
        {!hasChanges && (
          <p className="text-xs text-zinc-400">No unsaved changes.</p>
        )}
      </div>
    </form>
  )
}

/* ─── Notifications ───────────────────────────────────────── */

const NOTIFICATION_ITEMS: Array<{
  key: keyof NotificationPreferences
  label: string
  description: string
}> = [
  {
    key: 'emailMarketing',
    label: 'Marketing emails',
    description: 'Product updates, tips, and promotional content.',
  },
  {
    key: 'emailSecurity',
    label: 'Security emails',
    description: 'Password changes, new sign-ins, and account alerts.',
  },
  {
    key: 'emailCampaignUpdates',
    label: 'Campaign updates',
    description: 'Submission notifications, status changes, and milestones.',
  },
  {
    key: 'pushMarketing',
    label: 'Marketing push',
    description: 'Promotional push notifications on your device.',
  },
  {
    key: 'pushSecurity',
    label: 'Security push',
    description: 'Real-time security alerts via push.',
  },
  {
    key: 'pushCampaignUpdates',
    label: 'Campaign push',
    description: 'Instant push updates for campaign activity.',
  },
]

function NotificationTogglesPanel() {
  const { data, loading } = useNotificationPreferences()
  const { updatePreferences, loading: saving } = useUpdateNotificationPreferences()
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null)

  const current = prefs ?? data?.notificationPreferences ?? null

  const toggle = async (key: keyof NotificationPreferences) => {
    if (!current) return
    const previous = current
    const next = { ...current, [key]: !current[key] }
    setPrefs(next)
    try {
      await updatePreferences(next)
    } catch {
      setPrefs(previous)
    }
  }

  if (loading && !current) {
    return <LoadingView label="Loading notification preferences…" tone="primary" />
  }

  return (
    <SettingsCard title="Notification preferences" description="Choose which notifications you receive.">
      <div className="divide-y divide-zinc-100">
        {NOTIFICATION_ITEMS.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between gap-4 py-3"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-zinc-900">{item.label}</p>
              <p className="mt-0.5 text-xs text-zinc-500">{item.description}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={current?.[item.key] ?? false}
              aria-label={item.label}
              disabled={saving}
              onClick={() => toggle(item.key)}
              className={cn(
                'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                'disabled:cursor-not-allowed disabled:opacity-50',
                current?.[item.key] ? 'bg-zinc-900' : 'bg-zinc-200'
              )}
            >
              <span
                className={cn(
                  'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow ring-0 transition-transform',
                  current?.[item.key] ? 'translate-x-4' : 'translate-x-0'
                )}
              />
            </button>
          </div>
        ))}
      </div>
    </SettingsCard>
  )
}

/* ─── Security ────────────────────────────────────────────── */

function ChangePasswordSection() {
  const { changePassword, loading } = useChangePassword()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const canSubmit =
    currentPassword.length > 0 &&
    newPassword.length > 0 &&
    newPassword === confirmPassword

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    const ok = await changePassword(currentPassword, newPassword)
    if (ok) {
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  return (
    <SettingsCard title="Change password" description="Update your account password. You will need your current password.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Current password" id="current-password">
          <PasswordInput
            id="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </Field>
        <Field label="New password" id="new-password">
          <PasswordInput
            id="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </Field>
        <Field label="Confirm new password" id="confirm-new-password">
          <PasswordInput
            id="confirm-new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </Field>
        {newPassword && confirmPassword && newPassword !== confirmPassword && (
          <p className="text-xs text-red-500">Passwords do not match.</p>
        )}
        <div className="flex items-center gap-3 pt-1">
          <Button type="submit" isLoading={loading} disabled={!canSubmit || loading} size="sm">
            Update password
          </Button>
        </div>
      </form>
    </SettingsCard>
  )
}

function SessionRow({
  session,
  onRevoke,
  revoking,
}: {
  session: ActiveSession
  onRevoke: (id: string) => void
  revoking: boolean
}) {
  const platformLabel =
    session.platform === 'web' ? 'Web' : session.platform === 'mobile' ? 'Mobile' : session.platform

  const lastActive = session.lastActiveAt
    ? new Date(session.lastActiveAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—'

  return (
    <div className="flex items-center justify-between gap-4 py-3 last:pb-0">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-zinc-900">{session.deviceName}</p>
          {session.isCurrent && (
            <DotBadge label="Current" badgeClassName="bg-blue-50 text-blue-700 ring-blue-100" dotClassName="bg-blue-500" />
          )}
        </div>
        <p className="mt-0.5 text-xs text-zinc-500">
          {platformLabel} &middot; {session.ipAddress} &middot; Last active {lastActive}
        </p>
      </div>
      {!session.isCurrent && (
        <Button
          variant="outline"
          size="sm"
          className="h-7 shrink-0 border-red-200 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
          disabled={revoking}
          isLoading={revoking}
          onClick={() => onRevoke(session.id)}
        >
          Revoke
        </Button>
      )}
    </div>
  )
}

function SessionManagerSection() {
  const { data, loading } = useActiveSessions()
  const { revokeSession, loading: revoking } = useRevokeSession()
  const [revokingId, setRevokingId] = useState<string | null>(null)

  const sessions = data?.activeSessions ?? []

  const handleRevoke = async (id: string) => {
    setRevokingId(id)
    await revokeSession(id)
    setRevokingId(null)
  }

  if (loading && sessions.length === 0) {
    return (
      <SettingsCard title="Active sessions">
        <p className="py-2 text-center text-sm text-zinc-400">Loading sessions...</p>
      </SettingsCard>
    )
  }

  return (
    <SettingsCard
      title="Active sessions"
      description="Devices and browsers currently signed into your account."
      danger
    >
      {sessions.length === 0 ? (
        <p className="py-2 text-center text-sm text-zinc-400">No active sessions found.</p>
      ) : (
        <div className="divide-y divide-red-100/50">
          {sessions.map((session) => (
            <SessionRow
              key={session.id}
              session={session}
              onRevoke={handleRevoke}
              revoking={revokingId === session.id && revoking}
            />
          ))}
        </div>
      )}
    </SettingsCard>
  )
}

function SecurityPanel() {
  return (
    <div className="space-y-6">
      <ChangePasswordSection />
      <SessionManagerSection />
    </div>
  )
}

/* ─── Shared ──────────────────────────────────────────────── */

function SummaryRow({
  label,
  value,
  action,
  capitalize = false,
}: {
  label: string
  value: ReactNode
  action?: ReactNode
  capitalize?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <p className="text-xs font-medium text-zinc-500">{label}</p>
      </div>
      <div className="flex min-w-0 items-center gap-3 shrink-0">
        <span
          className={cn(
            'text-sm text-zinc-900',
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

function Field({
  label,
  required,
  children,
  className,
  id,
}: {
  label: string
  required?: boolean
  children: ReactNode
  className?: string
  id?: string
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={id} className="text-xs font-medium text-zinc-700">
        {label}
        {required && <span className="ml-0.5 text-red-400">*</span>}
      </Label>
      {children}
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
