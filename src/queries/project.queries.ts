import { createQueryKeys } from '@lukemorales/query-key-factory'
import { z } from 'zod'

import { storage } from '~lib/storage'
import { IFieldConfig, IOutletConfig, IProject, ProjectSchema } from '~schemas'

export const projectQueries = createQueryKeys('project', {
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
        queryFn: () => getProjectField(projectId, fieldId),
      }),
      outlet: (outletId: string) => ({
        queryKey: [outletId],
        queryFn: () => getProjectOutlet(projectId, outletId),
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
    storage.set('projects', [])
    return []
  }
}

export async function getProject(projectId: string): Promise<IProject> {
  const projects = await getProjects()
  const project = projects.find((p) => p.id === projectId)
  if (!project) throw new Error(`Project ${projectId} not found`)
  return project
}

export async function getProjectField(projectId: string, fieldId: string): Promise<IFieldConfig> {
  const project = await getProject(projectId)
  const field = project.fields.find((f) => f.id === fieldId)
  if (!field) throw new Error(`Field ${fieldId} not found`)
  return field
}

export async function getProjectOutlet(projectId: string, outletId: string): Promise<IOutletConfig> {
  const project = await getProject(projectId)
  const outlet = project.outlets.find((o) => o.id === outletId)
  if (!outlet) throw new Error(`Field ${outletId} not found`)
  return outlet
}
