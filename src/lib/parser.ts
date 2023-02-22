import { HTMLElement, NodeType, parse } from 'node-html-parser'

import { HTMLTagAllowList } from './utils'

// const schemaPath = path.join(process.cwd(), 'assets/example_turing.html')
// const htmlPage = readFileSync(schemaPath, 'utf8')
// https://platform.openai.com/playground/p/Z8oqEmAXGhdlDzk6ywQmbZSl?model=text-davinci-003
// https://platform.openai.com/tokenizer
export function html2GPTStr(htmlString: string): string {
  const rootElement = parse(`<html>${htmlString}</html>`)
  let GPTStr = ''

  const traverse = (element: HTMLElement, depth: number) => {
    if (depth >= 150) {
      return
    }
    element.childNodes.forEach((child, idx) => {
      if (child.nodeType === NodeType.TEXT_NODE && child.text.trim() !== '') {
        const parent = child.parentNode
        if (HTMLTagAllowList.includes(parent.tagName)) {
          const childContent = child.textContent.trim()
          if (/[a-zA-Z0-9]/gi.test(childContent)) {
            GPTStr += `\n<${parent.tagName}> ${childContent}`
          }

          // const compareDataRegex = new RegExp('data', 'g')
          // Object.entries(parent.attributes).forEach(([key, value]) => {
          //   if ((compareDataRegex.test(key) || ['id', 'class'].includes(key)) && value.trim() !== '') {
          //     newElement += `${value} `
          //   }
          // })
        }
      } else if (child.nodeType === NodeType.ELEMENT_NODE) {
        const childEle = child as HTMLElement

        // if they are Meta tags representing title or description
        if (
          childEle.tagName === 'META' &&
          (Object.hasOwn(childEle.attrs, 'name') || Object.hasOwn(childEle.attrs, 'property'))
        ) {
          console.log(childEle.tagName)
          if (/title|description/gi.test(childEle.attrs.name) || /title|description/gi.test(childEle.attrs.property)) {
            GPTStr += `\n<META> ${childEle.attrs.content}`
          }
          // don't parse children if they are in a nav or footer or menu
        } else if (
          ['NAV', 'FOOTER', 'ASIDE'].includes(childEle.tagName) ||
          /nav|footer|menu/gi.test(childEle.attrs['class'] || '') ||
          /nav|footer|menu/gi.test(childEle.attrs['id'] || '')
        ) {
          return
        } else {
          traverse(child as HTMLElement, depth + 1)
        }
      }
    })
  }

  traverse(rootElement, 0)

  return GPTStr.slice(0, 6000).trim()
}
