import { forwardRef, HTMLProps, useId } from 'react'

import { tw } from '~lib/utils'

export interface InputFieldProps extends HTMLProps<HTMLInputElement> {
  label?: string
  error?: string
  wrapperClassName?: string
  labelClassName?: string
  errorClassName?: string
}

const TextField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, wrapperClassName, labelClassName, errorClassName, ...props }, ref) => {
    const _id = useId()
    const id = props.id || _id

    return (
      <div className={tw('form-control w-full', wrapperClassName)}>
        {label && (
          <label htmlFor={id} className="label">
            <span className={tw('label-text', labelClassName)}>{label}</span>
          </label>
        )}

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
