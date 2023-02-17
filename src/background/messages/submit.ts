import type { PlasmoMessaging } from '@plasmohq/messaging'
import { OpenAIClient } from 'openai-fetch'
import { z } from 'zod'

export const SubmitRequestSchema = z.object({
  sample: z.string(),
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

const openai = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY })

const handler: PlasmoMessaging.MessageHandler<ISubmitRequest, ISubmitResponse> = async (req, res) => {
  if (req.body.content.length === 0) {
    res.send({
      error: 'Content was empty',
    })
    return
  }

  const prompt = `"""${req.body.content}"""\n[${req.body.sample},`

  const response = await openai.createCompletion({
    model: 'text-curie-001',
    prompt,
    temperature: 0,
    max_tokens: 820,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  })

  const output = response.completion

  res.send({
    prompt,
    output,
  })
}

export default handler
