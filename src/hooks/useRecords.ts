import { useState, useEffect } from 'react'
import { subscribeToRecords, addRecord, updateRecord, deleteRecord } from '@/lib/db'
import type { HealthRecord, RecordType } from '@/types'

export function useRecords(catId: string | null) {
  const [records, setRecords] = useState<HealthRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!catId) { setLoading(false); return }
    setLoading(true)
    const unsub = subscribeToRecords(catId, [], (recs) => {
      setRecords(recs)
      setLoading(false)
    })
    return unsub
  }, [catId])

  const add = (record: Omit<HealthRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!catId) return Promise.resolve('')
    return addRecord(catId, record)
  }

  const update = (recordId: string, data: Partial<HealthRecord>) => {
    if (!catId) return Promise.resolve()
    return updateRecord(catId, recordId, data)
  }

  const remove = (recordId: string) => {
    if (!catId) return Promise.resolve()
    return deleteRecord(catId, recordId)
  }

  return { records, loading, add, update, remove }
}

export function useTodayRecords(records: HealthRecord[]) {
  const today = new Date().toDateString()
  return records.filter(r => new Date(r.recordedAt).toDateString() === today)
}

export function useLastRecord(records: HealthRecord[], type: RecordType) {
  return records.find(r => r.type === type) ?? null
}
