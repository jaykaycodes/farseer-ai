import { readFileSync } from 'fs'
import path from 'path'

import { HTMLElement, NodeType, parse } from 'node-html-parser'

// https://platform.openai.com/playground/p/Z8oqEmAXGhdlDzk6ywQmbZSl?model=text-davinci-003
async function main() {
  const schemaPath = path.join(process.cwd(), 'assets/example.html')
  const htmlPage = readFileSync(schemaPath, 'utf8')
  const parsedDOM = parse(htmlPage)

  const traverse = (element: HTMLElement, depth: number) => {
    if (depth >= 100) {
      return
    }
    element.childNodes.forEach((child) => {
      if (child.nodeType === NodeType.TEXT_NODE && child.text.trim() !== '') {
        if (!['SCRIPT', 'BODY', 'HTML', 'STYLE', 'NOSCRIPT'].includes(child.parentNode.tagName)) {
          // console.log('TAG: ', child.parentNode.tagName)
          // console.log('CONTENT: ', child.textContent.trim())
        }
      } else if (child.nodeType === NodeType.ELEMENT_NODE) {
        traverse(child as HTMLElement, depth + 1)
      }
    })
  }

  traverse(parsedDOM, 0)
}

main()
