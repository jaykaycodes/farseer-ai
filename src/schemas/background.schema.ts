import { z } from 'zod'

import { FieldConfigSchema, OutletConfigSchema } from './project.schema'
import { ResultSchema } from './result.schema'

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
  __skip_open_ai__: z.boolean().optional(),
})
export type IGenerateRequest = z.infer<typeof GenerateRequestSchema>

export const GenerateResponseSchema = z.discriminatedUnion('ok', [
  z.object({
    ok: z.literal(false),
    error: z.string(),
  }),
  z.object({
    ok: z.literal(true),
    prompt: z.string(),
    result: ResultSchema,
  }),
])
export type IGenerateResponse = z.infer<typeof GenerateResponseSchema>

// TODO: Can we parse it out more specifically than `z.any()`?
/** Represents the result of `generate` after parsing. Can be any valid JSON object. */
export const ParsedResultSchema = z.record(z.any())
export type IParsedResult = z.infer<typeof ParsedResultSchema>

export const OutletRequestSchema = z.object({
  payload: ParsedResultSchema,
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
