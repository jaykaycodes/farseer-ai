import { z } from 'zod'

import { FieldConfigSchema, OutletConfigSchema as OutletConfigSchema } from './project.schema'

/**
 * Extends FieldConfigSchema to require a name and hint.
 */
export const RequiredFieldConfigSchema = FieldConfigSchema.extend({
  name: z.string().min(1),
  hint: z.string().min(5),
})

/**
 * The request sent to the background/messages/generate endpoint.
 */
export const GenerateRequestSchema = z.object({
  fields: z.array(RequiredFieldConfigSchema),
  content: z.string(),
})
export type IGenerateRequest = z.infer<typeof GenerateRequestSchema>

export const GenerateResponseSchema = z.union([
  z.object({
    error: z.string(),
  }),
  z.object({
    output: z.string(),
    prompt: z.string(),
  }),
])
export type IGenerateResponse = z.infer<typeof GenerateResponseSchema>

export const OutletRequestSchema = z.object({
  payload: z.record(z.union([z.string(), z.number(), z.boolean()])),
  config: OutletConfigSchema,
})
export type IOutletRequest = z.infer<typeof OutletRequestSchema>

export const OutletResponseSchema = z.discriminatedUnion('ok', [
  z.object({
    ok: z.literal(false),
    error: z.string(),
  }),
  z.object({
    ok: z.literal(true),
  }),
])
export type IOutletResponse = z.infer<typeof OutletResponseSchema>
