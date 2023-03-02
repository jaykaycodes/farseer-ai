import { AppMessages } from '~lib/constants'

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return // NOTE: not sure why id would be undefined

  await chrome.tabs.sendMessage(tab.id, AppMessages.TOGGLE_PLUGIN_VISIBILITY)
})
