import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ChevronLeft, Eye, MessageSquare, Globe, Trophy, ThumbsUp, RotateCcw, ListChecks, XCircle, CheckCircle2, FileEdit, ChevronDown } from 'lucide-react'
import { MOCK_CREATOR, MOCK_SUBMISSION, MOCK_REVISION_HISTORY, mockSubmissionForStatus } from '@/mock/submission-detail'
import { cn } from '@/lib/utils'

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
                {event.note && <p className="mt-1 text-xs leading-relaxed text-zinc-500">{event.note}</p>}
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
                className={cn('flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-600 transition-colors', action.className)}
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

export function SubmissionDetailPage({ submissionId: _submissionId }: { submissionId: string }) {
  const [status, setStatus] = useState(MOCK_SUBMISSION.status)
  const [showRevisionInput, setShowRevisionInput] = useState(false)
  const [revisionNote, setRevisionNote] = useState('')
  const submission = mockSubmissionForStatus(status as any)
  const formatNumber = (n: number) => n.toLocaleString()

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <Link
        to="/dashboard/submissions"
        className="inline-flex w-fit items-center gap-1 rounded-full bg-zinc-100 px-3 py-1.5 text-[11px] font-semibold text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-900"
      >
        <ChevronLeft className="h-3 w-3" />
        Back to submissions
      </Link>

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
    </div>
  )
}
