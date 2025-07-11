import type { IAirtableOutletConfig, IParsedResult } from '~schemas'

import { OutletBase } from './base'

export class AirtableOutlet extends OutletBase<IAirtableOutletConfig> {
  async _send(payload: IParsedResult): Promise<any> {
    const res = await fetch(`https://api.airtable.com/v0/${this.cfg.baseId}/${this.cfg.tableId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.cfg.authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        records: [{ fields: payload }],
      }),
    })

    if (res.status < 200 || res.status >= 300) throw new Error(`${res.status} - ${res.statusText || 'Unknown error'}`)
  }
}
