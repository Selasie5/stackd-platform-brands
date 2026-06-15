import { gql } from '@apollo/client'

export const MY_KYC_APPLICATION_QUERY = gql`
  query MyKycApplication {
    myKycApplication {
      id
      status
      attemptNumber
      profileType
      applicantNote
      adminNote
      rejectionReason
      submittedAt
      reviewedAt
      documents {
        documentType
        fileUrl
        fileName
        note
      }
    }
  }
`

export const SUBMIT_KYC_MUTATION = gql`
  mutation SubmitKyc($input: SubmitKycInput!) {
    submitKyc(input: $input) {
      id
      attemptNumber
      status
      rejectionReason
      submittedAt
      documents {
        documentType
        fileUrl
        fileName
        note
      }
    }
  }
`
