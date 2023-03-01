import { useMemo } from 'react'
import { Tab } from '@headlessui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { Trash2Icon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { LoaderFunctionArgs, useNavigate, useParams } from 'react-router-dom'

import ActionFooterLayout from '~components/ActionFooterLayout'
import { OutletRenderResource } from '~components/OutletRenderResource'
import { tw } from '~lib/utils'
import { Q, queryClient, useDeleteOutletMutation, useUpdateOutletMutation } from '~queries'
import { IOutletConfig, OutletConfigSchema, OutletType } from '~schemas'

const outletQuery = (projectId: string, outletId: string) => Q.project.detail(projectId)._ctx.outlet(outletId)

const EditOutletPage = () => {
  const outletId = useParams().outletId!
  const projectId = useParams().projectId!
  const navigate = useNavigate()

  const { data } = useQuery(outletQuery(projectId, outletId))
  const { mutate } = useUpdateOutletMutation()
  const { register, handleSubmit, setValue } = useForm({
    resolver: zodResolver(OutletConfigSchema),
    values: data,
    mode: 'onBlur',
  })

  const { mutateAsync: deleteOutlet } = useDeleteOutletMutation()
  const handleDeleteOutlet = async () => {
    await deleteOutlet({ projectId, outletId })
    navigate('..')
  }

  const renderableOutlets = useMemo(() => Object.entries(OutletRenderResource), [])

  return (
    <ActionFooterLayout
      actionFooter={
        <>
          <div className="flex w-full items-center justify-end pb-3">
            <button
              type="button"
              className="btn btn-error btn-outline btn-sm flex items-center gap-x-1"
              onClick={handleDeleteOutlet}
            >
              <Trash2Icon size={12} /> Delete
            </button>
          </div>
        </>
      }
    >
      <form
        onBlur={handleSubmit((outlet: IOutletConfig) => {
          mutate({ projectId, outlet })
        })}
      >
        <Tab.Group
          onChange={(index) => {
            const [key] = renderableOutlets[index]
            setValue('type', key as OutletType)
          }}
          defaultIndex={renderableOutlets.findIndex(([key]) => key === data?.type)}
        >
          <Tab.List className={'mx-2 grid grid-cols-3 gap-4'}>
            {renderableOutlets.map(([key, { icon }], idx) => (
              <Tab
                key={`selection-${key}-${idx}`}
                className={({ selected }) =>
                  tw(
                    //Todo: Add focus state
                    'rounded border py-3 shadow',
                    selected && 'bg-base-200',
                  )
                }
              >
                {icon(30, { className: 'mx-auto' })}
                <h3 className="mt-2 text-center text-xs font-semibold uppercase leading-none">{key}</h3>
              </Tab>
            ))}
          </Tab.List>
          <Tab.Panels>
            {renderableOutlets.map(([key, { form }], idx) => {
              return <Tab.Panel key={`form-${key}-${idx}`}>{form(register)}</Tab.Panel>
            })}
          </Tab.Panels>
        </Tab.Group>
      </form>
    </ActionFooterLayout>
  )
}

export default EditOutletPage

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { projectId, outletId } = params
  return queryClient.fetchQuery(outletQuery(projectId!, outletId!))
}
