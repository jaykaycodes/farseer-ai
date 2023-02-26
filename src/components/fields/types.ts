export interface BaseFieldProps<E extends HTMLElement = HTMLInputElement> extends React.HTMLProps<E> {
  label?: string
  error?: string
  wrapperClassName?: string
  labelClassName?: string
  errorClassName?: string
  /** Label at the top right */
  altLabel1?: React.ReactElement
  /** Label at the bottom right */
  altLabel2?: React.ReactElement
}
