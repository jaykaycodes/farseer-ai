import type { IHttpOutlet, IParsedResult } from '~schemas'

import { OutletBase } from './base'

export class HTTPOutlet extends OutletBase<IHttpOutlet> {
  async _send(_payload: IParsedResult): Promise<any> {
    const res = await fetch(this.cfg.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(_payload),
    })

    if (res.status >= 200 && res.status < 300) throw new Error(res.statusText || 'Unknown error')
  }
}
