import { createId } from '@paralleldrive/cuid2'
import { twMerge } from 'tailwind-merge'

import type { IProject } from '~schemas'

export const tw = twMerge

type BootstrapStrategy = 'pdp' | 'linkedin' | 'raw'
export type BootstrappedProject = { strategy: BootstrapStrategy } & Partial<IProject>

export const bootstrapProject = (bootstrappedProject: BootstrappedProject): IProject => {
  const { strategy, ...overrides } = bootstrappedProject

  switch (strategy) {
    case 'linkedin':
      return {
        id: createId(),
        fields: [
          { id: createId(), name: 'name', hint: 'name the main person in this profile', refinements: [{ rule: '' }] },
          {
            id: createId(),
            name: 'companies',
            hint: "list the company of this person's job",
            refinements: [{ rule: 'This should be an array of strings, e.g. ["first","second"]' }],
          },
          {
            id: createId(),
            name: 'industry',
            hint: 'name the industry this person works in.',
            refinements: [{ rule: '' }],
          },
        ],
        name: 'LinkedIn Profile Collector',
        outlets: [],
        ...overrides,
      }
    case 'pdp':
      return {
        id: createId(),
        fields: [
          {
            id: createId(),
            name: 'product',
            hint: 'name the primary product on this page',
            refinements: [{ rule: '' }],
          },
          {
            id: createId(),
            name: 'price',
            hint: 'get the price of this product',
            refinements: [{ rule: '' }],
          },
          {
            id: createId(),
            name: 'other_products',
            hint: 'list the non-primary products on this page',
            refinements: [{ rule: 'This should be an array of numbers, e.g. [1,2]' }],
          },
        ],
        name: 'Product Page Collector',
        outlets: [],
        ...overrides,
      }
    default:
      return {
        id: createId(),
        fields: [],
        name: 'Untitled Project',
        outlets: [],
        ...overrides,
      }
  }
}
