import { gql } from '@apollo/client'

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

export const CHANGE_PASSWORD_MUTATION = gql`
  mutation ChangePassword($currentPassword: String!, $newPassword: String!) {
    changePassword(currentPassword: $currentPassword, newPassword: $newPassword)
  }
`

export const ACTIVE_SESSIONS_QUERY = gql`
  query ActiveSessions {
    activeSessions {
      id
      deviceName
      platform
      ipAddress
      lastActiveAt
      createdAt
      isCurrent
    }
  }
`

export const REVOKE_SESSION_MUTATION = gql`
  mutation RevokeSession($sessionId: String!) {
    revokeSession(sessionId: $sessionId)
  }
`

export const NOTIFICATION_PREFERENCES_QUERY = gql`
  query NotificationPreferences {
    notificationPreferences {
      emailMarketing
      emailSecurity
      emailCampaignUpdates
      pushMarketing
      pushSecurity
      pushCampaignUpdates
    }
  }
`

export const UPDATE_NOTIFICATION_PREFERENCES_MUTATION = gql`
  mutation UpdateNotificationPreferences($input: NotificationPreferencesInput!) {
    updateNotificationPreferences(input: $input) {
      emailMarketing
      emailSecurity
      emailCampaignUpdates
      pushMarketing
      pushSecurity
      pushCampaignUpdates
    }
  }
`
