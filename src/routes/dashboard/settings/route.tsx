import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Settings</h1>
      <p className="text-slate-600">Manage your account settings.</p>
    </div>
  )
}
