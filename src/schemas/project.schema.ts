import { z } from 'zod'

export enum OutletType {
  Airtable = 'airtable',
  HTTP = 'http',
}

export const BaseOutletSchema = z.object({
  id: z.string(),
  type: z.nativeEnum(OutletType),
})

export type IBaseOutletConfig = z.infer<typeof BaseOutletSchema>

export const HttpOutletSchema = BaseOutletSchema.extend({
  type: z.literal(OutletType.HTTP),
  url: z.string().url(),
  // secret: z.string(),
})
export type IHttpOutlet = z.infer<typeof HttpOutletSchema>

export const AirtableOutletSchema = BaseOutletSchema.extend({
  type: z.literal(OutletType.Airtable),
  baseId: z.string(),
  tableId: z.string(),
  authToken: z.string(),
})
export type IAirtableOutletConfig = z.infer<typeof AirtableOutletSchema>

export const OutletConfigSchema = z.discriminatedUnion('type', [AirtableOutletSchema, HttpOutletSchema])
export type IOutletConfig = z.infer<typeof OutletConfigSchema>

export const FieldConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  hint: z.string(),
  refinements: z.array(z.object({ rule: z.string() })),
})
export type IFieldConfig = z.infer<typeof FieldConfigSchema>

export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  fields: z.array(FieldConfigSchema),
  outlets: z.array(OutletConfigSchema),
})
export type IProject = z.infer<typeof ProjectSchema>
