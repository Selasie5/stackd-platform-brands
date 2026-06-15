import type { ElementType } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  Circle,
  Clock3,
  FileWarning,
  LoaderCircle,
  ShieldCheck,
} from 'lucide-react'
import { SubmittedDocumentRow } from '@/components/kyc/document-upload-slot'
import type { KycApplication } from '@/hooks/use-kyc'
import {
  KYC_STATUS_DESCRIPTIONS,
  KYC_STATUS_LABELS,
  formatDocumentType,
  formatKycDate,
} from '@/lib/kyc'
import type { KycStatus } from '@/lib/kyc'
import { cn } from '@/lib/utils'

type TimelineStepState = 'complete' | 'current' | 'upcoming' | 'error'

interface TimelineStep {
  id: string
  title: string
  description?: string
  date?: string | null
  state: TimelineStepState
  icon: ElementType
}

function buildTimelineSteps(
  status: KycStatus,
  application?: KycApplication | null
): TimelineStep[] {
  if (!application) return []

  const submitted: TimelineStep = {
    id: 'submitted',
    title: 'Documents submitted',
    description: `Attempt ${application.attemptNumber} · ${application.documents.length} document${application.documents.length === 1 ? '' : 's'} uploaded`,
    date: application.submittedAt,
    state: 'complete',
    icon: CheckCircle2,
  }

  if (status === 'pending_review') {
    return [
      submitted,
      {
        id: 'review',
        title: 'Review in progress',
        description: KYC_STATUS_DESCRIPTIONS.pending_review,
        state: 'current',
        icon: Clock3,
      },
    ]
  }

  if (status === 'approved') {
    return [
      submitted,
      {
        id: 'review',
        title: 'Documents reviewed',
        description: 'Your submission was reviewed by our team.',
        date: application.reviewedAt,
        state: 'complete',
        icon: CheckCircle2,
      },
      {
        id: 'verified',
        title: 'Verification complete',
        description: KYC_STATUS_DESCRIPTIONS.approved,
        date: application.reviewedAt,
        state: 'complete',
        icon: ShieldCheck,
      },
    ]
  }

  if (status === 'rejected') {
    return [
      submitted,
      {
        id: 'review',
        title: 'Review completed',
        description: application.rejectionReason
          ? `Rejected: ${application.rejectionReason}`
          : KYC_STATUS_DESCRIPTIONS.rejected,
        date: application.reviewedAt,
        state: 'error',
        icon: AlertCircle,
      },
    ]
  }

  if (status === 'needs_more_info') {
    return [
      submitted,
      {
        id: 'review',
        title: 'More information needed',
        description: application.adminNote
          ? application.adminNote
          : KYC_STATUS_DESCRIPTIONS.needs_more_info,
        date: application.reviewedAt,
        state: 'current',
        icon: FileWarning,
      },
    ]
  }

  return [submitted]
}

function StepIndicator({ state, icon: Icon }: { state: TimelineStepState; icon: ElementType }) {
  const styles: Record<TimelineStepState, string> = {
    complete: 'border-emerald-200 bg-emerald-50 text-emerald-600',
    current: 'border-amber-200 bg-amber-50 text-amber-600',
    upcoming: 'border-zinc-200 bg-zinc-50 text-zinc-400',
    error: 'border-red-200 bg-red-50 text-red-600',
  }

  return (
    <span
      className={cn(
        'relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ring-4 ring-white',
        styles[state]
      )}
    >
      {state === 'current' ? (
        <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
      ) : state === 'upcoming' ? (
        <Circle className="h-3 w-3" />
      ) : (
        <Icon className="h-3.5 w-3.5" />
      )}
    </span>
  )
}

function TimelineConnector({ state }: { state: TimelineStepState }) {
  const color =
    state === 'complete'
      ? 'bg-emerald-200'
      : state === 'error'
        ? 'bg-red-200'
        : 'bg-zinc-200'

  return <span className={cn('block w-px flex-1 min-h-6', color)} aria-hidden="true" />
}

function TimelineStepRow({
  step,
  isLast,
  status,
  children,
}: {
  step: TimelineStep
  isLast: boolean
  status: KycStatus
  children?: React.ReactNode
}) {
  return (
    <div className={cn('grid grid-cols-[24px_minmax(0,1fr)] gap-x-3', !isLast && 'pb-1')}>
      <div className="flex flex-col items-center">
        <StepIndicator state={step.state} icon={step.icon} />
        {!isLast && <TimelineConnector state={step.state} />}
      </div>

      <div className={cn('min-w-0', isLast ? 'pb-0' : 'pb-6')}>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold text-zinc-900">{step.title}</h3>
          {step.state === 'current' && (
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset',
                status === 'pending_review' && 'bg-amber-50 text-amber-700 ring-amber-200',
                status === 'needs_more_info' && 'bg-orange-50 text-orange-700 ring-orange-200'
              )}
            >
              {KYC_STATUS_LABELS[status]}
            </span>
          )}
        </div>
        {step.description && (
          <p className="mt-1 text-xs leading-relaxed text-zinc-500">{step.description}</p>
        )}
        {step.date && (
          <p className="mt-1.5 text-[11px] text-zinc-400">{formatKycDate(step.date)}</p>
        )}
        {children}
      </div>
    </div>
  )
}

export function KycVerificationTimeline({
  status,
  application,
}: {
  status: KycStatus
  application?: KycApplication | null
}) {
  const steps = buildTimelineSteps(status, application)

  if (steps.length === 0) return null

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900">Verification timeline</h2>
          <p className="mt-1 text-xs text-zinc-500">
            Track your KYC submission from upload through review.
          </p>
        </div>
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset',
            status === 'approved' && 'bg-emerald-50 text-emerald-700 ring-emerald-200',
            status === 'pending_review' && 'bg-amber-50 text-amber-700 ring-amber-200',
            status === 'rejected' && 'bg-red-50 text-red-700 ring-red-200',
            status === 'needs_more_info' && 'bg-orange-50 text-orange-700 ring-orange-200',
            status === 'not_started' && 'bg-zinc-100 text-zinc-600 ring-zinc-200'
          )}
        >
          {KYC_STATUS_LABELS[status]}
        </span>
      </div>

      <div>
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1
          const showDocuments = step.id === 'submitted' && application

          return (
            <TimelineStepRow key={step.id} step={step} isLast={isLast} status={status}>
              {showDocuments && (
                <div className="mt-3 space-y-2">
                  {application.applicantNote && (
                    <p className="rounded-lg bg-zinc-50 px-3 py-2 text-xs text-zinc-600">
                      <span className="font-medium text-zinc-700">Your note: </span>
                      {application.applicantNote}
                    </p>
                  )}
                  {application.documents.map((document, docIndex) => (
                    <SubmittedDocumentRow
                      key={`${document.documentType}-${docIndex}`}
                      label={formatDocumentType(document.documentType)}
                      fileName={document.fileName}
                      fileUrl={document.fileUrl}
                      note={document.note}
                    />
                  ))}
                </div>
              )}
            </TimelineStepRow>
          )
        })}
      </div>
    </section>
  )
}
