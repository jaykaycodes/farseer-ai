import { createQueryKeys, mergeQueryKeys } from '@lukemorales/query-key-factory'
import { QueryClient } from '@tanstack/react-query'
import { z } from 'zod'

import { IOutputField, IProject, ProjectSchema } from './schemas'
import { storage } from './storage'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // We should only refetch when explicitly runs a query
      refetchOnWindowFocus: false,
      // Alert user of errors & let them decide what to do
      retry: false,
    },
  },
})

export const DEFAULT_PROJECT_ID = 'DEFAULT_PROJECT_ID'
const defaultProject: IProject = {
  id: DEFAULT_PROJECT_ID,
  name: 'Default',
  fields: [
    {
      id: 'DEFAULT_FIELD_ID',
      name: 'Default field',
      hint: 'Field hint',
    },
  ],
}

storage.get('projects').then((projects) => {
  if (!projects || projects.length === 0) {
    storage.set('projects', [defaultProject])
  }
})

const projectQueries = createQueryKeys('project', {
  list: {
    queryKey: null,
    queryFn: getProjects,
  },
  detail: (projectId: string) => ({
    queryKey: [projectId],
    queryFn: () => getProject(projectId),
    contextQueries: {
      field: (fieldId: string) => ({
        queryKey: [fieldId],
        queryFn: () => getField(projectId, fieldId),
      }),
    },
  }),
})

export async function getProjects(): Promise<IProject[]> {
  const store = (await storage.get('projects')) ?? []
  try {
    return z.array(ProjectSchema).parse(store)
  } catch (err) {
    console.error('Invalid projects store:', err)
    // FIXME: we should have better error recovery
    console.log('Resetting store back to default state...')
    const resetStore = [defaultProject]
    storage.set('projects', resetStore)
    return resetStore
  }
}

export async function getProject(projectId: string): Promise<IProject> {
  const projects = await getProjects()
  const project = projects.find((p) => p.id === projectId)
  if (!project) throw new Error(`Project ${projectId} not found`)
  return project
}

export async function getField(projectId: string, fieldId: string): Promise<IOutputField> {
  const project = await getProject(projectId)
  const field = project.fields.find((f) => f.id === fieldId)
  if (!field) throw new Error(`Field ${fieldId} not found`)
  return field
}

export const Q = mergeQueryKeys(projectQueries)
