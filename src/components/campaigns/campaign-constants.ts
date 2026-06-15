import { cn } from '@/lib/utils'

export const USAGE_RIGHTS_OPTIONS = [
  {
    id: 'organic',
    title: 'Organic only',
    description: 'Creator posts on their channel. Brand can repost organically.',
  },
  {
    id: 'paid-ads',
    title: 'Paid ads included',
    description: 'Brand may run paid ads using the creator content for a defined period.',
  },
  {
    id: 'full-buyout',
    title: 'Full buyout',
    description: 'Brand owns the content outright with unlimited usage across channels.',
  },
] as const

export const CPM_PLATFORM_OPTIONS = [
  { value: 'tiktok', label: 'TikTok' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'youtube_shorts', label: 'YouTube Shorts' },
]

export function textareaClassName(minHeight = 'min-h-[120px]') {
  return cn(
    minHeight,
    'w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30'
  )
}

export function combineDateTime(date: string, time: string) {
  if (!date || !time) return null
  const combined = new Date(`${date}T${time}:00`)
  return Number.isNaN(combined.getTime()) ? null : combined
}

export function calculateCpmMaxBudget(
  payPerThousandViews: number,
  maxViewsPerCreator: number,
  creatorsCount: number
) {
  const pay = Math.max(0, payPerThousandViews)
  const views = Math.max(0, maxViewsPerCreator)
  const creators = Math.max(0, creatorsCount)
  return (pay * views) / 1000 * creators
}

export const VIDEO_TYPE_OPTIONS = [
  { value: 'testimonial', label: 'Testimonial' },
  { value: 'product-demo', label: 'Product demo' },
  { value: 'unboxing', label: 'Unboxing' },
  { value: 'tutorial', label: 'Tutorial' },
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'other', label: 'Other' },
]

export const CONTEST_CATEGORY_OPTIONS = [
  { value: 'brand-awareness', label: 'Brand awareness' },
  { value: 'product-launch', label: 'Product launch' },
  { value: 'ugc-challenge', label: 'UGC challenge' },
  { value: 'seasonal', label: 'Seasonal / holiday' },
  { value: 'community', label: 'Community engagement' },
  { value: 'other', label: 'Other' },
]

export const MIN_FIRST_PLACE_PRIZE = 5000

export function getAnnouncementDateError(
  submissionDate: string,
  submissionTime: string,
  announcementDate: string,
  announcementTime: string
) {
  const submission = combineDateTime(submissionDate, submissionTime)
  const announcement = combineDateTime(announcementDate, announcementTime)

  if (!submission || !announcement) return null
  if (announcement.getTime() <= submission.getTime()) {
    return 'Winner announcement date must be after the submission deadline.'
  }

  return null
}

export function sumPrizeAmounts(amounts: string[]) {
  return amounts.reduce((total, raw) => total + Math.max(0, Number(raw) || 0), 0)
}

export function getPlacementLabel(index: number) {
  const ordinals = ['1st', '2nd', '3rd'] as const
  if (index < ordinals.length) return `${ordinals[index]} place`
  return `${index + 1}th place`
}
