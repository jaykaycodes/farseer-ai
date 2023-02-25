import { XIcon } from 'lucide-react'
import { LoaderFunctionArgs, useNavigate } from 'react-router-dom'

import { useOutput } from '~lib/storage'
import { tw } from '~lib/utils'

const OutputPage = () => {
  const navigate = useNavigate()

  const [output] = useOutput()

  return (
    <>
      <div className="px-2">
        <button type="button" onClick={() => navigate(-1)} className="btn btn-xs btn-ghost btn-square">
          <XIcon size={16} />
        </button>
      </div>

      <div className="p-4">
        <h3>Output</h3>
        <div className="h-36 w-full overflow-y-auto rounded-lg border border-dashed border-gray-400 p-2">
          <pre>{JSON.stringify(JSON.parse(output), null, 2)}</pre>
        </div>
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            // disabled={sendingToOutlet}
            // onClick={async () => await sendToOutlet()}
            className={tw('btn btn-sm' /* sendingToOutlet && 'loading' */)}
          >
            Export
          </button>
        </div>
      </div>
    </>
  )
}

export default OutputPage

export const loader = async ({ params: _ }: LoaderFunctionArgs) => {
  return null
}
