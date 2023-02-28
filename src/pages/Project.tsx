import { Disclosure, Transition } from '@headlessui/react'
import { createId } from '@paralleldrive/cuid2'
import { useStorage } from '@plasmohq/storage/hook'
import { useQuery } from '@tanstack/react-query'
import { ChevronRightIcon, FilePlus2Icon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, LoaderFunctionArgs, To, useNavigate, useParams } from 'react-router-dom'

import TextField from '~components/fields/TextField'
import { RESULT_STORAGE_KEY } from '~lib/constants'
import { tw } from '~lib/utils'
import { useIsKeypressed } from '~lib/utils/use-is-keypressed'
import {
  Q,
  queryClient,
  useCreateOutletMutation,
  useCreateProjectFieldMutation,
  useCreateProjectMutation,
  useDeleteProjectMutation,
  useSubmitRequestMutation,
  useUpdateProjectMutation,
} from '~queries'
import { GenerateRequestSchema, IGenerateRequest, OutletType } from '~schemas'

const projectQuery = (projectId: string) => Q.project.detail(projectId)

const ProjectPage = () => {
  const [result] = useStorage(RESULT_STORAGE_KEY)
  const navigate = useNavigate()
  const projectId = useParams().projectId!
  const {
    mutateAsync: submitRequest,
    isLoading: isSubmitting,
    isError: isSubmitError,
    error: submitError,
  } = useSubmitRequestMutation(true)
  const { data: project } = useQuery(projectQuery(projectId))
  const { data: projects } = useQuery(Q.project.list)

  const { mutateAsync: createField, isLoading: isCreatingField } = useCreateProjectFieldMutation()
  const { mutateAsync: createOutlet, isLoading: isCreatingOutlet } = useCreateOutletMutation()
  const { mutateAsync: deleteProject } = useDeleteProjectMutation()
  const { mutateAsync: duplicateProject, isLoading: isDuplicating } = useCreateProjectMutation()
  const { mutateAsync: updateProject } = useUpdateProjectMutation()

  const __skip_open_ai__ = useIsKeypressed('Shift') && process.env.NODE_ENV === 'development'

  const handleSubmit = async () => {
    if (!project) return

    // TODO clean this up - but basically we want to validate the data is filled in before passing to background
    const _data: IGenerateRequest = {
      fields: project.fields,
      __skip_open_ai__,
    }
    const data = GenerateRequestSchema.parse(_data)

    submitRequest(data)
    navigate(`/${projectId}/results`)
  }

  const handleAddField = async () => {
    const id = createId()
    await createField({
      projectId,
      field: {
        id,
        name: 'field_name',
        hint: 'What should this field contain?',
        refinements: [{ rule: '' }],
      },
    })
    navigate(`field/${id}`)
  }

  const handleAddOutlet = async () => {
    const id = createId()
    await createOutlet({
      projectId,
      outlet: {
        id,
        type: OutletType.Airtable,
        baseId: 'app123',
        tableId: 'table123',
        authToken: 'auth123',
      },
    })
    navigate(`outlet/${id}`)
  }

  const handleDeleteProject = async () => {
    const index = projects?.findIndex((p) => p.id === projectId) ?? 0
    deleteProject({ projectId })
    if (projects) navigate(`/${projects[index > 0 ? index - 1 : 0].id}`)
  }

  const handleDuplicateProject = async () => {
    if (!project) return
    const id = createId()
    await duplicateProject({ ...project, id })
    navigate(`/${id}`)
  }

  const handleRenameProject = async (value: string) => {
    if (!project) return
    updateProject({ ...project, name: value })
  }

  return (
    <div className="flex h-full w-full flex-col">
      <Section
        title="Fields"
        action={
          <button
            disabled={isCreatingField}
            type="button"
            data-tip="New Field"
            className={tw(
              'btn btn-xs btn-ghost btn-square tooltip tooltip-right flex justify-center',
              isCreatingField && 'loading',
            )}
            onClick={handleAddField}
          >
            <FilePlus2Icon size={16} />
          </button>
        }
      >
        <LinkList
          items={
            project?.fields.map((field) => ({ to: `field/${field.id}`, title: field.name, subtitle: field.hint })) ?? []
          }
        />
      </Section>

      <Section
        title="Exports"
        action={
          <button
            disabled={isCreatingOutlet}
            type="button"
            data-tip="New Outlet"
            className={tw(
              'btn btn-xs btn-ghost btn-square tooltip tooltip-right flex justify-center',
              isCreatingOutlet && 'loading',
            )}
            onClick={handleAddOutlet}
          >
            <FilePlus2Icon size={16} />
          </button>
        }
      >
        <LinkList items={project?.outlets.map((outlet) => ({ to: `outlet/${outlet.id}`, title: outlet.type })) ?? []} />
      </Section>

      <Section title="Settings">
        <div>
          <TextField
            key={project?.id}
            label="Project name"
            defaultValue={project?.name}
            className="input-xs"
            onBlur={(e) => {
              e.currentTarget.value && handleRenameProject(e.currentTarget.value)
            }}
          />
          <div className="space-x-1">
            <button
              type="button"
              disabled={isDuplicating}
              className={tw('btn btn-xs btn-secondary btn-outline', isDuplicating && 'loading')}
              onClick={handleDuplicateProject}
            >
              Duplicate
            </button>
            <button type="button" className="btn btn-xs btn-error btn-outline" onClick={handleDeleteProject}>
              Delete
            </button>
          </div>
        </div>
      </Section>

      <div className="mt-auto flex w-full justify-end gap-x-1">
        {result && (
          <Link to="/results" className="btn btn-sm btn-outline">
            Show Results
          </Link>
        )}
        <button
          disabled={isSubmitting || !project?.fields.length}
          type="submit"
          className={tw('btn btn-sm', isSubmitting && 'loading')}
          onClick={handleSubmit}
        >
          {__skip_open_ai__ ? 'Run (skip OpenAI)' : 'Run'}
        </button>
      </div>

      {isSubmitError && <p className="error text-red-700 ">{submitError as string}</p>}
    </div>
  )
}

