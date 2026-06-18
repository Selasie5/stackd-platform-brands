import { Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  IceFrostPattern,
  SpleenetLogoPattern,
} from '@/components/wallet/wallet-balance-card-patterns'

type BalanceCardProps = {
  label: string
  amount: string
  variant?: 'primary' | 'secondary'
  isFrozen?: boolean
  className?: string
}

function BalanceCard({
  label,
  amount,
  variant = 'secondary',
  isFrozen = false,
  className,
}: BalanceCardProps) {
  const isPrimary = variant === 'primary'

  return (
    <div
      className={cn(
        'relative flex min-h-[148px] flex-1 flex-col justify-between overflow-hidden rounded-2xl p-5 ring-1 ring-inset',
        isPrimary
          ? cn(
              'bg-primary text-primary-foreground ring-black/10',
              'shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.35),inset_0_-2px_8px_rgba(0,0,0,0.18)]',
              isFrozen && 'ring-sky-200/30'
            )
          : cn(
              'border border-zinc-200/80 bg-zinc-50 text-zinc-900 ring-zinc-200/60',
              'shadow-[inset_0_1px_0_rgba(255,255,255,0.95),inset_0_2px_6px_rgba(15,23,42,0.07)]',
              isFrozen && 'border-sky-200/70 bg-sky-50/90 text-sky-950 ring-sky-200/50'
            ),
        className
      )}
    >
      {isPrimary ? (
        <>
          <SpleenetLogoPattern />
          {isFrozen ? <IceFrostPattern className="opacity-70 mix-blend-soft-light" /> : null}
        </>
      ) : isFrozen ? (
        <IceFrostPattern className="opacity-90" />
      ) : null}

      <div className="relative flex items-start justify-between gap-3">
        <p
          className={cn(
            'text-sm font-medium',
            isPrimary ? 'text-primary-foreground/75' : 'text-zinc-500',
            isFrozen && !isPrimary && 'text-sky-700/80'
          )}
        >
          {label}
        </p>
        {isPrimary ? (
          <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 ring-1 ring-inset ring-white/15">
            <Wallet className="h-4 w-4 text-white" aria-hidden="true" />
          </span>
        ) : null}
      </div>

      <p
        className={cn(
          'relative mt-6 text-2xl font-semibold tracking-[-0.03em] sm:text-[1.75rem]',
          isPrimary ? 'text-primary-foreground' : 'text-zinc-900',
          isFrozen && !isPrimary && 'text-sky-950'
        )}
      >
        {amount}
      </p>
    </div>
  )
}

export function WalletBalanceCards({
  available,
  reserved,
  totalSpent,
  isFrozen,
  className,
}: {
  available: string
  reserved: string
  totalSpent: string
  isFrozen?: boolean
  className?: string
}) {
  return (
    <div className={cn('space-y-4', className)}>
      {isFrozen ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 ring-1 ring-inset ring-red-100">
            Frozen
          </span>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <BalanceCard
          label="Available balance"
          amount={available}
          variant="primary"
          isFrozen={isFrozen}
        />
        <BalanceCard label="Reserved balance" amount={reserved} isFrozen={isFrozen} />
        <BalanceCard label="Total spent" amount={totalSpent} isFrozen={isFrozen} />
      </div>
    </div>
  )
}
