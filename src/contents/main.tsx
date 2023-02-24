import { useEffect, useState } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import posthog from 'posthog-js'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'

import MainLayout from '~components/MainLayout'
import EditFieldPage, { loader as editFieldLoader } from '~contents/pages/EditField'
import EditOutletPage, { loader as editOutletLoader } from '~contents/pages/EditOutlet'
import HomePage, { loader as homeLoader } from '~contents/pages/Home'
import { TOGGLE_PLUGIN_VISIBILITY } from '~lib/constants'
import { queryClient } from '~queries'

import cssText from 'data-text:~tailwind.css'

export const router = createMemoryRouter([
  {
    path: '/',
    element: <HomePage />,
    loader: homeLoader,
  },
  {
    path: '/field/:fieldId',
    element: <EditFieldPage />,
    loader: editFieldLoader,
  },
  {
    path: '/outlet/:outletId',
    element: <EditOutletPage />,
    loader: editOutletLoader,
  },
])

export const getStyle = () => {
  const style = document.createElement('style')
  style.textContent = cssText
  return style
}

const PlasmoOverlay = () => {
  const [show, setShow] = useState(process.env.NODE_ENV === 'development')
  const [initialShow, setInitialShow] = useState(true)

  useEffect(() => {
    if (initialShow && process.env.NODE_ENV === 'production') {
      // services to set up on initial show
      posthog.init('phc_mJ3okP8NlaYiTig5EInaCIjcKCSXK8kv43EWrUcQxBh', {
        api_host: 'https://app.posthog.com',
        autocapture: false,
      })
      setInitialShow(false)
    }
  }, [show])

  useEffect(() => {
    const recvMsg = (msg: unknown) => {
      if (msg === TOGGLE_PLUGIN_VISIBILITY) setShow((prev) => !prev)
    }
    chrome.runtime.onMessage.addListener(recvMsg)
    return () => chrome.runtime.onMessage.removeListener(recvMsg)
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      {show && (
        <MainLayout handleClose={() => setShow(false)}>
          <RouterProvider router={router} />
        </MainLayout>
      )}
    </QueryClientProvider>
  )
}

export default PlasmoOverlay
