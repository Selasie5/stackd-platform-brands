import { useMutation, useQuery } from '@apollo/client/react'
import { toast } from 'sonner'
import {
  BRAND_QUERY,
  UPDATE_BRAND_MUTATION,
} from '@/graphql/settings'
import { extractGqlError } from '@/lib/gql-error'

export interface BrandProfile {
  id: string
  brandName: string
  contactName: string
  city: string
  country: string
  industry: string
  description: string
  website?: string | null
  logoUrl?: string | null
  kycStatus: string
  createdAt: string
}

export interface UpdateBrandInput {
  brandName?: string
  contactName?: string
  city?: string
  country?: string
  industry?: string
  description?: string
  website?: string | null
  logoUrl?: string | null
}

/**
 * Queries a top-level `brand` field.
 * NOTE: backend resolver not yet implemented — will silently return null.
 */
export function useBrand() {
  return useQuery<{ brand: BrandProfile | null }>(BRAND_QUERY, {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'ignore',
  })
}

/**
 * Mutates via `updateBrand`.
 * NOTE: backend resolver not yet implemented — will silently fail.
 */
export function useUpdateBrand() {
  const [mutation, { loading }] = useMutation<
    { updateBrand: BrandProfile },
    { input: UpdateBrandInput }
  >(UPDATE_BRAND_MUTATION, {
    refetchQueries: [{ query: BRAND_QUERY }],
  })

  const updateBrand = async (input: UpdateBrandInput) => {
    try {
      await mutation({ variables: { input } })
      toast.success('Profile updated successfully.')
      return true
    } catch (err) {
      toast.error(extractGqlError(err))
      return false
    }
  }

  return { updateBrand, loading }
}
