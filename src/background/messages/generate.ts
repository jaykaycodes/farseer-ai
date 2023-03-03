import type { PlasmoMessaging } from '@plasmohq/messaging'
import { OpenAIClient } from 'openai-fetch'
import { posthog } from 'posthog-js'

import { initAnalytics } from '~lib/analytics'
import { AppMessages } from '~lib/constants'
import type { IGenerateRequest, IGenerateResponse, IResult } from '~schemas'

initAnalytics()

const HTML_CHAR_LIMIT = 10000

const openai = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY })
const fakeRawResult = '{ "name": "John Doe", "age": 43, "city": "New York" }'

const extractActiveTabContent = (): Promise<string> =>
  new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTabId = tabs[0].id
      if (!activeTabId) return reject('No active tab!')
      posthog.capture('generate', { url: tabs[0].url })
      chrome.tabs.sendMessage(activeTabId, AppMessages.EXTRACT_CONTENT, resolve)
    })
  })

const handler: PlasmoMessaging.MessageHandler<IGenerateRequest, IGenerateResponse> = async (req, res) => {
  if (!req.body || req.body.fields.length === 0) {
    res.send({
      ok: false,
      error: 'No fields found in request',
    })
    return
  }

  const content = await extractActiveTabContent()
  const willTruncate = content.length > HTML_CHAR_LIMIT

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
  prompt += `"""html\n${content.slice(0, HTML_CHAR_LIMIT)}\n"""\n`

  // Need to add a prefix but also add it to our output
  const resultPrefix = `\n{"${req.body.fields[0].name}":`
  prompt += resultPrefix

  try {
    let rawResult: string
    if (req.body.__skip_open_ai__) {
      rawResult = fakeRawResult
    } else {
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

      rawResult = resultPrefix + response.completion + '}' // the stop token isn't included, so append a final }
    }

    const result = parseResult(rawResult)

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

function parseResult(result: string): IResult {
  try {
    // Try to parse the response as JSON right away
    return JSON.parse(result)
  } catch (e) {
    // Didn't work? time to do some cleanup
    const cleaned = result.trim().replace('{{', '{').replace('}}', '}')
    const extracted = cleaned.match(/({.*})/)?.[1]
    if (extracted) return JSON.parse(extracted)

    console.warn(`Could not extract JSON from result`, result)
    return null
  }
}
