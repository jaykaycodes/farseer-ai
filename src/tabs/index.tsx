import { createContext, useEffect } from 'react'
import { QueryClientProvider, useQuery } from '@tanstack/react-query'
import posthog from 'posthog-js'
import { createMemoryRouter, Outlet, RouterProvider, useLocation } from 'react-router-dom'

import { APP_WINDOW_DIMS } from '~lib/constants'
import EditFieldPage, { loader as editFieldLoader } from '~pages/EditField'
import EditOutletPage, { loader as editOutletLoader } from '~pages/EditOutlet'
import Layout, { loader as layoutLoader } from '~pages/Layout'
import ProjectPage, { loader as projectLoader } from '~pages/Project'
import ResultsPage, { loader as resultsLoader } from '~pages/Results'
import { Q, queryClient } from '~queries'

import '~tailwind.css'

export const ParentContext = createContext<string | null>(null)
const urlQuery = Q.background.url

const ParentProvider = () => {
  const { data, isInitialLoading, isSuccess } = useQuery(urlQuery)
  const location = useLocation()

  const url = data?.ok ? data.url : 'unavailable'
  // more custom properties breaking down the url
  const properties = { $current_url: location.pathname, $pathname: location.pathname, $host: url }

  useEffect(() => {
    if (isInitialLoading) return
    posthog.capture('$pageview', properties)
  }, [location, isInitialLoading])

  useEffect(() => {
    if (isSuccess) {
      posthog.capture('extension_open', properties)
    }
  }, [isSuccess])

  return (
    <ParentContext.Provider value={url}>
      <Outlet />
    </ParentContext.Provider>
  )
}

export const router = createMemoryRouter([
  {
    path: '/',
    element: <ParentProvider />,
    loader: layoutLoader,
    children: [
      {
        element: <Layout />,
        path: ':projectId',
        children: [
          {
            index: true,
            element: <ProjectPage />,
            loader: projectLoader,
          },
          {
            path: 'field/:fieldId',
            element: <EditFieldPage />,
            loader: editFieldLoader,
            handle: {
              title: 'Edit Field',
            },
          },
          {
            path: 'outlet/:outletId',
            element: <EditOutletPage />,
            loader: editOutletLoader,
            handle: {
              title: 'Edit Outlet',
            },
          },
        ],
      },
      // Results renders its own layout
      {
        path: ':projectId/results',
        element: <ResultsPage />,
        loader: resultsLoader,
      },
    ],
  },
])

const App = () => {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      // services to set up on initial show
      posthog.init('phc_mJ3okP8NlaYiTig5EInaCIjcKCSXK8kv43EWrUcQxBh', {
        api_host: 'https://app.posthog.com',
        autocapture: false,
        capture_performance: false,
        capture_pageview: false,
        capture_pageleave: false,
        debug: true,
      })
    }
  }, [])

  // useEffect(() => {
  //   const recvMsg = (
  //     msg: MessageEvent<{
  //       type: 'url'
  //       url: string
  //     }>,
  //     sender: chrome.runtime.MessageSender,
  //     sendResponse: (response?: unknown) => void,
  //   ) => {
  //     if (msg.type === 'url') {
  //       console.log(msg)
  //       console.log(sender.tab?.id)
  //       sendResponse({ ok: true })
  //     }
  //   }

  //   chrome.runtime.onMessage.addListener(recvMsg)
  //   // window.parent.postMessage('message', '*')
  //   return () => chrome.runtime.onMessage.removeListener(recvMsg)
  // }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ ...APP_WINDOW_DIMS }} className="flex flex-col overflow-auto">
        <RouterProvider router={router} />
      </div>
    </QueryClientProvider>
  )
}

export default App
