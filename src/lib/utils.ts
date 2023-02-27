import { createId } from '@paralleldrive/cuid2'
import { twMerge } from 'tailwind-merge'

import type { IProject } from '~schemas'

export const tw = twMerge

export const makeDefaultProject = (): IProject => ({
  id: createId(),
  fields: [],
  name: 'Untitled Project',
  outlets: [],
})
