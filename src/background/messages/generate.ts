import type { PlasmoMessaging } from '@plasmohq/messaging'
import { OpenAIClient } from 'openai-fetch'

import type { IGenerateRequest, IGenerateResponse } from '~schemas'

const openai = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY })

const handler: PlasmoMessaging.MessageHandler<IGenerateRequest, IGenerateResponse> = async (req, res) => {
  if (!req.body || req.body.content.length === 0) {
    res.send({
      ok: false,
      error: 'Content was empty',
    })
    return
  }

  let prompt = `Given this html:`
  prompt += `"""\n${req.body.content}\n"""\n`
  prompt += 'Generate JSON with this structure:\n'
  prompt += JSON.stringify(req.body.fields)
  // prompt += `{\n`
  // req.body.outFields.forEach((field, index) => {
  //   prompt += `  // ${field.hint}\n`
  //   prompt += `  "${field.name}":"${field.example}"`
  //   if (index < req.body.outFields.length - 1) prompt += ','
  //   prompt += '\n'
  // })
  // prompt += `}\n`

  // Need to add a prefix but also add it to our output
  const outputPrefix = `\n{"${req.body.fields[0].name}":"`
  prompt += outputPrefix

  try {
    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt,
      temperature: 0,
      max_tokens: 500,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      logit_bias: { '8423': 6 },
      stop: '}',
    })

    const result = `${outputPrefix}${response.completion}}`
    res.send({
      ok: true,
      prompt,
      result,
    })
  } catch (e) {
    res.send({
      ok: false,
      error: (e as Error).message,
    })
  }
}

export default handler
