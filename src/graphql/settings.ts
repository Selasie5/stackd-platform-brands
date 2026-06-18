import { gql } from '@apollo/client'

// Brand profile queries/mutations — backend not yet implemented.
// Re-add when the brand query and updateBrand mutation are available.

export const BRAND_QUERY = gql`
  query Brand {
    brand {
      id
      brandName
      contactName
      city
      country
      industry
      description
      website
      logoUrl
      kycStatus
      createdAt
    }
  }
`

export const UPDATE_BRAND_MUTATION = gql`
  mutation UpdateBrand($input: UpdateBrandInput!) {
    updateBrand(input: $input) {
      id
      brandName
      contactName
      city
      country
      industry
      description
      website
      logoUrl
    }
  }
`
