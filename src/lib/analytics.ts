import { createId } from '@paralleldrive/cuid2'
import { PostHog, posthog } from 'posthog-js'

export function initAnalytics() {
  if (process.env.NODE_ENV === 'production') {
    const storage = new Storage()
    // services to set up on initial show
    posthog.init('phc_mJ3okP8NlaYiTig5EInaCIjcKCSXK8kv43EWrUcQxBh', {
      api_host: 'https://app.posthog.com',
      autocapture: false,
      capture_performance: false,
      capture_pageview: false,
      capture_pageleave: false,
      disable_session_recording: true,
      loaded: function (posthog: PostHog) {
        // identify user goes here
        // posthog.identify('[user unique id]')
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
      debug: true,
    })
  }
}
