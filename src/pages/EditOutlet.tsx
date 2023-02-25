import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { Trash2Icon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { LoaderFunctionArgs, useNavigate, useParams } from 'react-router-dom'

import TextField from '~components/fields/TextField'
import { tw } from '~lib/utils'
import { Q, queryClient, useDeleteOutletMutation, useUpdateOutletMutation } from '~queries'
import { IOutletConfig, OutletConfigSchema } from '~schemas'

const outletQuery = (projectId: string, outletId: string) => Q.project.detail(projectId)._ctx.outlet(outletId)

const EditOutletPage = () => {
  const outletId = useParams().outletId!
  const projectId = useParams().projectId!
  const navigate = useNavigate()

  const { data } = useQuery(outletQuery(projectId, outletId))
  const { mutate } = useUpdateOutletMutation()
  const { register, handleSubmit } = useForm({
    resolver: zodResolver(OutletConfigSchema),
    values: data,
    mode: 'onSubmit',
  })

  const { mutateAsync: deleteOutlet } = useDeleteOutletMutation()
  const handleDeleteOutlet = async () => {
    await deleteOutlet({ projectId, outletId })
    navigate('..')
  }

  return (
    <form
      onSubmit={handleSubmit((outlet: IOutletConfig) => {
        mutate({ projectId, outlet })
      })}
    >
      <TextField label="Outlet" defaultValue={'airtable'} autoComplete="off" {...register('type')} />
      <TextField label="Base ID" placeholder="appoodzGBt25yz8UE" autoComplete="off" {...register('baseId')} />
      <TextField label="Table ID" placeholder="tblXVIPnMb0zDu3Hv" autoComplete="off" {...register('tableId')} />

      {/* <CodeMirror style={{ fontSize: '16px' }} {...register('function')} /> */}
      <button type="submit" className={tw('btn btn-sm')}>
        Save
      </button>

      <div className="flex w-full items-center justify-end">
        <button
          type="button"
          className="btn btn-error btn-outline btn-sm flex items-center gap-x-1"
          onClick={handleDeleteOutlet}
        >
          <Trash2Icon size={12} /> Delete
        </button>
      </div>
    </form>
  )
}

export default EditOutletPage

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { projectId, outletId } = params
  return queryClient.fetchQuery(outletQuery(projectId!, outletId!))
}
