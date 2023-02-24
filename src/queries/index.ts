import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // We should only refetch when explicitly runs a query
      refetchOnWindowFocus: false,
      // Alert user of errors & let them decide what to do
      retry: false,
    },
  },
})

export { default as Q } from './_queries'
export * from './background.mutations'
export * from './project.mutations'
