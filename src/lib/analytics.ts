import { createId } from '@paralleldrive/cuid2'
import { posthog } from 'posthog-js'

export function initAnalytics() {
  if (process.env.NODE_ENV === 'production') {
    // services to set up on initial show
    posthog.init('phc_mJ3okP8NlaYiTig5EInaCIjcKCSXK8kv43EWrUcQxBh', {
      api_host: 'https://app.posthog.com',
      autocapture: false,
    })

    const storage = new Storage()
    storage.get('analyticsId').then((id: string) => {
      if (!id) {
        const newId = createId()
        posthog.identify(newId)
        storage.set('analyticsId', newId)
      } else {
        posthog.identify(id)
      }
    })
  }
}
