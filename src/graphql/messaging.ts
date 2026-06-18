import { gql } from '@apollo/client'

export const CONVERSATION_QUERY = gql`
  query Conversation($referenceType: MessageReferenceType!, $referenceId: ID!, $limit: Int) {
    conversation(referenceType: $referenceType, referenceId: $referenceId, limit: $limit) {
      id
      senderId
      recipientId
      referenceType
      referenceId
      body
      attachmentUrl
      isRead
      readAt
      createdAt
    }
  }
`

export const SEND_MESSAGE_MUTATION = gql`
  mutation SendMessage($input: SendMessageInput!) {
    sendMessage(input: $input) {
      id
      senderId
      recipientId
      referenceType
      referenceId
      body
      attachmentUrl
      isRead
      readAt
      createdAt
    }
  }
`

export const MARK_MESSAGES_READ_MUTATION = gql`
  mutation MarkMessagesRead($referenceType: MessageReferenceType!, $referenceId: ID!) {
    markMessagesRead(referenceType: $referenceType, referenceId: $referenceId)
  }
`
