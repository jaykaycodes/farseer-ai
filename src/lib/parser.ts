import { readFileSync } from 'fs'
import path from 'path'

import { HTMLElement, NodeType, parse } from 'node-html-parser'

// https://platform.openai.com/playground/p/Z8oqEmAXGhdlDzk6ywQmbZSl?model=text-davinci-003
// https://platform.openai.com/tokenizer
async function main() {
  const schemaPath = path.join(process.cwd(), 'assets/example_turing.html')
  const htmlPage = readFileSync(schemaPath, 'utf8')
  const parsedDOM = parse(htmlPage)

  // console.log(parsedDOM.structuredText)

  let htmlstr = ''
  const compareMetaRegex = new RegExp('title|description', 'g')
  const compareDataRegex = new RegExp('data', 'g')

  const traverse = (element: HTMLElement, path: string, depth: number) => {
    if (depth >= 150) {
      return
    }
    element.childNodes.forEach((child, idx) => {
      if (child.nodeType === NodeType.TEXT_NODE && child.text.trim() !== '') {
        const parent = child.parentNode
        if (!['SCRIPT', 'BODY', 'HTML', 'STYLE', 'NOSCRIPT'].includes(parent.tagName)) {
          // let newElement = `\n${parent.tagName} `
          let newElement = `\n`
          // Object.entries(parent.attributes).forEach(([key, value]) => {
          //   if ((compareDataRegex.test(key) || ['id', 'class'].includes(key)) && value.trim() !== '') {
          //     newElement += `${value} `
          //   }
          // })
          newElement += child.textContent.trim()
          htmlstr += newElement
        }
      } else if (child.nodeType === NodeType.ELEMENT_NODE) {
        const childEle = child as HTMLElement
        if (
          childEle.tagName === 'META' &&
          (Object.hasOwn(childEle.attributes, 'name') || Object.hasOwn(childEle.attributes, 'property'))
        ) {
          if (compareMetaRegex.test(childEle.attributes.name) || compareMetaRegex.test(childEle.attributes.property)) {
            // htmlstr += `\nMETA ${childEle.attributes.content}`
            htmlstr += `\n${childEle.attributes.content}`
          }
        } else {
          traverse(child as HTMLElement, `${path}.children[${idx}]`, depth + 1)
        }
      }
    })
  }

  traverse(parsedDOM, `root`, 0)
  console.log(htmlstr)
}

main()
