import { twMerge } from 'tailwind-merge'

export const tw = twMerge

export function doc2HTMLString(document: Document): string {
  let content = ''

  const headHTMLCollection = document.getElementsByTagName('head')
  if (headHTMLCollection.length > 0) {
    content += headHTMLCollection.item(0)?.outerHTML
  }

  const mainHTMLCollection = document.getElementsByTagName('main')
  if (mainHTMLCollection.length > 0) {
    let idx = 0
    while (mainHTMLCollection.item(idx) !== null) {
      content += mainHTMLCollection.item(idx)?.outerHTML
      idx++
    }
    return content
  }

  const contentHTMLCollection = document.getElementsByClassName('content')
  if (contentHTMLCollection.length > 0) {
    let idx = 0
    while (contentHTMLCollection.item(idx) !== null) {
      content += contentHTMLCollection.item(idx)?.outerHTML
      idx++
    }
    return content
  }

  const bodyHTMLCollection = document.getElementsByTagName('body')
  if (bodyHTMLCollection.length > 0) {
    content += bodyHTMLCollection.item(0)?.outerHTML
    return content
  }

  return content
}

export const HTMLTagAllowList = [
  'TITLE',
  'TH',
  'TD',
  'SUMMARY',
  'SUP',
  'SUB',
  'STRONG',
  'SPAN',
  'SMALL',
  'SECTION',
  'S',
  'Q',
  'PRE',
  'P',
  'META',
  'LI',
  'MAIN',
  'LABEL',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'EM',
  'DT',
  'DIV',
  'DETAILS',
  'PRE',
  'CITE',
  'A',
  'ARTICLE',
  'ABBR',
  'STRIKE',
]
