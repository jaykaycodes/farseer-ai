import type { PlasmoMessaging } from '@plasmohq/messaging'

import { AppMessages } from '~lib/constants'
import type { IUrlResponseSchema } from '~schemas'

const getActiveTabURL = (): Promise<string> =>
  new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTabId = tabs[0].id
      if (!activeTabId) return reject('No active tab!')
      chrome.tabs.sendMessage(activeTabId, AppMessages.GET_URL, resolve)
    })
  })

const handler: PlasmoMessaging.MessageHandler<undefined, IUrlResponseSchema> = async (req, res) => {
  try {
    const url = await getActiveTabURL()
    res.send({ ok: true, url })
  } catch (err) {
    res.send({ ok: false, error: (err as Error).message })
  }
}

export default handler
