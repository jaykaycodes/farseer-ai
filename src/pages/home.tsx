import { createId } from '@paralleldrive/cuid2'
import { useQuery } from '@tanstack/react-query'
import { ChevronRightIcon, EditIcon, Trash2Icon } from 'lucide-react'
import { Link, LoaderFunctionArgs, useNavigate } from 'react-router-dom'

import {
  useCreateOutletMutation,
  useCreateProjectFieldMutation,
  useDeleteProjectFieldMutation,
  useSubmitRequestMutation,
} from '~lib/mutations'
import { DEFAULT_PROJECT_ID, Q, queryClient } from '~lib/queries'
import type { IOutlet, IOutputField } from '~lib/schemas'
import { doc2HTMLString, tw } from '~lib/utils'

const projectQuery = Q.project.detail(DEFAULT_PROJECT_ID)

const HomePage = () => {
  const navigate = useNavigate()
  const { data: project } = useQuery(projectQuery)
  const { mutateAsync: submitRequest, isLoading: isSubmitting, data: output } = useSubmitRequestMutation()
  const { mutateAsync: createField, isLoading: isCreatingField } = useCreateProjectFieldMutation()
  const { mutateAsync: createOutlet, isLoading: isCreatingOutlet } = useCreateOutletMutation()
  const { mutateAsync: deleteField } = useDeleteProjectFieldMutation()

  const handleSubmit = async () => {
    if (!project) return

    await submitRequest({
      content: doc2HTMLString(document),
      outputFields: project.fields,
    })

    // TODO: add output to execution history & navigate to it
  }

  const handleAddField = async () => {
    const id = createId()
    await createField({
      projectId: DEFAULT_PROJECT_ID,
      field: {
        id,
        name: 'field_name',
        hint: 'What should this field contain?',
      },
    })
    navigate(`/field/${id}`)
  }

  const handleDeleteField = async (fieldId: string) => {
    deleteField({ projectId: DEFAULT_PROJECT_ID, fieldId })
  }

  const handleAddOutlet = async () => {
    const id = createId()
    await createOutlet({
      projectId: DEFAULT_PROJECT_ID,
      outlet: {
        id,
        outlet: 'airtable',
        baseId: 'app123',
        tableId: 'table123',
      },
    })
    navigate(`/outlet/${id}`)
  }

  // const [sendingToOutlet, setSendingToOutlet] = useState(false)

  // const sendToOutlet = async () => {
  //   setSendingToOutlet(true)
  //   const outlet = 'airtable'
  //   const pageURL = new URL(window.location.href)
  //   const url = pageURL.href

  //   const res = await sendToBackground<IOutletRequest, IOutletResponse>({
  //     name: 'sendToOutlet',
  //     body: {
  //       outlet,
  //       url,
  //       output: JSON.parse(output!),
  //     },
  //   })

  //   setSendingToOutlet(false)

  //   if ('error' in res) {
  //     console.error(res.error)
  //     return
  //   } else if ('ok' in res) {
  //     if (process.env.NODE_ENV === 'development') {
  //       console.log('Did the record get sent successfully? ')
  //       console.log(res.ok)
  //     }
  //   }
  // }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Fields</h2>
        <div>
          <button
            disabled={isCreatingField}
            type="button"
            className={tw('btn btn-xs btn-link', isCreatingField && 'loading')}
            onClick={handleAddField}
          >
            + Add Field
          </button>
        </div>
      </div>

      <ul className="divide-base-200 my-1 divide-y overflow-y-auto">
        {project?.fields.map((field) => (
          <FieldListItem
            key={field.id}
            field={field}
            onDelete={project.fields.length > 1 ? () => handleDeleteField(field.id) : undefined}
          />
        ))}
      </ul>

      <div className="mt-3 flex w-full justify-end gap-x-1">
        <button
          disabled={isSubmitting || !project?.fields.length}
          type="submit"
          className={tw('btn btn-sm', isSubmitting && 'loading')}
          onClick={handleSubmit}
        >
          Run
        </button>
      </div>

      {output && (
        <div className="mt-5">
          <h3>Output</h3>
          <div className="h-36 w-full overflow-y-auto rounded-lg border border-dashed border-gray-400 p-2">
            <pre>{JSON.stringify(JSON.parse(output), null, 2)}</pre>
          </div>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Exports</h2>
            <div>
              <button
                disabled={isCreatingOutlet}
                type="button"
                className={tw('btn btn-xs btn-link', isCreatingOutlet && 'loading')}
                onClick={handleAddOutlet}
              >
                + Add Export
              </button>
            </div>
          </div>

          <ul className="divide-base-200 my-1 divide-y overflow-y-auto">
            {project?.outlets.map((outlet) => (
              <OutletListItem
                key={outlet.id}
                outlet={outlet}
                // onDelete={project.fields.length > 1 ? () => handleDeleteField(field.id) : undefined}
              />
            ))}
          </ul>
          <div className="mt-2 flex justify-end">
            <button
            // disabled={sendingToOutlet}
            // onClick={async () => await sendToOutlet()}
            // className={tw('btn btn-sm', sendingToOutlet && 'loading')}
            >
              Export
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export const loader = ({ params: _ }: LoaderFunctionArgs) => {
  return queryClient.fetchQuery(projectQuery)
}

export default HomePage

interface FieldListItemProps {
  field: IOutputField
  onDelete?: () => void
}

const _FieldListItemActionBar = ({ field, onDelete }: FieldListItemProps) => (
  <li className="flex items-center justify-between p-2">
    <Link to={`/field/${field.id}`}>
      <h3 className="text-sm font-semibold">{field.name}</h3>
      <p className="text-xs text-gray-700">{field.hint}</p>
    </Link>

    <div className="inline-flex gap-x-3">
      {onDelete && (
        <button type="button" className="text-error" onClick={onDelete}>
          <Trash2Icon size="16" />
        </button>
      )}
      <Link to={`/field/${field.id}`}>
        <EditIcon size="16" />
      </Link>
    </div>
  </li>
)

const FieldListItem = ({ field }: FieldListItemProps) => (
  <li className="hover:bg-base-200">
    <Link to={`/field/${field.id}`} className="flex justify-between p-2">
      <div>
        <h3 className="text-sm font-semibold">{field.name}</h3>
        <p className="text-xs text-gray-700">{field.hint}</p>
      </div>

      <div className="flex items-center gap-x-1">
        <ChevronRightIcon size={20} className="text-base-300 scale-y-150" />
      </div>
    </Link>
  </li>
)

interface OutletListItemProps {
  outlet: IOutlet
}

const OutletListItem = ({ outlet }: OutletListItemProps) => (
  <li className="hover:bg-base-200">
    <Link to={`/outlet/${outlet.id}`} className="flex justify-between p-2">
      <div>
        <h3 className="text-sm font-semibold">{outlet.outlet}</h3>
      </div>

      <div className="flex items-center gap-x-1">
        <ChevronRightIcon size={20} className="text-base-300 scale-y-150" />
      </div>
    </Link>
  </li>
)
