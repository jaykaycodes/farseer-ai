import { Fragment, useState } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronDownIcon } from 'lucide-react'

import { tw } from '~lib/utils'

import type { BaseFieldProps } from './types'

export type SelectOption = {
  id?: string | number
  label: string | number
  value: string | number
}

interface SelectFieldProps extends BaseFieldProps<HTMLInputElement> {
  options: SelectOption[]
}

const SelectInput = ({
  options,
  label,
  error,
  wrapperClassName,
  errorClassName,
  labelClassName,
  ...inputProps
}: SelectFieldProps) => {
  const [value, setValue] = useState(inputProps.value ?? inputProps.defaultValue)

  const handleSelectionChange = (o: SelectOption) => {
    setValue(o.value)
  }

  const opt = options.find((o) => o.value === value)
  const optLabel = opt?.label ?? ''

  return (
    <div className={tw('form-control', wrapperClassName)}>
      <input {...inputProps} type="hidden" />

      {label && (
        <label className="label">
          <span className={tw('label-text', labelClassName)}>{label}</span>
        </label>
      )}

      <SelectList
        options={options}
        value={opt}
        label={optLabel}
        disabled={inputProps.disabled}
        onChange={handleSelectionChange}
      />

      {error && (
        <label className="label">
          <span className={tw('label-text-alt text-error', errorClassName)}>{error}</span>
        </label>
      )}
    </div>
  )
}

export default SelectInput

interface SelectListProps {
  options: SelectOption[]
  onChange: (value: SelectOption) => void
  label?: string | number
  disabled?: boolean
  value?: SelectOption
  wrapperClassName?: string
  inputClassName?: string
}

export const SelectList = ({
  label,
  disabled,
  value,
  options,
  onChange,
  wrapperClassName,
  inputClassName,
}: SelectListProps) => (
  <div className={tw('relative', wrapperClassName)}>
    <Listbox disabled={disabled} value={value} onChange={onChange}>
      <Listbox.Button className={tw('input-bordered input bg-base-100 w-full text-left', inputClassName)}>
        <span className="text-ellipsis font-bold leading-tight">{label ?? value?.label}</span>
        <span className="pointer-events-none absolute inset-y-0 right-1 flex items-center rounded-r-md px-2">
          <ChevronDownIcon size={16} className="text-gray-400" aria-hidden="true" />
        </span>
      </Listbox.Button>

      <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
        <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
          {options.map((o) => (
            <SelectListItem key={o.id ?? o.value} option={o} />
          ))}
        </Listbox.Options>
      </Transition>
    </Listbox>
  </div>
)

type SelectListItemProps = {
  option: SelectOption
}

const SelectListItem = ({ option }: SelectListItemProps) => (
  <Listbox.Option
    value={option}
    className={({ active }) =>
      tw(
        'relative cursor-default select-none py-2 px-4',
        active ? 'bg-primary text-primary-content' : 'text-base-content',
      )
    }
  >
    {({ active, selected }) => (
      <>
        <span className={tw('inline-block break-words bg-transparent', selected && 'font-semibold')}>
          {option.label}
        </span>
        {selected && (
          <span
            className={tw(
              'absolute inset-y-0 right-0 flex items-center bg-transparent pr-4',
              active ? 'text-secondary-content' : 'text-primary',
            )}
          >
            <CheckIcon size={16} aria-hidden="true" />
          </span>
        )}
      </>
    )}
  </Listbox.Option>
)
