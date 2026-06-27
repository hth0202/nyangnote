import { useState } from 'react'
import { Chip } from '@/components/ui/Chip'
import { DateTimeInput, toLocalDateTimeString } from '@/components/ui/DateTimeInput'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { TextArea } from '@/components/ui/TextArea'
import { Button } from '@/components/ui/Button'
import type { FoodDetails, FoodType, FoodUnit, EatenRatio } from '@/types'

const FOOD_TYPES: { value: FoodType; label: string }[] = [
  { value: 'dry', label: '건식' },
  { value: 'wet', label: '습식' },
  { value: 'snack', label: '간식' },
  { value: 'prescription', label: '처방식' },
  { value: 'other', label: '기타' },
]

const WET_CHIPS = ['1/4캔', '1/2캔', '1캔', '1파우치', '1/2파우치']
const DRY_CHIPS = ['1/4그릇', '1/2그릇', '3/4그릇', '1그릇']

const EATEN_CHIPS: { label: string; value: EatenRatio }[] = [
  { label: '전부', value: 100 },
  { label: '거의 다', value: 75 },
  { label: '절반', value: 50 },
  { label: '조금', value: 25 },
  { label: '거의 안 먹음', value: 10 },
  { label: '안 먹음', value: 0 },
]

const APPETITE_CHIPS: { label: string; value: NonNullable<FoodDetails['appetite']> }[] = [
  { label: '좋음', value: 'good' },
  { label: '보통', value: 'normal' },
  { label: '적음', value: 'poor' },
  { label: '없음', value: 'none' },
  { label: '평소와 다름', value: 'unusual' },
]

const REACTION_TAGS = ['잘 먹음', '천천히 먹음', '남김', '냄새만 맡음', '거부함']
const SYMPTOM_TAGS = ['구토', '헛구역질', '설사', '기침', '침 흘림']

interface InitialValues { recordedAt: string; note?: string; details: FoodDetails }

interface Props {
  onSave: (details: FoodDetails, recordedAt: string, note: string) => void
  loading?: boolean
  onDirty?: () => void
  initialValues?: InitialValues
}

