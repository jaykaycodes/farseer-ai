import { useEffect, useState } from 'react'

interface Props {
  children: React.ReactNode
}

const AppShell = ({ children }: Props) => {
  const { x, y, onMouseDown } = useDraggable()

  return (
    <div
      data-theme="emerald"
      className="fixed top-4 right-4 rounded-md bg-black/50 p-1 font-sans text-gray-900 shadow"
      style={{ transform: `translate(${x}px,${y}px)` }}
    >
      <div
        style={{ resize: 'vertical' }}
        className="bg-base-100 max-h-[420px] w-[380px] overflow-y-auto overflow-x-clip rounded-md"
      >
        <div className="h-2 w-full cursor-move" onMouseDown={onMouseDown} />

        {children}
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

  return { x: xTranslate, y: yTranslate, onMouseDown }
}
