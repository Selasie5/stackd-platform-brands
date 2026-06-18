import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { NewMessageModal } from '@/components/messages/new-message-modal'

interface MessagesContextValue {
  openNewMessage: () => void
  closeNewMessage: () => void
}

const MessagesContext = createContext<MessagesContextValue | null>(null)

export function MessagesProvider({ children }: { children: ReactNode }) {
  const [newMessageOpen, setNewMessageOpen] = useState(false)

  const value = useMemo(
    () => ({
      openNewMessage: () => setNewMessageOpen(true),
      closeNewMessage: () => setNewMessageOpen(false),
    }),
    []
  )

  return (
    <MessagesContext.Provider value={value}>
      {children}
      <NewMessageModal open={newMessageOpen} onClose={() => setNewMessageOpen(false)} />
    </MessagesContext.Provider>
  )
}

export function useMessagesActions() {
  const context = useContext(MessagesContext)
  if (!context) {
    throw new Error('useMessagesActions must be used within a MessagesProvider')
  }
  return context
}
