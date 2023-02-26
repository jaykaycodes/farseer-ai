import { forwardRef, HTMLProps, useId } from 'react'

import { tw } from '~lib/utils'

export interface TextAreaFieldProps extends HTMLProps<HTMLTextAreaElement> {
  label?: string
  error?: string
  wrapperClassName?: string
  labelClassName?: string
  errorClassName?: string
}

const TextAreaField = forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(
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

        <textarea
          {...props}
          id={id}
          ref={ref}
          className={tw('textarea textarea-bordered', props.className, error && 'textarea-error')}
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

export default TextAreaField
