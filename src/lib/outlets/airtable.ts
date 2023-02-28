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
        // TODO - get fields from cfg? or just use payload?
        records: [{ fields: { url: payload.url, time: new Date().toLocaleTimeString(), ...payload } }],
      }),
    })

    if (res.status !== 200) throw new Error(res.statusText || 'Unknown error')
  }
}
