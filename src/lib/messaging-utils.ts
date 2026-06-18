export type MessageReferenceType = 'ugc_order' | 'cpm_deal' | 'contest' | 'dispute'

export type Message = {
  id: string
  senderId: string
  recipientId: string
  referenceType: MessageReferenceType | null
  referenceId: string | null
  body: string
  attachmentUrl: string | null
  isRead: boolean
  readAt: string | null
  createdAt: string
}

export type ThreadMessage = Message & {
  clientId?: string
  status?: 'sending' | 'sent' | 'failed'
}

export type ConversationPreview = {
  id: string
  creatorId: string
  creatorName: string
  referenceType: MessageReferenceType
  referenceId: string
  campaignTitle: string
  lastMessagePreview: string
  lastMessageAt: string
  unreadCount: number
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function formatMessageTimestamp(iso: string) {
  const date = new Date(iso)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()

  if (isToday) {
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  }

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function formatReferenceLabel(referenceType: MessageReferenceType) {
  switch (referenceType) {
    case 'ugc_order':
      return 'UGC campaign'
    case 'cpm_deal':
      return 'CPM deal'
    case 'contest':
      return 'Contest'
    case 'dispute':
      return 'Dispute'
    default:
      return 'Campaign'
  }
}

/** Demo previews until a conversations list API is available. */
export const DEMO_CONVERSATIONS: ConversationPreview[] = [
  {
    id: 'conv-1',
    creatorId: '00000000-0000-4000-8000-000000000001',
    creatorName: 'Ama Mensah',
    referenceType: 'ugc_order',
    referenceId: '00000000-0000-4000-8000-000000000101',
    campaignTitle: 'Summer product launch UGC',
    lastMessagePreview: 'I can resubmit the revised clip by tomorrow.',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    unreadCount: 2,
  },
  {
    id: 'conv-2',
    creatorId: '00000000-0000-4000-8000-000000000002',
    creatorName: 'Kwame Boateng',
    referenceType: 'cpm_deal',
    referenceId: '00000000-0000-4000-8000-000000000102',
    campaignTitle: 'CPM deal — skincare routine',
    lastMessagePreview: 'Thanks for approving the draft!',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    unreadCount: 0,
  },
  {
    id: 'conv-3',
    creatorId: '00000000-0000-4000-8000-000000000003',
    creatorName: 'Efua Addo',
    referenceType: 'contest',
    referenceId: '00000000-0000-4000-8000-000000000103',
    campaignTitle: 'Contest — best unboxing video',
    lastMessagePreview: 'Could you clarify the usage rights?',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
    unreadCount: 1,
  },
]
