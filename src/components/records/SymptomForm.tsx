import { useState } from 'react'
import { Chip } from '@/components/ui/Chip'
import { DateTimeInput, toLocalDateTimeString } from '@/components/ui/DateTimeInput'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { TextArea } from '@/components/ui/TextArea'
import { Button } from '@/components/ui/Button'
import type { SymptomDetails, SymptomType } from '@/types'

const SYMPTOMS: { label: string; value: SymptomType; emoji: string }[] = [
  { label: '구토', value: 'vomit', emoji: '🤢' },
  { label: '기침', value: 'cough', emoji: '😮‍💨' },
  { label: '재채기', value: 'sneeze', emoji: '🤧' },
  { label: '울음', value: 'cry', emoji: '😿' },
  { label: '절뚝거림', value: 'limp', emoji: '🐾' },
  { label: '식욕 저하', value: 'anorexia', emoji: '🍽️' },
  { label: '숨 가쁨', value: 'dyspnea', emoji: '💨' },
  { label: '침 흘림', value: 'drool', emoji: '💧' },
  { label: '긁음', value: 'scratch', emoji: '🐈' },
  { label: '떨림', value: 'tremor', emoji: '😰' },
  { label: '기타', value: 'other', emoji: '❓' },
]

const VOMIT_CONTENT = ['사료', '물', '거품', '털', '노란 액체', '피 섞임', '기타']
const VOMIT_COUNT: { label: string; value: 1 | 2 | 3 }[] = [
  { label: '1회', value: 1 }, { label: '2회', value: 2 }, { label: '3회 이상', value: 3 },
]
const VOMIT_TIMING: { label: string; value: string }[] = [
  { label: '식전', value: 'before_meal' },
  { label: '식후 30분 이내', value: 'within_30min' },
  { label: '식후 1시간 이후', value: 'after_1hr' },
  { label: '모름', value: 'unknown' },
]

const SEVERITY: { label: string; value: NonNullable<SymptomDetails['severity']> }[] = [
  { label: '가벼움', value: 'mild' },
  { label: '보통', value: 'moderate' },
  { label: '심각', value: 'severe' },
]

interface InitialValues { recordedAt: string; note?: string; details: SymptomDetails }

interface Props {
  onSave: (details: SymptomDetails, recordedAt: string, note: string) => void
  loading?: boolean
  onDirty?: () => void
  initialValues?: InitialValues
}

export function SymptomForm({ onSave, loading, onDirty, initialValues }: Props) {
  const iv = initialValues?.details
  const [recordedAt, setRecordedAt] = useState(
    initialValues ? toLocalDateTimeString(new Date(initialValues.recordedAt)) : toLocalDateTimeString()
  )
  const [symptomType, setSymptomType] = useState<SymptomType | null>(iv?.symptomType ?? null)
  const [severity, setSeverity] = useState<SymptomDetails['severity']>(iv?.severity)
  const [vomitContent, setVomitContent] = useState<string[]>(iv?.vomitExtra?.content ?? [])
  const [vomitCount, setVomitCount] = useState<1 | 2 | 3 | null>(iv?.vomitExtra?.count ?? null)
  const [vomitTiming, setVomitTiming] = useState(iv?.vomitExtra?.timing ?? '')
  const [note, setNote] = useState(initialValues?.note ?? '')

  const dirty = () => onDirty?.()

  const toggleContent = (c: string) => {
    setVomitContent(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])
    dirty()
  }

  const handleSave = () => {
    if (!symptomType) return
    const details: SymptomDetails = {
      symptomType,
      severity,
      vomitExtra: symptomType === 'vomit' ? {
        content: vomitContent.length ? vomitContent : undefined,
        count: vomitCount ?? undefined,
        timing: (vomitTiming as SymptomDetails['vomitExtra'] extends { timing?: infer T } ? T : never) || undefined,
      } : undefined,
    }
    onSave(details, new Date(recordedAt).toISOString(), note)
  }

  return (
    <div className="flex flex-col gap-4">
      <DateTimeInput label="날짜 및 시간" value={recordedAt} onChange={v => { setRecordedAt(v); dirty() }} />

      <SectionLabel>증상</SectionLabel>
      <div className="grid grid-cols-2 gap-2">
        {SYMPTOMS.map(s => (
          <button
            key={s.value}
            type="button"
            onClick={() => { setSymptomType(s.value); onDirty?.() }}
            className={[
              'flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium transition-all text-left',
              symptomType === s.value ? 'bg-error text-white' : 'bg-gray-100 text-text-primary hover:bg-gray-200',
            ].join(' ')}
          >
            <span>{s.emoji}</span>
            {s.label}
          </button>
        ))}
      </div>

      <SectionLabel>심각도</SectionLabel>
      <div className="flex gap-2">
        {SEVERITY.map(s => (
          <Chip key={s.value} label={s.label} selected={severity === s.value} onClick={() => { setSeverity(s.value); dirty() }} />
        ))}
      </div>

      {symptomType === 'vomit' && (
        <>
          <SectionLabel>구토 내용물</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {VOMIT_CONTENT.map(c => (
              <Chip key={c} label={c} selected={vomitContent.includes(c)} onClick={() => toggleContent(c)} />
            ))}
          </div>

          <SectionLabel>횟수</SectionLabel>
          <div className="flex gap-2">
            {VOMIT_COUNT.map(c => (
              <Chip key={c.value} label={c.label} selected={vomitCount === c.value} onClick={() => { setVomitCount(c.value); dirty() }} />
            ))}
          </div>

          <SectionLabel>식후 발생 여부</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {VOMIT_TIMING.map(t => (
              <Chip key={t.value} label={t.label} selected={vomitTiming === t.value} onClick={() => { setVomitTiming(t.value); dirty() }} />
            ))}
          </div>
        </>
      )}

      <TextArea label="메모" value={note} onChange={v => { setNote(v); dirty() }} placeholder="추가 메모 (선택)" />

      <Button size="lg" onClick={handleSave} loading={loading} disabled={!symptomType}>
        저장하기
      </Button>
    </div>
  )
}