export function FoodForm({ onSave, loading, onDirty, initialValues }: Props) {
  const iv = initialValues?.details
  const [recordedAt, setRecordedAt] = useState(
    initialValues ? toLocalDateTimeString(new Date(initialValues.recordedAt)) : toLocalDateTimeString()
  )
  const [foodType, setFoodType] = useState<FoodType>(iv?.foodType ?? 'dry')
  const dirty = () => onDirty?.()
  const [servedChip, setServedChip] = useState(iv ? 'custom' : '')
  const [servedCustom, setServedCustom] = useState(iv ? String(iv.servedAmount) : '')
  const [servedUnit, setServedUnit] = useState<FoodUnit>(iv?.servedUnit ?? 'bowl')
  const [eatenRatio, setEatenRatio] = useState<EatenRatio | null>(iv?.eatenRatio ?? null)
  const [appetite, setAppetite] = useState<FoodDetails['appetite']>(iv?.appetite)
  const [reactionTags, setReactionTags] = useState<string[]>(iv?.reactionTags ?? [])
  const [symptomTags, setSymptomTags] = useState<string[]>(iv?.symptomTags ?? [])
  const [note, setNote] = useState(initialValues?.note ?? '')

  const chips = foodType === 'dry' ? DRY_CHIPS : WET_CHIPS

  const toggleTag = (tag: string, list: string[], setter: (v: string[]) => void) => {
    setter(list.includes(tag) ? list.filter(t => t !== tag) : [...list, tag])
  }

  const parseServedAmount = () => {
    if (servedChip && servedChip !== 'custom') {
      const map: Record<string, { amount: number; unit: FoodUnit }> = {
        '1/4캔': { amount: 0.25, unit: 'can' }, '1/2캔': { amount: 0.5, unit: 'can' }, '1캔': { amount: 1, unit: 'can' },
        '1파우치': { amount: 1, unit: 'pouch' }, '1/2파우치': { amount: 0.5, unit: 'pouch' },
        '1/4그릇': { amount: 0.25, unit: 'bowl' }, '1/2그릇': { amount: 0.5, unit: 'bowl' },
        '3/4그릇': { amount: 0.75, unit: 'bowl' }, '1그릇': { amount: 1, unit: 'bowl' },
      }
      return map[servedChip] ?? { amount: 1, unit: 'can' as FoodUnit }
    }
    return { amount: parseFloat(servedCustom) || 0, unit: servedUnit }
  }

  const handleSave = () => {
    if (eatenRatio === null) return
    const { amount, unit } = parseServedAmount()
    onSave(
      {
        foodType,
        servedAmount: amount,
        servedUnit: unit,
        eatenRatio,
        appetite,
        reactionTags: reactionTags.length ? reactionTags : undefined,
        symptomTags: symptomTags.length ? symptomTags : undefined,
      },
      new Date(recordedAt).toISOString(),
      note
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <DateTimeInput label="날짜 및 시간" value={recordedAt} onChange={setRecordedAt} />

      <SectionLabel>사료 종류</SectionLabel>
      <div className="flex flex-wrap gap-2">
        {FOOD_TYPES.map(f => (
          <Chip key={f.value} label={f.label} selected={foodType === f.value} onClick={() => { setFoodType(f.value); dirty() }} />
        ))}
      </div>

      <SectionLabel>급여량</SectionLabel>
      <div className="flex flex-wrap gap-2">
        {chips.map(c => (
          <Chip key={c} label={c} selected={servedChip === c} onClick={() => { setServedChip(c) }} />
        ))}
        <Chip label="직접 입력" selected={servedChip === 'custom'} onClick={() => setServedChip('custom')} />
      </div>
      {servedChip === 'custom' && (
        <div className="flex gap-2">
          <input
            type="number"
            value={servedCustom}
            onChange={e => setServedCustom(e.target.value)}
            placeholder="양"
            className="flex-1 px-4 py-3 bg-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
          <select
            value={servedUnit}
            onChange={e => setServedUnit(e.target.value as FoodUnit)}
            className="px-3 py-3 bg-gray-100 rounded-2xl text-sm focus:outline-none"
          >
            {(['g', 'ml', '컵', '캔', '파우치', '스푼', '그릇'] as const).map(u => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>
      )}

      <SectionLabel>먹은 양</SectionLabel>
      <div className="flex flex-wrap gap-2">
        {EATEN_CHIPS.map(c => (
          <Chip key={c.value} label={c.label} selected={eatenRatio === c.value} onClick={() => setEatenRatio(c.value)} />
        ))}
      </div>

      <SectionLabel>식욕 상태</SectionLabel>
      <div className="flex flex-wrap gap-2">
        {APPETITE_CHIPS.map(c => (
          <Chip key={c.value} label={c.label} selected={appetite === c.value} onClick={() => setAppetite(c.value)} />
        ))}
      </div>

      <SectionLabel>식사 반응</SectionLabel>
      <div className="flex flex-wrap gap-2">
        {REACTION_TAGS.map(t => (
          <Chip key={t} label={t} selected={reactionTags.includes(t)} onClick={() => toggleTag(t, reactionTags, setReactionTags)} />
        ))}
      </div>

      <SectionLabel>식사 후 증상</SectionLabel>
      <div className="flex flex-wrap gap-2">
        {SYMPTOM_TAGS.map(t => (
          <Chip key={t} label={t} selected={symptomTags.includes(t)} onClick={() => toggleTag(t, symptomTags, setSymptomTags)} />
        ))}
      </div>

      <TextArea label="메모" value={note} onChange={setNote} placeholder="추가 메모 (선택)" />

      <Button size="lg" onClick={handleSave} loading={loading} disabled={eatenRatio === null}>
        저장하기
      </Button>
    </div>
  )
}
