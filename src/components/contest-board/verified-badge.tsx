import { Tooltip } from '@/components/ui/tooltip'

export function VerifiedBadge({
  approvedViews,
}: {
  approvedViews?: number | null
  submittedViews: number
}) {
  const isVerified = approvedViews != null

  if (isVerified) {
    return (
      <Tooltip content={`View count verified: ${approvedViews} approved views`}>
        <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
          <svg
            viewBox="0 0 16 16"
            fill="currentColor"
            className="h-3 w-3 shrink-0"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16Zm3.707-9.793a1 1 0 0 0-1.414-1.414L7 8.586 5.707 7.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4Z"
              clipRule="evenodd"
            />
          </svg>
          <span>Verified</span>
        </span>
      </Tooltip>
    )
  }

  return (
    <Tooltip content="View count has not yet been verified by our team. These numbers may be updated once an admin reviews the submission.">
      <span className="inline-flex items-center gap-1 text-xs text-amber-600">
        <svg
          viewBox="0 0 16 16"
          fill="currentColor"
          className="h-3 w-3 shrink-0"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16ZM8 4a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
            clipRule="evenodd"
          />
        </svg>
        <span>Unverified</span>
      </span>
    </Tooltip>
  )
}
