import { useEffect } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import posthog from 'posthog-js'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'

import AppShell from '~components/AppShell'
import { ShowWindowProvider, useShowWindow } from '~lib/ShowWindowProvider'
import EditFieldPage, { loader as editFieldLoader } from '~pages/EditField'
import EditOutletPage, { loader as editOutletLoader } from '~pages/EditOutlet'
import Layout from '~pages/Layout'
import OutputPage, { loader as outputLoader } from '~pages/Output'
import ProjectPage, { loader as projectLoader } from '~pages/Project'
import ProjectListPage, { loader as projectListLoader } from '~pages/ProjectList'
import { queryClient } from '~queries'
import type { IProject } from '~schemas'

import cssText from 'data-text:~tailwind.css'

export const router = createMemoryRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <ProjectListPage />,
        loader: projectListLoader,
      },
      {
        path: 'project/:projectId',
        loader: projectLoader,
        handle: {
          projectName: (data: IProject) => data.name,
        },
        children: [
          {
            index: true,
            element: <ProjectPage />,
          },
          {
            path: 'field/:fieldId',
            element: <EditFieldPage />,
            loader: editFieldLoader,
          },
          {
            path: 'outlet/:outletId',
            element: <EditOutletPage />,
            loader: editOutletLoader,
          },
        ],
      },
    ],
  },
  // Output renders its own layout
  {
    path: 'output',
    element: <OutputPage />,
    loader: outputLoader,
  },
])

export const getStyle = () => {
  const style = document.createElement('style')
  style.textContent = cssText
  return style
}

const App = () => {
  const { show } = useShowWindow()

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      // services to set up on initial show
      posthog.init('phc_mJ3okP8NlaYiTig5EInaCIjcKCSXK8kv43EWrUcQxBh', {
        api_host: 'https://app.posthog.com',
        autocapture: false,
      })
    }
  }, [])

  if (!show) return null

  return (
    <QueryClientProvider client={queryClient}>
      <AppShell>
        <RouterProvider router={router} />
      </AppShell>
    </QueryClientProvider>
  )
}

export default () => (
  <ShowWindowProvider>
    <App />
  </ShowWindowProvider>
)
