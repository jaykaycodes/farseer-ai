import type { PlasmoMessaging } from '@plasmohq/messaging'

import type { OutletBase } from '~lib/outlets'
import * as outlets from '~lib/outlets'
import { IBaseOutletConfig, IOutletRequest, IOutletResponse, OutletType } from '~schemas'

const handler: PlasmoMessaging.MessageHandler<IOutletRequest, IOutletResponse> = async (req, res) => {
  const { config, result } = req.body ?? {}
  if (!config) throw new Error('Outlet config not found')
  if (!result) throw new Error('No payload found')

  let outlet: OutletBase<IBaseOutletConfig>
  switch (config.type) {
    case OutletType.Airtable:
      outlet = new outlets.AirtableOutlet(config)
      break
    case OutletType.HTTP:
      outlet = new outlets.HTTPOutlet(config)
  }

  const outletResponse = await outlet.send(result)
  res.send(outletResponse)
}

export default handler
