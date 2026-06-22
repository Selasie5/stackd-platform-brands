import { createFileRoute } from '@tanstack/react-router'
import { useState, useRef } from 'react'
import { Eye, MessageSquare, Globe, Trophy, X, GripVertical, CheckCircle2, FileEdit, ChevronDown, ThumbsUp, RotateCcw, ListChecks, XCircle } from 'lucide-react'
import { MOCK_CREATOR, MOCK_SUBMISSION, MOCK_REVISION_HISTORY, mockSubmissionForStatus } from '@/mock/submission-detail'
import { MOCK_CONTEST, MOCK_SHORTLISTED_SUBMISSIONS } from '@/mock/winner-selection'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/dashboard/mock-demo')({
  component: MockDemoPage,
})

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    submitted: 'bg-zinc-100 text-zinc-700 ring-zinc-200',
    shortlisted: 'bg-blue-50 text-blue-700 ring-blue-100',
    revision_requested: 'bg-amber-50 text-amber-700 ring-amber-100',
    resubmitted: 'bg-violet-50 text-violet-700 ring-violet-100',
    approved: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    rejected: 'bg-red-50 text-red-700 ring-red-100',
    disqualified: 'bg-zinc-100 text-zinc-500 ring-zinc-200',
    winner: 'bg-blue-50 text-blue-700 ring-blue-100',
  }

  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset', styles[status] ?? 'bg-zinc-100 text-zinc-600')}>
      {status.replace(/_/g, ' ')}
    </span>
  )
}

