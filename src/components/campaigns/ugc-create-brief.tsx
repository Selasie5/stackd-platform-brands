import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  AlertCircle,
  ChevronLeft,
  Link2,
  Plus,
  Trash2,
  Upload,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DatePicker } from '@/components/ui/date-picker'
import { TimePicker } from '@/components/ui/time-picker'
import { Select } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { BriefField, BriefProse, BriefSection } from '@/components/campaigns/brief-field'
import {
  CPM_PLATFORM_OPTIONS,
  USAGE_RIGHTS_OPTIONS,
  VIDEO_TYPE_OPTIONS,
  textareaClassName,
} from '@/components/campaigns/campaign-constants'
import { useCreateUgcOrder, useSubmitOpportunityForApproval } from '@/hooks/use-opportunities'
import { buildCreateUgcOrderInput } from '@/lib/opportunity-mappers'
import { useWallet } from '@/contexts/wallet-context'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const PLATFORM_OPTIONS = [
  ...CPM_PLATFORM_OPTIONS,
  { value: 'any', label: 'Any platform' },
]

type ReferenceLink = { id: string; label: string; url: string }

const FIELD_ID = {
  title: 'ugc-campaign-title',
  productName: 'ugc-product-name',
  shortDescription: 'ugc-short-description',
  fullDescription: 'ugc-full-description',
  coverImage: 'ugc-cover-image',
  externalBriefLink: 'ugc-external-brief-link',
  videoType: 'ugc-video-type',
  videoLength: 'ugc-video-length',
  creatorsNeeded: 'ugc-creators-needed',
  flatRate: 'ugc-flat-rate',
  wordsToSay: 'ugc-words-to-say',
  wordsToAvoid: 'ugc-words-to-avoid',
  callToAction: 'ugc-call-to-action',
  requiredShots: 'ugc-required-shots',
  revisionLimit: 'ugc-revision-limit',
  postingRequired: 'ugc-posting-required',
  targetPlatform: 'ugc-target-platform',
  productDeliveryDetails: 'ugc-product-delivery-details',
  deadlineDate: 'ugc-deadline-date',
  deadlineTime: 'ugc-deadline-time',
} as const

