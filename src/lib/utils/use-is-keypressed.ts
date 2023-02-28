import { useEffect, useState } from 'react'

export function useIsKeypressed(initialKey: string) {
  const [isPressed, setPressed] = useState(false)

  function downHandler({ key }: KeyboardEvent) {
    if (key === initialKey) {
      console.log(key)
      setPressed(true)
    }
  }

  const upHandler = ({ key }: KeyboardEvent) => {
    if (key === initialKey) {
      setPressed(false)
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', downHandler)
    window.addEventListener('keyup', upHandler)
    return () => {
      window.removeEventListener('keydown', downHandler)
      window.removeEventListener('keyup', upHandler)
    }
  }, [initialKey])

  return isPressed
}
