import {
  calculateCpmMaxBudget,
  combineDateTime,
  getPlacementLabel,
  sumPrizeAmounts,
} from '@/components/campaigns/campaign-constants'
import type { InspirationLink } from '@/components/campaigns/inspiration-link-builder'
import type { PrizePlacement } from '@/components/campaigns/prize-structure-builder'
import { normalizeCurrencyCode } from '@/lib/currency'

type UsageRightsId = 'organic' | 'paid-ads' | 'full-buyout'
type CurrencyCode = 'NGN' | 'GHS' | 'USD'

const USAGE_RIGHTS_MAP: Record<UsageRightsId, 'basic' | 'ad' | 'full'> = {
  organic: 'basic',
  'paid-ads': 'ad',
  'full-buyout': 'full',
}

const VIDEO_TYPE_MAP: Record<string, string> = {
  'product-demo': 'review',
}

const PLATFORM_MAP: Record<string, string> = {
  'youtube-shorts': 'youtube_shorts',
  youtube: 'youtube_shorts',
  facebook: 'any',
  snapchat: 'any',
}

export function formatDecimalAmount(amount: number) {
  const safe = Number.isFinite(amount) ? Math.max(0, amount) : 0
  return safe.toFixed(2)
}

export function toIsoDateTime(date: string, time: string) {
  const combined = combineDateTime(date, time)
  return combined?.toISOString() ?? null
}

export function formatHashtags(tags: string[]) {
  if (tags.length === 0) return undefined
  return tags.map((tag) => `#${tag}`).join(' ')
}

export function mapUsageRights(value: UsageRightsId) {
  return USAGE_RIGHTS_MAP[value] ?? 'basic'
}

export function mapVideoType(value: string) {
  return VIDEO_TYPE_MAP[value] ?? value
}

export function mapTargetPlatform(value: string) {
  return PLATFORM_MAP[value] ?? value
}

export function mapCurrency(value: string): CurrencyCode {
  const code = normalizeCurrencyCode(value)
  if (code === 'NGN' || code === 'GHS' || code === 'USD') return code
  return 'USD'
}

