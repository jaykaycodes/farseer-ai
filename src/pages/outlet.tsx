import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeftIcon, Trash2Icon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, LoaderFunctionArgs, useNavigate, useParams } from 'react-router-dom'

import TextField from '~components/fields/TextField'
import { useDeleteOutletMutation, useUpdateOutletMutation } from '~lib/mutations'
import { DEFAULT_PROJECT_ID, Q, queryClient } from '~lib/queries'
import { IOutlet, OutletSchema } from '~lib/schemas'
import { tw } from '~lib/utils'

const outletQuery = (projectId: string, outletId: string) => Q.project.detail(projectId)._ctx.outlet(outletId)

const OutletPage = () => {
  const projectId = DEFAULT_PROJECT_ID
  const navigate = useNavigate()
  const outletId = useParams().outletId!
  const { data } = useQuery(outletQuery(projectId, outletId))
  const { mutate } = useUpdateOutletMutation()
  const { register, handleSubmit, formState } = useForm({
    resolver: zodResolver(OutletSchema),
    values: data,
    mode: 'onSubmit',
  })

  const { mutateAsync: deleteOutlet } = useDeleteOutletMutation()
  const handleDeleteOutlet = async () => {
    await deleteOutlet({ projectId: DEFAULT_PROJECT_ID, outletId })
    navigate('..')
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <Link to=".." className="inline-flex items-center gap-x-1">
          <ChevronLeftIcon size={14} /> Back
        </Link>

        <button type="button" className="text-error inline-flex items-center" onClick={handleDeleteOutlet}>
          <Trash2Icon size={14} />
        </button>
      </div>

      <form
        onSubmit={handleSubmit((outlet: IOutlet) => {
          mutate({ projectId, outlet })
        })}
      >
        <TextField label="Outlet" defaultValue={'airtable'} autoComplete="off" {...register('outlet')} />
        <TextField label="Base ID" placeholder="appoodzGBt25yz8UE" autoComplete="off" {...register('baseId')} />
        <TextField label="Table ID" placeholder="tblXVIPnMb0zDu3Hv" autoComplete="off" {...register('tableId')} />

        {/* <CodeMirror style={{ fontSize: '16px' }} {...register('function')} /> */}
        <button type="submit" className={tw('btn btn-sm')}>
          Save
        </button>
      </form>
    </>
  )
}

export default OutletPage

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const projectId = DEFAULT_PROJECT_ID
  const { outletId } = params
  return queryClient.fetchQuery(outletQuery(projectId, outletId!))
}
