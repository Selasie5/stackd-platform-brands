import { gql } from '@apollo/client'


export const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      role
      status
      emailVerified
      brand {
        id
        brandName
        kycStatus
      }
    }
  }
`


export const REGISTER_BRAND_MUTATION = gql`
  mutation RegisterBrand($input: RegisterBrandInput!) {
    registerBrand(input: $input) {
      message
      user {
        id
        email
        role
        status
        emailVerified
      }
    }
  }
`

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      user {
        id
        email
        role
        status
        emailVerified
        brand {
          id
          brandName
          kycStatus
        }
      }
    }
  }
`

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`

export const VERIFY_EMAIL_MUTATION = gql`
  mutation VerifyEmail($token: String!) {
    verifyEmail(token: $token) {
      user {
        id
        email
        role
        status
        emailVerified
      }
    }
  }
`

export const RESEND_VERIFICATION_EMAIL_MUTATION = gql`
  mutation ResendVerificationEmail($email: String!) {
    resendVerificationEmail(email: $email)
  }
`

export const REQUEST_PASSWORD_RESET_MUTATION = gql`
  mutation RequestPasswordReset($email: String!) {
    requestPasswordReset(email: $email)
  }
`

export const RESET_PASSWORD_MUTATION = gql`
  mutation ResetPassword($email: String!, $otp: String!, $newPassword: String!) {
    resetPassword(email: $email, otp: $otp, newPassword: $newPassword)
  }
`
