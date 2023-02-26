import { useState } from 'react'
import { Transition } from '@headlessui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { Trash2Icon } from 'lucide-react'
import { FormProvider, useFieldArray, useForm, useFormContext } from 'react-hook-form'
import { LoaderFunctionArgs, useNavigate, useParams } from 'react-router-dom'

import NativeSelectField from '~components/fields/NativeSelectField'
import TextAreaField from '~components/fields/TextAreaField'
import TextField from '~components/fields/TextField'
import { tw } from '~lib/utils'
import { Q, queryClient, useDeleteProjectFieldMutation, useUpdateProjectFieldMutation } from '~queries'
import { FieldConfigSchema, IFieldConfig } from '~schemas'

const fieldQuery = (projectId: string, fieldId: string) => Q.project.detail(projectId)._ctx.field(fieldId)

const AdvancedFieldSettings = ({ showing }: { showing: boolean }) => {
  const { register, control, getValues } = useFormContext()
  const projectId = useParams().projectId!
  const { mutate } = useUpdateProjectFieldMutation()

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'refinements',
  })

  return (
    <>
      <Transition
        show={showing}
        enter=" transform ease-out duration-100"
        enterFrom=" transform opacity-0"
        enterTo=" transform opacity-100"
        leave=" transform ease-out duration-100"
        leaveFrom=" transform opacity-100"
        leaveTo=" transform opacity-0"
      >
        {fields.map((field, index) => {
          if (index === 0) {
            return (
              <NativeSelectField key={field.id} label="Data Type" {...register(`refinements.${index}.rule`)}>
                <option value="">No Preference</option>
                <option value={`This should be a number, e.g. 1`}>Number, e.g. 1</option>
                <option value={`This should be a string, e.g. "value"`}>String, e.g. "value"</option>
                <option value={`This should be an array of numbers, e.g. [1,2]`}>List of Numbers, e.g. [1, 2]</option>
                <option value={`This should be an array of strings, e.g. ["first","second"]`}>
                  List of Strings, e.g. ["valOne", "valTwo"]
                </option>
              </NativeSelectField>
            )
          }

          const handleDelete = () => {
            remove(index)
            const field = getValues() as IFieldConfig
            mutate({ projectId, field })
          }

          const altLabel = (
            <button type="button" className="mr-4" onClick={handleDelete}>
              <Trash2Icon size={12} />
            </button>
          )

          return (
            <TextField
              key={field.id}
              label={`Refinment ${index}`}
              {...register(`refinements.${index}.rule`)}
              altLabel1={altLabel}
            />
          )
        })}
        <button type="button" className="ml-2 mt-4 w-fit underline opacity-60" onClick={() => append({ rule: '' })}>
          + Add Refinement
        </button>
      </Transition>
    </>
  )
}

const EditFieldPage = () => {
  const projectId = useParams().projectId!
  const fieldId = useParams().fieldId!
  const navigate = useNavigate()

  const { data } = useQuery(fieldQuery(projectId, fieldId))
  const { mutate } = useUpdateProjectFieldMutation()
  const form = useForm({
    resolver: zodResolver(FieldConfigSchema),
    values: data,
    mode: 'onBlur',
  })

  const [showingAdvanced, setShowingAdvanced] = useState(false)

  const { mutateAsync: deleteField } = useDeleteProjectFieldMutation()
  const handleDeleteField = async () => {
    await deleteField({ projectId, fieldId })
    navigate('..')
  }

  const saveForm = form.handleSubmit((field: IFieldConfig) => {
    mutate({ projectId, field })
  })

  return (
    <FormProvider {...form}>
      <form onBlur={saveForm} className={tw('mt-3 space-y-2', form.formState.isSubmitting && 'disabled')}>
        <TextField
          label="Field name"
          error={form.formState.errors.name?.message}
          placeholder="field_name"
          autoComplete="off"
          {...form.register('name')}
        />

        <TextAreaField
          label="Field hint"
          error={form.formState.errors.hint?.message}
          placeholder="What should this field contain?"
          {...form.register('hint')}
        />

        <AdvancedFieldSettings showing={showingAdvanced} />

        <div className="flex w-full items-center justify-end space-x-4">
          <button
            type="button"
            className="cursor-pointer underline opacity-60"
            onClick={() => setShowingAdvanced(!showingAdvanced)}
          >
            Advanced
          </button>
          <button
            type="button"
            className="btn btn-error btn-outline btn-sm flex items-center gap-x-1"
            onClick={handleDeleteField}
          >
            <Trash2Icon size={12} /> Delete
          </button>
        </div>
      </form>
    </FormProvider>
  )
}

export default EditFieldPage

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { projectId, fieldId } = params
  return queryClient.fetchQuery(fieldQuery(projectId!, fieldId!))
}
