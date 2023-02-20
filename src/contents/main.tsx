import { useLayoutEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { sendToBackground } from '@plasmohq/messaging'
import { Trash2Icon } from 'lucide-react'
import { SubmitHandler, useFieldArray, useForm } from 'react-hook-form'

import MainLayout from '~components/MainLayout'
import { ISubmitRequest, ISubmitResponse, SubmitRequestSchema, SubmitResponseSchema } from '~lib/schemas'
import { tw } from '~lib/utils'

import cssText from 'data-text:~tailwind.css'

export const getStyle = () => {
  const style = document.createElement('style')
  style.textContent = cssText
  return style
}

const PlasmoOverlay = () => {
  const { control, register, handleSubmit, formState } = useForm({
    resolver: zodResolver(SubmitRequestSchema),
    defaultValues: {
      content: '',
      outFields: [
        { name: 'latest_post', hint: 'title of the most recent post' },
        { name: 'most_upvoted', hint: 'title of the most upvoted post' },
      ],
    },
  })
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'outFields',
    rules: { minLength: 1 },
  })

  const [output, setOutput] = useState<string | null>(null)

  const onSubmit: SubmitHandler<ISubmitRequest> = async (body) => {
    let content = ''
    document.querySelectorAll('span.titleline,span.subline').forEach((el) => {
      content += el.textContent.trim() + '\n'
    })
    content.slice(0, 4000)
    body.content = content

    const _res = await sendToBackground<ISubmitRequest, ISubmitResponse>({
      name: 'submit',
      body,
    })

    const res = SubmitResponseSchema.parse(_res)
    if ('error' in res) {
      console.error(res.error)
      return
    } else if ('output' in res) {
      setOutput(res.output)
      if (process.env.NODE_ENV === 'development') {
        console.log('Success! The prompt used was:')
        console.log(res.prompt)
      }
    }
  }

  const onAddField = () => {
    append({ name: '', hint: '' })
  }
  useLayoutEffect(() => {
    // When a field is added/removed, focus on the name input
    const lastField = document.getElementById(`outFields[${fields.length - 1}].name`)
    if (lastField) {
      lastField.focus()
      lastField.parentElement.scrollIntoView(true)
    }
  }, [fields.length])

  return (
    <MainLayout>
      <form onSubmit={handleSubmit(onSubmit)} className={tw(formState.isSubmitting && 'disabled')}>
        <ul className="w-full space-y-2">
          {fields.map((field, index) => (
            <li key={field.id}>
              <div className="border-base-200 focus-within:border-primary input-gr group flex flex-col rounded-lg border transition-colors">
                <input
                  id={`outFields[${index}].name`}
                  type="text"
                  placeholder="field_name"
                  className="input input-ghost input-xs border-base-200 w-full rounded-b-none border-b text-sm font-bold focus:outline-none"
                  autoComplete="off"
                  {...register(`outFields.${index}.name` as const)}
                />

                <textarea
                  id={`prompts[${index}].hint`}
                  placeholder="What should this field contain?"
                  className="textarea textarea-ghost textarea-xs my-1 resize-none text-sm focus:outline-none"
                  {...register(`outFields.${index}.hint` as const)}
                />

                {index > 0 && (
                  <button
                    type="button"
                    className="btn btn-xs text-error btn-link btn-square ml-auto gap-x-1 focus:outline-offset-0"
                    onClick={() => remove(index)}
                  >
                    <Trash2Icon size="16" />
                    <span className="sr-only">Delete</span>
                  </button>
                )}
              </div>
              {formState.errors.outFields?.[index]?.name && (
                <p className="text-error text-xs">{formState.errors.outFields[index].name.message}</p>
              )}
              {formState.errors.outFields?.[index]?.hint && (
                <p className="text-error text-xs">{formState.errors.outFields[index].hint.message}</p>
              )}
            </li>
          ))}
        </ul>

        <div className="mt-3 flex w-full justify-end gap-x-1">
          <button type="button" className="btn btn-sm btn-outline" onClick={onAddField}>
            Add field
          </button>
          <button
            disabled={formState.isSubmitting}
            type="submit"
            className={tw('btn btn-sm', formState.isSubmitting && 'loading')}
          >
            Go!
          </button>
        </div>
      </form>

      {formState.isSubmitting && <div>Submitting...</div>}

      {output && (
        <div className="mt-5">
          <h3>Output</h3>
          <div className="h-36 w-full overflow-y-auto rounded-lg border border-dashed border-gray-400 p-2">
            <pre>{JSON.stringify(JSON.parse(output), null, 2)}</pre>
          </div>
        </div>
      )}
    </MainLayout>
  )
}

export default PlasmoOverlay
