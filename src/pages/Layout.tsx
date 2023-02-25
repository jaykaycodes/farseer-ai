import { useMemo } from 'react'
import { ChevronLeftIcon, XIcon } from 'lucide-react'
import { Link, Outlet, useMatch, useMatches } from 'react-router-dom'

import { useShowWindow } from '~lib/ShowWindowProvider'

const assertHandle = (handle: unknown): handle is Record<string, unknown> => Boolean(handle)

const Layout = () => {
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
    <>
      <div className="flex h-10 items-center border-b border-gray-300 p-2 pt-0">
        <div className="inline-flex w-1/2 select-none items-center justify-start">{actionLabel}</div>

        {title && <div className="inline-flex shrink-0 select-none items-center gap-x-2 font-bold">{title}</div>}

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
    </>
  )
}

export default Layout
