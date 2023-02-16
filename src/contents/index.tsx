import { useReducer } from 'react'

import cssText from 'data-text:~tailwind.css'

export const getStyle = () => {
  const style = document.createElement('style')
  style.textContent = cssText
  return style
}

const PlasmoOverlay = () => {
  const [count, increase] = useReducer((c) => c + 1, 0)

  return (
    <div className="fixed top-4 right-4 rounded-md bg-black/50 p-1 shadow backdrop-blur-lg">
      <div className="h-[420px] w-[380px] overflow-y-auto overflow-x-clip rounded-md  bg-white p-3">
        {count}
        <button onClick={increase} type="button" className="btn btn-primary">
          Inc
        </button>
      </div>
    </div>
  )
}

export default PlasmoOverlay
