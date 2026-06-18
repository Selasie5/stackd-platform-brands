import { useEffect, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { AlertCircle, ChevronLeft, Link2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { BriefField, BriefProse, BriefSection } from '@/components/campaigns/brief-field'
import {
  CPM_PLATFORM_OPTIONS,
  CONTEST_CATEGORY_OPTIONS,
  MIN_FIRST_PLACE_PRIZE,
  USAGE_RIGHTS_OPTIONS,
  VIDEO_TYPE_OPTIONS,
  calculateCpmMaxBudget,
  getAnnouncementDateError,
  sumPrizeAmounts,
  textareaClassName,
} from '@/components/campaigns/campaign-constants'
import { ContestDeadlinePicker } from '@/components/campaigns/contest-deadline-picker'
import { CpmLayerToggle } from '@/components/campaigns/cpm-layer-toggle'
import { HashtagInput } from '@/components/campaigns/hashtag-input'
import {
  InspirationLinkBuilder,
  createInitialInspirationLinks,
} from '@/components/campaigns/inspiration-link-builder'
import {
  PrizeStructureBuilder,
  createInitialPrizePlacements,
} from '@/components/campaigns/prize-structure-builder'
import { useContest, useCreateContest, useSubmitOpportunityForApproval } from '@/hooks/use-opportunities'
import { buildCreateContestInput } from '@/lib/opportunity-mappers'
import { useWallet } from '@/contexts/wallet-context'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const FIELD_ID = {
  title: 'contest-campaign-title',
  productName: 'contest-product-name',
  shortDescription: 'contest-short-description',
  fullDescription: 'contest-full-description',
  externalBriefLink: 'contest-external-brief-link',
  contestCategory: 'contest-category',
  videoType: 'contest-video-type',
  videoLength: 'contest-video-length',
  targetPlatform: 'contest-target-platform',
  hashtags: 'contest-hashtags',
  requiredCaption: 'contest-required-caption',
  brandTag: 'contest-brand-tag',
  postingRequired: 'contest-posting-required',
  contestRules: 'contest-rules',
  eligibilityRules: 'contest-eligibility-rules',
  productDeliveryDetails: 'contest-product-delivery-details',
  minimumWinners: 'contest-minimum-winners',
  cpmLayer: 'contest-cpm-layer',
  payPerThousand: 'contest-pay-per-thousand',
  maxViews: 'contest-max-views',
  submissionDate: 'contest-submission-date',
  submissionTime: 'contest-submission-time',
  announcementDate: 'contest-announcement-date',
  announcementTime: 'contest-announcement-time',
} as const

export function ContestCreateBrief({ existingId }: { existingId?: string }) {
  const navigate = useNavigate()
  const { currency, currencySymbol, availableBalance, formatMoney } = useWallet()
  const { saveContest, loading: saving } = useCreateContest()
  const { submitForApproval, loading: submitting } = useSubmitOpportunityForApproval()
  const { data: existingData, loading: loadingExisting } = useContest(existingId)
  const [draftId, setDraftId] = useState<string | null>(existingId ?? null)
  const [pendingAction, setPendingAction] = useState<'draft' | 'publish' | null>(null)
  const isEdit = Boolean(existingId) && !loadingExisting && Boolean(existingData?.contest)

  useEffect(() => {
    const d = existingData?.contest
    if (!d) return
    setTitle(d.title ?? '')
    setProductName(d.productName ?? '')
    setShortDescription(d.shortDescription ?? '')
    setFullDescription(d.fullDescription ?? '')
    setExternalBriefLink(d.externalBriefLink ?? '')
    setContestCategory(d.category ?? '')
    setVideoType(d.videoType ?? '')
    setVideoLengthSeconds(d.videoLengthSeconds != null ? String(d.videoLengthSeconds) : '')
    setTargetPlatform(d.targetPlatform ?? '')
    setHashtags(d.requiredHashtags ? d.requiredHashtags.split(' ').map((h) => h.replace(/^#/, '')) : [])
    setRequiredCaption(d.requiredCaption ?? '')
    setBrandTag(d.requiredBrandTag ?? '')
    setPostingRequired(d.postingRequired ?? true)
    setContestRules(d.contestRules ?? '')
    setEligibilityRules(d.eligibilityRules ?? '')
    setProductDeliveryDetails(d.productDeliveryDetails ?? '')
    setUsageRights((d.usageRightsPackage as (typeof USAGE_RIGHTS_OPTIONS)[number]['id']) ?? 'organic')
    setMinimumWinners(d.minimumWinners != null ? String(d.minimumWinners) : '15')
    setCpmLayerEnabled(d.cpmBudget != null && Number(d.cpmBudget) > 0)
    setPayPerThousand(d.payPer1000Views != null ? String(d.payPer1000Views) : '')
    setMaxViewsPerCreator(d.maxPayableViewsPerCreator != null ? String(d.maxPayableViewsPerCreator) : '')
    if (d.submissionDeadline) {
      setSubmissionDate(d.submissionDeadline.slice(0, 10))
      setSubmissionTime(d.submissionDeadline.slice(11, 16))
    }
    if (d.winnerAnnouncementDate) {
      setAnnouncementDate(d.winnerAnnouncementDate.slice(0, 10))
      setAnnouncementTime(d.winnerAnnouncementDate.slice(11, 16))
    }
    if (d.referenceLinks && d.referenceLinks.length > 0) {
      setInspirationLinks(
        d.referenceLinks.map((r) => ({
          id: crypto.randomUUID(),
          kind: r.isInspiration ? 'inspiration' as const : 'reference' as const,
          label: r.label ?? '',
          url: r.url,
        }))
      )
    }
    if (d.rewards && d.rewards.length > 0) {
      setPrizePlacements(
        d.rewards.map((r) => ({
          id: crypto.randomUUID(),
          label: r.label ?? '',
          amount: String(Math.max(0, Number(r.amount) || 0)),
        }))
      )
    }
  }, [existingData])

  const [title, setTitle] = useState('')
  const [productName, setProductName] = useState('')
  const [shortDescription, setShortDescription] = useState('')
  const [fullDescription, setFullDescription] = useState('')
  const [externalBriefLink, setExternalBriefLink] = useState('')
  const [contestCategory, setContestCategory] = useState('')

  const [videoType, setVideoType] = useState('')
  const [videoLengthSeconds, setVideoLengthSeconds] = useState('')
  const [targetPlatform, setTargetPlatform] = useState('')
  const [hashtags, setHashtags] = useState<string[]>([])
  const [requiredCaption, setRequiredCaption] = useState('')
  const [brandTag, setBrandTag] = useState('')
  const [postingRequired, setPostingRequired] = useState(true)
  const [contestRules, setContestRules] = useState('')
  const [eligibilityRules, setEligibilityRules] = useState('')

  const [inspirationLinks, setInspirationLinks] = useState(createInitialInspirationLinks)
  const [productDeliveryDetails, setProductDeliveryDetails] = useState('')

  const [prizePlacements, setPrizePlacements] = useState(createInitialPrizePlacements)
  const [minimumWinners, setMinimumWinners] = useState('15')
  const [cpmLayerEnabled, setCpmLayerEnabled] = useState(false)
  const [payPerThousand, setPayPerThousand] = useState('')
  const [maxViewsPerCreator, setMaxViewsPerCreator] = useState('')

  const [usageRights, setUsageRights] = useState<(typeof USAGE_RIGHTS_OPTIONS)[number]['id']>('organic')
  const [submissionDate, setSubmissionDate] = useState('')
  const [submissionTime, setSubmissionTime] = useState('')
  const [announcementDate, setAnnouncementDate] = useState('')
  const [announcementTime, setAnnouncementTime] = useState('')

  const prizePoolTotal = sumPrizeAmounts(prizePlacements.map((p) => p.amount))
  const firstPlaceAmount = Math.max(0, Number(prizePlacements[0]?.amount) || 0)
  const minimumWinnersCount = Number(minimumWinners) || 0
  const payRate = Math.max(0, Number(payPerThousand) || 0)
  const maxViews = Math.max(0, Number(maxViewsPerCreator) || 0)
  const cpmBudget = cpmLayerEnabled
    ? calculateCpmMaxBudget(payRate, maxViews, minimumWinnersCount)
    : 0
  const totalContestBudget = prizePoolTotal + cpmBudget
  const remainingBalance = availableBalance - totalContestBudget
  const hasInsufficientFunds = totalContestBudget > availableBalance
  const shortfall = hasInsufficientFunds ? totalContestBudget - availableBalance : 0
  const hasZeroMinimumWinners = minimumWinnersCount <= 0
  const firstPlaceBelowMinimum = firstPlaceAmount < MIN_FIRST_PLACE_PRIZE
  const firstPlaceError = firstPlaceBelowMinimum
    ? `First place prize must be at least ${formatMoney(MIN_FIRST_PLACE_PRIZE)}.`
    : null
  const announcementDateError = getAnnouncementDateError(
    submissionDate,
    submissionTime,
    announcementDate,
    announcementTime
  )
  const cannotPublish =
    hasInsufficientFunds ||
    hasZeroMinimumWinners ||
    firstPlaceBelowMinimum ||
    Boolean(announcementDateError)

  const buildInput = () =>
    buildCreateContestInput({
      title,
      productName,
      shortDescription,
      fullDescription,
      externalBriefLink,
      contestCategory,
      videoType,
      videoLengthSeconds,
      targetPlatform,
      hashtags,
      requiredCaption,
      brandTag,
      postingRequired,
      contestRules,
      eligibilityRules,
      inspirationLinks,
      productDeliveryDetails,
      prizePlacements,
      minimumWinners,
      cpmLayerEnabled,
      payPerThousand,
      maxViewsPerCreator,
      usageRights,
      submissionDate,
      submissionTime,
      announcementDate,
      announcementTime,
      currency,
    })

  const handleSaveDraft = async () => {
    setPendingAction('draft')
    try {
      const result = buildInput()
      if ('error' in result) {
        toast.error(result.error)
        return
      }
      const saved = await saveContest(result.input, draftId ?? undefined)
      if (!saved) return
      setDraftId(saved.id)
      toast.success('Campaign saved as draft.')
      await navigate({ to: '/dashboard/campaigns' })
    } finally {
      setPendingAction(null)
    }
  }

  const handlePublish = async () => {
    setPendingAction('publish')
    try {
      const result = buildInput()
      if ('error' in result) {
        toast.error(result.error)
        return
      }
      const saved = await saveContest(result.input, draftId ?? undefined)
      if (!saved) return
      setDraftId(saved.id)
      const submitted = await submitForApproval('CONTEST', saved.id)
      if (submitted) {
        await navigate({ to: '/dashboard/campaigns' })
      }
    } finally {
      setPendingAction(null)
    }
  }

  const isSaving = saving || submitting

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <Link
        to="/dashboard/campaigns"
        className="inline-flex w-fit items-center gap-1 rounded-full bg-zinc-100 px-3 py-1.5 text-[11px] font-semibold text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-900 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-100"
      >
        <ChevronLeft className="h-3 w-3" />
        Back to campaigns
      </Link>

      <div className="flex flex-col gap-8 xl:flex-row xl:items-start">
        <article className="min-w-0 flex-1 space-y-10 rounded-xl border border-zinc-200 bg-white px-6 py-8 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <header className="space-y-4 border-b border-zinc-100 pb-8">
            <div>
              <h1 className="text-2xl font-semibold tracking-[-0.03em] text-zinc-900">
                {isEdit ? 'Edit' : 'Contest Brief'}
              </h1>
              <BriefProse>
                {isEdit
                  ? 'Update the contest below. Changes will be saved to the existing campaign.'
                  : 'Launch a creator contest with tiered prizes, optional CPM payouts, and clear submission rules. Winners are ranked by your criteria after the submission deadline.'}
              </BriefProse>
            </div>
          </header>

          <BriefSection
            title="Basics"
            description="Introduce the contest and what creators are competing for."
          >
            <BriefField id={FIELD_ID.title} label="Campaign title" required hint="A clear name creators will recognize.">
              <Input
                id={FIELD_ID.title}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Summer creator challenge"
              />
            </BriefField>

            <BriefField id={FIELD_ID.productName} label="Product or service name" required>
              <Input
                id={FIELD_ID.productName}
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Stackd Pro Analytics"
              />
            </BriefField>

            <BriefField
              id={FIELD_ID.shortDescription}
              label="Short description"
              required
              hint="One-line summary shown in campaign listings. 500 characters max."
            >
              <textarea
                id={FIELD_ID.shortDescription}
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value.slice(0, 500))}
                placeholder="Create your best product video for a chance to win cash prizes."
                className={textareaClassName('min-h-[88px]')}
                maxLength={500}
              />
              <p className="text-right text-[11px] text-zinc-400">{shortDescription.length}/500</p>
            </BriefField>

            <BriefField
              id={FIELD_ID.fullDescription}
              label="Full campaign description"
              required
              hint="Explain the contest theme, goals, and what makes a winning entry."
            >
              <textarea
                id={FIELD_ID.fullDescription}
                value={fullDescription}
                onChange={(e) => setFullDescription(e.target.value)}
                placeholder="Describe the contest narrative, judging focus, and creative direction..."
                className={textareaClassName('min-h-[180px]')}
              />
            </BriefField>

            <BriefField id={FIELD_ID.externalBriefLink} label="External brief link" hint="Optional link to a Notion doc, PDF, or mood board.">
              <div className="relative">
                <Link2 className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <Input
                  id={FIELD_ID.externalBriefLink}
                  value={externalBriefLink}
                  onChange={(e) => setExternalBriefLink(e.target.value)}
                  placeholder="https://"
                  className="pl-9"
                />
              </div>
            </BriefField>

            <BriefField id={FIELD_ID.contestCategory} label="Contest category" required>
              <Select
                id={FIELD_ID.contestCategory}
                value={contestCategory}
                onChange={setContestCategory}
                options={CONTEST_CATEGORY_OPTIONS}
                placeholder="Select category"
              />
            </BriefField>
          </BriefSection>

          <BriefSection
            title="Requirements"
            description="Define deliverable specs, posting rules, and contest guidelines."
          >
            <div className="grid gap-6 sm:grid-cols-2">
              <BriefField id={FIELD_ID.videoType} label="Video type" required>
                <Select
                  id={FIELD_ID.videoType}
                  value={videoType}
                  onChange={setVideoType}
                  options={VIDEO_TYPE_OPTIONS}
                  placeholder="Select video type"
                />
              </BriefField>

              <BriefField id={FIELD_ID.videoLength} label="Video length (seconds)" required hint="Min 15, max 180.">
                <Input
                  id={FIELD_ID.videoLength}
                  type="number"
                  min={15}
                  max={180}
                  value={videoLengthSeconds}
                  onChange={(e) => setVideoLengthSeconds(e.target.value)}
                  placeholder="60"
                />
              </BriefField>
            </div>

            <BriefField id={FIELD_ID.targetPlatform} label="Target platform" required>
              <Select
                id={FIELD_ID.targetPlatform}
                value={targetPlatform}
                onChange={setTargetPlatform}
                options={CPM_PLATFORM_OPTIONS}
                placeholder="Select platform"
              />
            </BriefField>

            <BriefField
              id={FIELD_ID.hashtags}
              label="Required hashtags"
              hint="Add every hashtag creators must include in their post."
            >
              <HashtagInput id={FIELD_ID.hashtags} value={hashtags} onChange={setHashtags} />
            </BriefField>

            <BriefField
              id={FIELD_ID.requiredCaption}
              label="Required caption"
              required
              hint="Caption text creators must use or adapt."
            >
              <textarea
                id={FIELD_ID.requiredCaption}
                value={requiredCaption}
                onChange={(e) => setRequiredCaption(e.target.value)}
                placeholder="Enter our summer challenge — show us how you use Stackd!"
                className={textareaClassName()}
              />
            </BriefField>

            <BriefField
              id={FIELD_ID.brandTag}
              label="Required brand tag or mention"
              required
              hint="Handle or tag creators must mention (e.g. @stackd)."
            >
              <Input
                id={FIELD_ID.brandTag}
                value={brandTag}
                onChange={(e) => setBrandTag(e.target.value)}
                placeholder="@stackd"
              />
            </BriefField>

            <BriefField id={FIELD_ID.postingRequired} label="Posting requirement">
              <div className="flex h-9 cursor-pointer items-center gap-2.5 rounded-md border border-input px-3 text-sm dark:bg-input/30">
                <Checkbox
                  id={FIELD_ID.postingRequired}
                  checked={postingRequired}
                  onCheckedChange={(checked) => setPostingRequired(checked === true)}
                />
                <label htmlFor={FIELD_ID.postingRequired} className="cursor-pointer text-zinc-700">
                  Creator must post on their channel
                </label>
              </div>
            </BriefField>

            <BriefField
              id={FIELD_ID.contestRules}
              label="Contest rules"
              required
              hint="Full rules covering submissions, judging, disqualification, and prize distribution."
            >
              <textarea
                id={FIELD_ID.contestRules}
                value={contestRules}
                onChange={(e) => setContestRules(e.target.value)}
                placeholder="Entries must be original content. No copyrighted music without license..."
                className={textareaClassName('min-h-[160px]')}
              />
            </BriefField>

            <BriefField
              id={FIELD_ID.eligibilityRules}
              label="Eligibility rules"
              required
              hint="Who can enter — location, follower count, age, or other requirements."
            >
              <textarea
                id={FIELD_ID.eligibilityRules}
                value={eligibilityRules}
                onChange={(e) => setEligibilityRules(e.target.value)}
                placeholder="Open to creators aged 18+ based in Ghana with at least 1,000 followers..."
                className={textareaClassName('min-h-[120px]')}
              />
            </BriefField>
          </BriefSection>

          <BriefSection
            title="References and inspiration"
            description="Share example content and explain how creators receive your product."
          >
            <BriefField
              label="Reference and inspiration links"
              hint="Label each link and mark it as a reference or inspiration."
            >
              <InspirationLinkBuilder links={inspirationLinks} onChange={setInspirationLinks} />
            </BriefField>

            <BriefField
              id={FIELD_ID.productDeliveryDetails}
              label="Product delivery details"
              required
              hint="Explain how the product or access reaches the creator."
            >
              <textarea
                id={FIELD_ID.productDeliveryDetails}
                value={productDeliveryDetails}
                onChange={(e) => setProductDeliveryDetails(e.target.value)}
                placeholder="We'll ship the product within 3 business days..."
                className={textareaClassName()}
              />
            </BriefField>
          </BriefSection>

          <BriefSection
            title="Prize structure"
            description="Define placement prizes, minimum winners, and optional CPM payouts."
          >
            <BriefField label="Currency" hint="Prizes are paid in your wallet currency.">
              <p className="text-sm font-medium text-zinc-800">
                {currency} ({currencySymbol})
              </p>
            </BriefField>

            <BriefField label="Winner reward builder" required hint="Set prize amounts for each placement.">
              <PrizeStructureBuilder
                placements={prizePlacements}
                onChange={setPrizePlacements}
                currencySymbol={currencySymbol}
                minimumWinners={minimumWinners}
                onMinimumWinnersChange={setMinimumWinners}
                minimumWinnersId={FIELD_ID.minimumWinners}
                firstPlaceError={firstPlaceError}
              />
              {hasZeroMinimumWinners && (
                <p className="mt-1 text-xs text-red-600" role="alert">
                  Minimum winners must be greater than zero.
                </p>
              )}
            </BriefField>

            <div
              className="rounded-lg border border-zinc-100 bg-zinc-50/80 px-3 py-3 text-sm"
              aria-live="polite"
              aria-atomic="true"
            >
              <p className="font-medium text-zinc-800">Total prize pool</p>
              <p className="mt-1 text-lg font-semibold text-zinc-900">{formatMoney(prizePoolTotal)}</p>
            </div>

            <CpmLayerToggle
              enabled={cpmLayerEnabled}
              onEnabledChange={setCpmLayerEnabled}
              payPerThousand={payPerThousand}
              onPayPerThousandChange={setPayPerThousand}
              maxViewsPerCreator={maxViewsPerCreator}
              onMaxViewsPerCreatorChange={setMaxViewsPerCreator}
              currencySymbol={currencySymbol}
              currency={currency}
              minimumWinners={minimumWinnersCount}
              formatMoney={formatMoney}
              toggleId={FIELD_ID.cpmLayer}
              payPerThousandId={FIELD_ID.payPerThousand}
              maxViewsId={FIELD_ID.maxViews}
            />

            <div
              className="rounded-lg border border-primary/20 bg-blue-50/40 px-3 py-3 text-sm"
              aria-live="polite"
              aria-atomic="true"
            >
              <p className="font-medium text-zinc-800">Total contest budget</p>
              <p className="mt-1 text-xs text-zinc-500">
                Prize pool {formatMoney(prizePoolTotal)}
                {cpmLayerEnabled && cpmBudget > 0 && (
                  <> + CPM layer {formatMoney(cpmBudget)}</>
                )}
              </p>
              <p className="mt-1 text-lg font-semibold text-zinc-900">
                {formatMoney(totalContestBudget)}
              </p>
            </div>
          </BriefSection>

          <BriefSection
            title="Dates and settings"
            description="Set deadlines, usage rights, and review your final budget."
          >
            <ContestDeadlinePicker
              submissionDate={submissionDate}
              submissionTime={submissionTime}
              onSubmissionDateChange={setSubmissionDate}
              onSubmissionTimeChange={setSubmissionTime}
              announcementDate={announcementDate}
              announcementTime={announcementTime}
              onAnnouncementDateChange={setAnnouncementDate}
              onAnnouncementTimeChange={setAnnouncementTime}
              submissionDateId={FIELD_ID.submissionDate}
              submissionTimeId={FIELD_ID.submissionTime}
              announcementDateId={FIELD_ID.announcementDate}
              announcementTimeId={FIELD_ID.announcementTime}
            />

            <BriefField label="Usage rights package" required>
              <div className="grid gap-3 sm:grid-cols-3" role="group" aria-label="Usage rights package">
                {USAGE_RIGHTS_OPTIONS.map((option) => {
                  const selected = usageRights === option.id
                  return (
                    <button
                      key={option.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setUsageRights(option.id)}
                      className={cn(
                        'rounded-lg border px-4 py-3 text-left transition-all',
                        selected
                          ? 'border-primary bg-blue-50/60 ring-1 ring-primary/20'
                          : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
                      )}
                    >
                      <p className="text-sm font-semibold text-zinc-900">{option.title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-zinc-500">{option.description}</p>
                    </button>
                  )
                })}
              </div>
            </BriefField>
          </BriefSection>
        </article>

        <aside className="w-full shrink-0 xl:sticky xl:top-0 xl:w-80">
          <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">Final budget summary</h3>
              <p className="mt-1 text-xs text-zinc-500">
                Combined prize pool and optional CPM layer
              </p>
            </div>

            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-zinc-500">Prize pool</dt>
                <dd className="font-medium text-zinc-800">{formatMoney(prizePoolTotal)}</dd>
              </div>
              {cpmLayerEnabled && (
                <div className="flex justify-between">
                  <dt className="text-zinc-500">CPM layer</dt>
                  <dd className="font-medium text-zinc-800">{formatMoney(cpmBudget)}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-zinc-100 pt-2">
                <dt className="text-zinc-500">Total contest budget</dt>
                <dd className="font-semibold text-zinc-900">{formatMoney(totalContestBudget)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500">Wallet balance</dt>
                <dd className="font-medium text-zinc-800">{formatMoney(availableBalance)}</dd>
              </div>
              <div className="flex justify-between border-t border-zinc-100 pt-2">
                <dt className="text-zinc-500">After publish</dt>
                <dd
                  className={cn(
                    'font-semibold',
                    hasInsufficientFunds ? 'text-red-600' : 'text-emerald-600'
                  )}
                >
                  {formatMoney(remainingBalance)}
                </dd>
              </div>
            </dl>

            {hasZeroMinimumWinners && (
              <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>Set minimum winners to at least 1 before publishing.</p>
              </div>
            )}

            {firstPlaceError && (
              <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{firstPlaceError}</p>
              </div>
            )}

            {announcementDateError && (
              <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{announcementDateError}</p>
              </div>
            )}

            {hasInsufficientFunds && (
              <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  Insufficient wallet balance. You need{' '}
                  <span className="font-semibold">{formatMoney(shortfall)}</span> more to publish
                  this campaign.
                </p>
              </div>
            )}

            <div className="space-y-2 pt-2">
              <Button
                className="w-full"
                disabled={cannotPublish || isSaving}
                isLoading={pendingAction === 'publish'}
                onClick={() => void handlePublish()}
              >
                {isEdit ? 'Update campaign' : 'Publish campaign'}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                disabled={isSaving}
                isLoading={pendingAction === 'draft'}
                onClick={() => void handleSaveDraft()}
              >
                {isEdit ? 'Save changes' : 'Save as draft'}
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
