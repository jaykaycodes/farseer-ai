export abstract class Parser {
  doc2Prompt(document: Document): string {
    return this._doc2Prompt(document).slice(0, 20000).trim()
  }

  _doc2Prompt(_document: Document): string {
    throw new Error('Not implemented')
  }
}
