import { z } from 'zod'

export enum OutletType {
  Airtable = 'airtable',
  CSV = 'csv',
}

export const CsvOutletSchema = z.object({
  type: z.literal(OutletType.CSV),
  id: z.string(),
})
export type ICsvOutletConfig = z.infer<typeof CsvOutletSchema>

export const AirtableOutletSchema = z.object({
  type: z.literal(OutletType.Airtable),
  id: z.string(),
  baseId: z.string(),
  tableId: z.string(),
})
export type IAirtableOutletConfig = z.infer<typeof AirtableOutletSchema>

export const OutletConfigSchema = z.discriminatedUnion('type', [AirtableOutletSchema, CsvOutletSchema])
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
  // refinements: z.object({
  //   // Technically this can be -100 to 100, but we'd only really use -15 to 15
  //   nullSensitivity: z.number().min(-100).max(100).optional(),
  // }),
})
export type IProject = z.infer<typeof ProjectSchema>
