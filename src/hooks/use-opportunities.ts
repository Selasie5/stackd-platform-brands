import { useMutation, useQuery } from '@apollo/client/react'
import { toast } from 'sonner'
import {
  CONTEST_QUERY,
  CPM_DEAL_QUERY,
  CLOSE_OPPORTUNITY_MUTATION,
  COMPLETE_OPPORTUNITY_MUTATION,
  CREATE_CONTEST_MUTATION,
  CREATE_CPM_DEAL_MUTATION,
  CREATE_UGC_ORDER_MUTATION,
  MY_CONTESTS_QUERY,
  MY_CPM_DEALS_QUERY,
  MY_UGC_ORDERS_QUERY,
  PAUSE_OPPORTUNITY_MUTATION,
  RESUME_OPPORTUNITY_MUTATION,
  SUBMIT_OPPORTUNITY_FOR_APPROVAL_MUTATION,
  UGC_ORDER_QUERY,
  UPDATE_CONTEST_MUTATION,
  UPDATE_CPM_DEAL_MUTATION,
  UPDATE_UGC_ORDER_MUTATION,
} from '@/graphql/opportunities'
import { MY_BRAND_WALLET_QUERY } from '@/graphql/wallet'
import { extractGqlError } from '@/lib/gql-error'

export type OpportunityStatus =
  | 'draft'
  | 'pending_approval'
  | 'live'
  | 'paused'
  | 'closed'
  | 'cancelled'
  | 'completed'

export type OpportunityType = 'UGC_ORDER' | 'CPM_DEAL' | 'CONTEST'
export type CampaignDisplayType = 'UGC' | 'CPM' | 'Contest'

type OpportunityTransitionResult = { id: string; status: OpportunityStatus }

export function toOpportunityType(type: CampaignDisplayType): OpportunityType {
  if (type === 'UGC') return 'UGC_ORDER'
  if (type === 'CPM') return 'CPM_DEAL'
  return 'CONTEST'
}

export interface OpportunitySummary {
  id: string
  title: string
  productName: string
  shortDescription: string
  status: OpportunityStatus
  currency: string
  createdAt: string
  updatedAt: string
}

export interface UgcOrderSummary extends OpportunitySummary {
  totalBudget: string
  deadline: string
  numberOfCreators: number
  flatRatePerCreator: string
}

export interface CpmDealSummary extends OpportunitySummary {
  maxCampaignBudget: string
  postingDeadline: string
  finalViewCountDeadline: string
  numberOfCreators: number
}

export interface ContestSummary extends OpportunitySummary {
  totalContestBudget: string
  submissionDeadline: string
  winnerAnnouncementDate: string
  minimumWinners: number
}

export interface OpportunityReferenceLink {
  url: string
  label?: string | null
  isInspiration?: boolean | null
}

export interface OpportunityReward {
  placement: number
  label?: string | null
  amount: string
  currency: string
}

export interface UgcOrderDetail extends UgcOrderSummary {
  fullDescription?: string | null
  externalBriefLink?: string | null
  videoType?: string | null
  videoLengthSeconds?: number | null
  wordsToSay?: string | null
  wordsToAvoid?: string | null
  callToAction?: string | null
  requiredShots?: string | null
  revisionLimit?: number | null
  postingRequired?: boolean | null
  targetPlatform?: string | null
  productDeliveryDetails?: string | null
  usageRightsPackage?: string | null
  referenceLinks?: OpportunityReferenceLink[] | null
}

export interface CpmDealDetail extends CpmDealSummary {
  fullDescription?: string | null
  externalBriefLink?: string | null
  targetPlatform?: string | null
  requiredHashtags?: string | null
  requiredCaption?: string | null
  requiredBrandTag?: string | null
  payPer1000Views?: number | null
  maxPayableViewsPerCreator?: number | null
  productDeliveryDetails?: string | null
  usageRightsPackage?: string | null
  referenceLinks?: OpportunityReferenceLink[] | null
}

