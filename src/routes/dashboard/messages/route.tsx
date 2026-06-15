import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/messages')({
  component: MessagesPage,
})

function MessagesPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Messages</h1>
      <p className="text-slate-600">Communicate with creators.</p>
    </div>
  )
}
