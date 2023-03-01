import { APP_MESSAGES } from '~lib/constants'

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return // NOTE: not sure why id would be undefined

  await chrome.tabs.sendMessage(tab.id, APP_MESSAGES.TOGGLE_PLUGIN_VISIBILITY)
})
