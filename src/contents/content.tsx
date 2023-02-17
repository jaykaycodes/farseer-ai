import { useEffect, useState } from 'react'
import { sendToBackground } from '@plasmohq/messaging'

import { ISubmitRequest, ISubmitResponse, SubmitResponseSchema } from '~background/messages/submit'
import { Button } from '~components/ui/Button'
import { Label } from '~components/ui/Label'
import { Textarea } from '~components/ui/Textarea'
import { TOGGLE_PLUGIN_VISIBILITY } from '~lib/constants'

import cssText from 'data-text:~tailwind.css'

export const getStyle = () => {
  const style = document.createElement('style')
  style.textContent = cssText
  return style
}

const PlasmoOverlay = () => {
  const [sample, setSample] = useState('')
  const [output, setOutput] = useState<string | null>(null)
  const [prompt, setPrompt] = useState<string | null>(null)
  const show = useContentVisibility()

  const handleSubmit = async () => {
    let content = ''
    document.querySelectorAll('span.titleline,span.subline').forEach((el) => {
      content += el.textContent.trim() + '\n'
    })
    content.slice(0, 4000)

    const _res = await sendToBackground<ISubmitRequest, ISubmitResponse>({
      name: 'submit',
      body: {
        sample,
        content,
      },
    })

    const res = SubmitResponseSchema.parse(_res)
    if ('error' in res) {
      console.error(res.error)
      return
    } else if ('output' in res) {
      setPrompt(res.prompt)
      setOutput(res.output)
    }
  }

  return (
    <div className="fixed top-4 right-4 rounded-md bg-black/50 p-1 font-sans text-gray-900 shadow backdrop-blur-lg">
      {show && (
        <div className="h-[420px] w-[380px] overflow-y-auto overflow-x-clip rounded-md  bg-white p-3">
          <div className="mt-5 grid w-full gap-1.5">
            <Label htmlFor="sample">Sample</Label>
            <Textarea
              placeholder={JSON.stringify({ name: 'John Doe', age: 30 })}
              id="sample"
              value={sample}
              onChange={(e) => setSample(e.currentTarget.value)}
            />
          </div>

          <div className="mt-3 flex w-full justify-end">
            <Button className="px-8" variant="ghost">
              Reset
            </Button>
            <Button className="px-8" onClick={handleSubmit}>
              Go!
            </Button>
          </div>
          {prompt && (
            <div className="mt-5">
              <Label htmlFor="columnNames">Prompt</Label>
              <div className="h-36 w-full overflow-y-auto rounded-lg border border-dashed border-gray-400 p-2">
                <pre>{prompt}</pre>
              </div>
            </div>
          )}
          {output && (
            <div className="mt-5">
              <Label htmlFor="columnNames">Output</Label>
              <div className="h-36 w-full overflow-y-auto rounded-lg border border-dashed border-gray-400 p-2">
                <pre>{output}</pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default PlasmoOverlay

const useContentVisibility = () => {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const recvMsg = (msg: unknown) => {
      if (msg === TOGGLE_PLUGIN_VISIBILITY) setShow((prev) => !prev)
    }

    chrome.runtime.onMessage.addListener(recvMsg)
    return () => chrome.runtime.onMessage.removeListener(recvMsg)
  }, [])

  return show
}
