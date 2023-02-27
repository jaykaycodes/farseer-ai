import { createQueryKeys } from '@lukemorales/query-key-factory'
import { Storage } from '@plasmohq/storage'
import { z } from 'zod'

import { makeDefaultProject } from '~lib/utils'
import { IFieldConfig, IOutletConfig, IProject, ProjectSchema } from '~schemas'

const storage = new Storage()

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

const resetProjects = () => {
  const projects = [makeDefaultProject()]
  storage.set('projects', projects)
  return projects
}

export async function getProjects(): Promise<IProject[]> {
  let projects = await storage.get<IProject[]>('projects')

  if (!projects || !Array.isArray(projects) || projects.length === 0) {
    projects = resetProjects()
  }

  try {
    return z.array(ProjectSchema).parse(projects)
  } catch (err) {
    console.error('Invalid projects store:', err)
    // FIXME: we should have better error recovery
    console.log('Resetting store back to default state...')
    return resetProjects()
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
