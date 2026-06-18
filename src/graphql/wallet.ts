import { gql } from '@apollo/client'

export const MY_BRAND_WALLET_QUERY = gql`
  query MyBrandWallet {
    myBrandWallet {
      availableBalance
      brandId
      createdAt
      currency
      id
      reservedBalance
      status
      totalSpent
      updatedAt
    }
  }
`

export const MY_BRAND_WALLET_TRANSACTIONS_QUERY = gql`
  query MyBrandWalletTransactions($limit: Int) {
    myBrandWalletTransactions(limit: $limit) {
      id
      transactionType
      amount
      currency
      balanceBefore
      balanceAfter
      reservedBefore
      reservedAfter
      description
      referenceType
      referenceId
      createdAt
    }
  }
`

export const INITIALIZE_WALLET_TOPUP_MUTATION = gql`
  mutation InitializeWalletTopUp($amount: String!) {
    initializeWalletTopUp(amount: $amount) {
      topUpId
      authorizationUrl
      reference
      amount
      currency
    }
  }
`

export const VERIFY_WALLET_TOPUP_MUTATION = gql`
  mutation VerifyWalletTopUp($reference: String!) {
    verifyWalletTopUp(reference: $reference) {
      id
      brandId
      currency
      availableBalance
      reservedBalance
      totalSpent
      status
      createdAt
      updatedAt
    }
  }
`
