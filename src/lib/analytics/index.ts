import { createId } from '@paralleldrive/cuid2'
import { Storage } from '@plasmohq/storage'
import { PostHog, posthog } from 'posthog-js'

export { useAnalytics } from './use-analytics'

export function initAnalytics() {
  if (process.env.NODE_ENV === 'production') {
    // services to set up on initial show
    posthog.init('phc_mJ3okP8NlaYiTig5EInaCIjcKCSXK8kv43EWrUcQxBh', {
      api_host: 'https://app.posthog.com',
      autocapture: false,
      capture_performance: false,
      capture_pageview: false,
      capture_pageleave: false,
      disable_session_recording: true,
      loaded: function (posthog: PostHog) {
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
      },
      // if needed for debugging
      // debug: true,
    })
  }
}
