import { useEffect, useMemo } from 'react'
import { useStorage } from '@plasmohq/storage/hook'
import { useIsMutating, useQuery } from '@tanstack/react-query'
import { XIcon } from 'lucide-react'
import { LoaderFunctionArgs, useNavigate, useParams } from 'react-router-dom'

import { RESULT_STORAGE_KEY } from '~lib/constants'
import { tw } from '~lib/utils'
import { Q, SUBMIT_REQUEST_MUTATION_KEY, useExportResultsRequestMutations } from '~queries'
import type { IResult } from '~schemas'

const projectQuery = (projectId: string) => Q.project.detail(projectId)

const ResultsPage = () => {
  const navigate = useNavigate()
  const isMutating = 1 === useIsMutating({ mutationKey: SUBMIT_REQUEST_MUTATION_KEY, exact: true })
  const [result] = useStorage<IResult>(RESULT_STORAGE_KEY, {})

  const projectId = useParams().projectId!
  const { data: project } = useQuery(projectQuery(projectId))
  const outlets = useMemo(() => project?.outlets.map((o) => o), [project])
  const mutations = useExportResultsRequestMutations(outlets || [])

  const handleExport = () => {
    if (!outlets) return
    if (!result) return

    if (process.env.NODE_ENV === 'development') console.log('Exporting to outlets: ', outlets)

    mutations.forEach(({ mutation, outlet }) => mutation.mutateAsync({ payload: result, config: outlet }))
  }

  useEffect(() => {
    if (result && process.env.NODE_ENV === 'development') console.log(result)
  }, [result])

  const body = isMutating ? (
    <div className="p-4">
      <h3>Loading...</h3>
    </div>
  ) : result ? (
    <>
      <table className="table-compact border-base-200 my-4 table w-full rounded-sm border">
        <tbody>
          {Object.entries(result).map(([key, value]) => (
            <tr key={key} className="divide-base-200 divide-x">
              <th className="w-1/4 p-0">
                <input className="input input-ghost input-sm w-full rounded-none px-1 font-bold" defaultValue={key} />
              </th>
              <td className="p-0">
                <input className="input input-ghost input-sm w-full rounded-none px-1" defaultValue={`${value}`} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-2 flex justify-end">
        <button
          type="button"
          disabled={mutations.reduce((acc, { mutation }) => acc || mutation.isLoading, false)}
          onClick={handleExport}
          className={tw('btn btn-sm' /* sendingToOutlet && 'loading' */)}
        >
          Export
        </button>
      </div>
    </>
  ) : (
    <div className="p-4">
      <h3>No results found!</h3>
    </div>
  )

  return (
    <>
      <div className="px-2">
        <button type="button" onClick={() => navigate(-1)} className="btn btn-xs btn-ghost btn-square">
          <XIcon size={16} />
        </button>
      </div>

      <div className="overflow-x-auto p-4 pt-1">{body}</div>
    </>
  )
}

export default ResultsPage

export const loader = async ({ params: _ }: LoaderFunctionArgs) => {
  return null
}
