import { Base64 } from 'js-base64'
import type { HTMLElement, TextNode } from 'node-html-parser'

import { HTMLTagAllowList } from '~lib/parsers/utils'

export abstract class Parser {
  doc2Html4Prompt(document: Document): string {
    return this._doc2Html4Prompt(document).trim()
  }

  protected encodedLastAppenedLine: string | null = null

  private returnNullIfDuplicatesLastLine(newLine: string | null): string | null {
    if (newLine === null) {
      return null
    }

    if (this.encodedLastAppenedLine === null) {
      this.encodedLastAppenedLine = Base64.encode(newLine)
      return newLine
    }

    const encodedNewLine = Base64.encode(newLine)
    if (encodedNewLine === this.encodedLastAppenedLine) {
      return null
    }

    this.encodedLastAppenedLine = encodedNewLine
    return newLine
  }

  protected getNextLine(node: TextNode): string | null {
    const newLine = this.getAppendableTextFromTextNode(node)
    return this.returnNullIfDuplicatesLastLine(newLine)
  }

  protected getAppendableTextFromTextNode(node: TextNode): string | null {
    // test if it is only whitespace
    if (node.text.trim() === '') {
      return null
    }

    const parent = node.parentNode

    if (parent === null) {
      throw new Error('Parent node is null')
    }

    // test if tag is not in the allow list
    if (!HTMLTagAllowList.includes(parent.tagName)) {
      return null
    }

    const childContent = node.textContent.trim()

    // test if it is only punctuation
    if (!/[a-zA-Z0-9]/gi.test(childContent)) {
      return null
    }

    if (parent.tagName === 'SPAN') {
      let parentsParent = parent.parentNode
      let loopCount = 0
      while (parentsParent !== null && parentsParent.tagName === 'SPAN' && loopCount < 10) {
        loopCount++
        parentsParent = parentsParent.parentNode
      }

      if (parentsParent === null || parentsParent.tagName === 'SPAN') {
        return childContent
      } else {
        return `\n<${parentsParent.tagName.toLocaleLowerCase()}> ${childContent}`
      }
    }

    // const compareDataRegex = new RegExp('data', 'g')
    // Object.entries(parent.attributes).forEach(([key, value]) => {
    //   if ((compareDataRegex.test(key) || ['id', 'class'].includes(key)) && value.trim() !== '') {
    //     newElement += `${value} `
    //   }
    // })

    return `\n<${parent.tagName.toLocaleLowerCase()}> ${childContent}`
  }

  protected getMetaTagLine(node: HTMLElement): string | null {
    if (Object.hasOwn(node.attrs, 'name')) {
      if (!/title|description/gi.test(node.attrs.name) || node.attrs.content.trim() === '') {
        return null
      }

      return `\n<meta> ${node.attrs.content}`
    }

    if (Object.hasOwn(node.attrs, 'property')) {
      if (!/title|description/gi.test(node.attrs.property) || node.attrs.content.trim() === '') {
        return null
      }
      return `\n<meta> ${node.attrs.content}`
    }

    return null
  }

  _doc2Html4Prompt(_document: Document): string {
    throw new Error('Not implemented')
  }
}
