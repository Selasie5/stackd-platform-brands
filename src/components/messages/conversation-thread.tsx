import { useRef } from 'react'
import { AlertCircle, Paperclip, RotateCcw, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LoadingView } from '@/components/ui/view-state'
import { EmptyState } from '@/components/ui/empty-state'
import {
  formatMessageTimestamp,
  formatReferenceLabel,
  getInitials,
  type ConversationPreview,
  type ThreadMessage,
} from '@/lib/messaging-utils'
import { cn } from '@/lib/utils'

function MessageBubble({
  message,
  isOwn,
  onRetry,
}: {
  message: ThreadMessage
  isOwn: boolean
  onRetry?: () => void
}) {
  const failed = message.status === 'failed'
  const sending = message.status === 'sending'

  return (
    <div className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
      <div className={cn('max-w-[75%]', isOwn ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
            isOwn
              ? 'rounded-br-md bg-primary text-primary-foreground'
              : 'rounded-bl-md bg-zinc-100 text-zinc-900',
            failed && 'ring-1 ring-red-200',
            sending && 'opacity-70'
          )}
        >
          {message.body}
        </div>
        <div
          className={cn(
            'mt-1 flex items-center gap-2 text-[11px] text-zinc-400',
            isOwn ? 'justify-end' : 'justify-start'
          )}
        >
          <span>{formatMessageTimestamp(message.createdAt)}</span>
          {sending ? <span>Sending…</span> : null}
          {failed ? (
            <>
              <span className="inline-flex items-center gap-1 text-red-600">
                <AlertCircle className="h-3 w-3" />
                Failed
              </span>
              {onRetry ? (
                <button
                  type="button"
                  onClick={onRetry}
                  className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                >
                  <RotateCcw className="h-3 w-3" />
                  Retry
                </button>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export function MessageInput({
  value,
  onChange,
  onSend,
  onAttach,
  disabled,
  sending,
}: {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  onAttach?: () => void
  disabled?: boolean
  sending?: boolean
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="border-t border-zinc-200 bg-white px-4 py-3">
      <form
        className="flex items-end gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          onSend()
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={() => {
            // Attachment upload will be wired when media upload is available.
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="shrink-0"
          disabled={disabled || sending}
          onClick={() => {
            onAttach?.()
            fileInputRef.current?.click()
          }}
          aria-label="Attach file"
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Write a message…"
          disabled={disabled || sending}
          className="min-h-10"
        />
        <Button
          type="submit"
          size="icon"
          className="shrink-0"
          disabled={disabled || sending || !value.trim()}
          isLoading={sending}
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}

export function ConversationThread({
  conversation,
  messages,
  currentUserId,
  loading,
  draft,
  onDraftChange,
  onSend,
  onRetry,
  sending,
}: {
  conversation?: ConversationPreview
  messages: ThreadMessage[]
  currentUserId?: string
  loading?: boolean
  draft: string
  onDraftChange: (value: string) => void
  onSend: () => void
  onRetry: (clientId: string) => void
  sending?: boolean
}) {
  if (!conversation) {
    return (
      <div className="flex h-full flex-1 items-center justify-center bg-white">
        <EmptyState
          title="Select a conversation"
          description="Choose a creator from the list to view your message thread."
          className="min-h-0 py-8"
        />
      </div>
    )
  }

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col bg-white">
      <div className="border-b border-zinc-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white">
            {getInitials(conversation.creatorName)}
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-zinc-900">
              {conversation.creatorName}
            </h2>
            <p className="truncate text-xs text-zinc-500">
              {formatReferenceLabel(conversation.referenceType)} · {conversation.campaignTitle}
            </p>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        {loading ? (
          <LoadingView label="Loading messages…" tone="primary" className="min-h-[240px] py-8" />
        ) : messages.length === 0 ? (
          <EmptyState
            compact
            embedded
            title="No messages yet"
            description="Send the first message to start this conversation."
            className="min-h-[240px] py-8"
          />
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageBubble
                key={message.clientId ?? message.id}
                message={message}
                isOwn={message.senderId === currentUserId}
                onRetry={
                  message.clientId && message.status === 'failed'
                    ? () => onRetry(message.clientId!)
                    : undefined
                }
              />
            ))}
          </div>
        )}
      </div>

      <MessageInput
        value={draft}
        onChange={onDraftChange}
        onSend={onSend}
        disabled={!conversation}
        sending={sending}
      />
    </div>
  )
}
