import { createContext, useContext, type ReactNode } from 'react'
import type { RecordType } from '@/types'

interface RecordSheetContextValue {
  openSheet: (type?: RecordType) => void
}

const RecordSheetContext = createContext<RecordSheetContextValue>({ openSheet: () => {} })

export function useRecordSheet() {
  return useContext(RecordSheetContext)
}

interface Props {
  children: ReactNode
  onOpen: (type?: RecordType) => void
}

export function RecordSheetProvider({ children, onOpen }: Props) {
  return (
    <RecordSheetContext.Provider value={{ openSheet: onOpen }}>
      {children}
    </RecordSheetContext.Provider>
  )
}
