import { sendToBackground } from '@plasmohq/messaging'
import { useStorage } from '@plasmohq/storage/hook'
import { useMutation } from '@tanstack/react-query'

import { RESULT_STORAGE_KEY } from '~lib/constants'
import {
  GenerateResponseSchema,
  IGenerateRequest,
  IGenerateResponse,
  IOutletConfig,
  IOutletRequest,
  IOutletResponse,
  IResult,
  OutletResponseSchema,
} from '~schemas'

async function submitRequest(body: IGenerateRequest): Promise<IResult> {
  const _res = await sendToBackground<IGenerateRequest, IGenerateResponse>({
    name: 'generate',
    body,
  })

  const res = GenerateResponseSchema.parse(_res)
  if (res.ok) {
    if (process.env.NODE_ENV === 'development') {
      console.log('Success! The prompt used was:')
      console.log(res.prompt)
    }

    return res.result
  }

  throw res.error
}

export const SUBMIT_FIELD_REQUEST_MUTATION_KEY = ['submitFieldRequest']
export const useSimpleSubmitRequestMutation = () => {
  return useMutation({ mutationFn: submitRequest, mutationKey: SUBMIT_FIELD_REQUEST_MUTATION_KEY })
}

export const SUBMIT_REQUEST_MUTATION_KEY = ['submitRequest']
export const useSubmitRequestMutation = (persist = false) => {
  const [_, setStore] = useStorage<IResult>(RESULT_STORAGE_KEY, null)

  return useMutation({
    mutationKey: persist ? SUBMIT_REQUEST_MUTATION_KEY : undefined,
    mutationFn: submitRequest,
    onSuccess: (data) => {
      if (persist) setStore(data)
      // TODO invalidate execution history query when we have it
      // queryClient.invalidateQueries(Q.project.list.queryKey)
    },
  })
}

async function exportResultsRequest(body: IOutletRequest): Promise<IOutletResponse> {
  const _res = await sendToBackground<IOutletRequest, IOutletResponse>({
    name: 'send-to-outlet',
    body,
  })

  const res = OutletResponseSchema.parse(_res)

  if (res.ok && process.env.NODE_ENV === 'development') {
    console.log('Result exported successfully!')
  }

  return res
}

export const EXPORT_RESULTS_MUTATION_KEY = 'submitFieldRequest'
export const useExportResultsRequestMutations = (outlets: IOutletConfig[]) => {
  return outlets.map((outlet) => ({
    outlet,
    mutation: useMutation({ mutationFn: exportResultsRequest, mutationKey: [EXPORT_RESULTS_MUTATION_KEY, outlet.id] }),
  }))
}
