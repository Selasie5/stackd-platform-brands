import * as React from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Label } from '@/components/ui/label'
import { AuthShell } from '@/components/auth-shell'
import {
  useLogin,
  useRequestPasswordReset,
  useResetPassword,
  useResendVerificationEmail,
} from '@/hooks/use-auth'

const searchSchema = z.object({
  action: z.enum(['forgot-password', 'check-email', 'reset-password', 'verify-email']).optional(),
  email: z.email().optional(),
})

export const Route = createFileRoute('/signin')({
  validateSearch: searchSchema,
  component: SignInRoute,
})

function SignInRoute() {
  const { action, email: emailFromSearch } = Route.useSearch()
  const navigate = useNavigate()

  const [email, setEmail] = React.useState(emailFromSearch ?? '')
  const [password, setPassword] = React.useState('')
  const [newPassword, setNewPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [otp, setOtp] = React.useState(['', '', '', '', '', ''])
  const [otpError, setOtpError] = React.useState('')
  const [passwordError, setPasswordError] = React.useState('')
  const otpInputRefs = React.useRef<Array<HTMLInputElement | null>>([])

  const { login, loading: loginLoading } = useLogin()
  const { requestReset, loading: resetRequestLoading } = useRequestPasswordReset()
  const { resetPassword, loading: resetLoading } = useResetPassword()
  const { resendEmail, loading: resendLoading } = useResendVerificationEmail()

  const setAction = (newAction: typeof action) => {
    navigate({
      to: '/signin',
      search: {
        action: newAction,
        ...(email ? { email } : {}),
      },
    })
  }

  React.useEffect(() => {
    if (emailFromSearch) {
      setEmail(emailFromSearch)
    }
  }, [emailFromSearch])

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) value = value.slice(-1)
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    setOtpError('')

    if (value !== '' && index < 5) {
      otpInputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      otpInputRefs.current[index - 1]?.focus()
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    await login({ email, password })
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const success = await requestReset(email)
    if (success) setAction('check-email')
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.some((digit) => digit === '')) {
      setOtpError('Enter the full 6-digit verification code.')
      return
    }
    setOtpError('')
    setAction('reset-password')
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.')
      return
    }
    setPasswordError('')

    const otpCode = otp.join('')
    const success = await resetPassword(email, otpCode, newPassword)
    if (success) setAction(undefined)
  }

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    await resendEmail(email)
  }

  const handleResendResetCode = async () => {
    await requestReset(email)
  }

  switch (action) {
    case 'forgot-password':
      return (
        <AuthShell
          title="Forgot your password?"
          subtitle="Enter the email address associated with your account and we'll send you a verification code to reset your password."
          topRightText="Remember your password?"
          topRightLinkText="Sign In"
          topRightLinkTo="/signin"
        >
          <form className="space-y-6" onSubmit={handleForgotPassword}>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-700 dark:text-zinc-300">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-zinc-200 dark:border-zinc-800"
                required
              />
            </div>
            <div className="pt-2">
              <Button type="submit" className="w-full py-6 text-base font-semibold rounded-xl" isLoading={resetRequestLoading}>
                Send verification code
              </Button>
            </div>
          </form>
        </AuthShell>
      )

    case 'check-email':
      return (
        <AuthShell
          title="Check your email"
          subtitle="We've sent a verification code to your email address. Enter it below to continue."
          topRightText="Remember your password?"
          topRightLinkText="Sign In"
          topRightLinkTo="/signin"
        >
          <form className="space-y-6" onSubmit={handleVerifyOtp}>
            <div className="flex max-w-[360px] mx-auto items-center justify-between py-4">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(element) => {
                    otpInputRefs.current[index] = element
                  }}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, index)}
                  onKeyDown={(e) => handleOtpKeyDown(e, index)}
                  className="h-14 w-12 rounded-xl border border-zinc-200 bg-transparent text-center text-xl font-bold outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-zinc-800"
                  required
                />
              ))}
            </div>
            {otpError && (
              <p className="text-center text-xs text-red-600">{otpError}</p>
            )}
            <div className="space-y-4 pt-2 text-center">
              <Button type="submit" className="w-full rounded-xl py-6 text-base font-semibold">
                Verify code
              </Button>
              <button
                type="button"
                onClick={handleResendResetCode}
                className="text-xs font-semibold text-zinc-500 underline underline-offset-4 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                Resend verification code?
              </button>
            </div>
          </form>
        </AuthShell>
      )

    case 'reset-password':
      return (
        <AuthShell
          title="Create a new password"
          subtitle="Choose a strong password to secure your account."
          topRightText="Remember your password?"
          topRightLinkText="Sign In"
          topRightLinkTo="/signin"
        >
          <form className="space-y-6" onSubmit={handleResetPassword}>
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-zinc-700 dark:text-zinc-300">New Password</Label>
              <PasswordInput
                id="newPassword"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value)
                  setPasswordError('')
                }}
                className="border-zinc-200 dark:border-zinc-800"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-zinc-700 dark:text-zinc-300">Confirm New Password</Label>
              <PasswordInput
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  setPasswordError('')
                }}
                className="border-zinc-200 dark:border-zinc-800"
                required
              />
            </div>
            {passwordError && (
              <p className="text-xs text-red-600">{passwordError}</p>
            )}
            <div className="pt-2">
              <Button type="submit" className="w-full py-6 text-base font-semibold rounded-xl" isLoading={resetLoading}>
                Reset password
              </Button>
            </div>
          </form>
        </AuthShell>
      )

    case 'verify-email':
      return (
        <AuthShell
          title="Verify your email address"
          subtitle="We've sent a verification link to your email. Click the link in your inbox to activate your account and continue."
          bannerText="Didn't receive the email? Check your spam folder or request another verification email."
          topRightText="Remember your password?"
          topRightLinkText="Sign In"
          topRightLinkTo="/signin"
        >
          <form className="space-y-6" onSubmit={handleResendVerification}>
            <div className="space-y-4 pt-4 text-center">
              <Button type="submit" className="w-full py-6 text-base font-semibold rounded-xl" isLoading={resendLoading}>
                Resend verification email
              </Button>
              <div>
                <Link
                  to="/signin"
                  className="text-xs font-semibold text-zinc-500 underline underline-offset-4 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
                >
                  I've verified my email.
                </Link>
              </div>
            </div>
          </form>
        </AuthShell>
      )

    default:
      return (
        <AuthShell
          title="Welcome back to Stackd!"
          subtitle="Sign in to access your account and continue where you left off."
          topRightText="Don't have an account?"
          topRightLinkText="Sign Up"
          topRightLinkTo="/register"
        >
          <form className="space-y-5" onSubmit={handleLogin}>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-700 dark:text-zinc-300">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-zinc-200 dark:border-zinc-800"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-zinc-700 dark:text-zinc-300">Password</Label>
                <button
                  type="button"
                  onClick={() => setAction('forgot-password')}
                  className="text-xs font-semibold text-zinc-500 underline underline-offset-4 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
                >
                  Forgot password?
                </button>
              </div>
              <PasswordInput
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-zinc-200 dark:border-zinc-800"
                required
              />
            </div>
            <div className="pt-4">
              <Button type="submit" className="w-full py-6 text-base font-semibold rounded-xl" isLoading={loginLoading}>
                Sign In
              </Button>
            </div>
          </form>
        </AuthShell>
      )
  }
}
