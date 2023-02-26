import { forwardRef, useId } from 'react'

import { tw } from '~lib/utils'

import type { BaseFieldProps } from './types'

export interface InputFieldProps extends BaseFieldProps {}

const TextField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, wrapperClassName, labelClassName, errorClassName, altLabel1, altLabel2, ...props }, ref) => {
    const _id = useId()
    const id = props.id || _id

    return (
      <div className={tw('form-control w-full', wrapperClassName)}>
        {label && (
          <label htmlFor={id} className="label">
            {label && <span className={tw('label-text', labelClassName)}>{label}</span>}
            {altLabel1 && <span className={tw('label-text-alt')}>{altLabel1}</span>}
          </label>
        )}

        <input
          type="text"
          {...props}
          id={id}
          ref={ref}
          className={tw('input input-bordered', props.className, error && 'input-error')}
        />

        <label htmlFor={id} className="label">
          {error && <span className={tw('label-text-alt text-error', errorClassName)}>{error}</span>}
          {altLabel2 && <span className={tw('label-text-alt')}>{altLabel2}</span>}
        </label>
      </div>
    )
  },
)

export default TextField