function RevisionTimeline() {
  if (MOCK_REVISION_HISTORY.length === 0) return null

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <h3 className="text-sm font-semibold text-zinc-900">Revision history</h3>
      <div className="mt-4">
        {MOCK_REVISION_HISTORY.map((event, i) => {
          const isLast = i === MOCK_REVISION_HISTORY.length - 1
          const isRevision = event.status === 'revision_requested'

          return (
            <div key={i} className={cn('grid grid-cols-[24px_minmax(0,1fr)] gap-x-3', !isLast && 'pb-1')}>
              <div className="flex flex-col items-center">
                <span className={cn(
                  'relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ring-4 ring-white',
                  isRevision ? 'border-amber-200 bg-amber-50 text-amber-600' : 'border-emerald-200 bg-emerald-50 text-emerald-600'
                )}>
                  {isRevision ? <FileEdit className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                </span>
                {!isLast && <span className="block w-px flex-1 min-h-6 bg-zinc-200" aria-hidden="true" />}
              </div>
              <div className={cn('min-w-0', isLast ? 'pb-0' : 'pb-6')}>
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-sm font-semibold text-zinc-900">{event.versionLabel}</h4>
                </div>
                {event.note && (
                  <p className="mt-1 text-xs leading-relaxed text-zinc-500">{event.note}</p>
                )}
                <p className="mt-1 text-[11px] text-zinc-400">
                  {new Date(event.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function ActionsDropdown({
  onApprove,
  onRequestRevision,
  onShortlist,
  onReject,
}: {
  onApprove: () => void
  onRequestRevision: () => void
  onShortlist: () => void
  onReject: () => void
}) {
  const [open, setOpen] = useState(false)

  const actions = [
    { label: 'Approve', icon: ThumbsUp, onClick: onApprove, className: 'hover:bg-emerald-50 hover:text-emerald-700' },
    { label: 'Request revision', icon: RotateCcw, onClick: onRequestRevision, className: 'hover:bg-amber-50 hover:text-amber-700' },
    { label: 'Shortlist', icon: ListChecks, onClick: onShortlist, className: 'hover:bg-blue-50 hover:text-blue-700' },
    { label: 'Reject', icon: XCircle, onClick: onReject, className: 'hover:bg-red-50 hover:text-red-700' },
  ]

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-colors hover:bg-zinc-50"
      >
        Actions
        <ChevronDown className="h-3.5 w-3.5" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 w-48 rounded-lg border border-zinc-200 bg-white py-1 shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
            {actions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={() => { action.onClick(); setOpen(false) }}
                className={cn(
                  'flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-600 transition-colors',
                  action.className
                )}
              >
                <action.icon className="h-3.5 w-3.5" />
                {action.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function SubmissionDemo() {
  const [status, setStatus] = useState(MOCK_SUBMISSION.status)
  const [showRevisionInput, setShowRevisionInput] = useState(false)
  const [revisionNote, setRevisionNote] = useState('')
  const submission = mockSubmissionForStatus(status as any)
  const formatNumber = (n: number) => n.toLocaleString()

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-900">Submission Detail</h2>
        <div className="flex items-center gap-2">
          {status === 'submitted' && (
            <ActionsDropdown
              onApprove={() => setStatus('approved')}
              onRequestRevision={() => setShowRevisionInput(true)}
              onShortlist={() => setStatus('shortlisted')}
              onReject={() => setStatus('rejected')}
            />
          )}
          <StatusBadge status={status} />
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1 space-y-5">
          {submission.watermarkedPreviewUrl && (
            <video src={submission.watermarkedPreviewUrl} controls className="w-full rounded-lg" />
          )}

          {showRevisionInput && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs font-medium text-amber-700">Revision instructions</p>
              <textarea
                value={revisionNote}
                onChange={(e) => setRevisionNote(e.target.value)}
                placeholder="Describe what needs to be changed..."
                rows={3}
                className="mt-2 w-full resize-none rounded-md border border-amber-200 bg-white px-3 py-2 text-xs text-zinc-900 outline-none placeholder:text-zinc-400 focus-visible:ring-2 focus-visible:ring-amber-500/30"
              />
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  disabled={!revisionNote.trim()}
                  onClick={() => { setStatus('revision_requested'); setShowRevisionInput(false); setRevisionNote('') }}
                  className="inline-flex items-center gap-1 rounded-md bg-amber-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-amber-700 disabled:opacity-50"
                >
                  Send revision request
                </button>
                <button
                  type="button"
                  onClick={() => setShowRevisionInput(false)}
                  className="text-xs text-zinc-500 hover:text-zinc-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <p className="text-sm leading-relaxed text-zinc-600 italic">
            &ldquo;{submission.submissionNote}&rdquo;
          </p>

          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Eye, label: 'Views', value: formatNumber(submission.submittedViews) },
              { icon: MessageSquare, label: 'Engagement', value: formatNumber(submission.engagementCount) },
              { icon: Trophy, label: 'Score', value: String(submission.leaderboardScore) },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-lg border border-zinc-200 bg-white p-3 text-center shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                <div className="flex items-center justify-center gap-1 text-xs text-zinc-500">
                  <Icon className="h-3 w-3" /> {label}
                </div>
                <p className="mt-0.5 text-lg font-semibold text-zinc-900">{value}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-600">
            <Globe className="h-3.5 w-3.5" />
            {submission.platform && (submission.platform.charAt(0).toUpperCase() + submission.platform.slice(1))}
            {submission.postedVideoLink && (
              <><span className="text-zinc-300">&middot;</span><a href={submission.postedVideoLink} target="_blank" rel="noopener noreferrer" className="underline hover:text-zinc-900">View post</a></>
            )}
          </div>

          <div className="border-t border-zinc-100 pt-4">
            <p className="mb-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Creator</p>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-zinc-200">
                {MOCK_CREATOR.avatarUrl && <img src={MOCK_CREATOR.avatarUrl} alt="" className="h-full w-full object-cover" />}
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-900">{MOCK_CREATOR.name}</p>
                <p className="text-xs text-zinc-500">{MOCK_CREATOR.school}</p>
              </div>
            </div>
          </div>
        </div>

        <aside className="w-full shrink-0 space-y-4 lg:w-72">
          <RevisionTimeline />
        </aside>
      </div>
    </div>
  )
}

function WinnerSelectionDemo() {
  const contest = MOCK_CONTEST
  const shortlisted = MOCK_SHORTLISTED_SUBMISSIONS
  const dragItem = useRef<string | null>(null)

  const [slots, setSlots] = useState(
    contest.rewards.map((r) => ({
      placement: r.placement,
      label: r.label,
      amount: r.amount,
      currency: r.currency,
      submissionId: null as string | null,
    }))
  )

  const assignedIds = new Set(slots.map((s) => s.submissionId).filter(Boolean))
  const selectedCount = slots.filter((s) => s.submissionId).length
  const totalPayout = slots.filter((s) => s.submissionId).reduce((s, x) => s + Number(x.amount), 0)

  const assign = (placement: number, submissionId: string) => {
    if (slots.some((s) => s.submissionId === submissionId && s.placement !== placement)) return
    setSlots((prev) => prev.map((s) => (s.placement === placement ? { ...s, submissionId } : s)))
  }

  const removeAssign = (placement: number) => {
    setSlots((prev) => prev.map((s) => (s.placement === placement ? { ...s, submissionId: null } : s)))
  }

  const handleDragStart = (id: string) => {
    dragItem.current = id
  }

  const handleDrop = (placement: number) => {
    if (dragItem.current) {
      assign(placement, dragItem.current)
      dragItem.current = null
    }
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <h2 className="mb-5 text-sm font-semibold text-zinc-900">Winner Selection</h2>
      <p className="text-xs text-zinc-500 mb-5">
        Drag a shortlisted submission to a prize slot, or click the placement buttons to assign.
      </p>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Shortlisted <span className="font-normal normal-case">({shortlisted.length})</span>
          </p>
          {shortlisted.map((sub) => (
            <div
              key={sub.id}
              draggable={!assignedIds.has(sub.id)}
              onDragStart={() => handleDragStart(sub.id)}
              className={cn(
                'flex items-center gap-3 rounded-lg border p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-colors',
                assignedIds.has(sub.id)
                  ? 'border-emerald-200 bg-emerald-50/50 opacity-60'
                  : 'border-zinc-200 bg-white hover:border-zinc-300'
              )}
            >
              <GripVertical className="h-4 w-4 shrink-0 text-zinc-300 cursor-grab active:cursor-grabbing" />
              {sub.thumbnailUrl && (
                <img src={sub.thumbnailUrl} alt="" className="h-10 w-10 shrink-0 rounded object-cover" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-zinc-900">{sub.creatorName}</p>
                <p className="text-xs text-zinc-500">Score: {sub.leaderboardScore}</p>
              </div>
              <div className="flex flex-wrap gap-1">
                {contest.rewards.map((r) => {
                  const isTaken = slots.some((s) => s.placement === r.placement && s.submissionId && s.submissionId !== sub.id)
                  const isFilled = slots.find((s) => s.placement === r.placement)?.submissionId === sub.id
                  return (
                    <button
                      key={r.placement}
                      type="button"
                      disabled={isTaken || assignedIds.has(sub.id)}
                      onClick={() => assign(r.placement, sub.id)}
                      className={cn(
                        'rounded-md px-2 py-1 text-[11px] font-medium transition-colors',
                        isFilled
                          ? 'bg-emerald-100 text-emerald-700'
                          : isTaken || assignedIds.has(sub.id)
                            ? 'bg-zinc-100 text-zinc-300 cursor-not-allowed'
                            : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      )}
                    >
                      {r.label ?? `#${r.placement}`}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="w-full shrink-0 space-y-2 lg:w-72">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Prize slots</p>
          {slots.map((slot) => {
            const sub = slot.submissionId ? shortlisted.find((s) => s.id === slot.submissionId) : null
            return (
              <div
                key={slot.placement}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(slot.placement)}
                className={cn(
                  'flex items-center gap-3 rounded-lg border p-3 transition-colors',
                  sub
                    ? 'border-emerald-200 bg-emerald-50/50 shadow-[0_1px_2px_rgba(15,23,42,0.04)]'
                    : 'border-dashed border-zinc-300 bg-zinc-50'
                )}
              >
                <div className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                  sub ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-200 text-zinc-400'
                )}>
                  {slot.placement === 1 ? (
                    <Trophy className="h-4 w-4 text-amber-500" />
                  ) : slot.placement === 2 ? (
                    <Trophy className="h-4 w-4 text-zinc-400" />
                  ) : (
                    <span>{slot.placement}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-zinc-900">
                    {slot.label ?? `#${slot.placement}`}
                  </p>
                  {sub ? (
                    <p className="text-xs text-zinc-500">{sub.creatorName}</p>
                  ) : (
                    <p className="text-xs text-zinc-400">${Number(slot.amount).toLocaleString()}</p>
                  )}
                </div>
                {sub && (
                  <button
                    type="button"
                    onClick={() => removeAssign(slot.placement)}
                    className="shrink-0 rounded p-0.5 text-zinc-400 transition-colors hover:text-red-500"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            )
          })}

          <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-500">Selected</span>
              <span className={cn('font-medium', selectedCount >= contest.minimumWinners ? 'text-emerald-600' : 'text-amber-600')}>
                {selectedCount}/{contest.minimumWinners} min
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-zinc-500">Total payout</span>
              <span className="font-semibold text-zinc-900">${totalPayout.toLocaleString()}</span>
            </div>

            {selectedCount < contest.minimumWinners && (
              <p className="mt-2 text-xs text-amber-600">
                Select {contest.minimumWinners - selectedCount} more winner{contest.minimumWinners - selectedCount !== 1 ? 's' : ''}.
              </p>
            )}

            <button
              type="button"
              disabled={selectedCount < contest.minimumWinners}
              className={cn(
                'mt-3 w-full rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                selectedCount >= contest.minimumWinners
                  ? 'bg-zinc-900 text-white hover:bg-zinc-800'
                  : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
              )}
            >
              {selectedCount >= contest.minimumWinners ? 'Confirm & announce' : `Select ${contest.minimumWinners - selectedCount} more`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function MockDemoPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 py-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.03em] text-zinc-900">Mock Demo</h1>
        <p className="mt-0.5 text-sm text-zinc-500">Visual preview of submission detail and winner selection flows.</p>
      </div>
      <SubmissionDemo />
      <WinnerSelectionDemo />
    </div>
  )
}
