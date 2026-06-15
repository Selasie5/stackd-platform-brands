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
import { Select } from '@/components/ui/select'
import { BriefField, BriefProse, BriefSection } from '@/components/campaigns/brief-field'
import {
  CPM_PLATFORM_OPTIONS,
  USAGE_RIGHTS_OPTIONS,
  calculateCpmMaxBudget,
  textareaClassName,
} from '@/components/campaigns/campaign-constants'
import { CpmCalculator } from '@/components/campaigns/cpm-calculator'
import {
  DualDeadlinePicker,
  getDeadlineOrderError,
} from '@/components/campaigns/dual-deadline-picker'
import { HashtagInput } from '@/components/campaigns/hashtag-input'
import { useCreateCpmDeal, useSubmitOpportunityForApproval } from '@/hooks/use-opportunities'
import { buildCreateCpmDealInput } from '@/lib/opportunity-mappers'
import { useWallet } from '@/contexts/wallet-context'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type ReferenceLink = { id: string; label: string; url: string }

const FIELD_ID = {
  title: 'cpm-campaign-title',
  productName: 'cpm-product-name',
  shortDescription: 'cpm-short-description',
  fullDescription: 'cpm-full-description',
  coverImage: 'cpm-cover-image',
  externalBriefLink: 'cpm-external-brief-link',
  targetPlatform: 'cpm-target-platform',
  hashtags: 'cpm-hashtags',
  requiredCaption: 'cpm-required-caption',
  brandTag: 'cpm-brand-tag',
  payPerThousand: 'cpm-pay-per-thousand',
  maxViews: 'cpm-max-views',
  creatorsNeeded: 'cpm-creators-needed',
  productDeliveryDetails: 'cpm-product-delivery-details',
  postingDate: 'cpm-posting-date',
  postingTime: 'cpm-posting-time',
  viewCountDate: 'cpm-view-count-date',
  viewCountTime: 'cpm-view-count-time',
} as const

