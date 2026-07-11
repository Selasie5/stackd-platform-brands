import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client'

const httpLink = new HttpLink({
  uri: `${import.meta.env.VITE_API_URL ?? 'https://stackd-platform-core.onrender.com'}/graphql`,
  credentials: 'include',
})

export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          ugcOrder: {
            read(_, { args, toReference }) {
              return toReference({ __typename: 'UgcOrder', id: args?.id })
            },
          },
          cpmDeal: {
            read(_, { args, toReference }) {
              return toReference({ __typename: 'CpmDeal', id: args?.id })
            },
          },
          contest: {
            read(_, { args, toReference }) {
              return toReference({ __typename: 'Contest', id: args?.id })
            },
          },
        },
      },
      UgcOrder: { keyFields: ['id'] },
      CpmDeal: { keyFields: ['id'] },
      Contest: { keyFields: ['id'] },
      BrandWallet: { keyFields: ['id'] },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
})
