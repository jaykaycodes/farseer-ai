import { forwardRef, HTMLProps, useId } from 'react'
import { Trash2Icon } from 'lucide-react'

import { tw } from '~lib/utils'

import type { StandardFieldProps } from './utils'

export interface InputFieldProps extends HTMLProps<HTMLInputElement>, StandardFieldProps {}

const TextField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, wrapperClassName, labelClassName, errorClassName, removeFromFieldArray, ...props }, ref) => {
    const _id = useId()
    const id = props.id || _id

    return (
      <div className={tw('form-control w-full', wrapperClassName)}>
        <div className="flex justify-between">
          {label && (
            <label htmlFor={id} className="label">
              <span className={tw('label-text', labelClassName)}>{label}</span>
            </label>
          )}
          {removeFromFieldArray && (
            <button type="button" className="mr-4" onClick={removeFromFieldArray}>
              <Trash2Icon size={12} />
            </button>
          )}
        </div>

        <input
          type="text"
          {...props}
          id={id}
          ref={ref}
          className={tw('input input-bordered', props.className, error && 'input-error')}
        />

        {error && (
          <label htmlFor={id} className="label">
            <span className={tw('label-text-alt text-error', errorClassName)}>{error}</span>
          </label>
        )}
      </div>
    )
  },
)

export default TextField
