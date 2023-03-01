import { sendToBackground } from '@plasmohq/messaging'
import { useStorage } from '@plasmohq/storage/hook'
import { useMutation } from '@tanstack/react-query'

import { RESULT_STORAGE_KEY } from '~lib/constants'
import {
  GenerateResponseSchema,
  IGenerateRequest,
  IGenerateResponse,
  IOutletRequest,
  IOutletResponse,
  IResult,
  OutletResponseSchema,
} from '~schemas'

import { getProject } from './project.queries'

/**
 * GENERATE
 */

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

export const useSimpleSubmitRequestMutation = () => {
  return useMutation(submitRequest)
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

/**
 * EXPORTS
 */

async function exportResult({ projectId, result }: { projectId: string; result: IResult }): Promise<IOutletResponse[]> {
  if (!result) {
    throw new Error('No result to export!')
  }
  // Grab outlets for project
  const project = await getProject(projectId)
  // Build our requests
  const requests = project.outlets.map((config) =>
    sendToBackground<IOutletRequest, IOutletResponse>({ name: 'send-to-outlet', body: { config, result } }).then(
      (res) => OutletResponseSchema.parse(res),
    ),
  )
  const res = await Promise.all(requests)

  if (res.some((r) => !r.ok)) throw new Error('One or more outlets failed to export the result')

  return res
}

export const useExportResultMutation = () => {
  return useMutation(exportResult)
}
