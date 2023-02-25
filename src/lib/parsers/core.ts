import { HTMLElement, NodeType, parse, TextNode } from 'node-html-parser'

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
    const mainClassHTMLCollection = document.getElementsByClassName('main')
    if (mainClassHTMLCollection.length > 0) {
      let idx = 0
      while (mainClassHTMLCollection.item(idx) !== null) {
        content += mainClassHTMLCollection.item(idx)?.outerHTML
        idx++
      }
      return content
    }

    // if fails, try to get the content element
    const mainIdHTMLCollection = document.getElementById('main')
    if (mainIdHTMLCollection !== null) {
      return mainIdHTMLCollection.outerHTML
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
        if (child.nodeType === NodeType.TEXT_NODE) {
          const newLine = this.getNextLine(child as TextNode)

          console.log(newLine)

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

          // if it is nav or footer, skip it
          if (
            ['NAV', 'FOOTER', 'ASIDE'].includes(castedChild.tagName) ||
            /nav|footer|menu/gi.test(castedChild.attrs['class'] || '') ||
            /nav|footer|menu/gi.test(castedChild.attrs['id'] || '')
          ) {
            return
          }

          traverse(castedChild, depth + 1)
        }

        return
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
