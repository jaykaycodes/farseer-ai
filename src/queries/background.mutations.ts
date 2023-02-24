import { sendToBackground } from '@plasmohq/messaging'
import { useMutation } from '@tanstack/react-query'

import { GenerateResponseSchema, IGenerateRequest, IGenerateResponse } from '~schemas'

async function submitRequest(body: IGenerateRequest): Promise<string> {
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

export const useSubmitRequestMutation = () => {
  // const queryClient = useQueryClient()

  return useMutation(submitRequest, {
    onSuccess: () => {
      // TODO invalidate execution history query when we have it
      // queryClient.invalidateQueries(Q.project.list.queryKey)
    },
  })
}
