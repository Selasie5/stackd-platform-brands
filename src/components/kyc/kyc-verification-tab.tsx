import * as React from 'react'
import {
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import {
  DocumentUploadSlot,
} from '@/components/kyc/document-upload-slot'
import { KycStatusBanner } from '@/components/kyc/kyc-status-banner'
import { KycVerificationTimeline } from '@/components/kyc/kyc-verification-timeline'
import type { UploadedDocument } from '@/components/kyc/document-upload-slot'
import { LoadingView } from '@/components/ui/view-state'
import { useMe } from '@/hooks/use-auth'
import { useMyKycApplication, useSubmitKyc } from '@/hooks/use-kyc'
import { uploadToCloudinary } from '@/lib/cloudinary'
import {
  BRAND_KYC_OPTIONAL_DOCUMENT_TYPES,
  BRAND_KYC_REQUIRED_DOCUMENT,
  canSubmitKyc,
  isKycComplete,
  resolveEffectiveKycStatus,
} from '@/lib/kyc'
import type { KycStatus } from '@/lib/kyc'

interface AdditionalDocumentDraft {
  id: string
  documentType: string
  note: string
  upload: UploadedDocument | null
}

function createDraft(): AdditionalDocumentDraft {
  return {
    id: crypto.randomUUID(),
    documentType: 'incorporation',
    note: '',
    upload: null,
  }
}

export function KycVerificationTab() {
  const { data: meData } = useMe()
  const { data: kycData, loading: kycLoading } = useMyKycApplication()
  const { submitKyc, loading: isSubmitting } = useSubmitKyc()

  const application = kycData?.myKycApplication
  const kycStatus = resolveEffectiveKycStatus(
    meData?.me?.brand?.kycStatus,
    application?.status
  )
  const canEdit = canSubmitKyc(kycStatus)

  const [requiredUpload, setRequiredUpload] = React.useState<UploadedDocument | null>(null)
  const [additionalDocuments, setAdditionalDocuments] = React.useState<AdditionalDocumentDraft[]>(
    []
  )
  const [applicantNote, setApplicantNote] = React.useState('')
  const [confirmedAccuracy, setConfirmedAccuracy] = React.useState(false)

  React.useEffect(() => {
    if (!canEdit) return
    setRequiredUpload(null)
    setAdditionalDocuments([])
    setApplicantNote('')
    setConfirmedAccuracy(false)
  }, [kycStatus, canEdit])

  const handleAdditionalChange = (id: string, upload: UploadedDocument | null) => {
    setAdditionalDocuments((prev) =>
      prev.map((item) => (item.id === id ? { ...item, upload } : item))
    )
  }

  const handleAdditionalNoteChange = (id: string, note: string) => {
    setAdditionalDocuments((prev) =>
      prev.map((item) => (item.id === id ? { ...item, note } : item))
    )
  }

  const handleAdditionalTypeChange = (id: string, documentType: string) => {
    setAdditionalDocuments((prev) =>
      prev.map((item) => (item.id === id ? { ...item, documentType } : item))
    )
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!requiredUpload) return

    const additionalWithUploads = additionalDocuments.filter((doc) => doc.upload)
    const documents = [
      {
        documentType: BRAND_KYC_REQUIRED_DOCUMENT.type,
        fileUrl: requiredUpload.fileUrl,
        fileName: requiredUpload.fileName,
      },
      ...additionalWithUploads.map((doc) => ({
        documentType: doc.documentType,
        fileUrl: doc.upload!.fileUrl,
        fileName: doc.upload!.fileName,
        note: doc.note.trim() || undefined,
      })),
    ]

    await submitKyc({
      documents,
      applicantNote: applicantNote.trim() || undefined,
    })
  }

  const canSubmit = Boolean(requiredUpload) && confirmedAccuracy

  if (kycLoading && !application && !meData?.me) {
    return <LoadingView label="Loading verification status…" tone="primary" />
  }

  return (
    <div className="space-y-5">
      {!isKycComplete(kycStatus) && (
        <KycStatusBanner status={kycStatus} application={application} />
      )}

      {application && (
        <KycVerificationTimeline status={kycStatus} application={application} />
      )}

      {canEdit && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <section className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">Required document</h3>
              <p className="mt-1 text-xs text-zinc-500">
                Upload one business registration or incorporation document to start verification.
              </p>
            </div>

            <DocumentUploadSlot
              label={BRAND_KYC_REQUIRED_DOCUMENT.label}
              description={BRAND_KYC_REQUIRED_DOCUMENT.description}
              required
              value={requiredUpload}
              onChange={setRequiredUpload}
              onUpload={uploadToCloudinary}
            />
          </section>

          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-zinc-900">Additional documents</h3>
                <p className="mt-1 text-xs text-zinc-500">
                  Optional — add incorporation certificates or any other supporting files.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 border-zinc-200 text-xs"
                onClick={() => setAdditionalDocuments((prev) => [...prev, createDraft()])}
              >
                <Plus className="h-3.5 w-3.5" />
                Add document
              </Button>
            </div>

            {additionalDocuments.length === 0 ? (
              <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50/60 px-4 py-8 text-center">
                <p className="text-xs text-zinc-500">No additional documents added yet.</p>
              </div>
            ) : (
              <div className="grid gap-3 lg:grid-cols-2">
                {additionalDocuments.map((doc, index) => {
                  const typeMeta =
                    BRAND_KYC_OPTIONAL_DOCUMENT_TYPES.find((item) => item.type === doc.documentType) ??
                    BRAND_KYC_OPTIONAL_DOCUMENT_TYPES[1]

                  return (
                    <div key={doc.id} className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <Label className="text-[11px] font-medium text-zinc-600">
                          Document type
                        </Label>
                        <button
                          type="button"
                          onClick={() =>
                            setAdditionalDocuments((prev) =>
                              prev.filter((item) => item.id !== doc.id)
                            )
                          }
                          className="text-[11px] font-medium text-zinc-400 transition-colors hover:text-red-500"
                        >
                          Remove
                        </button>
                      </div>
                      <Select
                        value={doc.documentType}
                        onChange={(value) => handleAdditionalTypeChange(doc.id, value)}
                        options={BRAND_KYC_OPTIONAL_DOCUMENT_TYPES.map((item) => ({
                          value: item.type,
                          label: item.label,
                        }))}
                        placeholder="Select document type"
                      />
                      <DocumentUploadSlot
                        label={`Additional document ${index + 1}`}
                        description={typeMeta.description}
                        note={doc.documentType === 'other' ? doc.note : undefined}
                        notePlaceholder="e.g. Tax identification certificate"
                        onNoteChange={
                          doc.documentType === 'other'
                            ? (note) => handleAdditionalNoteChange(doc.id, note)
                            : undefined
                        }
                        value={doc.upload}
                        onChange={(upload) => handleAdditionalChange(doc.id, upload)}
                        onUpload={uploadToCloudinary}
                      />
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          <div className="space-y-2">
            <Label htmlFor="applicant-note" className="text-xs font-semibold text-zinc-800">
              Note for reviewer (optional)
            </Label>
            <textarea
              id="applicant-note"
              value={applicantNote}
              onChange={(event) => setApplicantNote(event.target.value)}
              rows={3}
              placeholder="Add any context that may help us review your submission faster."
              className="w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm text-zinc-800 outline-none transition-[color,box-shadow] placeholder:text-zinc-400 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
          </div>

          <div className="flex flex-col items-start gap-4 pt-2">
            <div className="flex items-start gap-2.5">
              <Checkbox
                id="kyc-confirmation"
                checked={confirmedAccuracy}
                onCheckedChange={(checked) => setConfirmedAccuracy(checked === true)}
                className="mt-0.5 border-zinc-300"
              />
              <label
                htmlFor="kyc-confirmation"
                className="cursor-pointer text-xs leading-relaxed text-zinc-600"
              >
                I confirm these documents belong to my business and are accurate for
                verification.
              </label>
            </div>
            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={!canSubmit || isSubmitting}
              className="h-9 px-5 text-xs"
            >
              {kycStatus === 'not_started' ? 'Submit verification' : 'Resubmit documents'}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
