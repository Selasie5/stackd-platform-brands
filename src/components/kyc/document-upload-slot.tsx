import * as React from 'react'
import { FileText, Upload, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export interface UploadedDocument {
  file: File
  fileUrl: string
  fileName: string
}

interface DocumentUploadSlotProps {
  label: string
  description?: string
  accept?: string
  required?: boolean
  note?: string
  notePlaceholder?: string
  onNoteChange?: (note: string) => void
  value?: UploadedDocument | null
  onChange: (value: UploadedDocument | null) => void
  onUpload: (file: File) => Promise<string>
  disabled?: boolean
  className?: string
}

export function DocumentUploadSlot({
  label,
  description,
  accept = '.pdf,.png,.jpg,.jpeg,.webp',
  required = false,
  note,
  notePlaceholder,
  onNoteChange,
  value,
  onChange,
  onUpload,
  disabled = false,
  className,
}: DocumentUploadSlotProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = React.useState(false)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    try {
      setIsUploading(true)
      const fileUrl = await onUpload(file)
      onChange({ file, fileUrl, fileName: file.name })
    } catch {
      toast.error('Failed to upload file. Please try again.')
      onChange(null)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div
      className={cn(
        'rounded-xl border border-zinc-200 bg-white p-4',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Label className="text-xs font-semibold text-zinc-800">
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </Label>
          {description && (
            <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">{description}</p>
          )}
        </div>
        {value && !disabled && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
            aria-label={`Remove ${label}`}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="mt-4">
        {value ? (
          <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600">
              <FileText className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-zinc-800">{value.fileName}</p>
              <p className="text-[10px] text-zinc-400">Ready to submit</p>
            </div>
          </div>
        ) : (
          <button
            type="button"
            disabled={disabled || isUploading}
            onClick={() => inputRef.current?.click()}
            className={cn(
              'flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-300 bg-zinc-50/80 px-4 py-6 text-center transition-colors',
              disabled || isUploading
                ? 'cursor-not-allowed opacity-60'
                : 'cursor-pointer hover:border-blue-300 hover:bg-blue-50/40'
            )}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-zinc-400 ring-1 ring-zinc-200">
              <Upload className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-medium text-zinc-700">
                {isUploading ? 'Uploading…' : 'Click to upload'}
              </p>
              <p className="mt-0.5 text-[10px] text-zinc-400">PDF, PNG, or JPG up to 10MB</p>
            </div>
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          disabled={disabled || isUploading}
          onChange={handleFileChange}
        />
      </div>

      {onNoteChange && (
        <div className="mt-3 space-y-1.5">
          <Label className="text-[11px] font-medium text-zinc-600">Document description</Label>
          <Input
            value={note ?? ''}
            onChange={(event) => onNoteChange(event.target.value)}
            placeholder={notePlaceholder ?? 'Briefly describe this document'}
            disabled={disabled}
            className="border-zinc-200 text-xs"
          />
        </div>
      )}
    </div>
  )
}

interface SubmittedDocumentRowProps {
  label: string
  fileName?: string | null
  fileUrl: string
  note?: string | null
}

export function SubmittedDocumentRow({
  label,
  fileName,
  fileUrl,
  note,
}: SubmittedDocumentRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600">
          <FileText className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium text-zinc-800">{label}</p>
          <p className="truncate text-[10px] text-zinc-500">{fileName ?? 'Uploaded document'}</p>
          {note && <p className="mt-0.5 text-[10px] text-zinc-400">{note}</p>}
        </div>
      </div>
      <Button asChild variant="outline" size="sm" className="h-7 shrink-0 px-2.5 text-[11px]">
        <a href={fileUrl} target="_blank" rel="noreferrer">
          View
        </a>
      </Button>
    </div>
  )
}
