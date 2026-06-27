import { useState } from 'react'
import { Chip } from '@/components/ui/Chip'
import { DateTimeInput, toLocalDateTimeString } from '@/components/ui/DateTimeInput'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { TextArea } from '@/components/ui/TextArea'
import { Button } from '@/components/ui/Button'
import type { ToiletDetails, ToiletType, ToiletAmount, Consistency } from '@/types'

const AMOUNTS: { label: string; value: ToiletAmount }[] = [
  { label: '거의 없음', value: 'none' },
  { label: '작음', value: 'small' },
  { label: '보통', value: 'normal' },
  { label: '큼', value: 'large' },
  { label: '매우 큼', value: 'very_large' },
]

const URINE_CONDITIONS = ['평소와 같음', '색이 진함', '혈뇨 의심', '냄새 강함', '배뇨 시 힘들어함', '자주 감', '못 눔']

const FECES_CONDITIONS = ['평소와 같음', '검은색', '붉은색', '노란색', '점액', '혈변 의심', '털 많음', '기생충 의심']

const CONSISTENCY: { label: string; value: Consistency }[] = [
  { label: '딱딱함', value: 'hard' },
  { label: '정상', value: 'normal' },
  { label: '무름', value: 'soft' },
  { label: '설사', value: 'loose' },
  { label: '물설사', value: 'liquid' },
]

const FECES_COUNT: { label: string; value: 1 | 2 | 3 }[] = [
  { label: '1회', value: 1 },
  { label: '2회', value: 2 },
  { label: '3회 이상', value: 3 },
]

interface InitialValues { recordedAt: string; note?: string; details: ToiletDetails }

interface Props {
  initialType?: ToiletType
  onSave: (details: ToiletDetails, recordedAt: string, note: string) => void
  loading?: boolean
  onDirty?: () => void
  initialValues?: InitialValues
}

export function ToiletForm({ initialType, onSave, loading, onDirty, initialValues }: Props) {
  const iv = initialValues?.details
  const [recordedAt, setRecordedAt] = useState(
    initialValues ? toLocalDateTimeString(new Date(initialValues.recordedAt)) : toLocalDateTimeString()
  )
  const [toiletType, setToiletType] = useState<ToiletType>(iv?.toiletType ?? initialType ?? 'urine')
  const [amount, setAmount] = useState<ToiletAmount | null>(iv?.amount ?? null)
  const [conditionTags, setConditionTags] = useState<string[]>(iv?.conditionTags ?? [])
  const [consistency, setConsistency] = useState<Consistency | null>(iv?.consistency ?? null)
  const [count, setCount] = useState<1 | 2 | 3 | null>(iv?.count ?? null)
  const [note, setNote] = useState(initialValues?.note ?? '')

  const toggleTag = (tag: string) => {
    setConditionTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  const handleSave = () => {
    if (!amount) return
    onSave(
      {
        toiletType,
        amount,
        conditionTags: conditionTags.length ? conditionTags : undefined,
        consistency: toiletType === 'feces' && consistency ? consistency : undefined,
        count: toiletType === 'feces' && count ? count : undefined,
      },
      new Date(recordedAt).toISOString(),
      note
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <DateTimeInput label="날짜 및 시간" value={recordedAt} onChange={setRecordedAt} />

      <SectionLabel>종류</SectionLabel>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => { setToiletType('urine'); setConditionTags([]); onDirty?.() }}
          className={[
            'flex-1 py-4 rounded-2xl text-sm font-semibold transition-all',
            toiletType === 'urine' ? 'bg-info text-white' : 'bg-gray-100 text-text-primary',
          ].join(' ')}
        >
          💧 소변
        </button>
        <button
          type="button"
          onClick={() => { setToiletType('feces'); setConditionTags([]); onDirty?.() }}
          className={[
            'flex-1 py-4 rounded-2xl text-sm font-semibold transition-all',
            toiletType === 'feces' ? 'bg-amber-500 text-white' : 'bg-gray-100 text-text-primary',
          ].join(' ')}
        >
          🟤 대변
        </button>
      </div>

      <SectionLabel>양</SectionLabel>
      <div className="flex flex-wrap gap-2">
        {AMOUNTS.map(a => (
          <Chip key={a.value} label={a.label} selected={amount === a.value} onClick={() => { setAmount(a.value); onDirty?.() }} />
        ))}
      </div>

      {toiletType === 'feces' && (
        <>
          <SectionLabel>횟수</SectionLabel>
          <div className="flex gap-2">
            {FECES_COUNT.map(c => (
              <Chip key={c.value} label={c.label} selected={count === c.value} onClick={() => setCount(c.value)} />
            ))}
          </div>

          <SectionLabel>굳기</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {CONSISTENCY.map(c => (
              <Chip key={c.value} label={c.label} selected={consistency === c.value} onClick={() => setConsistency(c.value)} />
            ))}
          </div>
        </>
      )}

      <SectionLabel>상태</SectionLabel>
      <div className="flex flex-wrap gap-2">
        {(toiletType === 'urine' ? URINE_CONDITIONS : FECES_CONDITIONS).map(t => (
          <Chip key={t} label={t} selected={conditionTags.includes(t)} onClick={() => toggleTag(t)} />
        ))}
      </div>

      <TextArea label="메모" value={note} onChange={setNote} placeholder="추가 메모 (선택)" />

      <Button size="lg" onClick={handleSave} loading={loading} disabled={!amount}>
        저장하기
      </Button>
    </div>
  )
}
