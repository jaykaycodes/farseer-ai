import type { ICsvOutletConfig, IParsedResult } from '~schemas'

import { OutletBase } from './base'

export class CsvOutlet extends OutletBase<ICsvOutletConfig> {
  async _send(_payload: IParsedResult): Promise<any> {
    throw new Error('Not implemented')
  }
}
