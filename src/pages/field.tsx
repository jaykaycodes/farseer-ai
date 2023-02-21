import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeftIcon, Trash2Icon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, LoaderFunctionArgs, useNavigate, useParams } from 'react-router-dom'

import TextAreaField from '~components/fields/TextAreaField'
import TextField from '~components/fields/TextField'
import { useDeleteProjectFieldMutation, useUpdateProjectFieldMutation } from '~lib/mutations'
import { DEFAULT_PROJECT_ID, Q, queryClient } from '~lib/queries'
import { IOutputField, OutputFieldSchema } from '~lib/schemas'
import { tw } from '~lib/utils'

const fieldQuery = (projectId: string, fieldId: string) => Q.project.detail(projectId)._ctx.field(fieldId)

const FieldPage = () => {
  const projectId = DEFAULT_PROJECT_ID
  const navigate = useNavigate()
  const fieldId = useParams().fieldId!
  const { data } = useQuery(fieldQuery(projectId, fieldId))
  const { mutate } = useUpdateProjectFieldMutation()
  const { register, handleSubmit, formState } = useForm({
    resolver: zodResolver(OutputFieldSchema),
    values: data,
    mode: 'onBlur',
  })

  const onSubmit = (field: IOutputField) => {
    mutate({ projectId, field })
  }

  const { mutateAsync: deleteField } = useDeleteProjectFieldMutation()
  const handleDeleteField = async () => {
    await deleteField({ projectId: DEFAULT_PROJECT_ID, fieldId })
    navigate('..')
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <Link to=".." className="inline-flex items-center gap-x-1">
          <ChevronLeftIcon size={14} /> Back
        </Link>

        <button type="button" className="text-error inline-flex items-center" onClick={handleDeleteField}>
          <Trash2Icon size={14} />
        </button>
      </div>

      {/* <h2 className="font-bold">{data?.name}</h2> */}

      <form onBlur={handleSubmit(onSubmit)} className={tw('mt-3 space-y-2', formState.isSubmitting && 'disabled')}>
        <TextField
          label="Field name"
          error={formState.errors.name?.message}
          placeholder="field_name"
          autoComplete="off"
          {...register('name')}
        />

        <TextAreaField
          label="Field hint"
          error={formState.errors.hint?.message}
          placeholder="What should this field contain?"
          {...register('hint')}
        />

        {/* {index > 0 && (
          <button
            type="button"
            className="btn btn-xs text-error btn-link btn-square ml-auto gap-x-1 focus:outline-offset-0"
            onClick={() => remove(index)}
          >
            <Trash2Icon size="16" />
            <span className="sr-only">Delete</span>
          </button>
        )} */}
      </form>
    </>
  )
}

export default FieldPage

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const projectId = DEFAULT_PROJECT_ID
  const { fieldId } = params
  return queryClient.fetchQuery(fieldQuery(projectId, fieldId!))
}
