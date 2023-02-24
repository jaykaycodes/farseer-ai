import { HTMLElement, NodeType, parse } from 'node-html-parser'

import { HTMLTagAllowList } from '../utils'
import { Parser } from './base'

export class RawParser extends Parser {
  _doc2Prompt(document: Document): string {
    return document.getElementsByTagName('html')[0].outerHTML
  }
}

export class OptimisticParser extends Parser {
  private _doc2OptimisticHTMLStr(document: Document): string {
    let content = ''

    // Gets the Head element of the DOM
    const headHTMLCollection = document.getElementsByTagName('head')
    if (headHTMLCollection.length > 0) {
      content += headHTMLCollection.item(0)?.outerHTML
    }

    // Optimistic HTML Element Extraction

    // First try to get the main element
    const mainHTMLCollection = document.getElementsByTagName('main')
    if (mainHTMLCollection.length > 0) {
      let idx = 0
      while (mainHTMLCollection.item(idx) !== null) {
        content += mainHTMLCollection.item(idx)?.outerHTML
        idx++
      }
      return content
    }

    // if fails, try to get the content element
    const contentHTMLCollection = document.getElementsByClassName('content')
    if (contentHTMLCollection.length > 0) {
      let idx = 0
      while (contentHTMLCollection.item(idx) !== null) {
        content += contentHTMLCollection.item(idx)?.outerHTML
        idx++
      }
      return content
    }

    // if fails, try to the body element
    const bodyHTMLCollection = document.getElementsByTagName('body')
    if (bodyHTMLCollection.length > 0) {
      content += bodyHTMLCollection.item(0)?.outerHTML
      return content
    }

    // if fails, reset content and fallback to the whole document
    return document.getElementsByTagName('html')[0].outerHTML
  }

  private _optimisticHTMLStr2PromptStr(htmlString: string): string {
    const rootElement = parse(`<html>${htmlString}</html>`)
    let GPTStr = ''

    const traverse = (element: HTMLElement, depth: number) => {
      if (depth >= 150) {
        return
      }
      element.childNodes.forEach((child) => {
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

    return GPTStr
  }

  _doc2Prompt(document: Document): string {
    const optimisticHtmlStr = this._doc2OptimisticHTMLStr(document)
    return this._optimisticHTMLStr2PromptStr(optimisticHtmlStr)
  }
}
