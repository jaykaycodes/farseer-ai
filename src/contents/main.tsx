import { useEffect, useState } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'

import MainLayout from '~components/MainLayout'
import { TOGGLE_PLUGIN_VISIBILITY } from '~lib/constants'
import { queryClient } from '~lib/queries'
import FieldPage, { loader as fieldLoader } from '~pages/field'
import HomePage, { loader as homeLoader } from '~pages/home'

import cssText from 'data-text:~tailwind.css'

export const router = createMemoryRouter([
  {
    path: '/',
    element: <HomePage />,
    loader: homeLoader,
  },
  {
    path: '/field/:fieldId',
    element: <FieldPage />,
    loader: fieldLoader,
  },
])

export const getStyle = () => {
  const style = document.createElement('style')
  style.textContent = cssText
  return style
}

const PlasmoOverlay = () => {
  const [show, setShow] = useState(process.env.NODE_ENV === 'development')

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
