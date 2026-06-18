import { useMutation, useQuery } from '@apollo/client/react'
import { toast } from 'sonner'
import {
  INITIALIZE_WALLET_TOPUP_MUTATION,
  MY_BRAND_WALLET_QUERY,
  MY_BRAND_WALLET_TRANSACTIONS_QUERY,
  VERIFY_WALLET_TOPUP_MUTATION,
} from '@/graphql/wallet'
import type { BrandWalletTransaction } from '@/lib/wallet-utils'
import { extractGqlError } from '@/lib/gql-error'

export interface BrandWallet {
  id: string
  brandId: string
  currency: string
  availableBalance: string
  reservedBalance: string
  totalSpent: string
  status: string
  createdAt: string
  updatedAt: string
}

export function useMyBrandWallet(options?: { skip?: boolean }) {
  return useQuery<{ myBrandWallet: BrandWallet | null }>(MY_BRAND_WALLET_QUERY, {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'ignore',
    skip: options?.skip,
  })
}

export function useMyBrandWalletTransactions(limit = 500) {
  return useQuery<{ myBrandWalletTransactions: BrandWalletTransaction[] }>(
    MY_BRAND_WALLET_TRANSACTIONS_QUERY,
    {
      variables: { limit },
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'ignore',
    }
  )
}

export function useInitializeWalletTopUp() {
  const [mutate, { loading }] = useMutation<
    {
      initializeWalletTopUp: {
        topUpId: string
        authorizationUrl: string
        reference: string
        amount: string
        currency: string
      }
    },
    { amount: string }
  >(INITIALIZE_WALLET_TOPUP_MUTATION, {
    refetchQueries: [{ query: MY_BRAND_WALLET_QUERY }, { query: MY_BRAND_WALLET_TRANSACTIONS_QUERY }],
  })

  const initializeTopUp = async (amount: string) => {
    try {
      const { data } = await mutate({ variables: { amount } })
      return data?.initializeWalletTopUp ?? null
    } catch (err) {
      const message = extractGqlError(err)
      if (message.toLowerCase().includes('paystack is not configured')) {
        toast.error(
          'Wallet top-up is unavailable because Paystack is not configured on the API server. Add PAYSTACK_SECRET_KEY to the backend environment and restart the server.'
        )
        return null
      }
      toast.error(message)
      return null
    }
  }

  return { initializeTopUp, loading }
}

export function useVerifyWalletTopUp() {
  const [mutate, { loading }] = useMutation<
    { verifyWalletTopUp: BrandWallet },
    { reference: string }
  >(VERIFY_WALLET_TOPUP_MUTATION, {
    refetchQueries: [{ query: MY_BRAND_WALLET_QUERY }, { query: MY_BRAND_WALLET_TRANSACTIONS_QUERY }],
  })

  const verifyTopUp = async (reference: string) => {
    try {
      const { data } = await mutate({ variables: { reference } })
      return data?.verifyWalletTopUp ?? null
    } catch (err) {
      toast.error(extractGqlError(err))
      return null
    }
  }

  return { verifyTopUp, loading }
}
