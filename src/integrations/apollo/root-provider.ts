import { apolloClient } from '../../lib/apollo-client'

export function getContext() {
  return {
    apolloClient,
    preloadQuery: true as const,
  }
}
