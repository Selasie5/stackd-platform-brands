import type { ContestSubmission } from '@/hooks/use-contest-board'

export const MOCK_CREATOR = {
  id: 'creator-uuid-1',
  name: 'Alex Johnson',
  avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=96&h=96&fit=crop&crop=face',
  school: 'University of Southern California',
  profileLink: 'https://spleenet.io/creators/alex-johnson',
  sampleVideosLink: 'https://spleenet.io/creators/alex-johnson/samples',
}

export const MOCK_SUBMISSION: ContestSubmission & {
  confirmedFollowsBrief: boolean
  confirmedOriginal: boolean
  confirmedNoFakeEngagement: boolean
  agreedToUsageRights: boolean
} = {
  id: 'submission-uuid-1',
  contestId: 'contest-uuid-1',
  creatorId: 'creator-uuid-1',
  videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  videoLink: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  thumbnailUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=225&fit=crop',
  watermarkedPreviewUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  cleanVideoUrl: null,
  submissionNote: 'I created this video following the brief closely. The lighting and energy match what was requested.',
  postingRequired: true,
  postedVideoLink: 'https://www.tiktok.com/@creator/video/123456789',
  platform: 'tiktok',
  submittedViews: 15420,
  approvedViews: null,
  engagementCount: 892,
  leaderboardScore: 78,
  placement: null,
  rewardAmount: null,
  status: 'submitted',
  shortlistedAt: null,
  winnerSelectedAt: null,
  createdAt: '2026-06-15T10:30:00.000Z',
  updatedAt: '2026-06-15T10:30:00.000Z',
  confirmedFollowsBrief: true,
  confirmedOriginal: true,
  confirmedNoFakeEngagement: true,
  agreedToUsageRights: true,
}

export const MOCK_REVISION_HISTORY = [
  {
    round: 1,
    versionLabel: 'Initial submission',
    status: 'submitted' as const,
    submittedAt: '2026-06-10T08:00:00.000Z',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  },
  {
    round: 1,
    versionLabel: 'Revision requested',
    status: 'revision_requested' as const,
    note: 'Please adjust the lighting and include the product shot in the first 3 seconds as specified in the brief.',
    submittedAt: '2026-06-12T14:00:00.000Z',
  },
  {
    round: 2,
    versionLabel: 'Resubmission',
    status: 'resubmitted' as const,
    submittedAt: '2026-06-14T09:00:00.000Z',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    note: 'Adjusted lighting and moved product shot to the beginning as requested.',
  },
]

export function mockSubmissionForStatus(status: ContestSubmission['status']): ContestSubmission & {
  confirmedFollowsBrief: boolean
  confirmedOriginal: boolean
  confirmedNoFakeEngagement: boolean
  agreedToUsageRights: boolean
} {
  const revisionNote = status === 'revision_requested'
    ? 'Please include the product placement within the first 5 seconds as outlined in the creative brief.'
    : undefined

  return {
    ...MOCK_SUBMISSION,
    status,
    cleanVideoUrl: status === 'approved' ? MOCK_SUBMISSION.videoUrl : null,
    shortlistedAt: status === 'shortlisted' || status === 'winner' ? '2026-06-16T12:00:00.000Z' : null,
    winnerSelectedAt: status === 'winner' ? '2026-06-18T10:00:00.000Z' : null,
    placement: status === 'winner' ? 1 : null,
    rewardAmount: status === 'winner' ? '500.00' : null,
    submissionNote: revisionNote,
  }
}
