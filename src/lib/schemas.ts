import { z } from 'zod'

export const OutputFieldSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  hint: z.string().min(5),
})
export type IOutputField = z.infer<typeof OutputFieldSchema>
export const ProjectFieldsSchema = z.array(OutputFieldSchema).min(1)
export type IProjectFields = z.infer<typeof ProjectFieldsSchema>

export const OutletSchema = z.discriminatedUnion('outlet', [
  z.object({
    id: z.string(),
    outlet: z.literal('airtable'),
    baseId: z.string(),
    tableId: z.string(),
  }),
  z.object({
    id: z.string(),
    outlet: z.literal('csv'),
  }),
])
export type IOutlet = z.infer<typeof OutletSchema>
export const ProjectOutletsSchema = z.array(OutletSchema).min(1)
export type IProjectOutlets = z.infer<typeof ProjectOutletsSchema>

export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  fields: ProjectFieldsSchema,
  outlets: ProjectOutletsSchema,
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

export const OutletRequestSchema = z.object({
  output: z.object({}).passthrough(),
  url: z.string(),
  outlet: OutletSchema,
})

export type IOutletRequest = z.infer<typeof OutletRequestSchema>

export const OutletResponseSchema = z.union([
  z.object({
    error: z.string(),
  }),
  z.object({
    ok: z.boolean(),
  }),
])
export type IOutletResponse = z.infer<typeof OutletResponseSchema>