export const loader = ({ params }: LoaderFunctionArgs) => {
  return queryClient.fetchQuery(projectQuery(params.projectId!))
}

export default ProjectPage

interface SectionProps {
  title: string
  action?: ReactNode
  children: ReactNode
}

const Section = ({ title, action, children }: SectionProps) => (
  <Disclosure>
    {({ open }) => (
      <>
        <Disclosure.Button as="div" className="flex cursor-default items-center gap-x-2">
          <div className="inline-flex cursor-pointer items-center">
            <ChevronRightIcon className={tw('h-5 w-5 transition-transform', open && 'rotate-90')} />
            <h2 className="select-none text-lg font-bold">{title}</h2>
          </div>
          {action}
        </Disclosure.Button>
        <Transition
          show={open}
          enter="transition duration-150 ease-out"
          enterFrom="transform scale-95 opacity-0"
          enterTo="transform scale-100 opacity-100"
          leave="transition duration-150 ease-out"
          leaveFrom="transform scale-100 opacity-100"
          leaveTo="transform scale-95 opacity-0"
        >
          <Disclosure.Panel>{children}</Disclosure.Panel>
        </Transition>
      </>
    )}
  </Disclosure>
)

interface LinkItem {
  to: To
  title: string
  subtitle?: string
}

const LinkListItem = ({ item: { to, title, subtitle } }: { item: LinkItem }) => (
  <li className="hover:bg-base-200">
    <Link to={to} className="flex justify-between py-1 px-2">
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        {subtitle && <p className="text-xs text-gray-700">{subtitle}</p>}
      </div>

      <div className="flex items-center">
        <ChevronRightIcon size={20} className="text-base-300 scale-y-150" />
      </div>
    </Link>
  </li>
)

const LinkList = ({ items }: { items: LinkItem[] }) => (
  <ul className="divide-base-200 max-h-[200px] divide-y overflow-y-auto">
    {items.map((item, idx) => (
      <LinkListItem key={`${item.title}-${idx}`} item={item} />
    ))}
  </ul>
)
