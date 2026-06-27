import { useState } from 'react'
import { Chip } from '@/components/ui/Chip'
import { DateTimeInput, toLocalDateTimeString } from '@/components/ui/DateTimeInput'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { TextArea } from '@/components/ui/TextArea'
import { Button } from '@/components/ui/Button'
import type { WeightDetails } from '@/types'

interface InitialValues { recordedAt: string; note?: string; details: WeightDetails }

interface Props {
  onSave: (details: WeightDetails, recordedAt: string, note: string) => void
  loading?: boolean
  onDirty?: () => void
  initialValues?: InitialValues
}

export function WeightForm({ onSave, loading, onDirty, initialValues }: Props) {
  const iv = initialValues?.details
  const [recordedAt, setRecordedAt] = useState(
    initialValues ? toLocalDateTimeString(new Date(initialValues.recordedAt)) : toLocalDateTimeString()
  )
  const [weightStr, setWeightStr] = useState(iv ? String(iv.weightKg) : '')
  const [context, setContext] = useState<WeightDetails['measurementContext']>(iv?.measurementContext ?? 'self')
  const [note, setNote] = useState(initialValues?.note ?? '')

  const weight = parseFloat(weightStr)
  const valid = !isNaN(weight) && weight > 0

  const handleSave = () => {
    if (!valid) return
    onSave({ weightKg: weight, measurementContext: context }, new Date(recordedAt).toISOString(), note)
  }

  return (
    <div className="flex flex-col gap-4">
      <DateTimeInput label="날짜 및 시간" value={recordedAt} onChange={setRecordedAt} />

      <SectionLabel>체중 (kg)</SectionLabel>
      <div className="relative">
        <input
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          max="30"
          value={weightStr}
          onChange={e => { setWeightStr(e.target.value); onDirty?.() }}
          placeholder="예: 4.35"
          className="w-full px-4 py-4 bg-gray-100 rounded-2xl text-2xl font-bold text-center text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-300"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary text-lg">kg</span>
      </div>

      <SectionLabel>측정 방법</SectionLabel>
      <div className="flex gap-2">
        <Chip label="자가 측정" selected={context === 'self'} onClick={() => setContext('self')} />
        <Chip label="병원 측정" selected={context === 'clinic'} onClick={() => setContext('clinic')} />
      </div>

      <TextArea label="메모" value={note} onChange={setNote} placeholder="추가 메모 (선택)" />

      <Button size="lg" onClick={handleSave} loading={loading} disabled={!valid}>
        저장하기
      </Button>
    </div>
  )
}
