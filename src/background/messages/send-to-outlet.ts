import type { PlasmoMessaging } from '@plasmohq/messaging'

import type { IOutletRequest, IOutletResponse } from '~schemas'

const handler: PlasmoMessaging.MessageHandler<IOutletRequest, IOutletResponse> = async (req, res) => {
  const body = req.body

  const _res = await fetch('https://api.airtable.com/v0/appoodzGBt25yz8UE/tblXVIPnMb0zDu3Hv', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      records: [{ fields: { url: body?.payload?.url, time: new Date().toLocaleTimeString(), ...body?.payload } }],
    }),
  })

  if (_res.status === 200) {
    res.send({ ok: true })
    return
  } else {
    res.send({
      ok: false,
      error: _res.statusText || 'Unknown error',
    })
    return
  }
}

export default handler
