import { createQueryKeys } from '@lukemorales/query-key-factory'
import { sendToBackground } from '@plasmohq/messaging'

import type { IUrlResponseSchema } from '~schemas'

// TODO: Get this triggering every time the URL changes for static sites. @jake maybe this is easy?
// Also see, ParentProvider component
export const backgroundQueries = createQueryKeys('background', {
  url: {
    queryKey: null,
    queryFn: getUrlQuery,
  },
})

export async function getUrlQuery(): Promise<IUrlResponseSchema> {
  return sendToBackground<undefined, IUrlResponseSchema>({
    name: 'get-url',
  })
}
