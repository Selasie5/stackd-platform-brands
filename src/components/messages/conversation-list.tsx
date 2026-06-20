import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/ui/empty-state'
import {
  formatMessageTimestamp,
  getInitials,
  type ConversationPreview,
} from '@/lib/messaging-utils'
import { cn } from '@/lib/utils'

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
}: {
  conversations: ConversationPreview[]
  selectedId?: string
  onSelect: (conversation: ConversationPreview) => void
}) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return conversations

    return conversations.filter(
      (conversation) =>
        conversation.creatorName.toLowerCase().includes(normalized) ||
        conversation.campaignTitle.toLowerCase().includes(normalized) ||
        conversation.lastMessagePreview.toLowerCase().includes(normalized)
    )
  }, [conversations, query])

  return (
    <div className="flex h-full min-w-0 flex-col">
      <div className="border-b border-zinc-200/70 px-4 py-4">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search conversations"
            className="pl-9"
            aria-label="Search conversations"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="px-4 py-8">
            <EmptyState
              compact
              embedded
              title="No conversations found"
              description="Try a different search term or start a new message."
              className="min-h-0 py-4"
            />
          </div>
        ) : (
          <ul className="divide-y divide-zinc-100">
            {filtered.map((conversation) => {
              const isSelected = conversation.id === selectedId

              return (
                <li key={conversation.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(conversation)}
                    className={cn(
                      'flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors',
                      isSelected ? 'bg-zinc-50' : 'hover:bg-zinc-50/60'
                    )}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold text-white">
                      {getInitials(conversation.creatorName)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-medium text-zinc-900">
                          {conversation.creatorName}
                        </span>
                        <span className="shrink-0 text-[11px] text-zinc-400">
                          {formatMessageTimestamp(conversation.lastMessageAt)}
                        </span>
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-zinc-500">
                        {conversation.campaignTitle}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-zinc-400">
                        {conversation.lastMessagePreview}
                      </span>
                    </span>
                    {conversation.unreadCount > 0 ? (
                      <span className="mt-1 inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-zinc-900 px-1.5 text-[10px] font-semibold text-white">
                        {conversation.unreadCount}
                      </span>
                    ) : null}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
