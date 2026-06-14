import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/wallet')({
  component: WalletPage,
})

function WalletPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Wallet</h1>
      <p className="text-slate-600">Manage your funds and transactions.</p>
    </div>
  )
}
