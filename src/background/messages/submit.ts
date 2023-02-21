import type { PlasmoMessaging } from '@plasmohq/messaging'
import { OpenAIClient } from 'openai-fetch'

import { html2GPTStr } from '~lib/parser'
import type { ISubmitRequest, ISubmitResponse } from '~lib/schemas'

const openai = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY })

const handler: PlasmoMessaging.MessageHandler<ISubmitRequest, ISubmitResponse> = async (req, res) => {
  if (req.body.content.length === 0) {
    res.send({
      error: 'Content was empty',
    })
    return
  }

  const gptStr = html2GPTStr(req.body.content)

  let prompt = `Given this html:`
  prompt += `"""\n${gptStr}\n"""\n`
  prompt += 'Generate JSON with this structure:\n'
  prompt += JSON.stringify(req.body.outFields)
  // prompt += `{\n`
  // req.body.outFields.forEach((field, index) => {
  //   prompt += `  // ${field.hint}\n`
  //   prompt += `  "${field.name}":"${field.example}"`
  //   if (index < req.body.outFields.length - 1) prompt += ','
  //   prompt += '\n'
  // })
  // prompt += `}\n`

  const outputPrefix = `
{"${req.body.outFields[0].name}":"`
  prompt += outputPrefix

  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt,
    temperature: 0,
    max_tokens: 820,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  })

  const output = `${outputPrefix}${response.completion}`

  res.send({
    prompt,
    output,
  })
}

export default handler
