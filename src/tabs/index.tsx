import { useEffect } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'

import { initAnalytics } from '~lib/analytics'
import { APP_WINDOW_DIMS } from '~lib/constants'
import EditFieldPage, { loader as editFieldLoader } from '~pages/EditField'
import EditOutletPage, { loader as editOutletLoader } from '~pages/EditOutlet'
import Layout, { loader as layoutLoader } from '~pages/Layout'
import ProjectPage, { loader as projectLoader } from '~pages/Project'
import ResultsPage, { loader as resultsLoader } from '~pages/Results'
import { queryClient } from '~queries'

import '~tailwind.css'

export const router = createMemoryRouter([
  {
    path: '/',
    element: <Layout />,
    loader: layoutLoader,
    children: [
      {
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
    ],
  },
  // Results renders its own layout
  {
    path: ':projectId/results',
    element: <ResultsPage />,
    loader: resultsLoader,
  },
])

const App = () => {
  useEffect(initAnalytics, [])

  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ ...APP_WINDOW_DIMS }} className="flex flex-col overflow-auto">
        <RouterProvider router={router} />
      </div>
    </QueryClientProvider>
  )
}

export default App
