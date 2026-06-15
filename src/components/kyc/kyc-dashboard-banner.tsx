import type { ElementType } from 'react'
import { Link } from '@tanstack/react-router'
import {
  AlertCircle,
  ChevronRight,
  Clock3,
  FileWarning,
  Rocket,
} from 'lucide-react'
import type { KycApplication } from '@/hooks/use-kyc'
import { KYC_STATUS_DESCRIPTIONS, formatKycDate, type KycStatus } from '@/lib/kyc'

const DASHBOARD_BANNER_CONFIG: Record<
  Exclude<KycStatus, 'approved'>,
  {
    gradient: string
    icon: ElementType
    kicker: string
    getMessage: (application?: KycApplication | null) => string
    actionLabel: string
  }
> = {
  not_started: {
    gradient: 'linear-gradient(110deg, #0F61FF 0%, #0F61FF 58%, #3d80ff 100%)',
    icon: Rocket,
    kicker: 'Complete your KYC',
    getMessage: () =>
      'One step left. Verify your business to unlock your wallet, create campaigns, and start receiving creator content.',
    actionLabel: 'Complete KYC',
  },
  pending_review: {
    gradient: 'linear-gradient(110deg, #c27803 0%, #d97706 58%, #f59e0b 100%)',
    icon: Clock3,
    kicker: 'Review in progress',
    getMessage: (application) => {
      const base = KYC_STATUS_DESCRIPTIONS.pending_review
      if (application?.submittedAt) {
        return `${base} Submitted ${formatKycDate(application.submittedAt)}.`
      }
      return base
    },
    actionLabel: 'View status',
  },
  rejected: {
    gradient: 'linear-gradient(110deg, #b91c1c 0%, #dc2626 58%, #ef4444 100%)',
    icon: AlertCircle,
    kicker: 'Submission rejected',
    getMessage: (application) =>
      application?.rejectionReason
        ? `${KYC_STATUS_DESCRIPTIONS.rejected} Feedback: ${application.rejectionReason}`
        : KYC_STATUS_DESCRIPTIONS.rejected,
    actionLabel: 'Update submission',
  },
  needs_more_info: {
    gradient: 'linear-gradient(110deg, #c2410c 0%, #ea580c 58%, #f97316 100%)',
    icon: FileWarning,
    kicker: 'More information needed',
    getMessage: (application) =>
      application?.adminNote
        ? `${KYC_STATUS_DESCRIPTIONS.needs_more_info} Note: ${application.adminNote}`
        : KYC_STATUS_DESCRIPTIONS.needs_more_info,
    actionLabel: 'Update submission',
  },
}

export function KycDashboardBanner({
  status,
  application,
}: {
  status: KycStatus
  application?: KycApplication | null
}) {
  if (status === 'approved') return null

  const config = DASHBOARD_BANNER_CONFIG[status]
  const Icon = config.icon

  return (
    <div className="shrink-0 bg-white px-6 pt-4 dark:bg-zinc-900">
      <section
        className="relative overflow-hidden rounded-lg px-5 py-3.5 text-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.25),inset_0_-10px_24px_rgba(0,0,0,0.08),0_1px_2px_rgba(15,23,42,0.08)]"
        style={{ backgroundImage: config.gradient }}
      >
        <div className="pointer-events-none absolute -right-8 -top-12 h-28 w-28 rounded-full bg-white/15" />
        <div className="pointer-events-none absolute right-12 -bottom-16 h-32 w-32 rounded-full bg-white/10" />
        <div className="relative flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/20">
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-white/75">{config.kicker}</p>
              <p className="text-sm font-semibold leading-snug text-white">
                {config.getMessage(application)}
              </p>
            </div>
          </div>
          <Link
            to="/dashboard/settings"
            search={{ tab: 'kyc' }}
            className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md bg-white px-3 text-xs font-medium shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.35),0_1px_2px_rgba(0,0,0,0.12)] ring-1 ring-inset ring-white/30 transition-colors hover:bg-blue-50"
            style={{ color: '#0F61FF' }}
          >
            {config.actionLabel}
            <ChevronRight className="h-3.5 w-3.5" style={{ color: '#0F61FF' }} />
          </Link>
        </div>
      </section>
    </div>
  )
}
