import { PLUGIN_TOGGLE_MSG } from '~lib/constants'

export {}

chrome.action.onClicked.addListener((tab) => {
  if (!tab.id) return // NOTE: not sure why id would be undefined
  chrome.tabs.sendMessage(tab.id, PLUGIN_TOGGLE_MSG)
})
