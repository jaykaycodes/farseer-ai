import { HTMLElement, NodeType, parse, TextNode } from 'node-html-parser'

import { Parser } from './base'

export class ZillowHomeDetailParser extends Parser {
  static isSensible(url: URL): boolean {
    return /\/homedetails\/[a-zA-Z0-9-]*\/[0-9_]*_zpid\/$/gi.test(url.pathname) && url.host.endsWith('zillow.com')
  }

  _doc2Html4Prompt(document: Document): string {
    let content = ''

    // Gets the Head element of the DOM
    const headHTMLCollection = document.getElementsByTagName('head')
    if (headHTMLCollection.length > 0) {
      content += headHTMLCollection[0]?.outerHTML
    }

    const searchHTMLCollection = document.getElementById('search-detail-lightbox')
    if (searchHTMLCollection !== null) {
      content += searchHTMLCollection.outerHTML
    }

    const rootElement = parse(`<html>${content}</html>`)

    let GPTStr = ''

    const traverse = (element: HTMLElement, depth: number) => {
      if (depth >= 150) {
        return
      }
      element.childNodes.forEach((child) => {
        if (child.nodeType === NodeType.TEXT_NODE) {
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
}

export class ZillowSearchParser extends Parser {
  static isSensible(url: URL): boolean {
    return /\/homes\/(for_sale|recently_sold|for_rent)\/$/gi.test(url.pathname) && url.host.endsWith('zillow.com')
  }

  _doc2Html4Prompt(document: Document): string {
    let content = ''

    // Gets the Head element of the DOM
    const headHTMLCollection = document.getElementsByTagName('head')
    if (headHTMLCollection.length > 0) {
      content += headHTMLCollection[0]?.outerHTML
    }

    const searchHTMLCollection = document.getElementById('grid-search-results')
    if (searchHTMLCollection !== null) {
      content += searchHTMLCollection.outerHTML
    }

    const rootElement = parse(`<html>${content}</html>`)

    let GPTStr = ''

    const traverse = (element: HTMLElement, depth: number) => {
      if (depth >= 150) {
        return
      }
      element.childNodes.forEach((child) => {
        if (child.nodeType === NodeType.TEXT_NODE) {
          const newLine = this.getNextLine(child as TextNode)

          if (newLine === null) {
            return
          }

          if (newLine.trim().endsWith('Three Dimensional') || newLine.trim().endsWith('Save this home')) {
            return
          }

          GPTStr += newLine
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
}