export function CpmCreateBrief() {
  const navigate = useNavigate()
  const { currency, currencySymbol, availableBalance, formatMoney } = useWallet()
  const { saveCpmDeal, loading: saving } = useCreateCpmDeal()
  const { submitForApproval, loading: submitting } = useSubmitOpportunityForApproval()
  const [draftId, setDraftId] = useState<string | null>(null)
  const [pendingAction, setPendingAction] = useState<'draft' | 'publish' | null>(null)

  const [title, setTitle] = useState('')
  const [productName, setProductName] = useState('')
  const [shortDescription, setShortDescription] = useState('')
  const [fullDescription, setFullDescription] = useState('')
  const [externalBriefLink, setExternalBriefLink] = useState('')
  const [coverImageName, setCoverImageName] = useState<string | null>(null)

  const [targetPlatform, setTargetPlatform] = useState('')
  const [hashtags, setHashtags] = useState<string[]>([])
  const [requiredCaption, setRequiredCaption] = useState('')
  const [brandTag, setBrandTag] = useState('')
  const [payPerThousand, setPayPerThousand] = useState('')
  const [maxViewsPerCreator, setMaxViewsPerCreator] = useState('')
  const [creatorsNeeded, setCreatorsNeeded] = useState('1')

  const [referenceLinks, setReferenceLinks] = useState<ReferenceLink[]>([
    { id: crypto.randomUUID(), label: '', url: '' },
  ])
  const [productDeliveryDetails, setProductDeliveryDetails] = useState('')

  const [usageRights, setUsageRights] = useState<(typeof USAGE_RIGHTS_OPTIONS)[number]['id']>('organic')
  const [postingDate, setPostingDate] = useState('')
  const [postingTime, setPostingTime] = useState('')
  const [viewCountDate, setViewCountDate] = useState('')
  const [viewCountTime, setViewCountTime] = useState('')

  const payRate = Math.max(0, Number(payPerThousand) || 0)
  const maxViews = Math.max(0, Number(maxViewsPerCreator) || 0)
  const creatorsCount = Math.max(1, Number(creatorsNeeded) || 0)
  const totalBudget = calculateCpmMaxBudget(payRate, maxViews, creatorsCount)
  const remainingBalance = availableBalance - totalBudget
  const hasInsufficientFunds = totalBudget > availableBalance
  const shortfall = hasInsufficientFunds ? totalBudget - availableBalance : 0
  const hasZeroPayRate = payRate <= 0
  const deadlineOrderError = getDeadlineOrderError(
    postingDate,
    postingTime,
    viewCountDate,
    viewCountTime
  )
  const cannotPublish = hasInsufficientFunds || hasZeroPayRate || Boolean(deadlineOrderError)

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
    buildCreateCpmDealInput({
      title,
      productName,
      shortDescription,
      fullDescription,
      externalBriefLink,
      targetPlatform,
      hashtags,
      requiredCaption,
      brandTag,
      payPerThousand,
      maxViewsPerCreator,
      creatorsNeeded,
      productDeliveryDetails,
      usageRights,
      postingDate,
      postingTime,
      viewCountDate,
      viewCountTime,
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
      const saved = await saveCpmDeal(result.input, draftId ?? undefined)
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
      const saved = await saveCpmDeal(result.input, draftId ?? undefined)
      if (!saved) return
      setDraftId(saved.id)
      const submitted = await submitForApproval('CPM_DEAL', saved.id)
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
                CPM Deal Brief
              </h1>
              <BriefProse>
                Configure a cost-per-mille campaign. Creators are paid based on verified views
                up to your maximum per creator, with budget calculated automatically.
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
                placeholder="Summer launch CPM push"
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
                placeholder="Pay creators per 1,000 views for authentic product content."
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
                placeholder="Describe posting requirements, content style, and how views will be tracked..."
                className={textareaClassName('min-h-[180px]')}
              />
            </BriefField>

            <BriefField label="Cover image" hint="Optional hero image for the campaign listing.">
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
            title="Performance settings"
            description="Define platform, payout structure, and creator capacity."
          >
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
                placeholder="Check out Stackd — the analytics dashboard built for growing brands."
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

            <div className="grid gap-6 sm:grid-cols-2">
              <BriefField
                id={FIELD_ID.payPerThousand}
                label="Pay per 1,000 views"
                required
                hint={`Currency: ${currency} (from wallet).`}
              >
                <div className="flex h-9 w-full overflow-hidden rounded-md border border-input bg-transparent focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 dark:bg-input/30">
                  <span className="flex shrink-0 items-center border-r border-input bg-zinc-50 px-3 text-sm text-zinc-500 dark:bg-zinc-900/50">
                    {currencySymbol}
                  </span>
                  <Input
                    id={FIELD_ID.payPerThousand}
                    type="number"
                    min={0}
                    step="0.01"
                    value={payPerThousand}
                    onChange={(e) => setPayPerThousand(e.target.value)}
                    placeholder="5"
                    className="rounded-none border-0 bg-transparent shadow-none focus-visible:border-transparent focus-visible:ring-0"
                  />
                </div>
                {hasZeroPayRate && (
                  <p className="mt-1 text-xs text-red-600" role="alert">
                    Pay per 1,000 views must be greater than zero.
                  </p>
                )}
              </BriefField>

              <BriefField
                id={FIELD_ID.maxViews}
                label="Maximum payable views per creator"
                required
                hint="Cap on views that count toward payout for each creator."
              >
                <Input
                  id={FIELD_ID.maxViews}
                  type="number"
                  min={1}
                  value={maxViewsPerCreator}
                  onChange={(e) => setMaxViewsPerCreator(e.target.value)}
                  placeholder="100000"
                />
              </BriefField>

              <BriefField id={FIELD_ID.creatorsNeeded} label="Number of creators" required>
                <Input
                  id={FIELD_ID.creatorsNeeded}
                  type="number"
                  min={1}
                  value={creatorsNeeded}
                  onChange={(e) => setCreatorsNeeded(e.target.value)}
                />
              </BriefField>
            </div>

            <CpmCalculator
              payPerThousandViews={payRate}
              maxViewsPerCreator={maxViews}
              creatorsCount={creatorsCount}
              formatMoney={formatMoney}
            />
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
                      aria-label="Reference link label"
                    />
                    <Input
                      value={link.url}
                      onChange={(e) => updateReferenceLink(link.id, 'url', e.target.value)}
                      placeholder="https://"
                      className="flex-1"
                      aria-label="Reference link URL"
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
                placeholder="We'll ship the product within 3 business days..."
                className={textareaClassName()}
              />
            </BriefField>
          </BriefSection>

          <BriefSection
            title="Settings"
            description="Choose usage rights and set campaign deadlines."
          >
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

            <DualDeadlinePicker
              postingDate={postingDate}
              postingTime={postingTime}
              onPostingDateChange={setPostingDate}
              onPostingTimeChange={setPostingTime}
              viewCountDate={viewCountDate}
              viewCountTime={viewCountTime}
              onViewCountDateChange={setViewCountDate}
              onViewCountTimeChange={setViewCountTime}
              postingDateId={FIELD_ID.postingDate}
              postingTimeId={FIELD_ID.postingTime}
              viewCountDateId={FIELD_ID.viewCountDate}
              viewCountTimeId={FIELD_ID.viewCountTime}
            />
          </BriefSection>
        </article>

        <aside className="w-full shrink-0 xl:sticky xl:top-0 xl:w-80">
          <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">Budget summary</h3>
              <p className="mt-1 text-xs text-zinc-500">
                Max {formatMoney(payRate)} per 1,000 views × {maxViews.toLocaleString()} views ×{' '}
                {creatorsCount} creator{creatorsCount === 1 ? '' : 's'}
              </p>
            </div>

            <CpmCalculator
              payPerThousandViews={payRate}
              maxViewsPerCreator={maxViews}
              creatorsCount={creatorsCount}
              formatMoney={formatMoney}
            />

            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-zinc-500">Max campaign budget</dt>
                <dd className="font-semibold text-zinc-900">{formatMoney(totalBudget)}</dd>
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

            {hasZeroPayRate && (
              <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>Set a pay rate greater than zero before publishing.</p>
              </div>
            )}

            {deadlineOrderError && (
              <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{deadlineOrderError}</p>
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
