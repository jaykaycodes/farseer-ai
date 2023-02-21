import { HTMLElement, NodeType, parse } from 'node-html-parser'

// const schemaPath = path.join(process.cwd(), 'assets/example_turing.html')
// const htmlPage = readFileSync(schemaPath, 'utf8')
// https://platform.openai.com/playground/p/Z8oqEmAXGhdlDzk6ywQmbZSl?model=text-davinci-003
// https://platform.openai.com/tokenizer
export function html2GPTStr(htmlString: string): string {
  const rootElement = parse(htmlString)
  let GPTStr = ''

  const traverse = (element: HTMLElement, depth: number) => {
    if (depth >= 150) {
      return
    }
    element.childNodes.forEach((child, idx) => {
      if (child.nodeType === NodeType.TEXT_NODE && child.text.trim() !== '') {
        const parent = child.parentNode
        if (!['SCRIPT', 'BODY', 'HTML', 'STYLE', 'NOSCRIPT', 'LINK', 'NAV', 'FOOTER'].includes(parent.tagName)) {
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
          (Object.hasOwn(childEle.attributes, 'name') || Object.hasOwn(childEle.attributes, 'property'))
        ) {
          if (
            /'title|description'/gi.test(childEle.attributes.name) ||
            /'title|description'/gi.test(childEle.attributes.property)
          ) {
            GPTStr += `\n<META> ${childEle.attributes.content}`
          }
          // don't parse children if they are in a nav or footer or menu
        } else if (
          /nav|footer|menu/gi.test(childEle.attrs['class'] || '') ||
          /nav|footer|menu/gi.test(childEle.attrs['id'] || '') ||
          ['NAV', 'FOOTER'].includes(childEle.tagName)
        ) {
          return
        } else {
          traverse(child as HTMLElement, depth + 1)
        }
      }
    })
  }

  traverse(rootElement, 0)

  return GPTStr.slice(0, 5000).trim()
}
