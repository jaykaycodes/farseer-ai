import { Storage } from '@plasmohq/storage'
import { useStorage } from '@plasmohq/storage/hook'

export const storage = new Storage()

storage.get('projects').then((projects) => {
  if (!projects || projects.length === 0) {
    storage.set('projects', [])
  }
})

export function useOutput() {
  const [output, setOutput] = useStorage<string>('output', '{}')

  return [output, setOutput] as const
}
