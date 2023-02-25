import { useEffect, useMemo, useState } from 'react'
import { ChevronLeftIcon, XIcon } from 'lucide-react'
import { Link, Outlet, useMatch, useMatches } from 'react-router-dom'

import { useShowWindow } from '~lib/ShowWindowProvider'

const assertHandle = (handle: unknown): handle is Record<string, unknown> => Boolean(handle)

const Layout = () => {
  const { x, y, onMouseDown } = useDraggable()
  const { setShow } = useShowWindow()
  const matches = useMatches()
  const projectRootMatch = useMatch('project/:projectId')
  const isRoot = matches.every((m) => m.pathname === '/')

  const backPath = projectRootMatch ? '/' : matches[matches.length - 2]?.pathname

  const actionLabel = isRoot ? (
    <h1 className="text-lg font-bold">🔮 Farseer</h1>
  ) : (
    <Link to={backPath} className="inline-flex items-center gap-x-1">
      <ChevronLeftIcon size={16} /> {projectRootMatch ? 'Projects' : 'Back'}
    </Link>
  )

  const title = useMemo(() => {
    if (isRoot) return null

    const handles = matches.map(({ handle, data }) => {
      if (assertHandle(handle)) {
        if (typeof handle.projectName === 'function') return handle.projectName(data) as string
        else if (typeof handle.projectName === 'string') return handle.projectName
      }
      return null
    })
    const projectName = handles.filter(Boolean)[0]

    return projectName
    // const lastMatch = matches[matches.length - 1]
    // const handle = lastMatch.handle as { title: string | ((data: any) => string) | undefined } | undefined
    // return typeof handle?.title === 'function' ? handle.title(lastMatch.data) : handle?.title
  }, [matches])

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
        <div className="flex h-10 cursor-move items-center border-b border-gray-300 p-2" onMouseDown={onMouseDown}>
          <div className="inline-flex w-1/2 items-center justify-start">{actionLabel}</div>

          {title && <div className="inline-flex shrink-0 items-center gap-x-2 font-bold">{title}</div>}

          <div className="inline-flex w-1/2 justify-end">
            <button
              className="btn btn-ghost btn-square btn-xs flex items-center focus:outline-offset-0"
              onClick={() => {
                setShow(false)
              }}
            >
              <XIcon size={18} />
            </button>
          </div>
        </div>

        <div className="p-3">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default Layout

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
