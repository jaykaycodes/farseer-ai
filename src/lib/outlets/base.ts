import type { IBaseOutletConfig, IOutletResponse, IParsedResult } from '~schemas'

export abstract class OutletBase<OutletConfig extends IBaseOutletConfig> {
  protected cfg: OutletConfig

  constructor(cfg: OutletConfig) {
    this.cfg = cfg
  }

  async send(payload: IParsedResult): Promise<IOutletResponse> {
    try {
      await this._send(payload)
      return { ok: true }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') console.error(error)
      if (error instanceof Error) return { ok: false, error: error.message }
      return { ok: false, error: 'Unknown error' }
    }
  }

  abstract _send(payload: IParsedResult): Promise<any>
}
