import { HTMLElement, NodeType, parse } from 'node-html-parser'

import { HTMLTagAllowList } from '../utils'
import { Parser } from './base'

export class LinkedProfileParser extends Parser {
  static isSensible(url: URL): boolean {
    return url.pathname.startsWith('/in/') && url.host.endsWith('linkedin.com')
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
        if (child.nodeType === NodeType.TEXT_NODE && child.text.trim() !== '') {
          const parent = child.parentNode
          const parentClass = parent.attrs['class'] || ''
          if (HTMLTagAllowList.includes(parent.tagName) && !parentClass.includes('visually-hidden')) {
            const childContent = child.textContent.trim()
            if (/[a-zA-Z0-9]/gi.test(childContent)) {
              // Goes up an extra leve because linkedin wraps all in spans
              GPTStr += `\n<${parent.parentNode.tagName}> ${childContent}`
            }
          }
        } else if (child.nodeType === NodeType.ELEMENT_NODE) {
          const childEle = child as HTMLElement

          // if they are Meta tags representing title or description add them to the prompt
          if (
            childEle.tagName === 'META' &&
            (Object.hasOwn(childEle.attrs, 'name') || Object.hasOwn(childEle.attrs, 'property'))
          ) {
            if (
              /title|description/gi.test(childEle.attrs.name) ||
              /title|description/gi.test(childEle.attrs.property)
            ) {
              GPTStr += `\n<META> ${childEle.attrs.content}`
            }
            // don't parse children it's in the activity, featured, or highlights section
          } else if (childEle.tagName === 'SECTION') {
            const h2 = childEle.getElementsByTagName('h2')[0] || null
            const hSpan = (h2 && h2.getElementsByTagName('span')[0]) || null
            const sectionName = hSpan && hSpan.structuredText
            if (sectionName && ['highlights', 'featured', 'activity'].includes(sectionName.toLocaleLowerCase())) {
              return
            } else {
              traverse(child as HTMLElement, depth + 1)
            }
          } else if (childEle.tagName === 'DIV' && (childEle.attrs['class'] || '').includes('artdeco-dropdown')) {
            return
          } else {
            traverse(child as HTMLElement, depth + 1)
          }
        }
      })
    }

    traverse(rootElement, 0)

    return GPTStr
  }
}
