import { useState, useRef, useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { ChevronLeft, Trophy, X, GripVertical, AlertCircle } from 'lucide-react'
import { useContest } from '@/hooks/use-opportunities'
import { useContestSubmissions, useSelectContestWinners } from '@/hooks/use-contest-board'
import { cn } from '@/lib/utils'

interface Slot {
  placement: number
  label: string | null
  amount: string
  currency: string
  submissionId: string | null
}

export function WinnerSelectionPage({ contestId }: { contestId: string }) {
  const { data: contestData, loading: contestLoading } = useContest(contestId)
  const { data: submissionsData, loading: submissionsLoading } = useContestSubmissions(contestId)
  const { selectWinners, loading: confirming } = useSelectContestWinners()

  const contest = contestData?.contest
  const allSubmissions = submissionsData?.contestSubmissions ?? []
  const shortlisted = allSubmissions.filter((s) => s.status === 'shortlisted')
  const loading = contestLoading || submissionsLoading

  const rewards = contest?.rewards ?? []
  const minimumWinners = contest?.minimumWinners ?? 0
  const currency = contest?.currency ?? 'USD'

  const [slots, setSlots] = useState<Slot[]>(
    rewards.map((r) => ({
      placement: r.placement,
      label: r.label ?? null,
      amount: r.amount,
      currency: r.currency,
      submissionId: null,
    }))
  )

  const [error, setError] = useState<string | null>(null)
  const dragItem = useRef<string | null>(null)
  const assignedIds = useMemo(() => new Set(slots.map((s) => s.submissionId).filter(Boolean)), [slots])
  const selectedCount = slots.filter((s) => s.submissionId).length
  const totalPayout = slots.filter((s) => s.submissionId).reduce((sum, s) => sum + Number(s.amount), 0)
  const canConfirm = selectedCount >= minimumWinners

  const assign = (placement: number, submissionId: string) => {
    setError(null)
    const existing = slots.find((s) => s.submissionId === submissionId && s.placement !== placement)
    if (existing) {
      setError('This creator is already assigned to another placement.')
      return
    }
    setSlots((prev) => prev.map((s) => (s.placement === placement ? { ...s, submissionId } : s)))
  }

  const remove = (placement: number) => {
    setSlots((prev) => prev.map((s) => (s.placement === placement ? { ...s, submissionId: null } : s)))
    setError(null)
  }

  const handleConfirm = async () => {
    const winners = slots
      .filter((s) => s.submissionId)
      .map((s) => ({ submissionId: s.submissionId!, placement: s.placement }))
    await selectWinners(contestId, winners)
  }

  if (loading && !contest) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 py-6">
        <p className="text-sm text-zinc-500">Loading contest data…</p>
      </div>
    )
  }

  if (!contest) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 py-6">
        <p className="text-sm text-zinc-500">Contest not found.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 py-6">
      <Link
        to="/dashboard/campaigns"
        search={{ action: 'view', opportunity_id: contestId, opportunity_type: 'Contest', tab: 'contest-board' }}
        className="inline-flex w-fit items-center gap-1 rounded-full bg-zinc-100 px-3 py-1.5 text-[11px] font-semibold text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-900"
      >
        <ChevronLeft className="h-3 w-3" />
        Back to {contest.title}
      </Link>

      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.03em] text-zinc-900">Select winners</h1>
        <p className="mt-0.5 text-sm text-zinc-500">
          Drag or assign shortlisted submissions to prize placement slots.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Shortlisted <span className="font-normal normal-case">({shortlisted.length})</span>
          </p>

          {shortlisted.length === 0 && (
            <p className="text-xs text-zinc-400">No shortlisted submissions yet.</p>
          )}

          {shortlisted.map((sub) => {
            const isAssigned = assignedIds.has(sub.id)
            return (
              <div
                key={sub.id}
                draggable={!isAssigned}
                onDragStart={() => { dragItem.current = sub.id }}
                className={cn(
                  'flex items-center gap-3 rounded-lg border p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-colors',
                  isAssigned
                    ? 'border-emerald-200 bg-emerald-50/50 opacity-60'
                    : 'border-zinc-200 bg-white hover:border-zinc-300'
                )}
              >
                <GripVertical className="h-4 w-4 shrink-0 text-zinc-300 cursor-grab active:cursor-grabbing" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-zinc-900">
                    {sub.creatorId.slice(0, 8)}...
                  </p>
                  <p className="text-xs text-zinc-500">
                    Score: {sub.leaderboardScore} &middot; {sub.platform ?? 'N/A'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {rewards.map((r) => {
                    const isTaken = slots.some((s) => s.placement === r.placement && s.submissionId && s.submissionId !== sub.id)
                    const isFilled = slots.find((s) => s.placement === r.placement)?.submissionId === sub.id
                    return (
                      <button
                        key={r.placement}
                        type="button"
                        disabled={isTaken || isAssigned}
                        onClick={() => assign(r.placement, sub.id)}
                        className={cn(
                          'rounded-md px-2 py-1 text-[11px] font-medium transition-colors',
                          isFilled
                            ? 'bg-emerald-100 text-emerald-700'
                            : isTaken || isAssigned
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
            )
          })}
        </div>

        <div className="w-full shrink-0 space-y-2 lg:w-72">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Prize slots</p>

          {slots.map((slot) => {
            const sub = slot.submissionId ? allSubmissions.find((s) => s.id === slot.submissionId) : null
            return (
              <div
                key={slot.placement}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragItem.current) { assign(slot.placement, dragItem.current); dragItem.current = null }
                }}
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
                  <p className="text-xs font-medium text-zinc-900">{slot.label ?? `#${slot.placement}`}</p>
                  {sub ? (
                    <p className="text-xs text-zinc-500">{sub.creatorId.slice(0, 8)}...</p>
                  ) : (
                    <p className="text-xs text-zinc-400">{Number(slot.amount).toLocaleString('en-US', { style: 'currency', currency: slot.currency, minimumFractionDigits: 0 })}</p>
                  )}
                </div>
                {sub && (
                  <button
                    type="button"
                    onClick={() => remove(slot.placement)}
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
              <span className={cn('font-medium', canConfirm ? 'text-emerald-600' : 'text-amber-600')}>
                {selectedCount}/{minimumWinners} min
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-zinc-500">Total payout</span>
              <span className="font-semibold text-zinc-900">
                {totalPayout.toLocaleString('en-US', { style: 'currency', currency, minimumFractionDigits: 0 })}
              </span>
            </div>

            {!canConfirm && selectedCount < minimumWinners && (
              <p className="mt-2 text-xs text-amber-600">
                Select {minimumWinners - selectedCount} more winner{minimumWinners - selectedCount !== 1 ? 's' : ''}.
              </p>
            )}

            <button
              type="button"
              disabled={!canConfirm || confirming}
              onClick={handleConfirm}
              className={cn(
                'mt-3 w-full rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                canConfirm && !confirming
                  ? 'bg-zinc-900 text-white hover:bg-zinc-800'
                  : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
              )}
            >
              {confirming ? 'Confirming…' : canConfirm ? 'Confirm & announce' : `Select ${minimumWinners - selectedCount} more`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
