import { z } from 'zod'

export const OutletConfigSchema = z.discriminatedUnion('type', [
  z.object({
    id: z.string(),
    type: z.literal('airtable'),
    baseId: z.string(),
    tableId: z.string(),
  }),
  z.object({
    id: z.string(),
    type: z.literal('csv'),
  }),
])
export type IOutletConfig = z.infer<typeof OutletConfigSchema>

export const FieldConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  hint: z.string(),
})
export type IFieldConfig = z.infer<typeof FieldConfigSchema>

export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  fields: z.array(FieldConfigSchema),
  outlets: z.array(OutletConfigSchema),
})
export type IProject = z.infer<typeof ProjectSchema>
