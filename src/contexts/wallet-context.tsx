import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from 'react'
import type { ReactNode } from 'react'
import type { BrandWallet } from '@/hooks/use-wallet'
import { useMyBrandWallet } from '@/hooks/use-wallet'
import {
  formatCurrency,
  getCurrencySymbol,
  normalizeCurrencyCode,
  parseWalletAmount,
} from '@/lib/currency'

interface WalletContextValue {
  wallet: BrandWallet | null
  currency: string
  currencySymbol: string
  availableBalance: number
  loading: boolean
  formatMoney: (
    amount: number,
    options?: { maximumFractionDigits?: number; minimumFractionDigits?: number }
  ) => string
  refetch: () => Promise<unknown>
}

const WalletContext = createContext<WalletContextValue | null>(null)

export function WalletProvider({
  children,
  skip = false,
}: {
  children: ReactNode
  skip?: boolean
}) {
  const { data, loading, refetch } = useMyBrandWallet({ skip })
  const wallet = data?.myBrandWallet ?? null
  const currency = normalizeCurrencyCode(wallet?.currency)

  const formatMoney = useCallback(
    (
      amount: number,
      options?: { maximumFractionDigits?: number; minimumFractionDigits?: number }
    ) => formatCurrency(amount, currency, options),
    [currency]
  )

  useEffect(() => {
    if (!skip) {
      void refetch()
    }
  }, [skip, refetch])

  const value = useMemo<WalletContextValue>(
    () => ({
      wallet,
      currency,
      currencySymbol: getCurrencySymbol(currency),
      availableBalance: parseWalletAmount(wallet?.availableBalance),
      loading,
      formatMoney,
      refetch: () => refetch(),
    }),
    [wallet, currency, loading, formatMoney, refetch]
  )

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}
