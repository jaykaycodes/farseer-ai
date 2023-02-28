import { useMemo } from 'react'
import { createId } from '@paralleldrive/cuid2'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeftIcon, FilePlus2Icon, Redo2, Trash2Icon, XIcon } from 'lucide-react'
import {
  Link,
  LoaderFunctionArgs,
  Outlet,
  redirect,
  useMatch,
  useMatches,
  useNavigate,
  useParams,
} from 'react-router-dom'

import { SelectList } from '~components/fields/SelectField'
import { useShowWindow } from '~lib/ShowWindowProvider'
import { tw } from '~lib/utils'
import { Q, queryClient, useCreateProjectMutation, useDeleteProjectMutation, useResetProjectsMutation } from '~queries'

const assertHandle = (handle: unknown): handle is Record<string, unknown> => Boolean(handle)
const projectsQuery = Q.project.list

const Layout = () => {
  const navigate = useNavigate()
  const { data: projects } = useQuery(projectsQuery)
  const projectId = useParams().projectId!
  const { setShow } = useShowWindow()
  const matches = useMatches()
  const rootMatch = useMatch('/:projectId')

  const { mutateAsync: createProject, isLoading: isCreatingProject } = useCreateProjectMutation()
  const handleAddProject = async () => {
    const projectId = createId()
    await createProject({
      id: projectId,
      name: 'My Project',
      fields: [],
      outlets: [],
    })
    navigate(`/${projectId}`)
  }

  const { mutateAsync: resetAllProjects } = useResetProjectsMutation()

  const { mutateAsync: deleteProject } = useDeleteProjectMutation()
  const handleDeleteProject = async () => {
    deleteProject({ projectId })
    navigate(`/${projects?.[0].id}` ?? '/')
  }

  const left = rootMatch ? (
    <h1 className="font-bold">
      <span className="text-sm">🔮</span> Farseer
    </h1>
  ) : (
    <Link to={`/${projectId}`} className="inline-flex items-center gap-x-1 text-sm">
      <ChevronLeftIcon size={12} /> Back
    </Link>
  )

  const middle = useMemo(() => {
    if (rootMatch) {
      const opts = projects?.map((p) => ({ value: p.id, label: p.name })) ?? []
      return (
        <div className="relative">
          <SelectList
            value={opts.find((o) => o.value === projectId)}
            options={opts}
            onChange={(o) => {
              navigate(`/${o.value}`)
            }}
            wrapperClassName="w-32"
            inputClassName="input-xs border-none text-sm leading-3"
          />
          <div className="absolute inset-y-0 left-full ml-2 flex items-center gap-x-2 pb-0.5">
            <button
              type="button"
              className={tw('tooltip tooltip-bottom', isCreatingProject && 'loading')}
              data-tip="New Project"
              onClick={handleAddProject}
            >
              <FilePlus2Icon size={16} />
            </button>
            {projects && projects.length > 1 && (
              <button
                type="button"
                className={tw('tooltip tooltip-bottom', isCreatingProject && 'loading')}
                data-tip="Delete Project"
                onClick={handleDeleteProject}
              >
                <Trash2Icon size={16} />
              </button>
            )}
            {process.env.NODE_ENV === 'development' && (
              <button
                type="button"
                className={tw('tooltip tooltip-bottom', isCreatingProject && 'loading')}
                data-tip="Reset Project"
                onClick={async () => {
                  const projects = await resetAllProjects('*')
                  navigate(`/${projects[0].id}` ?? '/')
                }}
              >
                <Redo2 size={16} />
              </button>
            )}
          </div>
        </div>
      )
    }
    const pageTitle = matches.reduce(
      (title, { handle }) => (assertHandle(handle) && typeof handle.title === 'string' ? handle.title : title),
      '',
    )

    return <h1 className="font-bold">{pageTitle}</h1>
  }, [matches, rootMatch, projects])

  return (
    <>
      <div className="flex h-10 items-center border-b border-gray-300 p-2 pt-0">
        {/* Left */}
        <div className="inline-flex h-full w-1/2 select-none items-center justify-start">{left}</div>

        {/* Middle */}
        <div className="inline-flex h-full shrink-0 items-center">{middle}</div>

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

      <div className="p-3">
        <Outlet />
      </div>
    </>
  )
}

export default Layout

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const projects = await queryClient.fetchQuery(projectsQuery)

  if (!params.projectId) {
    // TODO load last project id from storage
    console.log('redirecting to', projects[0].id)
    return redirect(`/${projects[0].id}`)
  }

  return projects
}
