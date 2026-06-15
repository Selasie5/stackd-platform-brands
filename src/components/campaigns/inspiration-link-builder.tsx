import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export type InspirationLink = {
  id: string
  label: string
  url: string
  kind: 'reference' | 'inspiration'
}

export function createInitialInspirationLinks(): InspirationLink[] {
  return [{ id: crypto.randomUUID(), label: '', url: '', kind: 'reference' }]
}

export function InspirationLinkBuilder({
  links,
  onChange,
}: {
  links: InspirationLink[]
  onChange: (links: InspirationLink[]) => void
}) {
  const addLink = () => {
    onChange([...links, { id: crypto.randomUUID(), label: '', url: '', kind: 'reference' }])
  }

  const updateLink = (
    id: string,
    field: keyof Pick<InspirationLink, 'label' | 'url' | 'kind'>,
    value: string
  ) => {
    onChange(
      links.map((item) =>
        item.id === id
          ? { ...item, [field]: field === 'kind' ? (value as InspirationLink['kind']) : value }
          : item
      )
    )
  }

  const removeLink = (id: string) => {
    if (links.length <= 1) return
    onChange(links.filter((item) => item.id !== id))
  }

  return (
    <div className="space-y-3">
      {links.map((link) => (
        <div key={link.id} className="space-y-2 rounded-lg border border-zinc-100 bg-zinc-50/40 p-3">
          <div
            className="flex gap-1 rounded-md border border-zinc-200 bg-white p-0.5"
            role="group"
            aria-label={`Link type for ${link.label || 'untitled link'}`}
          >
            {(['reference', 'inspiration'] as const).map((kind) => {
              const selected = link.kind === kind
              return (
                <button
                  key={kind}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => updateLink(link.id, 'kind', kind)}
                  className={cn(
                    'flex-1 rounded px-2 py-1.5 text-xs font-medium capitalize transition-colors',
                    selected
                      ? 'bg-primary text-primary-foreground'
                      : 'text-zinc-600 hover:bg-zinc-50'
                  )}
                >
                  {kind}
                </button>
              )
            })}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={link.label}
              onChange={(e) => updateLink(link.id, 'label', e.target.value)}
              placeholder="Label"
              className="sm:w-40"
              aria-label="Link label"
            />
            <Input
              value={link.url}
              onChange={(e) => updateLink(link.id, 'url', e.target.value)}
              placeholder="https://"
              className="flex-1"
              aria-label="Link URL"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="shrink-0"
              onClick={() => removeLink(link.id)}
              disabled={links.length <= 1}
              aria-label="Remove link"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={addLink}>
        <Plus className="h-4 w-4" />
        Add link
      </Button>
    </div>
  )
}
