import React, { useEffect, useState } from 'react'
import { throttle } from 'lodash-es'

import { TOGGLE_PLUGIN_VISIBILITY } from '~lib/constants'

interface ShowWindowState {
  show: boolean
  setShow: (show: boolean | ((previous: boolean) => boolean)) => void
}

const ShowWindowContext = React.createContext<ShowWindowState | undefined>(undefined)

export function ShowWindowProvider({ children }: { children: React.ReactNode }) {
  const [show, setShow] = useState(process.env.NODE_ENV === 'development')

  useEffect(() => {
    const recvMsg = throttle((msg: unknown) => {
      if (msg === TOGGLE_PLUGIN_VISIBILITY) setShow((p) => !p)
    }, 50)

    chrome.runtime.onMessage.addListener(recvMsg)
    return () => chrome.runtime.onMessage.removeListener(recvMsg)
  }, [])

  return (
    <ShowWindowContext.Provider
      value={{
        show,
        setShow,
      }}
    >
      {children}
    </ShowWindowContext.Provider>
  )
}

export function useShowWindow() {
  const context = React.useContext(ShowWindowContext)
  if (context === undefined) {
    throw new Error('useShowWindow must be used within a ShowWindowProvider')
  }

  return context
}
