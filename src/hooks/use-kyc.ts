import { useMutation, useQuery } from '@apollo/client/react'
import { toast } from 'sonner'
import { ME_QUERY } from '@/graphql/auth'
import { MY_KYC_APPLICATION_QUERY, SUBMIT_KYC_MUTATION } from '@/graphql/kyc'

export interface KycDocument {
  documentType: string
  fileUrl: string
  fileName?: string | null
  note?: string | null
}

export interface KycApplication {
  id: string
  status: string
  attemptNumber: number
  profileType: string
  applicantNote?: string | null
  adminNote?: string | null
  rejectionReason?: string | null
  submittedAt: string
  reviewedAt?: string | null
  documents: KycDocument[]
}

export interface SubmitKycDocumentInput {
  documentType: string
  fileUrl: string
  fileName?: string
  note?: string
}

export interface SubmitKycInput {
  documents: SubmitKycDocumentInput[]
  applicantNote?: string
}

export function useMyKycApplication() {
  return useQuery<{ myKycApplication: KycApplication | null }>(MY_KYC_APPLICATION_QUERY, {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'ignore',
  })
}

export function useSubmitKyc() {
  const [submitMutation, { loading }] = useMutation<
    { submitKyc: KycApplication },
    { input: SubmitKycInput }
  >(SUBMIT_KYC_MUTATION, {
    refetchQueries: [{ query: ME_QUERY }, { query: MY_KYC_APPLICATION_QUERY }],
  })

  const submitKyc = async (input: SubmitKycInput) => {
    try {
      const { data } = await submitMutation({ variables: { input } })
      if (data?.submitKyc) {
        toast.success('KYC documents submitted successfully.')
        return data.submitKyc
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit KYC documents.'
      toast.error(message)
    }
    return null
  }

  return { submitKyc, loading }
}
