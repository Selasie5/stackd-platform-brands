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
