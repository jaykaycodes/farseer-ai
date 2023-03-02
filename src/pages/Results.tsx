import { useEffect } from 'react'
import { useStorage } from '@plasmohq/storage/hook'
import { useIsMutating } from '@tanstack/react-query'
import { XIcon } from 'lucide-react'
import { LoaderFunctionArgs, useNavigate, useParams } from 'react-router-dom'

import { StorageKeys } from '~lib/constants'
import { tw } from '~lib/utils'
import { SUBMIT_REQUEST_MUTATION_KEY, useExportResultMutation } from '~queries'
import type { IResult } from '~schemas'

const ResultsPage = () => {
  const navigate = useNavigate()
  const isMutating = 1 === useIsMutating({ mutationKey: SUBMIT_REQUEST_MUTATION_KEY, exact: true })
  const [result] = useStorage<IResult>(StorageKeys.RESULTS, {})

  const projectId = useParams().projectId!
  const {
    mutateAsync: exportResult,
    isLoading: isSendingExport,
    isSuccess: isSuccessExport,
    isError: isErrorExport,
    error,
  } = useExportResultMutation()

  const handleExport = () => {
    if (!result || !projectId) return

    exportResult({ projectId, result })
  }

  useEffect(() => {
    if (result && process.env.NODE_ENV === 'development') console.log(result)
  }, [result])

  const body = isMutating ? (
    <div className="p-8">
      <h3>Loading...</h3>
    </div>
  ) : result ? (
    <>
      <table className="table-compact border-base-200 my-4 mx-3 table overflow-x-auto rounded-sm border">
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
      <div className="bg-base-100 sticky bottom-0 w-full">
        {/* Temporary Feedback */}
        <div className="flex items-center justify-between p-3 ">
          <div>
            {isSendingExport && <div className="base-300 text-sm">Sending...</div>}
            {isSuccessExport && <div className="text-success text-sm">Sent</div>}
            {isErrorExport && <div className="text-error text-sm">{(error as Error).message}</div>}
          </div>
          <button
            type="button"
            disabled={isSendingExport}
            onClick={handleExport}
            className={tw('btn btn-sm' /* sendingToOutlet && 'loading' */)}
          >
            Export
          </button>
        </div>
      </div>
    </>
  ) : (
    <div className="p-8">
      <h3>No results found!</h3>
    </div>
  )

  return (
    <>
      <div className="p-2">
        <button type="button" onClick={() => navigate(-1)} className="btn btn-xs btn-ghost btn-square">
          <XIcon size={16} />
        </button>
      </div>

      {body}
    </>
  )
}

export default ResultsPage

export const loader = async ({ params: _ }: LoaderFunctionArgs) => {
  return null
}
