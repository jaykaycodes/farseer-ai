import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { Trash2Icon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { LoaderFunctionArgs, useNavigate, useParams } from 'react-router-dom'

import TextAreaField from '~components/fields/TextAreaField'
import TextField from '~components/fields/TextField'
import { tw } from '~lib/utils'
import { Q, queryClient, useDeleteProjectFieldMutation, useUpdateProjectFieldMutation } from '~queries'
import { FieldConfigSchema, IFieldConfig } from '~schemas'

const fieldQuery = (projectId: string, fieldId: string) => Q.project.detail(projectId)._ctx.field(fieldId)

const EditFieldPage = () => {
  const projectId = useParams().projectId!
  const fieldId = useParams().fieldId!
  const navigate = useNavigate()

  const { data } = useQuery(fieldQuery(projectId, fieldId))
  const { mutate } = useUpdateProjectFieldMutation()
  const { register, handleSubmit, formState } = useForm({
    resolver: zodResolver(FieldConfigSchema),
    values: data,
    mode: 'onBlur',
  })

  const { mutateAsync: deleteField } = useDeleteProjectFieldMutation()
  const handleDeleteField = async () => {
    await deleteField({ projectId, fieldId })
    navigate('..')
  }

  return (
    <form
      onBlur={handleSubmit((field: IFieldConfig) => {
        mutate({ projectId, field })
      })}
      className={tw('mt-3 space-y-2', formState.isSubmitting && 'disabled')}
    >
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

      <div className="flex w-full items-center justify-end">
        <button
          type="button"
          className="btn btn-error btn-outline btn-sm flex items-center gap-x-1"
          onClick={handleDeleteField}
        >
          <Trash2Icon size={12} /> Delete
        </button>
      </div>
    </form>
  )
}

export default EditFieldPage

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { projectId, fieldId } = params
  return queryClient.fetchQuery(fieldQuery(projectId!, fieldId!))
}
