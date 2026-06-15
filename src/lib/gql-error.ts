export function extractGqlError(error: unknown): string {
  if (!error || typeof error !== 'object') return 'An unexpected error occurred.'
  if ('graphQLErrors' in error) {
    const gqlErrors = (error as { graphQLErrors: Array<{ message: string }> }).graphQLErrors
    if (gqlErrors.length > 0) return gqlErrors[0].message
  }
  if ('message' in error && typeof error.message === 'string') {
    return error.message
  }
  return 'An unexpected error occurred.'
}