export interface ContestDetail extends ContestSummary {
  fullDescription?: string | null
  externalBriefLink?: string | null
  category?: string | null
  videoType?: string | null
  videoLengthSeconds?: number | null
  targetPlatform?: string | null
  requiredHashtags?: string | null
  requiredCaption?: string | null
  requiredBrandTag?: string | null
  postingRequired?: boolean | null
  contestRules?: string | null
  eligibilityRules?: string | null
  usageRightsPackage?: string | null
  productDeliveryDetails?: string | null
  cpmBudget?: string | null
  payPer1000Views?: number | null
  maxPayableViewsPerCreator?: number | null
  referenceLinks?: OpportunityReferenceLink[] | null
  rewards?: OpportunityReward[] | null
}

const opportunityListRefetchQueries = [
  { query: MY_UGC_ORDERS_QUERY },
  { query: MY_CPM_DEALS_QUERY },
  { query: MY_CONTESTS_QUERY },
  { query: MY_BRAND_WALLET_QUERY },
]

export function useMyUgcOrders(status?: OpportunityStatus) {
  return useQuery<{ myUgcOrders: UgcOrderSummary[] }>(MY_UGC_ORDERS_QUERY, {
    variables: status ? { status } : undefined,
    errorPolicy: 'ignore',
  })
}

export function useMyCpmDeals(status?: OpportunityStatus) {
  return useQuery<{ myCpmDeals: CpmDealSummary[] }>(MY_CPM_DEALS_QUERY, {
    variables: status ? { status } : undefined,
    errorPolicy: 'ignore',
  })
}

export function useMyContests(status?: OpportunityStatus) {
  return useQuery<{ myContests: ContestSummary[] }>(MY_CONTESTS_QUERY, {
    variables: status ? { status } : undefined,
    errorPolicy: 'ignore',
  })
}

export function useUgcOrder(id?: string) {
  return useQuery<{ ugcOrder: UgcOrderDetail }>(UGC_ORDER_QUERY, {
    variables: id ? { id } : undefined,
    skip: !id,
    errorPolicy: 'ignore',
  })
}

export function useCpmDeal(id?: string) {
  return useQuery<{ cpmDeal: CpmDealDetail }>(CPM_DEAL_QUERY, {
    variables: id ? { id } : undefined,
    skip: !id,
    errorPolicy: 'ignore',
  })
}

export function useContest(id?: string) {
  return useQuery<{ contest: ContestDetail }>(CONTEST_QUERY, {
    variables: id ? { id } : undefined,
    skip: !id,
    errorPolicy: 'ignore',
  })
}

export function useCreateUgcOrder() {
  const [createMutation, { loading: creating }] = useMutation<
    { createUgcOrder: UgcOrderSummary },
    { input: Record<string, unknown> }
  >(CREATE_UGC_ORDER_MUTATION, { refetchQueries: opportunityListRefetchQueries })

  const [updateMutation, { loading: updating }] = useMutation<
    { updateUgcOrder: UgcOrderSummary },
    { id: string; input: Record<string, unknown> }
  >(UPDATE_UGC_ORDER_MUTATION, { refetchQueries: opportunityListRefetchQueries })

  const saveUgcOrder = async (input: Record<string, unknown>, existingId?: string) => {
    try {
      if (existingId) {
        const { data } = await updateMutation({ variables: { id: existingId, input } })
        return data?.updateUgcOrder ?? null
      }
      const { data } = await createMutation({ variables: { input } })
      return data?.createUgcOrder ?? null
    } catch (err) {
      toast.error(extractGqlError(err))
      return null
    }
  }

  return { saveUgcOrder, loading: creating || updating }
}

export function useCreateCpmDeal() {
  const [createMutation, { loading: creating }] = useMutation<
    { createCpmDeal: CpmDealSummary },
    { input: Record<string, unknown> }
  >(CREATE_CPM_DEAL_MUTATION, { refetchQueries: opportunityListRefetchQueries })

  const [updateMutation, { loading: updating }] = useMutation<
    { updateCpmDeal: CpmDealSummary },
    { id: string; input: Record<string, unknown> }
  >(UPDATE_CPM_DEAL_MUTATION, { refetchQueries: opportunityListRefetchQueries })

  const saveCpmDeal = async (input: Record<string, unknown>, existingId?: string) => {
    try {
      if (existingId) {
        const { data } = await updateMutation({ variables: { id: existingId, input } })
        return data?.updateCpmDeal ?? null
      }
      const { data } = await createMutation({ variables: { input } })
      return data?.createCpmDeal ?? null
    } catch (err) {
      toast.error(extractGqlError(err))
      return null
    }
  }

  return { saveCpmDeal, loading: creating || updating }
}

