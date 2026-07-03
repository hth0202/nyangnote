import { useState } from 'react'
import { Chip } from '@/components/ui/Chip'
import { DateTimeInput, toLocalDateTimeString } from '@/components/ui/DateTimeInput'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { TextArea } from '@/components/ui/TextArea'
import { Button } from '@/components/ui/Button'
import type { MoodDetails, MoodType, ActivityLevel } from '@/types'

const MOODS: { label: string; value: MoodType; emoji: string }[] = [
  { label: '평온함', value: 'calm', emoji: '😌' },
  { label: '활발함', value: 'active', emoji: '😸' },
  { label: '예민함', value: 'sensitive', emoji: '😾' },
  { label: '숨어있음', value: 'hiding', emoji: '🙈' },
  { label: '무기력함', value: 'lethargic', emoji: '😿' },
  { label: '공격적임', value: 'aggressive', emoji: '😤' },
  { label: '불안해 보임', value: 'anxious', emoji: '😰' },
]

const ACTIVITIES: { label: string; value: ActivityLevel }[] = [
  { label: '평소보다 많음', value: 'high' },
  { label: '평소와 비슷', value: 'normal' },
  { label: '평소보다 적음', value: 'low' },
  { label: '거의 움직이지 않음', value: 'very_low' },
]

const BEHAVIOR_TAGS = ['놀이함', '잠을 많이 잠', '그루밍 감소', '과도한 그루밍', '만지는 것을 싫어함', '안기 싫어함', '계속 따라다님']

interface InitialValues { recordedAt: string; note?: string; details: MoodDetails }

interface Props {
  onSave: (details: MoodDetails, recordedAt: string, note: string) => void
  loading?: boolean
  onDirty?: () => void
  initialValues?: InitialValues
}

export function MoodForm({ onSave, loading, onDirty, initialValues }: Props) {
  const iv = initialValues?.details
  const [recordedAt, setRecordedAt] = useState(
    initialValues ? toLocalDateTimeString(new Date(initialValues.recordedAt)) : toLocalDateTimeString()
  )
  const [mood, setMood] = useState<MoodType | null>(iv?.mood ?? null)
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | null>(iv?.activityLevel ?? null)
  const [behaviorTags, setBehaviorTags] = useState<string[]>(iv?.behaviorTags ?? [])
  const [note, setNote] = useState(initialValues?.note ?? '')

  const dirty = () => onDirty?.()

  const toggleTag = (tag: string) => {
    setBehaviorTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
    dirty()
  }

  const handleSave = () => {
    if (!mood || !activityLevel) return
    onSave({ mood, activityLevel, behaviorTags: behaviorTags.length ? behaviorTags : undefined }, new Date(recordedAt).toISOString(), note)
  }

  return (
    <div className="flex flex-col gap-4">
      <DateTimeInput label="날짜 및 시간" value={recordedAt} onChange={v => { setRecordedAt(v); dirty() }} />

      <SectionLabel>기분</SectionLabel>
      <div className="grid grid-cols-2 gap-2">
        {MOODS.map(m => (
          <button
            key={m.value}
            type="button"
            onClick={() => { setMood(m.value); onDirty?.() }}
            className={[
              'flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium transition-all text-left',
              mood === m.value ? 'bg-primary-500 text-white' : 'bg-gray-100 text-text-primary hover:bg-gray-200',
            ].join(' ')}
          >
            <span>{m.emoji}</span>
            {m.label}
          </button>
        ))}
      </div>

      <SectionLabel>활동량</SectionLabel>
      <div className="flex flex-col gap-2">
        {ACTIVITIES.map(a => (
          <button
            key={a.value}
            type="button"
            onClick={() => { setActivityLevel(a.value); onDirty?.() }}
            className={[
              'w-full text-left px-4 py-3 rounded-2xl text-sm font-medium transition-all',
              activityLevel === a.value ? 'bg-primary-500 text-white' : 'bg-gray-100 text-text-primary hover:bg-gray-200',
            ].join(' ')}
          >
            {a.label}
          </button>
        ))}
      </div>

      <SectionLabel>행동 태그</SectionLabel>
      <div className="flex flex-wrap gap-2">
        {BEHAVIOR_TAGS.map(t => (
          <Chip key={t} label={t} selected={behaviorTags.includes(t)} onClick={() => toggleTag(t)} />
        ))}
      </div>

      <TextArea label="메모" value={note} onChange={v => { setNote(v); dirty() }} placeholder="추가 메모 (선택)" />

      <Button size="lg" onClick={handleSave} loading={loading} disabled={!mood || !activityLevel}>
        저장하기
      </Button>
    </div>
  )
}
