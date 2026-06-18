import { FrozenWalletBanner } from '@/components/wallet/frozen-wallet-banner'
import { useWalletStatusBanner } from '@/components/wallet/use-wallet-status-banner'

export function WalletStatusBanners() {
  const { showBanner } = useWalletStatusBanner()

  if (!showBanner) {
    return null
  }

  return (
    <div className="w-full shrink-0">
      <FrozenWalletBanner />
    </div>
  )
}