export function useCreateContest() {
  const [createMutation, { loading: creating }] = useMutation<
    { createContest: ContestSummary },
    { input: Record<string, unknown> }
  >(CREATE_CONTEST_MUTATION, { refetchQueries: opportunityListRefetchQueries })

  const [updateMutation, { loading: updating }] = useMutation<
    { updateContest: ContestSummary },
    { id: string; input: Record<string, unknown> }
  >(UPDATE_CONTEST_MUTATION, { refetchQueries: opportunityListRefetchQueries })

  const saveContest = async (input: Record<string, unknown>, existingId?: string) => {
    try {
      if (existingId) {
        const { data } = await updateMutation({ variables: { id: existingId, input } })
        return data?.updateContest ?? null
      }
      const { data } = await createMutation({ variables: { input } })
      return data?.createContest ?? null
    } catch (err) {
      toast.error(extractGqlError(err))
      return null
    }
  }

  return { saveContest, loading: creating || updating }
}

export function useSubmitOpportunityForApproval() {
  const [submitMutation, { loading }] = useMutation<
    { submitOpportunityForApproval: OpportunityTransitionResult },
    { type: OpportunityType; id: string }
  >(SUBMIT_OPPORTUNITY_FOR_APPROVAL_MUTATION, {
    refetchQueries: opportunityListRefetchQueries,
  })

  const submitForApproval = async (type: OpportunityType, id: string) => {
    try {
      const { data } = await submitMutation({ variables: { type, id } })
      if (data?.submitOpportunityForApproval) {
        toast.success('Campaign submitted for approval.')
        return data.submitOpportunityForApproval
      }
    } catch (err) {
      toast.error(extractGqlError(err))
    }
    return null
  }

  return { submitForApproval, loading }
}

export function useOpportunityTransitions() {
  const [pauseMutation, { loading: pausing }] = useMutation<
    { pauseOpportunity: OpportunityTransitionResult },
    { type: OpportunityType; id: string }
  >(PAUSE_OPPORTUNITY_MUTATION, {
    refetchQueries: opportunityListRefetchQueries,
  })

  const [resumeMutation, { loading: resuming }] = useMutation<
    { resumeOpportunity: OpportunityTransitionResult },
    { type: OpportunityType; id: string }
  >(RESUME_OPPORTUNITY_MUTATION, {
    refetchQueries: opportunityListRefetchQueries,
  })

  const [closeMutation, { loading: closing }] = useMutation<
    { closeOpportunity: OpportunityTransitionResult },
    { type: OpportunityType; id: string }
  >(CLOSE_OPPORTUNITY_MUTATION, {
    refetchQueries: opportunityListRefetchQueries,
  })

  const pauseOpportunity = async (type: OpportunityType, id: string) => {
    try {
      const { data } = await pauseMutation({ variables: { type, id } })
      if (data?.pauseOpportunity) {
        toast.success('Campaign paused.')
        return data.pauseOpportunity
      }
    } catch (err) {
      toast.error(extractGqlError(err))
    }
    return null
  }

  const resumeOpportunity = async (type: OpportunityType, id: string) => {
    try {
      const { data } = await resumeMutation({ variables: { type, id } })
      if (data?.resumeOpportunity) {
        toast.success('Campaign resumed.')
        return data.resumeOpportunity
      }
    } catch (err) {
      toast.error(extractGqlError(err))
    }
    return null
  }

  const closeOpportunity = async (type: OpportunityType, id: string) => {
    try {
      const { data } = await closeMutation({ variables: { type, id } })
      if (data?.closeOpportunity) {
        toast.success('Campaign closed.')
        return data.closeOpportunity
      }
    } catch (err) {
      toast.error(extractGqlError(err))
    }
    return null
  }

  return {
    pauseOpportunity,
    resumeOpportunity,
    closeOpportunity,
    loading: pausing || resuming || closing,
  }
}
