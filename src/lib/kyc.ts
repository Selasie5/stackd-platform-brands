export type KycStatus =
  | 'not_started'
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'needs_more_info'

export const BRAND_KYC_REQUIRED_DOCUMENT = {
  type: 'business_registration',
  label: 'Business registration document',
  description:
    'Official certificate or proof of business registration / incorporation with the relevant authority.',
} as const

export const BRAND_KYC_OPTIONAL_DOCUMENT_TYPES = [
  {
    type: 'incorporation',
    label: 'Incorporation document',
    description: 'Certificate of incorporation or equivalent legal formation document.',
  },
  {
    type: 'other',
    label: 'Other supporting document',
    description: 'Tax certificate, operating license, or any other supporting file.',
  },
] as const

export const KYC_STATUS_LABELS: Record<KycStatus, string> = {
  not_started: 'Not started',
  pending_review: 'Under review',
  approved: 'Verified',
  rejected: 'Rejected',
  needs_more_info: 'More info needed',
}

export const KYC_STATUS_DESCRIPTIONS: Record<KycStatus, string> = {
  not_started: 'Upload your business documents to start verification.',
  pending_review: 'Your documents are being reviewed. This usually takes 1–3 business days.',
  approved: 'Your business has been verified. You have full access to the platform.',
  rejected: 'Your submission was rejected. Review the feedback below and resubmit.',
  needs_more_info: 'We need additional information. Review the note below and resubmit.',
}

export function isKycComplete(status?: string | null) {
  if (!status) return false
  return status.toLowerCase() === 'approved'
}

export function resolveKycStatus(status?: string | null): KycStatus {
  const normalized = (status ?? 'not_started').toLowerCase()
  if (
    normalized === 'pending_review' ||
    normalized === 'rejected' ||
    normalized === 'needs_more_info' ||
    normalized === 'approved' ||
    normalized === 'not_started'
  ) {
    return normalized
  }
  return 'not_started'
}

/** Prefer application status when present; either source can confirm approval. */
export function resolveEffectiveKycStatus(
  brandStatus?: string | null,
  applicationStatus?: string | null
): KycStatus {
  const brand = resolveKycStatus(brandStatus)
  const application = applicationStatus ? resolveKycStatus(applicationStatus) : null

  if (brand === 'approved' || application === 'approved') return 'approved'

  if (application && application !== 'not_started') return application

  return brand
}

export function canSubmitKyc(status?: string | null) {
  if (!status) return true
  const normalized = status.toLowerCase() as KycStatus
  return ['not_started', 'rejected', 'needs_more_info'].includes(normalized)
}

export function formatDocumentType(type: string) {
  if (type === BRAND_KYC_REQUIRED_DOCUMENT.type) return BRAND_KYC_REQUIRED_DOCUMENT.label

  const optional = BRAND_KYC_OPTIONAL_DOCUMENT_TYPES.find((doc) => doc.type === type)
  if (optional) return optional.label
  if (type === 'other') return 'Additional document'

  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function formatKycDate(value?: string | null) {
  if (!value) return null

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  try {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  } catch {
    return null
  }
}
