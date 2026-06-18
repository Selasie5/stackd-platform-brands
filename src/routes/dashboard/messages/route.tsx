import { createFileRoute } from '@tanstack/react-router'
import { MessagesPanel } from '@/components/messages/messages-panel'

export const Route = createFileRoute('/dashboard/messages')({
  component: MessagesPage,
})

function MessagesPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <MessagesPanel />
    </div>
  )
}
