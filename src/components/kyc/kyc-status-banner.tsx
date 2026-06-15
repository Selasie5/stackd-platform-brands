import type { ElementType, ReactNode } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  FileWarning,
  ShieldCheck,
} from 'lucide-react'
import type { KycApplication } from '@/hooks/use-kyc'
import {
  KYC_STATUS_DESCRIPTIONS,
  KYC_STATUS_LABELS,
  formatKycDate,
} from '@/lib/kyc'
import type { KycStatus } from '@/lib/kyc'
import { cn } from '@/lib/utils'

const STATUS_CONFIG: Record<
  Exclude<KycStatus, 'approved'>,
  { icon: ElementType; tone: string; title: string }
> = {
  not_started: {
    icon: ShieldCheck,
    tone: 'border-blue-100 bg-blue-50/70 text-blue-900',
    title: 'Verify your business',
  },
  pending_review: {
    icon: Clock3,
    tone: 'border-amber-100 bg-amber-50/70 text-amber-900',
    title: 'Review in progress',
  },
  rejected: {
    icon: AlertCircle,
    tone: 'border-red-100 bg-red-50/70 text-red-900',
    title: 'Submission rejected',
  },
  needs_more_info: {
    icon: FileWarning,
    tone: 'border-orange-100 bg-orange-50/70 text-orange-900',
    title: 'Additional information required',
  },
}

export function KycStatusBadge({ status }: { status: KycStatus }) {
  const styles: Record<KycStatus, string> = {
    not_started: 'bg-zinc-100 text-zinc-600 ring-zinc-200',
    pending_review: 'bg-amber-50 text-amber-700 ring-amber-200',
    approved: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    rejected: 'bg-red-50 text-red-700 ring-red-200',
    needs_more_info: 'bg-orange-50 text-orange-700 ring-orange-200',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset',
        styles[status]
      )}
    >
      {KYC_STATUS_LABELS[status]}
    </span>
  )
}

export function KycStatusBanner({
  status,
  application,
  action,
}: {
  status: KycStatus
  application?: KycApplication | null
  action?: ReactNode
}) {
  if (status === 'approved') return null

  const current = STATUS_CONFIG[status]
  const Icon = current.icon
  const feedback =
    status === 'rejected'
      ? application?.rejectionReason
      : status === 'needs_more_info'
        ? application?.adminNote
        : null

  return (
    <section className={cn('rounded-xl border p-5', current.tone)}>
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/70">
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold">{current.title}</h3>
            <KycStatusBadge status={status} />
          </div>
          <p className="mt-1 text-xs leading-relaxed opacity-80">
            {KYC_STATUS_DESCRIPTIONS[status]}
          </p>
          {feedback && (
            <p className="mt-3 rounded-lg bg-white/60 px-3 py-2 text-xs leading-relaxed">
              <span className="font-medium">Reviewer feedback: </span>
              {feedback}
            </p>
          )}
          {/* {status === 'pending_review' && application?.submittedAt && (
            <p className="mt-2 text-[11px] opacity-70">
              Submitted {formatKycDate(application.submittedAt)}
            </p>
          )} */}
        </div>
        {action ? (
          <div className="shrink-0 self-center">{action}</div>
        ) : (
          status === 'not_started' && (
            <CheckCircle2 className="hidden h-5 w-5 shrink-0 opacity-40 sm:block" />
          )
        )}
      </div>
    </section>
  )
}
