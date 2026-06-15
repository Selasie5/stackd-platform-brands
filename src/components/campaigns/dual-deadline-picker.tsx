import { useMemo } from 'react'
import { combineDateTime } from '@/components/campaigns/campaign-constants'
import { DatePicker } from '@/components/ui/date-picker'
import { TimePicker } from '@/components/ui/time-picker'
import { BriefField } from '@/components/campaigns/brief-field'

export function getDeadlineOrderError(
  postingDate: string,
  postingTime: string,
  viewCountDate: string,
  viewCountTime: string
) {
  const posting = combineDateTime(postingDate, postingTime)
  const viewCount = combineDateTime(viewCountDate, viewCountTime)

  if (!posting || !viewCount) return null
  if (viewCount.getTime() <= posting.getTime()) {
    return 'Final view count deadline must be after the posting deadline.'
  }

  return null
}

export function DualDeadlinePicker({
  postingDate,
  postingTime,
  onPostingDateChange,
  onPostingTimeChange,
  viewCountDate,
  viewCountTime,
  onViewCountDateChange,
  onViewCountTimeChange,
  postingDateId,
  postingTimeId,
  viewCountDateId,
  viewCountTimeId,
}: {
  postingDate: string
  postingTime: string
  onPostingDateChange: (value: string) => void
  onPostingTimeChange: (value: string) => void
  viewCountDate: string
  viewCountTime: string
  onViewCountDateChange: (value: string) => void
  onViewCountTimeChange: (value: string) => void
  postingDateId: string
  postingTimeId: string
  viewCountDateId: string
  viewCountTimeId: string
}) {
  const orderError = useMemo(
    () =>
      getDeadlineOrderError(
        postingDate,
        postingTime,
        viewCountDate,
        viewCountTime
      ),
    [postingDate, postingTime, viewCountDate, viewCountTime]
  )

  return (
    <div className="space-y-4">
      <BriefField
        id={postingDateId}
        label="Posting deadline"
        required
        hint="When creators must publish their content."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <DatePicker
            id={postingDateId}
            value={postingDate}
            onChange={onPostingDateChange}
            placeholder="Select date"
            fromDate={new Date()}
          />
          <TimePicker
            id={postingTimeId}
            value={postingTime}
            onChange={onPostingTimeChange}
            placeholder="Select time"
          />
        </div>
      </BriefField>

      <BriefField
        id={viewCountDateId}
        label="Final view count deadline"
        required
        hint="When view counts are finalized for payout calculation."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <DatePicker
            id={viewCountDateId}
            value={viewCountDate}
            onChange={onViewCountDateChange}
            placeholder="Select date"
            fromDate={new Date()}
          />
          <TimePicker
            id={viewCountTimeId}
            value={viewCountTime}
            onChange={onViewCountTimeChange}
            placeholder="Select time"
          />
        </div>
      </BriefField>

      {orderError && (
        <p className="text-xs text-red-600" role="alert">
          {orderError}
        </p>
      )}
    </div>
  )
}
