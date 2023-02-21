import { z } from 'zod'

export const OutputFieldSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  hint: z.string().min(5),
})
export type IOutputField = z.infer<typeof OutputFieldSchema>

export const ProjectFieldsSchema = z.array(OutputFieldSchema).min(1)
export type IProjectFields = z.infer<typeof ProjectFieldsSchema>

export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  fields: ProjectFieldsSchema,
})
export type IProject = z.infer<typeof ProjectSchema>

export const SubmitRequestSchema = z.object({
  outputFields: z.array(OutputFieldSchema.required()),
  content: z.string(),
})
export type ISubmitRequest = z.infer<typeof SubmitRequestSchema>

export const SubmitResponseSchema = z.union([
  z.object({
    error: z.string(),
  }),
  z.object({
    output: z.string(),
    prompt: z.string(),
  }),
])
export type ISubmitResponse = z.infer<typeof SubmitResponseSchema>
