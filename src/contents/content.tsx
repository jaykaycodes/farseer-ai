import { useState } from 'react'

import { Label } from '~components/ui/Label'
import { Textarea } from '~components/ui/Textarea'

import cssText from 'data-text:~tailwind.css'

export const getStyle = () => {
  const style = document.createElement('style')
  style.textContent = cssText
  return style
}

const PlasmoOverlay = () => {
  const [val, setVal] = useState('')
  const [show, setShow] = useState(true)

  return (
    <div className="fixed top-4 right-4 rounded-md bg-black/50 p-1 font-sans text-gray-900 shadow backdrop-blur-lg">
      {show ? (
        <div className="h-[420px] w-[380px] overflow-y-auto overflow-x-clip rounded-md  bg-white p-3">
          <button onClick={() => setShow(false)}>Hide Farseer</button>

          <div className="mt-5 grid w-full gap-1.5">
            <Label htmlFor="columnNames">Column Names</Label>
            <Textarea
              placeholder="col1, col2, col3"
              id="columnNames"
              value={val}
              onChange={(e) => setVal(e.currentTarget.value)}
            />
          </div>
        </div>
      ) : (
        <button onClick={() => setShow(true)}>Open Farseer</button>
      )}
    </div>
  )
}

export default PlasmoOverlay
