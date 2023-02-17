import { readFileSync } from 'fs'
import path from 'path'

import { HTMLElement, Node, NodeType, parse } from 'node-html-parser'

async function main() {
  const schemaPath = path.join(process.cwd(), 'assets/example.html')
  const htmlPage = readFileSync(schemaPath, 'utf8')
  const parsed = parse(htmlPage)

  const traverse = (element: Node, depth: number) => {
    if (depth >= 100) {
      return
    }
    if (element.nodeType === NodeType.TEXT_NODE) {
      console.log((element as HTMLElement).rawTagName || '')
      console.log(element.text.trim())
    }

    element.childNodes.forEach((child) => traverse(child, depth + 1))
  }

  traverse(parsed, 0)

  console.log(parsed.structuredText)
  // traverse(parsed, '', 0)
}

main()
