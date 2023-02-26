import { forwardRef, ReactNode, useId } from 'react'

import { tw } from '~lib/utils'

import type { BaseFieldProps } from './types'

export interface SelectFieldProps extends BaseFieldProps<HTMLSelectElement> {
  children: ReactNode
}

const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, error, wrapperClassName, labelClassName, errorClassName, children, ...props }, ref) => {
    const _id = useId()
    const id = props.id || _id

    return (
      <div className={tw('form-control w-full', wrapperClassName)}>
        {label && (
          <label htmlFor={id} className="label">
            <span className={tw('label-text', labelClassName)}>{label}</span>
          </label>
        )}

        <select
          {...props}
          id={id}
          ref={ref}
          className={tw('select select-bordered font-normal', props.className, error && 'input-error')}
        >
          {children}
        </select>

        {error && (
          <label htmlFor={id} className="label">
            <span className={tw('label-text-alt text-error', errorClassName)}>{error}</span>
          </label>
        )}
      </div>
    )
  },
)

export default SelectField
