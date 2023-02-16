import type { PlasmoMessaging } from '@plasmohq/messaging'
import { z } from 'zod'

export const SubmitRequestSchema = z.object({
  columns: z.array(z.string()),
  content: z.string(),
})
export type ISubmitRequest = z.infer<typeof SubmitRequestSchema>

export const SubmitResponseSchema = z.object({
  error: z.string().optional(),
  message: z.string().optional(),
})
export type ISubmitResponse = z.infer<typeof SubmitResponseSchema>

const handler: PlasmoMessaging.MessageHandler<ISubmitRequest, ISubmitResponse> = async (req, res) => {
  console.log(req.body)

  res.send({
    message: `Hello from the background script!\n\nColumns:\n${req.body.columns}\n\nContent:\n${req.body.content}`,
  })
}

export default handler
