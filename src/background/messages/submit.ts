import type { PlasmoMessaging } from '@plasmohq/messaging'
import { OpenAIClient } from 'openai-fetch'

import type { ISubmitRequest, ISubmitResponse } from '~lib/schemas'

const openai = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY })

const handler: PlasmoMessaging.MessageHandler<ISubmitRequest, ISubmitResponse> = async (req, res) => {
  if (req.body.content.length === 0) {
    res.send({
      error: 'Content was empty',
    })
    return
  }

  let prompt = `Given the following: """${req.body.content}"""\nAnswer these questions. Format your response in JSON.\n`
  for (const q of req.body.questions) {
    prompt += `- ${q.name}: ${q.question} (string)\n`
  }

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
