import { gql } from '@apollo/client'

export const CONTEST_SUBMISSIONS_QUERY = gql`
  query ContestSubmissions($contestId: ID!) {
    contestSubmissions(contestId: $contestId) {
      id
      contestId
      creatorId
      videoUrl
      videoLink
      thumbnailUrl
      watermarkedPreviewUrl
      cleanVideoUrl
      submissionNote
      postingRequired
      postedVideoLink
      platform
      submittedViews
      approvedViews
      engagementCount
      leaderboardScore
      placement
      rewardAmount
      status
      shortlistedAt
      winnerSelectedAt
      createdAt
      updatedAt
    }
  }
`

export const SHORTLIST_CONTEST_SUBMISSION_MUTATION = gql`
  mutation ShortlistContestSubmission($submissionId: ID!) {
    shortlistContestSubmission(submissionId: $submissionId) {
      id
      status
      shortlistedAt
    }
  }
`

export const SELECT_CONTEST_WINNERS_MUTATION = gql`
  mutation SelectContestWinners($input: SelectContestWinnersInput!) {
    selectContestWinners(input: $input) {
      id
      status
      placement
      rewardAmount
      winnerSelectedAt
    }
  }
`
