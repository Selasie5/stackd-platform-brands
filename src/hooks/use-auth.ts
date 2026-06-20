import { useMutation, useQuery, useApolloClient } from '@apollo/client/react'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import {
  ME_QUERY,
  LOGIN_MUTATION,
  LOGOUT_MUTATION,
  REGISTER_BRAND_MUTATION,
  REQUEST_PASSWORD_RESET_MUTATION,
  RESET_PASSWORD_MUTATION,
  RESEND_VERIFICATION_EMAIL_MUTATION,
  REGISTER_DEVICE_TOKEN_MUTATION,
} from '@/graphql/auth'
import { registerStoredDeviceToken } from '@/lib/device-token'



interface User {
  id: string
  email: string
  role: 'admin' | 'brand' | 'creator'
  status: 'active' | 'suspended' | 'pending' | 'banned'
  emailVerified: boolean
  brand?: {
    id: string
    brandName: string
    contactName?: string | null
    city?: string | null
    country: string
    industry?: string | null
    description?: string | null
    website?: string | null
    logoUrl?: string | null
    kycStatus: string
    createdAt: string
  } | null
}

interface RegisterBrandInput {
  email: string
  password: string
  brandName: string
  country: string
  contactName: string
  currency?: string
  industry: string
  city: string
  description: string
  website?: string
  logoUrl?: string
}

interface LoginInput {
  email: string
  password: string
}

interface LoginData {
  login: {
    user: User
  }
}

interface RegisterData {
  registerBrand: {
    message: string
    user: User
  }
}


function extractGqlError(error: unknown): string {
  if (!error || typeof error !== 'object') return 'An unexpected error occurred.'
  if ('graphQLErrors' in error) {
    const gqlErrors = (error as { graphQLErrors: Array<{ message: string }> }).graphQLErrors
    if (gqlErrors.length > 0) return gqlErrors[0].message
  }
  if ('message' in error && typeof error.message === 'string') {
    return error.message
  }
  return 'An unexpected error occurred.'
}


export function useMe() {
  return useQuery<{ me: User | null }>(ME_QUERY, {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'ignore',
  })
}

export function useLogin() {
  const navigate = useNavigate()
  const { registerDeviceToken } = useRegisterDeviceToken()
  const [loginMutation, { loading, error }] = useMutation<LoginData, { input: LoginInput }>(LOGIN_MUTATION)

  const login = async (input: LoginInput) => {
    try {
      const { data } = await loginMutation({ variables: { input } })
      if (data?.login.user) {
        void registerStoredDeviceToken(registerDeviceToken)
        toast.success('Welcome back!')
        navigate({ to: '/dashboard/overview' })
      }
    } catch (err) {
      toast.error(extractGqlError(err))
    }
  }

  return { login, loading, error }
}

export function useRegisterBrand() {
  const navigate = useNavigate()
  const [registerMutation, { loading, error }] = useMutation<RegisterData, { input: RegisterBrandInput }>(REGISTER_BRAND_MUTATION)

  const registerBrand = async (input: RegisterBrandInput) => {
    try {
      const { data } = await registerMutation({ variables: { input } })
      if (data?.registerBrand.message) {
        toast.success(data.registerBrand.message)
        navigate({
          to: '/signin',
          search: { action: 'verify-email', email: input.email },
        })
      }
    } catch (err) {
      toast.error(extractGqlError(err))
    }
  }

  return { registerBrand, loading, error }
}

export function useLogout() {
  const navigate = useNavigate()
  const client = useApolloClient()
  const [logoutMutation, { loading }] = useMutation(LOGOUT_MUTATION)

  const logout = async () => {
    try {
      await logoutMutation()
      await client.clearStore()
      toast.success('Signed out successfully.')
      navigate({ to: '/signin' })
    } catch (err) {
      toast.error(extractGqlError(err))
    }
  }

  return { logout, loading }
}

export function useRequestPasswordReset() {
  const [mutation, { loading, error }] = useMutation(REQUEST_PASSWORD_RESET_MUTATION)

  const requestReset = async (email: string) => {
    try {
      await mutation({ variables: { email } })
      toast.success('Verification code sent to your email.')
      return true
    } catch (err) {
      toast.error(extractGqlError(err))
      return false
    }
  }

  return { requestReset, loading, error }
}

export function useResetPassword() {
  const [mutation, { loading, error }] = useMutation(RESET_PASSWORD_MUTATION)

  const resetPassword = async (email: string, otp: string, newPassword: string) => {
    try {
      await mutation({ variables: { email, otp, newPassword } })
      toast.success('Password reset successfully. Please sign in.')
      return true
    } catch (err) {
      toast.error(extractGqlError(err))
      return false
    }
  }

  return { resetPassword, loading, error }
}

export function useResendVerificationEmail() {
  const [mutation, { loading, error }] = useMutation(RESEND_VERIFICATION_EMAIL_MUTATION)

  const resendEmail = async (email: string) => {
    try {
      await mutation({ variables: { email } })
      toast.success('Verification email sent.')
      return true
    } catch (err) {
      toast.error(extractGqlError(err))
      return false
    }
  }

  return { resendEmail, loading, error }
}

export function useRegisterDeviceToken() {
  const [registerDeviceTokenMutation] = useMutation<
    { registerDeviceToken: boolean },
    { token: string; platform: string }
  >(REGISTER_DEVICE_TOKEN_MUTATION)

  const registerDeviceToken = async (token: string, platform: string) => {
    try {
      await registerDeviceTokenMutation({ variables: { token, platform } })
      return true
    } catch {
      return false
    }
  }

  return { registerDeviceToken }
}

export type { User, RegisterBrandInput, LoginInput }
