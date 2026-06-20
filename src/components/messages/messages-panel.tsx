import { useEffect, useMemo, useState } from 'react'
import { ConversationList } from '@/components/messages/conversation-list'
import { ConversationThread } from '@/components/messages/conversation-thread'
import { EmptyState } from '@/components/ui/empty-state'
import { useMe } from '@/hooks/use-auth'
import { useConversation, useMarkMessagesRead, useSendMessage } from '@/hooks/use-messaging'
import {
  DEMO_CONVERSATIONS,
  type ConversationPreview,
  type ThreadMessage,
} from '@/lib/messaging-utils'

function mergeMessages(serverMessages: ThreadMessage[], optimistic: ThreadMessage[]) {
  const serverIds = new Set(serverMessages.map((message) => message.id))
  const pending = optimistic.filter(
    (message) => message.clientId && !serverIds.has(message.id) && message.status !== 'sent'
  )

  return [...serverMessages, ...pending].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )
}

export function MessagesPanel() {
  const { data: meData } = useMe()
  const currentUserId = meData?.me?.id
  const [conversations, setConversations] = useState(DEMO_CONVERSATIONS)
  const [selected, setSelected] = useState<ConversationPreview | undefined>(DEMO_CONVERSATIONS[0])
  const [draft, setDraft] = useState('')
  const [optimisticMessages, setOptimisticMessages] = useState<ThreadMessage[]>([])
  const [pendingBodies, setPendingBodies] = useState<Record<string, string>>({})

  const { data, loading, refetch } = useConversation(
    selected?.referenceType,
    selected?.referenceId,
    { skip: !selected }
  )
  const { sendMessage, loading: sending } = useSendMessage()
  const { markRead } = useMarkMessagesRead()

  useEffect(() => {
    if (!selected) return
    void markRead(selected.referenceType, selected.referenceId)
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === selected.id ? { ...conversation, unreadCount: 0 } : conversation
      )
    )
  }, [selected, markRead])

  const serverMessages = useMemo(
    () => (data?.conversation ?? []).map((message) => ({ ...message, status: 'sent' as const })),
    [data?.conversation]
  )

  const threadMessages = useMemo(
    () => mergeMessages(serverMessages, optimisticMessages),
    [optimisticMessages, serverMessages]
  )

  const submitMessage = async (body: string, clientId: string, isRetry = false) => {
    if (!selected || !currentUserId) return

    if (!isRetry) {
      const optimistic: ThreadMessage = {
        id: clientId,
        clientId,
        senderId: currentUserId,
        recipientId: selected.creatorId,
        referenceType: selected.referenceType,
        referenceId: selected.referenceId,
        body,
        attachmentUrl: null,
        isRead: true,
        readAt: null,
        createdAt: new Date().toISOString(),
        status: 'sending',
      }
      setOptimisticMessages((current) => [...current, optimistic])
      setPendingBodies((current) => ({ ...current, [clientId]: body }))
    } else {
      setOptimisticMessages((current) =>
        current.map((message) =>
          message.clientId === clientId ? { ...message, status: 'sending' } : message
        )
      )
    }

    const result = await sendMessage({
      recipientId: selected.creatorId,
      body,
      referenceType: selected.referenceType,
      referenceId: selected.referenceId,
    })

    if (result) {
      setOptimisticMessages((current) =>
        current.filter((message) => message.clientId !== clientId)
      )
      setPendingBodies((current) => {
        const next = { ...current }
        delete next[clientId]
        return next
      })
      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === selected.id
            ? {
                ...conversation,
                lastMessagePreview: body,
                lastMessageAt: result.createdAt,
              }
            : conversation
        )
      )
      void refetch()
      return
    }

    setOptimisticMessages((current) =>
      current.map((message) =>
        message.clientId === clientId ? { ...message, status: 'failed' } : message
      )
    )
  }

  const handleSend = async () => {
    const body = draft.trim()
    if (!body || !selected) return

    setDraft('')
    await submitMessage(body, crypto.randomUUID())
  }

  const handleRetry = async (clientId: string) => {
    const body = pendingBodies[clientId]
    if (!body) return
    await submitMessage(body, clientId, true)
  }

  if (conversations.length === 0) {
    return (
      <div className="flex min-h-full items-center justify-center">
        <EmptyState
          title="No conversations yet"
          description="When creators engage with your campaigns, your message threads will appear here."
        />
      </div>
    )
  }

  return (
    <div className="flex min-h-full flex-1 overflow-hidden rounded-lg border border-zinc-200/70 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="w-80 shrink-0 border-r border-zinc-200/70">
        <ConversationList
          conversations={conversations}
          selectedId={selected?.id}
          onSelect={setSelected}
        />
      </div>
      <ConversationThread
        conversation={selected}
        messages={threadMessages}
        currentUserId={currentUserId}
        loading={loading}
        draft={draft}
        onDraftChange={setDraft}
        onSend={() => void handleSend()}
        onRetry={(clientId) => void handleRetry(clientId)}
        sending={sending}
      />
    </div>
  )
}
