import { Storage } from '@plasmohq/storage'

import { defaultProject } from './constants'

export const storage = new Storage()

storage.get('projects').then((projects) => {
  if (!projects || projects.length === 0) {
    storage.set('projects', [defaultProject])
  }
})
