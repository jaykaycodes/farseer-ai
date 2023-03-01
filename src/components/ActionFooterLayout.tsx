import type { ReactNode } from 'react'

export const ActionFooterLayout = ({ children, actionFooter }: { children: ReactNode; actionFooter: ReactNode }) => {
  return (
    <div className="-mb-3">
      {children}

      <div className="bg-base-100 sticky bottom-0 w-full">{actionFooter}</div>
    </div>
  )
}

export default ActionFooterLayout
