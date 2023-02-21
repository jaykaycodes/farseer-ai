import { useEffect, useState } from 'react'
import { XIcon } from 'lucide-react'

interface Props {
  handleClose: () => void
  children?: React.ReactNode
}

const MainLayout = ({ handleClose, children }: Props) => {
  const [isDragging, setIsDragging] = useState(false)
  const [xTranslate, setXTranslate] = useState(0)
  const [yTranslate, setYTranslate] = useState(0)
  const [initialMousePosition, setInitialMousePosition] = useState({ x: 0, y: 0 })
  const onMouseDown = ({ clientX, clientY }: { clientX: number; clientY: number }) => {
    setInitialMousePosition({ x: clientX, y: clientY })
    setIsDragging(true)
  }
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

  return (
    <div
      data-theme="emerald"
      className="fixed top-4 right-4 rounded-md bg-black/50 p-1 font-sans text-gray-900 shadow"
      style={{ transform: `translate(${xTranslate}px,${yTranslate}px)` }}
    >
      <div
        style={{ resize: 'vertical' }}
        className="bg-base-100 max-h-[420px] w-[380px] overflow-y-auto overflow-x-clip rounded-md"
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

          <div className="inline-flex w-1/2 justify-end">
            <button
              className="btn btn-ghost btn-square btn-xs flex items-center focus:outline-offset-0"
              onClick={handleClose}
            >
              <XIcon size={18} />
            </button>
          </div>
        </div>

        <div className="p-3">{children}</div>
      </div>
    </div>
  )
}
export default MainLayout
