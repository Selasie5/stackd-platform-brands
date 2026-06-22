import { useState } from 'react'
import { ThumbsUp, RotateCcw, ListChecks, XCircle, CheckCircle2, Ban } from 'lucide-react'
import type { SubmissionStatus } from '@/hooks/use-contest-board'

interface Props {
  status: SubmissionStatus
  onApprove: () => void
  onRequestRevision: (note: string) => void
  onShortlist: () => void
  onReject: (reason: string) => void
  actionsLoading?: { approve?: boolean; revision?: boolean; shortlist?: boolean; reject?: boolean }
}

function ConfirmButton({
  label,
  icon,
  variant,
  onClick,
  loading,
  confirmLabel,
}: {
  label: string
  icon: React.ReactNode
  variant: 'approve' | 'revision' | 'shortlist' | 'reject'
  onClick: () => void
  loading?: boolean
  confirmLabel?: string
}) {
  const [confirming, setConfirming] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  const variantStyles = {
    approve: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    revision: 'bg-amber-600 hover:bg-amber-700 text-white',
    shortlist: 'bg-blue-600 hover:bg-blue-700 text-white',
    reject: 'bg-red-600 hover:bg-red-700 text-white',
  }

  if (confirming && variant === 'reject') {
    return (
      <div className="space-y-2 rounded-lg border border-red-200 bg-red-50 p-3">
        <p className="text-xs font-medium text-red-700">Why are you rejecting this?</p>
        <textarea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Provide a reason..."
          rows={2}
          className="w-full resize-none rounded-md border border-red-200 bg-white px-2 py-1.5 text-xs outline-none focus-visible:ring-2 focus-visible:ring-red-500/30"
        />
        <div className="flex gap-2">
          <button
            type="button"
            disabled={!rejectReason.trim() || loading}
            onClick={() => { onClick(); setConfirming(false); setRejectReason('') }}
            className="inline-flex items-center gap-1 rounded-md bg-red-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            Confirm reject
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="text-xs text-zinc-500 hover:text-zinc-700"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2">
        <p className="text-xs text-zinc-600">{confirmLabel ?? `Confirm ${label.toLowerCase()}?`}</p>
        <button
          type="button"
          onClick={() => { onClick(); setConfirming(false) }}
          className="inline-flex items-center gap-1 rounded-md bg-zinc-900 px-2 py-1 text-[11px] font-medium text-white hover:bg-zinc-800"
        >
          Yes, {label.toLowerCase()}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="text-[11px] text-zinc-500 hover:text-zinc-700"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${variantStyles[variant]}`}
    >
      {icon}
      {label}
    </button>
  )
}

export function SubmissionActions({ status, onApprove, onRequestRevision, onShortlist, onReject, actionsLoading }: Props) {
  const [showRevisionInput, setShowRevisionInput] = useState(false)
  const [revisionNote, setRevisionNote] = useState('')

  const isShortlisted = status === 'shortlisted'

  return (
    <div className="rounded-lg border border-zinc-200 p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Actions</h3>

      <div className="mt-3 flex flex-wrap gap-2">
        {(status === 'submitted' || status === 'under_review' || status === 'resubmitted') && (
          <>
            <ConfirmButton
              label="Approve"
              icon={<ThumbsUp className="h-3.5 w-3.5" />}
              variant="approve"
              onClick={onApprove}
              loading={actionsLoading?.approve}
            />
            <ConfirmButton
              label="Request revision"
              icon={<RotateCcw className="h-3.5 w-3.5" />}
              variant="revision"
              onClick={() => setShowRevisionInput(true)}
              loading={actionsLoading?.revision}
            />
            {!isShortlisted && (
              <ConfirmButton
                label="Shortlist"
                icon={<ListChecks className="h-3.5 w-3.5" />}
                variant="shortlist"
                onClick={onShortlist}
                loading={actionsLoading?.shortlist}
                confirmLabel="Shortlist this submission?"
              />
            )}
            <ConfirmButton
              label="Reject"
              icon={<XCircle className="h-3.5 w-3.5" />}
              variant="reject"
              onClick={() => onReject('')}
              loading={actionsLoading?.reject}
            />
          </>
        )}

        {status === 'shortlisted' && (
          <>
            <ConfirmButton
              label="Approve"
              icon={<ThumbsUp className="h-3.5 w-3.5" />}
              variant="approve"
              onClick={onApprove}
              loading={actionsLoading?.approve}
            />
            <ConfirmButton
              label="Remove from shortlist"
              icon={<Ban className="h-3.5 w-3.5" />}
              variant="reject"
              onClick={() => {}}
            />
          </>
        )}

        {status === 'approved' && (
          <div className="flex items-center gap-2 text-xs text-emerald-600">
            <CheckCircle2 className="h-4 w-4" />
            Approved
          </div>
        )}

        {status === 'revision_requested' && (
          <div className="flex items-center gap-2 text-xs text-amber-600">
            <RotateCcw className="h-4 w-4" />
            Waiting for resubmission
          </div>
        )}

        {status === 'rejected' && (
          <div className="flex items-center gap-2 text-xs text-red-600">
            <XCircle className="h-4 w-4" />
            Rejected
          </div>
        )}

        {status === 'disqualified' && (
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            Disqualified
          </div>
        )}

        {status === 'winner' && (
          <div className="flex items-center gap-2 text-xs font-medium text-blue-600">
            Winner (Place #{' '})
          </div>
        )}

        {status === 'paid' && (
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            Paid
          </div>
        )}
      </div>

      {showRevisionInput && (
        <div className="mt-3 space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="text-xs font-medium text-amber-700">Revision instructions</p>
          <textarea
            value={revisionNote}
            onChange={(e) => setRevisionNote(e.target.value)}
            placeholder="Describe what needs to be changed..."
            rows={3}
            className="w-full resize-none rounded-md border border-amber-200 bg-white px-3 py-2 text-xs text-zinc-900 outline-none placeholder:text-zinc-400 focus-visible:ring-2 focus-visible:ring-amber-500/30"
          />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={!revisionNote.trim()}
              onClick={() => { onRequestRevision(revisionNote); setShowRevisionInput(false); setRevisionNote('') }}
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
    </div>
  )
}
