import { useMutation, useQuery } from '@apollo/client/react'
import { toast } from 'sonner'
import {
  CREATE_CONTEST_MUTATION,
  CREATE_CPM_DEAL_MUTATION,
  CREATE_UGC_ORDER_MUTATION,
  MY_CONTESTS_QUERY,
  MY_CPM_DEALS_QUERY,
  MY_UGC_ORDERS_QUERY,
  SUBMIT_OPPORTUNITY_FOR_APPROVAL_MUTATION,
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

const opportunityListRefetchQueries = [
  { query: MY_UGC_ORDERS_QUERY },
  { query: MY_CPM_DEALS_QUERY },
  { query: MY_CONTESTS_QUERY },
  { query: MY_BRAND_WALLET_QUERY },
]

export function useMyUgcOrders(status?: OpportunityStatus) {
  return useQuery<{ myUgcOrders: UgcOrderSummary[] }>(MY_UGC_ORDERS_QUERY, {
    variables: status ? { status } : undefined,
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'ignore',
  })
}

export function useMyCpmDeals(status?: OpportunityStatus) {
  return useQuery<{ myCpmDeals: CpmDealSummary[] }>(MY_CPM_DEALS_QUERY, {
    variables: status ? { status } : undefined,
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'ignore',
  })
}

export function useMyContests(status?: OpportunityStatus) {
  return useQuery<{ myContests: ContestSummary[] }>(MY_CONTESTS_QUERY, {
    variables: status ? { status } : undefined,
    fetchPolicy: 'cache-and-network',
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
    { submitOpportunityForApproval: { id: string; status: OpportunityStatus } },
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
