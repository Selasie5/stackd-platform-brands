import { QueryClient } from '@tanstack/react-query'
import { apolloClient } from '../../lib/apollo-client'

export function getContext() {
  const queryClient = new QueryClient()

  return {
    queryClient,
    apolloClient,
    preloadQuery: true as const,
  }
}
export default function TanstackQueryProvider() {}
