import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'

import PostHogProvider from '../integrations/posthog/provider'

import appCss from '../styles.css?url'

import type { ApolloClientIntegration } from '@apollo/client-integration-tanstack-start'
import { ApolloProvider } from '@apollo/client/react'
import { apolloClient } from '../lib/apollo-client'

import { Toaster } from 'sonner'

interface MyRouterContext extends ApolloClientIntegration.RouterContext {}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Stackd Platform | Brand',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <PostHogProvider>
          <ApolloProvider client={apolloClient}>
            {children}
            {/* <TanStackDevtools
              config={{
                position: 'bottom-right',
              }}
              plugins={[
                {
                  name: 'Tanstack Router',
                  render: <TanStackRouterDevtoolsPanel />,
                },
                TanStackQueryDevtools,
              ]}
            /> */}
            <Toaster closeButton />
          </ApolloProvider>
        </PostHogProvider>
        <Scripts />
      </body>
    </html>
  )
}
