import type { Parser } from './base'
import { OptimisticParser } from './core'
import { LinkedProfileParser } from './linkedin'

export function getSensibleParser4Host(url: URL): Parser {
  if (LinkedProfileParser.isSensible(url)) {
    return new LinkedProfileParser()
  } else {
    return new OptimisticParser()
  }
}
