import { createId } from '@paralleldrive/cuid2'

import type { IFieldConfig, IProject } from '~schemas'

export enum ExampleProjectType {
  PDP,
  LINKEDIN,
  ARTICLE,
  BOOKFACE,
  EMPTY,
}

export const AllExampleProjects = [
  ExampleProjectType.PDP,
  ExampleProjectType.LINKEDIN,
  ExampleProjectType.ARTICLE,
  ExampleProjectType.BOOKFACE,
  ExampleProjectType.EMPTY,
]

export const makeExampleProject = (
  type: ExampleProjectType = ExampleProjectType.EMPTY,
  overrides?: Partial<IProject>,
): IProject => factories[type](overrides)

const makeBaseField = (overrides?: Partial<IFieldConfig>): IFieldConfig => ({
  id: createId(),
  name: 'New field',
  hint: 'What is this field for?',
  refinements: [{ rule: '' }],
  ...overrides,
})

const makeBaseProject = (overrides?: Partial<IProject>): IProject => ({
  id: createId(),
  name: 'Untitled project',
  fields: [makeBaseField()],
  outlets: [],
  ...overrides,
})

type FactoryFn = (overrides?: Partial<IProject>) => IProject
const factories: Record<ExampleProjectType, FactoryFn> = {
  [ExampleProjectType.PDP]: (overrides) =>
    makeBaseProject({
      name: 'Product Page Collector',
      fields: [
        makeBaseField({ name: 'product', hint: 'name the primary product on this page' }),
        makeBaseField({ name: 'price', hint: 'get the price of this product' }),
        makeBaseField({ name: 'other_products', hint: 'list the non-primary products on this page' }),
        makeBaseField({ name: 'ingredients', hint: 'list the ingredients of this product' }),
      ],
      ...overrides,
    }),
  [ExampleProjectType.LINKEDIN]: (overrides) =>
    makeBaseProject({
      name: 'LinkedIn Profile Collector',
      fields: [
        makeBaseField({ name: 'name', hint: 'name the main person in this profile' }),
        makeBaseField({
          name: 'companies',
          hint: "list the company of this person's job",
          refinements: [{ rule: 'This should be an array of strings, e.g. ["first","second"]' }],
        }),
        makeBaseField({ name: 'industry', hint: 'name the industry this person works in.' }),
      ],
      ...overrides,
    }),
  [ExampleProjectType.ARTICLE]: (overrides) =>
    makeBaseProject({
      name: 'Article Page Collector',
      fields: [
        makeBaseField({ name: 'title', hint: 'title of this article' }),
        makeBaseField({ name: 'author', hint: "the author's name" }),
        makeBaseField({ name: 'date', hint: 'get the date this article was published on' }),
        makeBaseField({ name: 'summary', hint: 'a short summary of this article' }),
      ],
      ...overrides,
    }),
  [ExampleProjectType.BOOKFACE]: (overrides) =>
    makeBaseProject({
      name: 'Bookface Page Collector',
      fields: [
        makeBaseField({ name: 'poster', hint: 'get the author of the post' }),
        makeBaseField({ name: 'company', hint: 'get the company name where the author works' }),
        makeBaseField({ name: 'summary', hint: 'summarize this article' }),
      ],
      ...overrides,
    }),
  [ExampleProjectType.EMPTY]: makeBaseProject,
}
