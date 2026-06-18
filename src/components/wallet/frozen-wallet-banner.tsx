import { AlertTriangle } from 'lucide-react'

export function FrozenWalletBanner() {
  return (
    <div
      className="flex w-full gap-3 bg-red-50 px-6 py-3.5 text-sm text-red-800"
      role="alert"
    >
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
      <div className="space-y-1">
        <p className="font-semibold">Your wallet is frozen</p>
        <p className="leading-relaxed text-red-700/90">
          All wallet actions are disabled. Balances are shown for reference only. Please contact
          support to resolve this issue.
        </p>
      </div>
    </div>
  )
}
