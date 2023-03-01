import { useState } from 'react'
import { Transition } from '@headlessui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { Trash2Icon, XIcon } from 'lucide-react'
import { FormProvider, useFieldArray, useForm, useFormContext } from 'react-hook-form'
import { LoaderFunctionArgs, useNavigate, useParams } from 'react-router-dom'

import ActionFooterLayout from '~components/ActionFooterLayout'
import NativeSelectField from '~components/fields/NativeSelectField'
import TextAreaField from '~components/fields/TextAreaField'
import TextField from '~components/fields/TextField'
import { getSensibleParser4URL } from '~lib/parsers/utils'
import { tw } from '~lib/utils'
import {
  Q,
  queryClient,
  useDeleteProjectFieldMutation,
  useSubmitRequestMutation,
  useUpdateProjectFieldMutation,
} from '~queries'
import { FieldConfigSchema, GenerateRequestSchema, IFieldConfig, IGenerateRequest } from '~schemas'

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
  const [showingTestResult, setShowingTestResult] = useState(false)

  const { mutateAsync: deleteField } = useDeleteProjectFieldMutation()
  const handleDeleteField = async () => {
    await deleteField({ projectId, fieldId })
    navigate('..')
  }

  const saveForm = form.handleSubmit((field: IFieldConfig) => {
    mutate({ projectId, field })
  })

  const {
    mutateAsync: submitRequest,
    isLoading: isSubmitting,
    data: submitResult,
    isSuccess: isSubmitSuccess,
    isError: isSubmitError,
    error: submitError,
  } = useSubmitRequestMutation()

  const handleTestRun = async (e: React.MouseEvent) => {
    // store parser manual override for project
    const parser = getSensibleParser4URL(new URL(window.location.href))
    const html4Prompt = parser.doc2Html4Prompt(document)

    if (process.env.NODE_ENV === 'development') console.log(html4Prompt)

    // TODO clean this up - but basically we want to validate the data is filled in before passing to background
    const _data: IGenerateRequest = {
      fields: [form.getValues()],
      __skip_open_ai__: process.env.NODE_ENV === 'development' && e.shiftKey,
    }
    const data = GenerateRequestSchema.parse(_data)

    submitRequest(data)
    setShowingTestResult(true)
  }

  return (
    <FormProvider {...form}>
      <ActionFooterLayout
        actionFooter={
          <>
            <Transition
              show={showingTestResult}
              enter=" transform ease-out duration-100"
              enterFrom=" transform opacity-0"
              enterTo=" transform opacity-100"
              leave=" transform ease-out duration-100"
              leaveFrom=" transform opacity-100"
            >
              <div className="flex items-center justify-end py-2">
                <button type="button" onClick={() => setShowingTestResult(!showingTestResult)}>
                  <XIcon size={12} />
                </button>
              </div>
              <div className="dashed  max-h-24 overflow-y-auto rounded-md border p-2">
                {isSubmitting && <div className="text-center">Submitting...</div>}
                {isSubmitError && <pre>{JSON.stringify(submitError)}</pre>}
                {isSubmitSuccess && <code className={'JSON'}>{JSON.stringify(submitResult, null, 2)}</code>}
              </div>
            </Transition>

            <div className="flex items-center justify-end space-x-2 py-2">
              <button
                type="button"
                className="cursor-pointer px-2 underline opacity-60"
                onClick={() => setShowingAdvanced(!showingAdvanced)}
              >
                {showingAdvanced ? 'Hide' : 'Advanced'}
              </button>
              <button
                type="button"
                className="btn btn-error btn-outline btn-sm flex items-center gap-x-1"
                onClick={handleDeleteField}
              >
                <Trash2Icon size={12} /> Delete
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm flex items-center gap-x-1"
                disabled={isSubmitting}
                onClick={handleTestRun}
              >
                Test
              </button>
            </div>
          </>
        }
      >
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
        </form>
      </ActionFooterLayout>
    </FormProvider>
  )
}

export default EditFieldPage

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { projectId, fieldId } = params
  return queryClient.fetchQuery(fieldQuery(projectId!, fieldId!))
}
