import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useWallet } from '@/contexts/wallet-context'
import { useInitializeWalletTopUp } from '@/hooks/use-wallet'
import { WALLET_TOPUP_REFERENCE_KEY } from '@/lib/wallet-topup'

function formatTopUpAmount(raw: string) {
  const value = Number(raw)
  if (!Number.isFinite(value) || value <= 0) return null
  return value.toFixed(2)
}

export function FundWalletModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { currency, currencySymbol, wallet, loading: walletLoading } = useWallet()
  const { initializeTopUp, loading } = useInitializeWalletTopUp()
  const [amount, setAmount] = useState('')

  useEffect(() => {
    if (!open) {
      setAmount('')
    }
  }, [open])

  const handleProceed = async () => {
    const formatted = formatTopUpAmount(amount)
    if (!formatted) return

    const result = await initializeTopUp(formatted)
    if (!result?.authorizationUrl) return

    sessionStorage.setItem(WALLET_TOPUP_REFERENCE_KEY, result.reference)
    window.location.href = result.authorizationUrl
  }

  const parsedAmount = Number(amount)
  const isValidAmount = Number.isFinite(parsedAmount) && parsedAmount > 0
  const isWalletReady = Boolean(wallet?.currency) && !walletLoading

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-zinc-950/45 backdrop-blur-[1px]"
        aria-label="Close fund wallet dialog"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="fund-wallet-title"
        className="relative w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="fund-wallet-title" className="text-lg font-semibold text-zinc-900">
              Fund your wallet
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Enter an amount to top up your {currency} wallet.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          className="mt-6 space-y-4"
          onSubmit={(event) => {
            event.preventDefault()
            void handleProceed()
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="fund-wallet-amount">Amount</Label>
            <div className="flex h-10 w-full overflow-hidden rounded-md border border-input bg-transparent focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50">
              <span className="flex shrink-0 items-center gap-1.5 border-r border-input bg-zinc-50 px-3 text-sm text-zinc-500">
                <span>{currencySymbol}</span>
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  {currency}
                </span>
              </span>
              <Input
                id="fund-wallet-amount"
                type="number"
                min={0}
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0.00"
                disabled={loading || !isWalletReady}
                className="rounded-none border-0 bg-transparent shadow-none focus-visible:border-transparent focus-visible:ring-0"
                aria-describedby="fund-wallet-amount-hint"
              />
            </div>
            <p id="fund-wallet-amount-hint" className="text-xs text-zinc-500">
              {isWalletReady
                ? 'You will be redirected to complete payment securely. Your wallet updates after payment is confirmed.'
                : 'Loading wallet currency…'}
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValidAmount || loading || !isWalletReady}
              isLoading={loading}
            >
              Proceed to top up
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
