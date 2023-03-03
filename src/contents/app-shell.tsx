import { useEffect, useState } from 'react'
import { throttle } from 'lodash-es'
import { XIcon } from 'lucide-react'

import { AppMessages } from '~lib/constants'
import { tw } from '~lib/utils'

import { APP_WINDOW_DIMS } from '../lib/constants'

import css from 'data-text:~tailwind.css'

export const getStyle = () => {
  const style = document.createElement('style')
  style.textContent = css
  return style
}

function AppShell() {
  const [show, setShow] = useState(process.env.NODE_ENV === 'development')
  const { x, y, onMouseDown, isDragging } = useDraggable()

  // Setup listener for messages from background script
  useEffect(() => {
    const recvMsg = throttle((msg: unknown) => {
      if (msg === AppMessages.TOGGLE_PLUGIN_VISIBILITY) setShow((p) => !p)
    }, 50)

    chrome.runtime.onMessage.addListener(recvMsg)
    return () => chrome.runtime.onMessage.removeListener(recvMsg)
  }, [])

  if (!show) return null

  return (
    <div
      data-theme="emerald"
      role="dialog"
      className="fixed top-4 right-4 rounded-md bg-black/20 p-1 font-sans text-gray-900 shadow"
      style={{ transform: `translate(${x}px,${y}px)` }}
    >
      {/* Container w/ drag handle */}
      <div
        className={tw(
          'bg-base-100 overflow-y-auto overflow-x-clip rounded-md',
          isDragging ? 'cursor-grabbing' : 'cursor-grab',
        )}
        onMouseDown={onMouseDown}
      >
        {/* Topbar */}
        <div className="bg-base-200 flex h-8 items-center border-b border-gray-200 p-1">
          {/* Left */}
          <div className="inline-flex h-full w-1/2 select-none items-center justify-start">
            <h1 className="text-[15px] font-bold">🔮 Farseer</h1>
          </div>

          {/* Right */}
          <div className="inline-flex h-full w-1/2 items-center justify-end">
            <button
              type="button"
              className="flex items-center focus:outline-offset-0"
              onClick={() => {
                setShow(false)
              }}
            >
              <XIcon size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <iframe
          title="Farseer AI"
          src={`chrome-extension://${chrome.runtime.id}/tabs/index.html`}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          style={{ ...APP_WINDOW_DIMS }}
          className={tw('select-none', isDragging && 'pointer-events-none')}
        />
      </div>
    </div>
  )
}

export default AppShell

function useDraggable() {
  const [xTranslate, setXTranslate] = useState(0)
  const [yTranslate, setYTranslate] = useState(0)
  const onMouseDown = ({ clientX, clientY }: { clientX: number; clientY: number }) => {
    setInitialMousePosition({ x: clientX, y: clientY })
    setIsDragging(true)
  }

  const [isDragging, setIsDragging] = useState(false)
  const [initialMousePosition, setInitialMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      setXTranslate(xTranslate + e.clientX - initialMousePosition.x)
      setYTranslate(yTranslate + e.clientY - initialMousePosition.y)
    }
    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove)
    }
    return () => window.removeEventListener('mousemove', onMouseMove)
  }, [isDragging, initialMousePosition])

  useEffect(() => {
    const onMouseUp = () => setIsDragging(false)
    window.addEventListener('mouseup', onMouseUp)
    return () => window.removeEventListener('mouseup', onMouseUp)
  }, [])

  return { x: xTranslate, y: yTranslate, onMouseDown, isDragging }
}
