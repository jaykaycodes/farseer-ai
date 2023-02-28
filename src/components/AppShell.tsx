import { useEffect, useState } from 'react'

import { tw } from '~lib/utils'

interface Props {
  children: React.ReactNode
}

const AppShell = ({ children }: Props) => {
  const { x, y, onMouseDown, isDragging } = useDraggable()

  return (
    <div
      role="dialog"
      data-theme="emerald"
      className="fixed top-4 right-4 rounded-md bg-black/20 p-1 font-sans text-gray-900 opacity-60 shadow blur-[2px] transition-opacity hover:opacity-100 hover:blur-none"
      style={{ transform: `translate(${x}px,${y}px)` }}
    >
      <div className="bg-base-100 max-h-[500px] w-[400px] overflow-y-auto overflow-x-clip rounded-md">
        <div
          className={tw('absolute inset-x-0 top-0 h-3', isDragging ? 'cursor-grabbing' : 'cursor-grab')}
          onMouseDown={onMouseDown}
        />
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

  return { x: xTranslate, y: yTranslate, onMouseDown, isDragging }
}
