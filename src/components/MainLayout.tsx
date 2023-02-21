import { useEffect, useState } from 'react'
import { XIcon } from 'lucide-react'

import { TOGGLE_PLUGIN_VISIBILITY } from '~lib/constants'

interface Props {
  children?: React.ReactNode
}

const MainLayout = ({ children }: Props) => {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const recvMsg = (msg: unknown) => {
      if (msg === TOGGLE_PLUGIN_VISIBILITY) setShow((prev) => !prev)
    }

    chrome.runtime.onMessage.addListener(recvMsg)
    return () => chrome.runtime.onMessage.removeListener(recvMsg)
  }, [])

  const [isDragging, setIsDragging] = useState(false)
  const [xTranslate, setXTranslate] = useState(0)
  const [yTranslate, setYTranslate] = useState(0)
  const [initialMousePosition, setInitialMousePosition] = useState({ x: null, y: null })
  const onMouseDown = ({ clientX, clientY }) => {
    setInitialMousePosition({ x: clientX, y: clientY })
    setIsDragging(true)
  }
  useEffect(() => {
    const onMouseMove = (e) => {
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

  return (
    <div
      data-theme="emerald"
      className="fixed top-4 right-4 rounded-md bg-black/50 p-1 font-sans text-gray-900 shadow"
      style={{ transform: `translate(${xTranslate}px,${yTranslate}px)` }}
    >
      {show && (
        <div
          style={{ resize: 'vertical' }}
          className="bg-base-100 max-h-[600px] w-[380px] overflow-y-auto overflow-x-clip rounded-md"
        >
          <div className="flex h-10 cursor-move items-center border-b border-gray-300 p-2" onMouseDown={onMouseDown}>
            <div className="inline-flex w-1/2 items-center justify-start">
              <h1>🔮 Farseer</h1>
            </div>

            <div className="inline-flex shrink-0 items-center gap-x-2">
              {/* <Button variant="link" size="xs">
                Btn 1
              </Button>
              <Button variant="link" size="xs">
                History
              </Button> */}
            </div>

            <div className="inline-flex w-1/2 items-center justify-end">
              <button
                className="btn btn-ghost btn-square btn-xs focus:outline-offset-0"
                onClick={() => {
                  setShow(false)
                }}
              >
                <XIcon size={20} />
              </button>
            </div>
          </div>

          <div className="p-3">{children}</div>
        </div>
      )}
    </div>
  )
}
export default MainLayout
