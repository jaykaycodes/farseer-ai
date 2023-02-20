import { z } from 'zod'

export const SubmitRequestSchema = z.object({
  questions: z
    .array(
      z.object({
        name: z.string().min(1),
        question: z.string().min(5),
      }),
    )
    .min(1),
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
