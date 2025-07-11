import type { Parser } from './base'
import { OptimisticParser } from './core'
import { LinkedProfileParser } from './linkedin'
import { ZillowHomeDetailParser, ZillowSearchParser } from './zillow'

export function getSensibleParser4URL(url: URL): Parser {
  if (LinkedProfileParser.isSensible(url)) {
    return new LinkedProfileParser()
  } else if (ZillowHomeDetailParser.isSensible(url)) {
    return new ZillowHomeDetailParser()
  } else if (ZillowSearchParser.isSensible(url)) {
    return new ZillowSearchParser()
  } else {
    return new OptimisticParser()
  }
}

export const HTMLTagAllowList = [
  'TITLE',
  'TH',
  'TD',
  'SUMMARY',
  'SUP',
  'SUB',
  'STRONG',
  'TIME',
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
