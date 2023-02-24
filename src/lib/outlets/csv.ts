import type { ICsvOutletConfig, IParsedResult } from '~schemas'

import { OutletBase } from './base'

export class CsvOutlet extends OutletBase {
  private cfg: ICsvOutletConfig

  constructor(cfg: ICsvOutletConfig) {
    super()
    this.cfg = cfg
  }

  async _send(_payload: IParsedResult): Promise<any> {
    throw new Error('Not implemented')
  }
}
