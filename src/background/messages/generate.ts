import type { PlasmoMessaging } from '@plasmohq/messaging'
import { OpenAIClient } from 'openai-fetch'

import { storage } from '~lib/storage'
import type { IGenerateRequest, IGenerateResponse } from '~schemas'

const openai = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY })
const HtmlCharacterLimit = 10000

const handler: PlasmoMessaging.MessageHandler<IGenerateRequest, IGenerateResponse> = async (req, res) => {
  if (!req.body || req.body.content.length === 0) {
    res.send({
      ok: false,
      error: 'Content was empty',
    })
    return
  }

  const willTruncate = req.body.content.length > HtmlCharacterLimit

  const promptInstructionObjs = req.body.fields
    .map((field) => {
      let refinements = ''
      const filteredRefinements = field.refinements.filter((refinement) => refinement.rule != '')
      if (filteredRefinements.length > 0) {
        refinements = `, refinements: "${field.refinements.map(({ rule }) => rule).join('. ')}"`
      }
      return `{ key: "${field.name}", hint: "${field.hint}"${refinements} }`
    })
    .join('\n')

  let prompt = `Generate JSON with the rules
- One "key": "value" pair for each JSON object below
- Use hint and the html below to populate the value
- Use refinements as a rule set for how to generate the value
- Use null when the value is unavailable or uncertain

${promptInstructionObjs}

Note: This html does not have closing tags.${willTruncate ? ' This html has been truncated.' : ''}\n`
  prompt += `"""html\n${req.body.content.slice(0, HtmlCharacterLimit)}\n"""\n`

  // Need to add a prefix but also add it to our output
  const outputPrefix = `\n{"${req.body.fields[0].name}":`
  prompt += outputPrefix

  try {
    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt,
      temperature: 0,
      max_tokens: 800,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      logit_bias: { '8423': 6 },
      stop: '}',
    })

    // add the closing bracket, since stop sequence ensures it's not included
    const result = `${outputPrefix}${response.completion} }`

    storage.set('output', result)

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
