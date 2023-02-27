import { Storage } from '@plasmohq/storage'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { IFieldConfig, IOutletConfig, IProject } from '~schemas'

import Q from './_queries'
import { getProject, getProjects } from './project.queries'

const storage = new Storage()

async function createProject(project: IProject): Promise<IProject> {
  const projects = await getProjects()
  projects.push(project)
  await storage.set('projects', projects)
  return project
}

export async function updateProject(project: IProject): Promise<IProject> {
  const projects = await getProjects()
  const index = projects.findIndex((p) => p.id === project.id)
  if (index === -1) throw new Error(`Project ${project.id} not found`)
  projects[index] = project
  await storage.set('projects', projects)
  return project
}

export async function deleteProject({ projectId }: { projectId: string }): Promise<string> {
  const projects = await getProjects()
  const index = projects.findIndex((p) => p.id === projectId)
  if (index === -1) throw new Error(`Project ${projectId} not found`)
  projects.splice(index, 1)
  await storage.set('projects', projects)
  return projectId
}

export const useCreateProjectMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(createProject, {
    onSuccess: (project) => {
      queryClient.setQueryData(Q.project.detail(project.id).queryKey, project)
      queryClient.invalidateQueries(Q.project.list.queryKey)
    },
  })
}

export const useUpdateProjectMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(updateProject, {
    onSuccess: (project) => {
      queryClient.setQueryData(Q.project.detail(project.id).queryKey, project)
      queryClient.invalidateQueries(Q.project.list.queryKey)
    },
  })
}

export const useDeleteProjectMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(deleteProject, {
    onSuccess: (projectId) => {
      queryClient.setQueryData(Q.project.detail(projectId).queryKey, undefined)
      queryClient.invalidateQueries(Q.project.list.queryKey)
    },
  })
}

const createProjectField = async ({ projectId, field }: { projectId: string; field: IFieldConfig }) => {
  const project = await getProject(projectId)
  project.fields.push(field)
  await updateProject(project)
  return field
}

export const useCreateProjectFieldMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(createProjectField, {
    onSuccess: (field, { projectId }) => {
      queryClient.setQueryData(Q.project.detail(projectId)._ctx.field(field.id).queryKey, field)
      queryClient.invalidateQueries(Q.project.detail(projectId).queryKey)
    },
  })
}

const deleteProjectField = async ({ projectId, fieldId }: { projectId: string; fieldId: string }) => {
  const project = await getProject(projectId)
  const index = project.fields.findIndex((f) => f.id === fieldId)
  if (index === -1) throw new Error(`Field ${fieldId} not found`)
  project.fields.splice(index, 1)
  await updateProject(project)
  return fieldId
}

export const useDeleteProjectFieldMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(deleteProjectField, {
    onSuccess: (fieldId, { projectId }) => {
      queryClient.invalidateQueries(Q.project.detail(projectId)._ctx.field(fieldId).queryKey)
      queryClient.invalidateQueries(Q.project.detail(projectId).queryKey)
    },
  })
}

const updateProjectField = async ({ projectId, field }: { projectId: string; field: IFieldConfig }) => {
  const project = await getProject(projectId)
  const index = project.fields.findIndex((f) => f.id === field.id)
  if (index === -1) throw new Error(`Field ${field.id} not found`)
  project.fields[index] = field
  await updateProject(project)
  return field
}

export const useUpdateProjectFieldMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(updateProjectField, {
    onSuccess: (field, { projectId }) => {
      queryClient.setQueryData(Q.project.detail(projectId)._ctx.field(field.id).queryKey, field)
      queryClient.invalidateQueries(Q.project.detail(projectId).queryKey)
    },
  })
}

const createOutlet = async ({ projectId, outlet }: { projectId: string; outlet: IOutletConfig }) => {
  const project = await getProject(projectId)
  project.outlets.push(outlet)
  await updateProject(project)
  return outlet
}

export const useCreateOutletMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(createOutlet, {
    onSuccess: (outlet, { projectId }) => {
      queryClient.setQueryData(Q.project.detail(projectId)._ctx.field(outlet.id).queryKey, outlet)
      queryClient.invalidateQueries(Q.project.detail(projectId).queryKey)
    },
  })
}
const updateOutlet = async ({ projectId, outlet }: { projectId: string; outlet: IOutletConfig }) => {
  const project = await getProject(projectId)
  const index = project.outlets.findIndex((f) => f.id === outlet.id)
  if (index === -1) throw new Error(`Outlet ${outlet.id} not found`)
  project.outlets[index] = outlet
  await updateProject(project)
  return outlet
}

export const useUpdateOutletMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(updateOutlet, {
    onSuccess: (outlet, { projectId }) => {
      queryClient.invalidateQueries(Q.project.detail(projectId)._ctx.outlet(outlet.id).queryKey)
      queryClient.invalidateQueries(Q.project.detail(projectId).queryKey)
    },
  })
}

const deleteOutlet = async ({ projectId, outletId }: { projectId: string; outletId: string }) => {
  const project = await getProject(projectId)
  const index = project.outlets.findIndex((o) => o.id === outletId)
  if (index === -1) throw new Error(`Field ${outletId} not found`)
  project.outlets.splice(index, 1)
  await updateProject(project)
  return outletId
}

export const useDeleteOutletMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(deleteOutlet, {
    onSuccess: (outletId, { projectId }) => {
      queryClient.invalidateQueries(Q.project.detail(projectId)._ctx.outlet(outletId).queryKey)
      queryClient.invalidateQueries(Q.project.detail(projectId).queryKey)
    },
  })
}
