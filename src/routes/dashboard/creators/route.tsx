import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/creators')({
  component: CreatorsPage,
})

function CreatorsPage() {
  return <div />
}
