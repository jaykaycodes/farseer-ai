/**
 * A simple script that listens for requests from background to extract the document from
 */
import { APP_MESSAGES } from '~lib/constants'
import { getSensibleParser4URL } from '~lib/parsers/utils'

chrome.runtime.onMessage.addListener((msg, _, res) => {
  if (msg !== APP_MESSAGES.EXTRACT_CONTENT) return
  // Load up the best parser for this page
  const parser = getSensibleParser4URL(new URL(window.location.href))
  // Parse & return to background script!
  const doc = parser.doc2Html4Prompt(document)
  res(doc)
})