function optionalUrl(value: string) {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function optionalText(value: string) {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

export function mapReferenceLinks(links: Array<{ label: string; url: string }>) {
  return links
    .filter((link) => link.url.trim().length > 0)
    .map((link) => ({
      url: link.url.trim(),
      label: optionalText(link.label),
    }))
}

export function mapContestReferenceLinks(links: InspirationLink[]) {
  return links
    .filter((link) => link.url.trim().length > 0)
    .map((link) => ({
      url: link.url.trim(),
      label: optionalText(link.label),
      isInspiration: link.kind === 'inspiration',
    }))
}

export function mapContestRewards(
  placements: PrizePlacement[],
  currency: string
): Array<{ placement: number; label?: string; amount: string; currency: CurrencyCode }> {
  const currencyCode = mapCurrency(currency)

  return placements
    .map((placement, index) => ({
      placement: index + 1,
      label: getPlacementLabel(index),
      amount: formatDecimalAmount(Number(placement.amount) || 0),
      currency: currencyCode,
    }))
    .filter((reward) => Number(reward.amount) > 0)
}

export interface UgcFormState {
  title: string
  productName: string
  shortDescription: string
  fullDescription: string
  externalBriefLink: string
  videoType: string
  videoLengthSeconds: string
  creatorsNeeded: string
  flatRate: string
  wordsToSay: string
  wordsToAvoid: string
  callToAction: string
  requiredShots: string
  revisionLimit: string
  postingRequired: boolean
  targetPlatform: string
  productDeliveryDetails: string
  usageRights: UsageRightsId
  deadlineDate: string
  deadlineTime: string
  referenceLinks: Array<{ label: string; url: string }>
  currency: string
}

export function buildCreateUgcOrderInput(form: UgcFormState) {
  const deadline = toIsoDateTime(form.deadlineDate, form.deadlineTime)
  if (!deadline) {
    return { error: 'Deadline date and time are required.' as const }
  }

  const creatorsCount = Math.max(1, Number(form.creatorsNeeded) || 0)
  const ratePerCreator = Math.max(0, Number(form.flatRate) || 0)

  return {
    input: {
      title: form.title.trim(),
      productName: form.productName.trim(),
      shortDescription: form.shortDescription.trim(),
      fullDescription: form.fullDescription.trim(),
      externalBriefLink: optionalUrl(form.externalBriefLink),
      videoType: mapVideoType(form.videoType),
      videoLengthSeconds: Math.max(1, Number(form.videoLengthSeconds) || 0),
      numberOfCreators: creatorsCount,
      flatRatePerCreator: formatDecimalAmount(ratePerCreator),
      currency: mapCurrency(form.currency),
      totalBudget: formatDecimalAmount(creatorsCount * ratePerCreator),
      requiredShots: optionalText(form.requiredShots),
      wordsToSay: optionalText(form.wordsToSay),
      wordsToAvoid: optionalText(form.wordsToAvoid),
      callToAction: optionalText(form.callToAction),
      usageRightsPackage: mapUsageRights(form.usageRights),
      postingRequired: form.postingRequired,
      targetPlatform: form.postingRequired && form.targetPlatform
        ? mapTargetPlatform(form.targetPlatform)
        : undefined,
      productDeliveryDetails: optionalText(form.productDeliveryDetails),
      revisionLimit: Math.max(0, Number(form.revisionLimit) || 0),
      deadline,
      referenceLinks: mapReferenceLinks(form.referenceLinks),
    },
  }
}

export interface CpmFormState {
  title: string
  productName: string
  shortDescription: string
  fullDescription: string
  externalBriefLink: string
  targetPlatform: string
  hashtags: string[]
  requiredCaption: string
  brandTag: string
  payPerThousand: string
  maxViewsPerCreator: string
  creatorsNeeded: string
  productDeliveryDetails: string
  usageRights: UsageRightsId
  postingDate: string
  postingTime: string
  viewCountDate: string
  viewCountTime: string
  referenceLinks: Array<{ label: string; url: string }>
  currency: string
}

export function buildCreateCpmDealInput(form: CpmFormState) {
  const postingDeadline = toIsoDateTime(form.postingDate, form.postingTime)
  const finalViewCountDeadline = toIsoDateTime(form.viewCountDate, form.viewCountTime)

  if (!postingDeadline || !finalViewCountDeadline) {
    return { error: 'Posting and view count deadlines are required.' as const }
  }

  const payRate = Math.max(0, Number(form.payPerThousand) || 0)
  const maxViews = Math.max(1, Number(form.maxViewsPerCreator) || 0)
  const creatorsCount = Math.max(1, Number(form.creatorsNeeded) || 0)
  const maxCampaignBudget = calculateCpmMaxBudget(payRate, maxViews, creatorsCount)

  return {
    input: {
      title: form.title.trim(),
      productName: form.productName.trim(),
      shortDescription: form.shortDescription.trim(),
      fullDescription: form.fullDescription.trim(),
      externalBriefLink: optionalUrl(form.externalBriefLink),
      targetPlatform: mapTargetPlatform(form.targetPlatform),
      requiredHashtags: formatHashtags(form.hashtags),
      requiredCaption: optionalText(form.requiredCaption),
      requiredBrandTag: optionalText(form.brandTag),
      payPer1000Views: formatDecimalAmount(payRate),
      maxPayableViewsPerCreator: maxViews,
      numberOfCreators: creatorsCount,
      maxCampaignBudget: formatDecimalAmount(maxCampaignBudget),
      currency: mapCurrency(form.currency),
      usageRightsPackage: mapUsageRights(form.usageRights),
      productDeliveryDetails: optionalText(form.productDeliveryDetails),
      postingDeadline,
      finalViewCountDeadline,
      referenceLinks: mapReferenceLinks(form.referenceLinks),
    },
  }
}

export interface ContestFormState {
  title: string
  productName: string
  shortDescription: string
  fullDescription: string
  externalBriefLink: string
  contestCategory: string
  videoType: string
  videoLengthSeconds: string
  targetPlatform: string
  hashtags: string[]
  requiredCaption: string
  brandTag: string
  postingRequired: boolean
  contestRules: string
  eligibilityRules: string
  inspirationLinks: InspirationLink[]
  productDeliveryDetails: string
  prizePlacements: PrizePlacement[]
  minimumWinners: string
  cpmLayerEnabled: boolean
  payPerThousand: string
  maxViewsPerCreator: string
  usageRights: UsageRightsId
  submissionDate: string
  submissionTime: string
  announcementDate: string
  announcementTime: string
  currency: string
}

export function buildCreateContestInput(form: ContestFormState) {
  const submissionDeadline = toIsoDateTime(form.submissionDate, form.submissionTime)
  const winnerAnnouncementDate = toIsoDateTime(form.announcementDate, form.announcementTime)

  if (!submissionDeadline || !winnerAnnouncementDate) {
    return { error: 'Submission deadline and winner announcement date are required.' as const }
  }

  const prizePoolTotal = sumPrizeAmounts(form.prizePlacements.map((p) => p.amount))
  const minimumWinnersCount = Math.max(1, Number(form.minimumWinners) || 0)
  const payRate = Math.max(0, Number(form.payPerThousand) || 0)
  const maxViews = Math.max(0, Number(form.maxViewsPerCreator) || 0)
  const cpmBudget = form.cpmLayerEnabled
    ? calculateCpmMaxBudget(payRate, maxViews, minimumWinnersCount)
    : 0
  const rewards = mapContestRewards(form.prizePlacements, form.currency)

  if (rewards.length === 0) {
    return { error: 'At least one prize placement with an amount is required.' as const }
  }

  return {
    input: {
      title: form.title.trim(),
      productName: form.productName.trim(),
      shortDescription: form.shortDescription.trim(),
      fullDescription: form.fullDescription.trim(),
      externalBriefLink: optionalUrl(form.externalBriefLink),
      category: optionalText(form.contestCategory),
      videoType: form.videoType ? mapVideoType(form.videoType) : undefined,
      videoLengthSeconds: form.videoLengthSeconds
        ? Math.max(1, Number(form.videoLengthSeconds) || 0)
        : undefined,
      targetPlatform: mapTargetPlatform(form.targetPlatform),
      requiredHashtags: formatHashtags(form.hashtags),
      requiredCaption: optionalText(form.requiredCaption),
      requiredBrandTag: optionalText(form.brandTag),
      postingRequired: form.postingRequired,
      contestRules: optionalText(form.contestRules),
      eligibilityRules: optionalText(form.eligibilityRules),
      usageRightsPackage: mapUsageRights(form.usageRights),
      productDeliveryDetails: optionalText(form.productDeliveryDetails),
      totalContestBudget: formatDecimalAmount(prizePoolTotal + cpmBudget),
      currency: mapCurrency(form.currency),
      cpmBudget: form.cpmLayerEnabled ? formatDecimalAmount(cpmBudget) : undefined,
      payPer1000Views: form.cpmLayerEnabled ? formatDecimalAmount(payRate) : undefined,
      maxPayableViewsPerCreator:
        form.cpmLayerEnabled && maxViews > 0 ? maxViews : undefined,
      minimumWinners: minimumWinnersCount,
      submissionDeadline,
      winnerAnnouncementDate,
      referenceLinks: mapContestReferenceLinks(form.inspirationLinks),
      rewards,
    },
  }
}
