import { useState, useEffect } from 'react'
import { limit } from 'firebase/firestore'
import { subscribeToRecords, addRecord, updateRecord, deleteRecord } from '@/lib/db'
import type { HealthRecord, RecordType } from '@/types'

// 기록이 쌓여도 초기 로딩이 느려지지 않도록 구독 범위 제한
const RECORDS_LIMIT = 500

export function useRecords(catId: string | null) {
  const [records, setRecords] = useState<HealthRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!catId) { setLoading(false); return }
    setLoading(true)
    const unsub = subscribeToRecords(
      catId,
      [limit(RECORDS_LIMIT)],
      (recs) => {
        setRecords(recs)
        setLoading(false)
      },
      (err) => {
        console.error('기록 구독 실패:', err)
        setLoading(false)
      }
    )
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

export function useLastRecord(records: HealthRecord[], type: RecordType) {
  return records.find(r => r.type === type) ?? null
}
