import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useWallet } from '@/contexts/wallet-context'

export function FundWalletButton() {
  const { wallet, openFundModal } = useWallet()
  const isFrozen = wallet?.status === 'frozen'

  return (
    <Button disabled={isFrozen} onClick={openFundModal}>
      <Plus className="h-4 w-4" />
      Fund wallet
    </Button>
  )
}
