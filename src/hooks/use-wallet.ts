import { useQuery } from '@apollo/client/react'
import { MY_BRAND_WALLET_QUERY } from '@/graphql/wallet'

export interface BrandWallet {
  id: string
  brandId: string
  currency: string
  availableBalance: number
  reservedBalance: number
  totalSpent: number
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
