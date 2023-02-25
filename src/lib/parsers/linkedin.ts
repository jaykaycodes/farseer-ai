import { HTMLElement, NodeType, parse, TextNode } from 'node-html-parser'

import { Parser } from './base'

export class LinkedProfileParser extends Parser {
  static isSensible(url: URL): boolean {
    return /\/in\/[a-zA-Z0-9-]*(\/)?$/gi.test(url.pathname) && url.host.endsWith('linkedin.com')
  }

  _doc2Prompt(document: Document): string {
    let content = ''

    // Gets the Head element of the DOM
    const headHTMLCollection = document.getElementsByTagName('head')
    if (headHTMLCollection.length > 0) {
      content += headHTMLCollection[0]?.outerHTML
    }

    const mainHTMLCollection = document.getElementsByTagName('main')
    if (mainHTMLCollection.length === 0) {
      throw new Error('No main element was found')
    } else {
      content += mainHTMLCollection.item(0)?.outerHTML
    }

    const rootElement = parse(`<html>${content}</html>`)
    let GPTStr = ''

    const traverse = (element: HTMLElement, depth: number) => {
      if (depth >= 150) {
        return
      }
      element.childNodes.forEach((child) => {
        if (child.nodeType === NodeType.TEXT_NODE) {
          const parent = child.parentNode

          if ((parent.attrs['class'] || '').includes('visually-hidden')) {
            return
          }

          const newLine = this.getNextLine(child as TextNode)

          if (newLine !== null) {
            GPTStr += newLine
          }

          return
        }

        if (child.nodeType === NodeType.ELEMENT_NODE) {
          const castedChild = child as HTMLElement

          // if they are Meta tags representing title or description add them to the prompt
          if (castedChild.tagName === 'META') {
            const newLine = this.getMetaTagLine(castedChild)

            if (newLine !== null) {
              GPTStr += newLine
            }
            return
          }

          if (castedChild.tagName === 'SECTION') {
            const h2 = castedChild.getElementsByTagName('h2')[0] || null
            const hSpan = (h2 && h2.getElementsByTagName('span')[0]) || null
            const sectionName = hSpan && hSpan.structuredText
            if (sectionName && ['highlights', 'featured', 'activity'].includes(sectionName.toLocaleLowerCase())) {
              return
            }
          }

          if (castedChild.tagName === 'DIV' && (castedChild.attrs['class'] || '').includes('artdeco-dropdown')) {
            return
          }

          traverse(child as HTMLElement, depth + 1)
        }
      })
    }

    traverse(rootElement, 0)

    return GPTStr
  }
}
