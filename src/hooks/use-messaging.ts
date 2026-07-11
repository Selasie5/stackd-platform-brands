import { useMutation, useQuery } from '@apollo/client/react'
import { toast } from 'sonner'
import {
  CONVERSATION_QUERY,
  MARK_MESSAGES_READ_MUTATION,
  SEND_MESSAGE_MUTATION,
} from '@/graphql/messaging'
import type { Message, MessageReferenceType } from '@/lib/messaging-utils'
import { extractGqlError } from '@/lib/gql-error'

export function useConversation(
  referenceType?: MessageReferenceType,
  referenceId?: string,
  options?: { skip?: boolean }
) {
  return useQuery<{ conversation: Message[] }>(CONVERSATION_QUERY, {
    variables: {
      referenceType,
      referenceId,
      limit: 100,
    },
    skip: options?.skip || !referenceType || !referenceId,
    errorPolicy: 'ignore',
  })
}

export function useSendMessage() {
  const [mutate, { loading }] = useMutation<
    { sendMessage: Message },
    {
      input: {
        recipientId: string
        body: string
        referenceType?: MessageReferenceType
        referenceId?: string
        attachmentUrl?: string
      }
    }
  >(SEND_MESSAGE_MUTATION)

  const sendMessage = async (input: {
    recipientId: string
    body: string
    referenceType?: MessageReferenceType
    referenceId?: string
    attachmentUrl?: string
  }) => {
    try {
      const { data } = await mutate({ variables: { input } })
      return data?.sendMessage ?? null
    } catch (err) {
      toast.error(extractGqlError(err))
      return null
    }
  }

  return { sendMessage, loading }
}

export function useMarkMessagesRead() {
  const [mutate] = useMutation<
    { markMessagesRead: number },
    { referenceType: MessageReferenceType; referenceId: string }
  >(MARK_MESSAGES_READ_MUTATION)

  const markRead = async (referenceType: MessageReferenceType, referenceId: string) => {
    try {
      await mutate({ variables: { referenceType, referenceId } })
    } catch {
      // Non-blocking
    }
  }

  return { markRead }
}
