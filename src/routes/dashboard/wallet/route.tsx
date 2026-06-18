import { useEffect, useRef } from 'react'

import { createFileRoute, useNavigate } from '@tanstack/react-router'

import { z } from 'zod'

import { toast } from 'sonner'

import { TransactionTable } from '@/components/wallet/transaction-table'

import { WalletBalanceCards } from '@/components/wallet/wallet-balance-cards'

import { useMyBrandWalletTransactions, useVerifyWalletTopUp } from '@/hooks/use-wallet'

import { useWallet } from '@/contexts/wallet-context'

import { parseWalletAmount } from '@/lib/currency'

import { WALLET_TOPUP_REFERENCE_KEY } from '@/lib/wallet-topup'



const walletSearchSchema = z.object({

  topup: z.enum(['success']).optional(),

  reference: z.string().optional(),

  trxref: z.string().optional(),

})



export const Route = createFileRoute('/dashboard/wallet')({

  validateSearch: walletSearchSchema,

  component: WalletPage,

})



function WalletPage() {

  const navigate = useNavigate()

  const { topup, reference, trxref } = Route.useSearch()

  const { wallet, formatMoney, loading, refetch } = useWallet()

  const { data: txData, loading: txLoading, refetch: refetchTx } = useMyBrandWalletTransactions()

  const { verifyTopUp } = useVerifyWalletTopUp()

  const verifyingRef = useRef(false)



  const isFrozen = wallet?.status === 'frozen'

  const available = parseWalletAmount(wallet?.availableBalance)

  const reserved = parseWalletAmount(wallet?.reservedBalance)

  const totalSpent = parseWalletAmount(wallet?.totalSpent)



  useEffect(() => {

    if (topup !== 'success' || verifyingRef.current) return



    const paystackReference =

      reference ??

      trxref ??

      sessionStorage.getItem(WALLET_TOPUP_REFERENCE_KEY) ??

      undefined



    if (!paystackReference) {

      toast.error('Payment reference missing. If your payment succeeded, contact support.')

      void navigate({ to: '/dashboard/wallet', search: {}, replace: true })

      return

    }



    verifyingRef.current = true



    void (async () => {

      const updatedWallet = await verifyTopUp(paystackReference)

      sessionStorage.removeItem(WALLET_TOPUP_REFERENCE_KEY)



      if (updatedWallet) {

        toast.success('Wallet funded successfully.')

        await refetch()

        await refetchTx()

      } else {

        toast.message('Payment received. Your wallet will update once confirmation completes.')

        await refetch()

        await refetchTx()

      }



      void navigate({ to: '/dashboard/wallet', search: {}, replace: true })

    })()

  }, [topup, reference, trxref, verifyTopUp, refetch, refetchTx, navigate])



  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <WalletBalanceCards

        available={loading ? '…' : formatMoney(available)}

        reserved={loading ? '…' : formatMoney(reserved)}

        totalSpent={loading ? '…' : formatMoney(totalSpent)}

        isFrozen={isFrozen}

      />



      <TransactionTable

        transactions={txData?.myBrandWalletTransactions ?? []}

        loading={txLoading}

        formatMoney={formatMoney}

      />

    </div>

  )

}


