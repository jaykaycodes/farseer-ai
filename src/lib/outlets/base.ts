import type { IOutletResponse, IParsedResult } from '~schemas'

export abstract class OutletBase {
  async send(payload: IParsedResult): Promise<IOutletResponse> {
    try {
      await this._send(payload)
      return { ok: true }
    } catch (error) {
      if (error instanceof Error) return { ok: false, error: error.message }
      return { ok: false, error: 'Unknown error' }
    }
  }

  abstract _send(payload: IParsedResult): Promise<any>
}
