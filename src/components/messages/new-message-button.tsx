import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useMessagesActions } from '@/contexts/messages-context'

export function NewMessageButton() {
  const { openNewMessage } = useMessagesActions()

  return (
    <Button onClick={openNewMessage}>
      <Plus className="h-4 w-4" />
      New message
    </Button>
  )
}
