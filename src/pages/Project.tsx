import { createId } from '@paralleldrive/cuid2'
import { useQuery } from '@tanstack/react-query'
import { ChevronRightIcon } from 'lucide-react'
import { Link, LoaderFunctionArgs, useNavigate, useParams } from 'react-router-dom'

import { getSensibleParser4URL } from '~lib/parsers/utils'
import { useOutput } from '~lib/storage'
import { tw } from '~lib/utils'
import {
  Q,
  queryClient,
  useCreateOutletMutation,
  useCreateProjectFieldMutation,
  useDeleteProjectFieldMutation,
  useSubmitRequestMutation,
} from '~queries'
import { GenerateRequestSchema, IFieldConfig, IGenerateRequest, IOutletConfig, OutletType } from '~schemas'

const projectQuery = (projectId: string) => Q.project.detail(projectId)

const ProjectPage = () => {
  const navigate = useNavigate()
  const projectId = useParams().projectId!
  const {
    mutateAsync: submitRequest,
    isLoading: isSubmitting,
    isError: isSubmitError,
    error: submitError,
  } = useSubmitRequestMutation()
  const { data: project } = useQuery(projectQuery(projectId))
  const { mutateAsync: createField, isLoading: isCreatingField } = useCreateProjectFieldMutation()
  const { mutateAsync: createOutlet, isLoading: isCreatingOutlet } = useCreateOutletMutation()
  const { mutateAsync: deleteField } = useDeleteProjectFieldMutation()

  const [output] = useOutput()

  const handleSubmit = async () => {
    if (!project) return

    // store parser manual override for project
    const parser = getSensibleParser4URL(new URL(window.location.href))
    const html4Prompt = parser.doc2Html4Prompt(document)

    if (process.env.NODE_ENV === 'development') console.log(html4Prompt)

    // TODO clean this up - but basically we want to validate the data is filled in before passing to background
    const _data: IGenerateRequest = { content: html4Prompt, fields: project.fields }
    const data = GenerateRequestSchema.parse(_data)

    await submitRequest(data)

    // TODO: add output to execution history & navigate to it
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

  const handleDeleteField = async (fieldId: string) => {
    deleteField({ projectId, fieldId })
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
      },
    })
    navigate(`outlet/${id}`)
  }

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

      <div className="mt-3 flex w-full justify-end gap-x-1">
        {output && (
          <Link to="/output" className="btn btn-sm btn-outline">
            Show Output
          </Link>
        )}
        <button
          disabled={isSubmitting || !project?.fields.length}
          type="submit"
          className={tw('btn btn-sm', isSubmitting && 'loading')}
          onClick={handleSubmit}
        >
          Run
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

interface FieldListItemProps {
  field: IFieldConfig
  onDelete?: () => void
}

const FieldListItem = ({ field }: FieldListItemProps) => (
  <li className="hover:bg-base-200">
    <Link to={`field/${field.id}`} className="flex justify-between p-2">
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
  outlet: IOutletConfig
}

const OutletListItem = ({ outlet }: OutletListItemProps) => (
  <li className="hover:bg-base-200">
    <Link to={`outlet/${outlet.id}`} className="flex justify-between p-2">
      <div>
        <h3 className="text-sm font-semibold">{outlet.type}</h3>
      </div>

      <div className="flex items-center gap-x-1">
        <ChevronRightIcon size={20} className="text-base-300 scale-y-150" />
      </div>
    </Link>
  </li>
)
