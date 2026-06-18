import { useWallet } from '@/contexts/wallet-context'

export function useWalletStatusBanner() {
  const { wallet } = useWallet()

  const isFrozen = wallet?.status === 'frozen'

  return {
    showBanner: isFrozen,
    isFrozen,
  }
}
