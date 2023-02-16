import { TOGGLE_PLUGIN_VISIBILITY } from '~lib/constants'

chrome.action.onClicked.addListener((tab) => {
  if (!tab.id) return // NOTE: not sure why id would be undefined

  chrome.tabs.sendMessage(tab.id, TOGGLE_PLUGIN_VISIBILITY)
})
