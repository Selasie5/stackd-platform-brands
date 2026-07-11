import { useMutation, useQuery } from '@apollo/client/react'
import { toast } from 'sonner'
import {
  CONTEST_SUBMISSIONS_QUERY,
  SHORTLIST_CONTEST_SUBMISSION_MUTATION,
  SELECT_CONTEST_WINNERS_MUTATION,
} from '@/graphql/contest-board'
import { extractGqlError } from '@/lib/gql-error'

export type SubmissionStatus =
  | 'submitted'
  | 'under_review'
  | 'shortlisted'
  | 'revision_requested'
  | 'resubmitted'
  | 'winner'
  | 'approved'
  | 'rejected'
  | 'disqualified'
  | 'paid'

export type TargetPlatform = 'tiktok' | 'instagram' | 'youtube_shorts' | 'any'

export interface ContestSubmission {
  id: string
  contestId: string
  creatorId: string
  videoUrl?: string | null
  videoLink?: string | null
  thumbnailUrl?: string | null
  watermarkedPreviewUrl?: string | null
  cleanVideoUrl?: string | null
  submissionNote?: string | null
  postingRequired: boolean
  postedVideoLink?: string | null
  platform?: TargetPlatform | null
  submittedViews: number
  approvedViews?: number | null
  engagementCount: number
  leaderboardScore: number
  placement?: number | null
  rewardAmount?: string | null
  status: SubmissionStatus
  shortlistedAt?: string | null
  winnerSelectedAt?: string | null
  createdAt: string
  updatedAt: string
}

export function useContestSubmissions(contestId: string | undefined) {
  return useQuery<{ contestSubmissions: ContestSubmission[] }>(CONTEST_SUBMISSIONS_QUERY, {
    variables: contestId ? { contestId } : undefined,
    skip: !contestId,
  })
}

export function useShortlistContestSubmission() {
  const [mutation, { loading }] = useMutation<
    { shortlistContestSubmission: { id: string; status: SubmissionStatus; shortlistedAt: string | null } },
    { submissionId: string }
  >(SHORTLIST_CONTEST_SUBMISSION_MUTATION)

  const shortlist = async (submissionId: string) => {
    try {
      const { data } = await mutation({ variables: { submissionId } })
      if (data?.shortlistContestSubmission) {
        toast.success('Submission shortlisted.')
        return data.shortlistContestSubmission
      }
    } catch (err) {
      toast.error(extractGqlError(err))
    }
    return null
  }

  return { shortlist, loading }
}

export function useSelectContestWinners() {
  const [mutation, { loading }] = useMutation<
    { selectContestWinners: Array<{ id: string; status: SubmissionStatus; placement: number | null; rewardAmount: string | null; winnerSelectedAt: string | null }> },
    { input: { contestId: string; winners: Array<{ submissionId: string; placement: number }> } }
  >(SELECT_CONTEST_WINNERS_MUTATION)

  const selectWinners = async (contestId: string, winners: Array<{ submissionId: string; placement: number }>) => {
    try {
      const { data } = await mutation({ variables: { input: { contestId, winners } } })
      if (data?.selectContestWinners) {
        toast.success(`Selected ${winners.length} winner${winners.length !== 1 ? 's' : ''}.`)
        return data.selectContestWinners
      }
    } catch (err) {
      toast.error(extractGqlError(err))
    }
    return null
  }

  return { selectWinners, loading }
}
