import { useMutation, useQuery } from '@apollo/client/react'
import { toast } from 'sonner'
import {
  BRAND_QUERY,
  UPDATE_BRAND_MUTATION,
  CHANGE_PASSWORD_MUTATION,
  ACTIVE_SESSIONS_QUERY,
  REVOKE_SESSION_MUTATION,
  NOTIFICATION_PREFERENCES_QUERY,
  UPDATE_NOTIFICATION_PREFERENCES_MUTATION,
} from '@/graphql/settings'
import { ME_QUERY } from '@/graphql/auth'
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

export interface ActiveSession {
  id: string
  deviceName: string
  platform: string
  ipAddress: string
  lastActiveAt: string
  createdAt: string
  isCurrent: boolean
}

export interface NotificationPreferences {
  emailMarketing: boolean
  emailSecurity: boolean
  emailCampaignUpdates: boolean
  pushMarketing: boolean
  pushSecurity: boolean
  pushCampaignUpdates: boolean
}

export function useBrand() {
  return useQuery<{ brand: BrandProfile | null }>(BRAND_QUERY, {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'ignore',
  })
}

export function useUpdateBrand() {
  const [mutation, { loading }] = useMutation<
    { updateBrand: BrandProfile },
    { input: UpdateBrandInput }
  >(UPDATE_BRAND_MUTATION, {
    refetchQueries: [{ query: ME_QUERY }, { query: BRAND_QUERY }],
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

export function useChangePassword() {
  const [mutation, { loading }] = useMutation<
    { changePassword: boolean },
    { currentPassword: string; newPassword: string }
  >(CHANGE_PASSWORD_MUTATION)

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      const result = await mutation({ variables: { currentPassword, newPassword } })
      if (result.data?.changePassword) {
        toast.success('Password changed successfully.')
        return true
      }
      return false
    } catch (err) {
      toast.error(extractGqlError(err))
      return false
    }
  }

  return { changePassword, loading }
}

export function useActiveSessions() {
  return useQuery<{ activeSessions: ActiveSession[] }>(ACTIVE_SESSIONS_QUERY, {
    fetchPolicy: 'cache-and-network',
  })
}

export function useRevokeSession() {
  const [mutation, { loading }] = useMutation<
    { revokeSession: boolean },
    { sessionId: string }
  >(REVOKE_SESSION_MUTATION, {
    refetchQueries: [{ query: ACTIVE_SESSIONS_QUERY }],
  })

  const revokeSession = async (sessionId: string) => {
    try {
      const result = await mutation({ variables: { sessionId } })
      if (result.data?.revokeSession) {
        toast.success('Session revoked successfully.')
        return true
      }
      return false
    } catch (err) {
      toast.error(extractGqlError(err))
      return false
    }
  }

  return { revokeSession, loading }
}

export function useNotificationPreferences() {
  return useQuery<{ notificationPreferences: NotificationPreferences }>(
    NOTIFICATION_PREFERENCES_QUERY,
    {
      fetchPolicy: 'cache-and-network',
    }
  )
}

export function useUpdateNotificationPreferences() {
  const [mutation, { loading }] = useMutation<
    { updateNotificationPreferences: NotificationPreferences },
    { input: Partial<NotificationPreferences> }
  >(UPDATE_NOTIFICATION_PREFERENCES_MUTATION, {
    refetchQueries: [{ query: NOTIFICATION_PREFERENCES_QUERY }],
  })

  const updatePreferences = async (input: Partial<NotificationPreferences>) => {
    try {
      const result = await mutation({ variables: { input } })
      if (result.data?.updateNotificationPreferences) {
        toast.success('Notification preferences updated.')
        return true
      }
      return false
    } catch (err) {
      toast.error(extractGqlError(err))
      return false
    }
  }

  return { updatePreferences, loading }
}
