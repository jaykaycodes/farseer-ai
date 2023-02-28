import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeftIcon, FilePlus2Icon, RecycleIcon } from 'lucide-react'
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
import { makeExampleProject, tw } from '~lib/utils'
import { useIsKeypressed } from '~lib/utils/use-is-keypressed'
import { Q, queryClient, resetProjects, useCreateProjectMutation, useResetProjectsMutation } from '~queries'

const assertHandle = (handle: unknown): handle is Record<string, unknown> => Boolean(handle)
const projectsQuery = Q.project.list

const Layout = () => {
  const navigate = useNavigate()
  const { data: projects } = useQuery(projectsQuery)
  const projectId = useParams().projectId!
  const matches = useMatches()
  const rootMatch = useMatch('/:projectId')

  const showReset = useIsKeypressed('Shift') && process.env.NODE_ENV === 'development'

  const { mutateAsync: resetAllProjects } = useResetProjectsMutation()
  const { mutateAsync: createProject, isLoading: isCreatingProject } = useCreateProjectMutation()
  const handleAddProject = async () => {
    if (showReset) {
      const projects = await resetAllProjects('*')
      navigate(`/${projects[0].id}` ?? '/')
      return
    }

    const prj = makeExampleProject()
    await createProject(prj)
    navigate(`/${prj.id}`)
  }

  const left = rootMatch ? null : (
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
            wrapperClassName="w-44"
            optionsWrapperClassName="max-h-36 text-xs"
            inputClassName="input-xs border-none text-sm leading-3"
          />
          <div className="absolute inset-y-0 left-full ml-2 flex items-center gap-x-2 pb-0.5">
            <button
              type="button"
              className={tw('tooltip tooltip-bottom', isCreatingProject && 'loading')}
              data-tip={showReset ? 'RESET' : 'New Project'}
              onClick={handleAddProject}
            >
              {showReset ? <RecycleIcon size={16} /> : <FilePlus2Icon size={16} />}
            </button>
          </div>
        </div>
      )
    }
    const pageTitle = matches.reduce(
      (title, { handle }) => (assertHandle(handle) && typeof handle.title === 'string' ? handle.title : title),
      '',
    )

    return <h1 className="font-bold">{pageTitle}</h1>
  }, [matches, rootMatch, projects, showReset])

  return (
    <>
      <div className="flex h-10 w-full items-center border-b border-gray-200 p-2">
        {/* Left */}
        <div className="inline-flex h-full w-1/2 select-none items-center justify-start">{left}</div>

        {/* Middle */}
        <div className="inline-flex h-full shrink-0 items-center">{middle}</div>

        {/* Right */}
        <div className="inline-flex h-full w-1/2 items-center justify-end"></div>
      </div>

      <div className="grow p-3">
        <Outlet />
      </div>
    </>
  )
}

export default Layout

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const projects = await queryClient.fetchQuery({ ...projectsQuery, staleTime: Infinity })

  if (projects.length === 0) {
    await resetProjects()
    return redirect(`/${projects[0].id}`)
  } else if (!params.projectId || !projects.find((p) => p.id === params.projectId)) {
    // TODO load last project id from storage
    console.log('No projectId found! Redirecting to', projects[0].id)
    return redirect(`/${projects[0].id}`)
  }

  return projects
}
