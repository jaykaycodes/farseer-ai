import { useCallback, useContext } from 'react'
import posthog, { CaptureOptions, Properties } from 'posthog-js'

import type { IFieldConfig, IResult } from '~schemas'
import { ParentContext } from '~tabs'

export function useAnalytics() {
  const defaultProperties = useContext(ParentContext)

  const flattenFields = (fields: IFieldConfig[]) => {
    return fields.reduce((acc, { id, name, hint, refinements }) => {
      acc[`name_${id}`] = name
      acc[`hint_${id}`] = hint
      acc[`refinements_${id}`] = refinements.map(({ rule }) => rule).join(' | ')
      return acc
    }, {} as any)
  }

  const flattenResults = (result: IResult) => {
    if (!result) return { response_ok: false }
    return {
      response_ok: true,
      ...Object.entries(result).reduce((acc, [key, value]) => {
        acc[`result_${key}`] = (value || 'null').toString()
        return acc
      }, {} as any),
    }
  }

  const capture = useCallback(
    (event_name: string, properties?: Properties | null | undefined, options?: CaptureOptions | undefined) =>
      posthog.capture(event_name, { ...defaultProperties, ...properties }, options),
    [defaultProperties],
  )

  return { capture, flattenFields, flattenResults }
}
