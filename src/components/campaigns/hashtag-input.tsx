import { useState } from 'react'
import { X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function normalizeHashtag(value: string) {
  const trimmed = value.trim().replace(/^#+/, '')
  return trimmed.toLowerCase()
}

export function HashtagInput({
  id,
  value,
  onChange,
  disabled = false,
  className,
}: {
  id: string
  value: string[]
  onChange: (tags: string[]) => void
  disabled?: boolean
  className?: string
}) {
  const [draft, setDraft] = useState('')

  const addTag = (raw: string) => {
    const tag = normalizeHashtag(raw)
    if (!tag) return
    if (value.includes(tag)) {
      setDraft('')
      return
    }
    onChange([...value, tag])
    setDraft('')
  }

  const removeTag = (tag: string) => {
    onChange(value.filter((item) => item !== tag))
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex gap-2">
        <Input
          id={id}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              addTag(draft)
            }
          }}
          placeholder="Add hashtag (e.g. stackd)"
          disabled={disabled}
          aria-describedby={`${id}-hint`}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => addTag(draft)}
          disabled={disabled || !draft.trim()}
        >
          Add
        </Button>
      </div>
      <p id={`${id}-hint`} className="text-[11px] text-zinc-400">
        Press Enter or Add to include a hashtag. The # prefix is optional.
      </p>
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label="Required hashtags">
          {value.map((tag) => (
            <li key={tag}>
              <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700">
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  disabled={disabled}
                  className="rounded-sm text-zinc-400 transition-colors hover:text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                  aria-label={`Remove hashtag ${tag}`}
                >
                  <X className="h-3 w-3" aria-hidden="true" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
