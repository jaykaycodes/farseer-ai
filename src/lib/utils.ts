import { createId } from '@paralleldrive/cuid2'
import { twMerge } from 'tailwind-merge'

import type { IFieldConfig, IProject } from '~schemas'

export const tw = twMerge

type BootstrapStrategy = 'pdp' | 'linkedin' | 'article' | 'raw'
export type BootstrappedProject = { strategy: BootstrapStrategy } & Partial<IProject>

const baseProject: () => Omit<IProject, 'name' | 'fields'> = () => ({ id: createId(), outlets: [] })
const baseField: () => Omit<IFieldConfig, 'name' | 'hint'> = () => ({ id: createId(), refinements: [{ rule: '' }] })

export const bootstrapProject = (bootstrappedProject: BootstrappedProject): IProject => {
  const { strategy, ...overrides } = bootstrappedProject

  switch (strategy) {
    case 'linkedin':
      return {
        ...baseProject(),
        fields: [
          { ...baseField(), name: 'name', hint: 'name the main person in this profile' },
          {
            ...baseField(),
            name: 'companies',
            hint: "list the company of this person's job",
            refinements: [{ rule: 'This should be an array of strings, e.g. ["first","second"]' }],
          },
          {
            ...baseField(),
            name: 'industry',
            hint: 'name the industry this person works in.',
          },
        ],
        name: 'LinkedIn Profile Collector',
        ...overrides,
      }
    case 'pdp':
      return {
        ...baseProject(),
        fields: [
          {
            ...baseField(),
            name: 'product',
            hint: 'name the primary product on this page',
          },
          {
            ...baseField(),
            name: 'price',
            hint: 'get the price of this product',
          },
          {
            ...baseField(),
            name: 'other_products',
            hint: 'list the non-primary products on this page',
            refinements: [{ rule: 'This should be an array of numbers, e.g. [1,2]' }],
          },
          {
            ...baseField(),
            name: 'ingredients',
            hint: 'list the ingredients of this product',
            refinements: [{ rule: 'This should be an array of strings, e.g. ["first","second"]' }],
          },
        ],
        name: 'Product Page Collector',
        ...overrides,
      }
    case 'article':
      return {
        ...baseProject(),
        fields: [
          {
            ...baseField(),
            name: 'author',
            hint: 'name the author of this article',
          },
          {
            ...baseField(),
            name: 'title',
            hint: 'get the title of this article',
          },
          {
            ...baseField(),
            name: 'summary',
            hint: 'get the summary of this article',
          },
        ],
        name: 'Article Page Collector',
        ...overrides,
      }
    default:
      return {
        ...baseProject(),
        fields: [],
        name: 'Untitled Project',
        ...overrides,
      }
  }
}
