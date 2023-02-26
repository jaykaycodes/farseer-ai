import { z } from 'zod'

const LiteralSchema = z.union([z.string(), z.number(), z.boolean(), z.null()])
type Literal = z.infer<typeof LiteralSchema>
type Json = Literal | { [key: string]: Json } | Json[]
const JsonSchema: z.ZodType<Json> = z.lazy(() => z.union([LiteralSchema, z.array(JsonSchema), z.record(JsonSchema)]))

export const ResultSchema = z.union([z.record(JsonSchema), z.null()])
export type IResult = z.infer<typeof ResultSchema>
