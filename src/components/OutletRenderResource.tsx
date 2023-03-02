import { WebhookIcon } from 'lucide-react'
import type { HTMLAttributes, ReactNode } from 'react'
import type { UseFormRegister } from 'react-hook-form'

import TextField from '~components/fields/TextField'
import { IOutletConfig, OutletType } from '~schemas'

import airtable from 'data-base64:~assets/outletIcons/airtable.png'

export const OutletRenderResource: Record<
  OutletType,
  {
    icon: (size: number, props: HTMLAttributes<HTMLImageElement | SVGSVGElement>) => ReactNode
    form: (register: UseFormRegister<IOutletConfig>) => ReactNode
  }
> = {
  [OutletType.Airtable]: {
    icon: (size: number, props: HTMLAttributes<HTMLImageElement>) => (
      <img {...props} src={airtable} alt="airtable icon" height={size} width={size} />
    ),
    form: (register: UseFormRegister<IOutletConfig>) => (
      <>
        <TextField label="API Key" placeholder="personal-api-key" autoComplete="off" {...register('authToken')} />
        <TextField label="Base ID" placeholder="appoodzGBt25yz8UE" autoComplete="off" {...register('baseId')} />
        <TextField label="Table ID" placeholder="tblXVIPnMb0zDu3Hv" autoComplete="off" {...register('tableId')} />
        <TextField
          wrapperClassName="hidden"
          defaultValue={OutletType.Airtable}
          autoComplete="off"
          {...register('type')}
        />
      </>
    ),
  },
  [OutletType.HTTP]: {
    icon: (size: number, props: HTMLAttributes<SVGSVGElement>) => <WebhookIcon {...props} size={size} />,
    form: (register: UseFormRegister<IOutletConfig>) => (
      <>
        <TextField
          label="URL"
          placeholder="https://hooks.zapier.com/hooks/catch/98699/3omt/"
          autoComplete="off"
          {...register('url')}
        />
        <TextField wrapperClassName="hidden" defaultValue={OutletType.HTTP} {...register('type')} />
      </>
    ),
  },
}
