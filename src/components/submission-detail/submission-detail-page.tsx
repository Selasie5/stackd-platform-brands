import { useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { ChevronLeft, Eye, MessageSquare, Globe, Trophy, Video, Users, Camera, Music2 } from 'lucide-react'
import { useMyContests } from '@/hooks/use-opportunities'
import { useContestSubmissions } from '@/hooks/use-contest-board'
import { cn } from '@/lib/utils'
import { LoadingView } from '@/components/ui/view-state'
import { format } from 'date-fns'

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  submitted: { label: 'Submitted', className: 'bg-blue-50 text-blue-700 ring-blue-200' },
  under_review: { label: 'Under review', className: 'bg-amber-50 text-amber-700 ring-amber-200' },
  shortlisted: { label: 'Shortlisted', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  revision_requested: { label: 'Revision requested', className: 'bg-purple-50 text-purple-700 ring-purple-200' },
  resubmitted: { label: 'Resubmitted', className: 'bg-indigo-50 text-indigo-700 ring-indigo-200' },
  winner: { label: 'Winner', className: 'bg-amber-50 text-amber-700 ring-amber-200' },
  approved: { label: 'Approved', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  rejected: { label: 'Rejected', className: 'bg-red-50 text-red-700 ring-red-200' },
  disqualified: { label: 'Disqualified', className: 'bg-zinc-100 text-zinc-500 ring-zinc-200' },
  paid: { label: 'Paid', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
}

export function SubmissionDetailPage({ submissionId }: { submissionId: string }) {
  const { data: contestsData } = useMyContests()
  const liveContests = contestsData?.myContests ?? []

  const firstContestId = liveContests[0]?.id
  const { data: submissionsData, loading } = useContestSubmissions(firstContestId)

  const submission = useMemo(() => {
    if (!submissionsData?.contestSubmissions) return null
    return submissionsData.contestSubmissions.find((s) => s.id === submissionId) ?? null
  }, [submissionsData, submissionId])

  if (loading && !submission) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <LoadingView label="Loading submission…" tone="primary" />
      </div>
    )
  }

  if (!submission) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <Link
          to="/dashboard/submissions"
          className="inline-flex w-fit items-center gap-1 rounded-full bg-zinc-100 px-3 py-1.5 text-[11px] font-semibold text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-900"
        >
          <ChevronLeft className="h-3 w-3" />
          Back to submissions
        </Link>
        <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-200 bg-white p-12">
          <Video className="mb-3 h-8 w-8 text-zinc-300" />
          <p className="text-sm font-medium text-zinc-900">Submission not found</p>
          <p className="mt-1 text-xs text-zinc-500">This submission could not be loaded.</p>
        </div>
      </div>
    )
  }

  const statusBadge = STATUS_BADGES[submission.status] ?? {
    label: submission.status.replace(/_/g, ' '),
    className: 'bg-zinc-50 text-zinc-600 ring-zinc-200',
  }

  const formatNumber = (n: number) => n.toLocaleString()

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <Link
        to="/dashboard/submissions"
        className="inline-flex w-fit items-center gap-1 rounded-full bg-zinc-100 px-3 py-1.5 text-[11px] font-semibold text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-900"
      >
        <ChevronLeft className="h-3 w-3" />
        Back to submissions
      </Link>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900">Submission Detail</h2>
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset',
              statusBadge.className
            )}
          >
            {statusBadge.label}
          </span>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="min-w-0 flex-1 space-y-5">
            {submission.watermarkedPreviewUrl ? (
              <video
                key={submission.id}
                src={submission.watermarkedPreviewUrl}
                controls
                className="w-full rounded-lg"
              />
            ) : (
              <div className="flex aspect-video items-center justify-center rounded-lg bg-zinc-100">
                <Video className="h-8 w-8 text-zinc-400" />
              </div>
            )}

            {submission.submissionNote && (
              <p className="text-sm leading-relaxed text-zinc-600 italic">
                &ldquo;{submission.submissionNote}&rdquo;
              </p>
            )}

            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Eye, label: 'Views', value: formatNumber(submission.submittedViews) },
                { icon: MessageSquare, label: 'Engagement', value: formatNumber(submission.engagementCount) },
                { icon: Trophy, label: 'Score', value: String(submission.leaderboardScore) },
              ].map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="rounded-lg border border-zinc-200 bg-white p-3 text-center shadow-sm"
                >
                  <div className="flex items-center justify-center gap-1 text-xs text-zinc-500">
                    <Icon className="h-3 w-3" /> {label}
                  </div>
                  <p className="mt-0.5 text-lg font-semibold text-zinc-900">{value}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-600">
              <Globe className="h-3.5 w-3.5" />
              {submission.platform
                ? (submission.platform.charAt(0).toUpperCase() + submission.platform.slice(1))
                : 'Unknown platform'}
              {submission.postedVideoLink && (
                <>
                  <span className="text-zinc-300">&middot;</span>
                  <a
                    href={submission.postedVideoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-zinc-900"
                  >
                    View post
                  </a>
                </>
              )}
            </div>

            <div className="border-t border-zinc-100 pt-4">
              <p className="mb-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Submission Info</p>
              <p className="text-xs text-zinc-500">
                Submitted {format(new Date(submission.createdAt), 'MMM d, yyyy h:mm a')}
              </p>
            </div>
          </div>

          <aside className="w-full shrink-0 space-y-4 lg:w-72">
            {submission.creator && (
              <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">Creator</h3>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-zinc-100">
                    {submission.creator.profileImage ? (
                      <img src={submission.creator.profileImage} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm font-medium text-zinc-500">
                        {submission.creator.fullName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-900">{submission.creator.fullName}</p>
                    {submission.creator.school && (
                      <p className="truncate text-xs text-zinc-500">{submission.creator.school}</p>
                    )}
                  </div>
                </div>
                {(submission.creator.youtubeSubscriberCount != null || submission.creator.instagramFollowerCount != null || submission.creator.tiktokFollowerCount != null) && (
                  <div className="mt-3 space-y-1">
                    {submission.creator.youtubeSubscriberCount != null && (
                      <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                        <Users className="h-3.5 w-3.5" />
                        <span>{submission.creator.youtubeSubscriberCount.toLocaleString()} YouTube</span>
                      </div>
                    )}
                    {submission.creator.instagramFollowerCount != null && (
                      <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                        <Camera className="h-3.5 w-3.5" />
                        <span>{submission.creator.instagramFollowerCount.toLocaleString()} Instagram</span>
                      </div>
                    )}
                    {submission.creator.tiktokFollowerCount != null && (
                      <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                        <Music2 className="h-3.5 w-3.5" />
                        <span>{submission.creator.tiktokFollowerCount.toLocaleString()} TikTok</span>
                      </div>
                    )}
                  </div>
                )}
                {(submission.autoFetchedViews != null || submission.autoFetchedLikes != null) && (
                  <div className="mt-3 space-y-1 border-t border-zinc-100 pt-3">
                    <p className="text-[11px] font-medium text-zinc-400">Auto-Verified Stats</p>
                    {submission.autoFetchedViews != null && (
                      <p className="text-xs text-zinc-600">Views: {submission.autoFetchedViews.toLocaleString()}</p>
                    )}
                    {submission.autoFetchedLikes != null && (
                      <p className="text-xs text-zinc-600">Likes: {submission.autoFetchedLikes.toLocaleString()}</p>
                    )}
                    {submission.autoFetchedComments != null && (
                      <p className="text-xs text-zinc-600">Comments: {submission.autoFetchedComments.toLocaleString()}</p>
                    )}
                  </div>
                )}
              </div>
            )}
            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-zinc-900">Actions</h3>
              <p className="mt-2 text-xs text-zinc-500">
                Submission actions will be available here.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
