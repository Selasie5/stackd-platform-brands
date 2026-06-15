import { useMemo } from 'react'
import { getAnnouncementDateError } from '@/components/campaigns/campaign-constants'
import { DatePicker } from '@/components/ui/date-picker'
import { TimePicker } from '@/components/ui/time-picker'
import { BriefField } from '@/components/campaigns/brief-field'

export function ContestDeadlinePicker({
  submissionDate,
  submissionTime,
  onSubmissionDateChange,
  onSubmissionTimeChange,
  announcementDate,
  announcementTime,
  onAnnouncementDateChange,
  onAnnouncementTimeChange,
  submissionDateId,
  submissionTimeId,
  announcementDateId,
  announcementTimeId,
}: {
  submissionDate: string
  submissionTime: string
  onSubmissionDateChange: (value: string) => void
  onSubmissionTimeChange: (value: string) => void
  announcementDate: string
  announcementTime: string
  onAnnouncementDateChange: (value: string) => void
  onAnnouncementTimeChange: (value: string) => void
  submissionDateId: string
  submissionTimeId: string
  announcementDateId: string
  announcementTimeId: string
}) {
  const orderError = useMemo(
    () =>
      getAnnouncementDateError(
        submissionDate,
        submissionTime,
        announcementDate,
        announcementTime
      ),
    [submissionDate, submissionTime, announcementDate, announcementTime]
  )

  return (
    <div className="space-y-4">
      <BriefField
        id={submissionDateId}
        label="Submission deadline"
        required
        hint="When creators must submit their entries."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <DatePicker
            id={submissionDateId}
            value={submissionDate}
            onChange={onSubmissionDateChange}
            placeholder="Select date"
            fromDate={new Date()}
          />
          <TimePicker
            id={submissionTimeId}
            value={submissionTime}
            onChange={onSubmissionTimeChange}
            placeholder="Select time"
          />
        </div>
      </BriefField>

      <BriefField
        id={announcementDateId}
        label="Winner announcement date"
        required
        hint="When winners will be announced publicly."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <DatePicker
            id={announcementDateId}
            value={announcementDate}
            onChange={onAnnouncementDateChange}
            placeholder="Select date"
            fromDate={new Date()}
          />
          <TimePicker
            id={announcementTimeId}
            value={announcementTime}
            onChange={onAnnouncementTimeChange}
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
