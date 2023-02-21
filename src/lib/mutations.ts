import { sendToBackground } from '@plasmohq/messaging'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { getProject, getProjects, Q } from './queries'
import { IOutputField, IProject, ISubmitRequest, ISubmitResponse, SubmitResponseSchema } from './schemas'
import { storage } from './storage'

async function createProject(project: IProject): Promise<IProject> {
  const projects = await getProjects()
  projects.push(project)
  await storage.set('projects', projects)
  return project
}

async function updateProject(project: IProject): Promise<IProject> {
  const projects = await getProjects()
  const index = projects.findIndex((p) => p.id === project.id)
  if (index === -1) throw new Error(`Project ${project.id} not found`)
  projects[index] = project
  await storage.set('projects', projects)
  return project
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

const createProjectField = async ({ projectId, field }: { projectId: string; field: IOutputField }) => {
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

const updateProjectField = async ({ projectId, field }: { projectId: string; field: IOutputField }) => {
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

async function submitRequest(body: ISubmitRequest): Promise<string> {
  const _res = await sendToBackground<ISubmitRequest, ISubmitResponse>({
    name: 'submit',
    body,
  })

  const res = SubmitResponseSchema.parse(_res)
  if ('output' in res) {
    if (process.env.NODE_ENV === 'development') {
      console.log('Success! The prompt used was:')
      console.log(res.prompt)
    }
    return res.output
  }

  throw res.error
}

export const useSubmitRequestMutation = () => {
  // const queryClient = useQueryClient()

  return useMutation(submitRequest, {
    onSuccess: () => {
      // TODO invalidate execution history query when we have it
      // queryClient.invalidateQueries(Q.project.list.queryKey)
    },
  })
}
