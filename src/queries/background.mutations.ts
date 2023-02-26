import { sendToBackground } from '@plasmohq/messaging'
import { useStorage } from '@plasmohq/storage/hook'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { RESULT_STORAGE_KEY } from '~lib/constants'
import { GenerateResponseSchema, IGenerateRequest, IGenerateResponse, IResult } from '~schemas'

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

export const SUBMIT_REQUEST_MUTATION_KEY = ['submitRequest']
export const useSubmitRequestMutation = () => {
  const [_, setStore] = useStorage<IResult>(RESULT_STORAGE_KEY, null)
  const navigate = useNavigate()

  return useMutation({
    mutationKey: SUBMIT_REQUEST_MUTATION_KEY,
    mutationFn: submitRequest,
    onMutate: () => {
      navigate('/results')
    },
    onSuccess: (data) => {
      setStore(data)
      // TODO invalidate execution history query when we have it
      // queryClient.invalidateQueries(Q.project.list.queryKey)
    },
  })
}
