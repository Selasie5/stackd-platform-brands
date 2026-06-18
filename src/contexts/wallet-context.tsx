import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { FundWalletModal } from '@/components/wallet/fund-wallet-modal'
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
  fundModalOpen: boolean
  openFundModal: () => void
  closeFundModal: () => void
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
  const [fundModalOpen, setFundModalOpen] = useState(false)
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
      fundModalOpen,
      openFundModal: () => setFundModalOpen(true),
      closeFundModal: () => setFundModalOpen(false),
      formatMoney,
      refetch: () => refetch(),
    }),
    [wallet, currency, loading, fundModalOpen, formatMoney, refetch]
  )

  return (
    <WalletContext.Provider value={value}>
      {children}
      {!skip ? (
        <FundWalletModal
          open={fundModalOpen}
          onClose={() => setFundModalOpen(false)}
        />
      ) : null}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}