export function UgcCreateBrief() {
  const navigate = useNavigate()
  const { currency, currencySymbol, availableBalance, formatMoney } = useWallet()
  const { saveUgcOrder, loading: saving } = useCreateUgcOrder()
  const { submitForApproval, loading: submitting } = useSubmitOpportunityForApproval()
  const [draftId, setDraftId] = useState<string | null>(null)
  const [pendingAction, setPendingAction] = useState<'draft' | 'publish' | null>(null)
  const [title, setTitle] = useState('')
  const [productName, setProductName] = useState('')
  const [shortDescription, setShortDescription] = useState('')
  const [fullDescription, setFullDescription] = useState('')
  const [externalBriefLink, setExternalBriefLink] = useState('')

  const [videoType, setVideoType] = useState('')
  const [videoLengthSeconds, setVideoLengthSeconds] = useState('')
  const [creatorsNeeded, setCreatorsNeeded] = useState('1')
  const [flatRate, setFlatRate] = useState('')
  const [wordsToSay, setWordsToSay] = useState('')
  const [wordsToAvoid, setWordsToAvoid] = useState('')
  const [callToAction, setCallToAction] = useState('')
  const [requiredShots, setRequiredShots] = useState('')
  const [revisionLimit, setRevisionLimit] = useState('2')
  const [postingRequired, setPostingRequired] = useState(false)
  const [targetPlatform, setTargetPlatform] = useState('')

  const [referenceLinks, setReferenceLinks] = useState<ReferenceLink[]>([
    { id: crypto.randomUUID(), label: '', url: '' },
  ])
  const [productDeliveryDetails, setProductDeliveryDetails] = useState('')
  const [coverImageName, setCoverImageName] = useState<string | null>(null)

  const [usageRights, setUsageRights] = useState<(typeof USAGE_RIGHTS_OPTIONS)[number]['id']>('organic')
  const [deadlineDate, setDeadlineDate] = useState('')
  const [deadlineTime, setDeadlineTime] = useState('')

  const creatorsCount = Math.max(1, Number(creatorsNeeded) || 0)
  const ratePerCreator = Math.max(0, Number(flatRate) || 0)
  const totalBudget = creatorsCount * ratePerCreator
  const remainingBalance = availableBalance - totalBudget
  const hasInsufficientFunds = totalBudget > availableBalance
  const shortfall = hasInsufficientFunds ? totalBudget - availableBalance : 0

  const addReferenceLink = () => {
    setReferenceLinks((prev) => [...prev, { id: crypto.randomUUID(), label: '', url: '' }])
  }

  const updateReferenceLink = (id: string, field: 'label' | 'url', value: string) => {
    setReferenceLinks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    )
  }

  const removeReferenceLink = (id: string) => {
    setReferenceLinks((prev) => (prev.length <= 1 ? prev : prev.filter((item) => item.id !== id)))
  }

  const buildInput = () =>
    buildCreateUgcOrderInput({
      title,
      productName,
      shortDescription,
      fullDescription,
      externalBriefLink,
      videoType,
      videoLengthSeconds,
      creatorsNeeded,
      flatRate,
      wordsToSay,
      wordsToAvoid,
      callToAction,
      requiredShots,
      revisionLimit,
      postingRequired,
      targetPlatform,
      productDeliveryDetails,
      usageRights,
      deadlineDate,
      deadlineTime,
      referenceLinks,
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
      const saved = await saveUgcOrder(result.input, draftId ?? undefined)
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
      const saved = await saveUgcOrder(result.input, draftId ?? undefined)
      if (!saved) return
      setDraftId(saved.id)
      const submitted = await submitForApproval('UGC_ORDER', saved.id)
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
              UGC Campaign Brief
            </h1>
            <BriefProse>
              Build a creator-ready brief below. This document will be shared with creators as
              your campaign instructions — write clearly, and fill in the structured fields where
              they appear in the flow.
            </BriefProse>
          </div>
        </header>

        <BriefSection
          title="Basics"
          description="Introduce the campaign and what you're asking creators to produce."
        >
          <BriefField id={FIELD_ID.title} label="Campaign title" required hint="A clear name creators will recognize.">
            <Input
              id={FIELD_ID.title}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summer launch testimonial series"
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
              placeholder="We're looking for authentic testimonials from brands using our analytics dashboard."
              className={textareaClassName('min-h-[88px]')}
              maxLength={500}
            />
            <p className="text-right text-[11px] text-zinc-400">{shortDescription.length}/500</p>
          </BriefField>

          <BriefField
            id={FIELD_ID.fullDescription}
            label="Full campaign description"
            required
            hint="The main narrative of your brief. Explain context, goals, and creative direction."
          >
            <textarea
              id={FIELD_ID.fullDescription}
              value={fullDescription}
              onChange={(e) => setFullDescription(e.target.value)}
              placeholder="Tell creators about your brand story, the product experience you want highlighted, and the tone you're going for..."
              className={textareaClassName('min-h-[180px]')}
            />
          </BriefField>

          <BriefField
            label="Cover image"
            hint="Optional hero image for the campaign listing."
          >
            <label
              htmlFor={FIELD_ID.coverImage}
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-200 bg-zinc-50/50 px-4 py-8 transition-colors hover:border-primary/40 hover:bg-blue-50/30"
            >
              <Upload className="h-5 w-5 text-zinc-400" />
              <span className="text-sm font-medium text-zinc-700">
                {coverImageName ?? 'Upload cover image'}
              </span>
              <span className="text-xs text-zinc-400">PNG or JPG, up to 5MB</span>
              <input
                id={FIELD_ID.coverImage}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={(e) => setCoverImageName(e.target.files?.[0]?.name ?? null)}
              />
            </label>
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
        </BriefSection>

        <BriefSection
          title="Video requirements"
          description="Define the deliverable specs and creative constraints for each creator."
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

            <BriefField id={FIELD_ID.creatorsNeeded} label="Number of creators needed" required>
              <Input
                id={FIELD_ID.creatorsNeeded}
                type="number"
                min={1}
                value={creatorsNeeded}
                onChange={(e) => setCreatorsNeeded(e.target.value)}
              />
            </BriefField>

            <BriefField
              id={FIELD_ID.flatRate}
              label="Flat rate per creator"
              required
              hint={`Currency: ${currency} (from wallet).`}
            >
              <div className="flex h-9 w-full overflow-hidden rounded-md border border-input bg-transparent focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 dark:bg-input/30">
                <span className="flex shrink-0 items-center border-r border-input bg-zinc-50 px-3 text-sm text-zinc-500 dark:bg-zinc-900/50">
                  {currencySymbol}
                </span>
                <Input
                  id={FIELD_ID.flatRate}
                  type="number"
                  min={0}
                  value={flatRate}
                  onChange={(e) => setFlatRate(e.target.value)}
                  placeholder="250"
                  className="rounded-none border-0 bg-transparent shadow-none focus-visible:border-transparent focus-visible:ring-0"
                />
              </div>
            </BriefField>
          </div>

          <BriefField id={FIELD_ID.wordsToSay} label="Words to say" hint="Key phrases or talking points creators should include.">
            <textarea
              id={FIELD_ID.wordsToSay}
              value={wordsToSay}
              onChange={(e) => setWordsToSay(e.target.value)}
              placeholder="Mention our free trial, highlight ease of setup, reference the mobile app..."
              className={textareaClassName()}
            />
          </BriefField>

          <BriefField id={FIELD_ID.wordsToAvoid} label="Words to avoid" hint="Terms, claims, or competitor names to stay away from.">
            <textarea
              id={FIELD_ID.wordsToAvoid}
              value={wordsToAvoid}
              onChange={(e) => setWordsToAvoid(e.target.value)}
              placeholder="Do not mention competitors by name. Avoid guaranteed ROI claims."
              className={textareaClassName()}
            />
          </BriefField>

          <BriefField id={FIELD_ID.callToAction} label="Call to action" required hint="What should viewers do after watching?">
            <Input
              id={FIELD_ID.callToAction}
              value={callToAction}
              onChange={(e) => setCallToAction(e.target.value)}
              placeholder="Visit stackd.com and start your free trial"
            />
          </BriefField>

          <BriefField id={FIELD_ID.requiredShots} label="Required shots" hint="List specific scenes, angles, or B-roll you need.">
            <textarea
              id={FIELD_ID.requiredShots}
              value={requiredShots}
              onChange={(e) => setRequiredShots(e.target.value)}
              placeholder="Opening hook with product on desk, screen recording of dashboard, closing CTA with logo..."
              className={textareaClassName()}
            />
          </BriefField>

          <div className="grid gap-6 sm:grid-cols-2">
            <BriefField id={FIELD_ID.revisionLimit} label="Revision limit" required hint="Maximum 3 revisions per creator.">
              <Select
                id={FIELD_ID.revisionLimit}
                value={revisionLimit}
                onChange={setRevisionLimit}
                options={[
                  { value: '0', label: 'No revisions' },
                  { value: '1', label: '1 revision' },
                  { value: '2', label: '2 revisions' },
                  { value: '3', label: '3 revisions' },
                ]}
              />
            </BriefField>

            <BriefField id={FIELD_ID.postingRequired} label="Posting required">
              <div className="flex h-9 cursor-pointer items-center gap-2.5 rounded-md border border-input px-3 text-sm dark:bg-input/30">
                <Checkbox
                  id={FIELD_ID.postingRequired}
                  checked={postingRequired}
                  onCheckedChange={(checked) => setPostingRequired(checked === true)}
                />
                <span className="text-zinc-700">Creator must post on their channel</span>
              </div>
            </BriefField>
          </div>

          {postingRequired && (
            <BriefField id={FIELD_ID.targetPlatform} label="Target platform" required>
              <Select
                id={FIELD_ID.targetPlatform}
                value={targetPlatform}
                onChange={setTargetPlatform}
                options={PLATFORM_OPTIONS}
                placeholder="Select platform"
              />
            </BriefField>
          )}
        </BriefSection>

        <BriefSection
          title="Brief and references"
          description="Give creators examples and explain how they'll receive your product."
        >
          <BriefField
            label="Reference video links"
            hint="Add inspiration videos with a short label for each."
          >
            <div className="space-y-3">
              {referenceLinks.map((link) => (
                <div key={link.id} className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    value={link.label}
                    onChange={(e) => updateReferenceLink(link.id, 'label', e.target.value)}
                    placeholder="Label"
                    className="sm:w-40"
                  />
                  <Input
                    value={link.url}
                    onChange={(e) => updateReferenceLink(link.id, 'url', e.target.value)}
                    placeholder="https://"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                    onClick={() => removeReferenceLink(link.id)}
                    disabled={referenceLinks.length <= 1}
                    aria-label="Remove reference link"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addReferenceLink}>
                <Plus className="h-4 w-4" />
                Add reference link
              </Button>
            </div>
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
              placeholder="We'll ship the product within 3 business days. Include your shipping address after acceptance. Digital access codes sent via email."
              className={textareaClassName()}
            />
          </BriefField>
        </BriefSection>

        <BriefSection
          title="Settings"
          description="Choose usage rights and set your campaign deadline."
        >
          <BriefField label="Usage rights package" required>
            <div className="grid gap-3 sm:grid-cols-3">
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

          <BriefField label="Deadline" required hint="When creators must deliver final content.">
            <div className="grid gap-3 sm:grid-cols-2">
              <DatePicker
                id={FIELD_ID.deadlineDate}
                value={deadlineDate}
                onChange={setDeadlineDate}
                placeholder="Select date"
                fromDate={new Date()}
              />
              <TimePicker
                id={FIELD_ID.deadlineTime}
                value={deadlineTime}
                onChange={setDeadlineTime}
                placeholder="Select time"
              />
            </div>
          </BriefField>
        </BriefSection>
      </article>

      <aside className="w-full shrink-0 xl:sticky xl:top-0 xl:w-80">
        <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">Budget summary</h3>
            <p className="mt-1 text-xs text-zinc-500">
              {formatMoney(ratePerCreator)} × {creatorsCount} creator
              {creatorsCount === 1 ? '' : 's'}
            </p>
          </div>

          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-zinc-500">Total budget</dt>
              <dd className="font-semibold text-zinc-900">{formatMoney(totalBudget)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500">Wallet balance</dt>
              <dd className="font-medium text-zinc-800">
                {formatMoney(availableBalance)}
              </dd>
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

          {hasInsufficientFunds && (
            <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                Insufficient wallet balance. You need{' '}
                <span className="font-semibold">{formatMoney(shortfall)}</span> more
                to publish this campaign.
              </p>
            </div>
          )}

          <div className="space-y-2 pt-2">
            <Button
              className="w-full"
              disabled={hasInsufficientFunds || isSaving}
              isLoading={pendingAction === 'publish'}
              onClick={() => void handlePublish()}
            >
              Publish campaign
            </Button>
            <Button
              variant="outline"
              className="w-full"
              disabled={isSaving}
              isLoading={pendingAction === 'draft'}
              onClick={() => void handleSaveDraft()}
            >
              Save as draft
            </Button>
          </div>
        </div>
      </aside>
    </div>
    </div>
  )
}

