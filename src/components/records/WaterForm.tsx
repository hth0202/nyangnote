import { useState } from 'react'
import { Chip } from '@/components/ui/Chip'
import { DateTimeInput, toLocalDateTimeString } from '@/components/ui/DateTimeInput'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { TextArea } from '@/components/ui/TextArea'
import { Button } from '@/components/ui/Button'
import type { WaterDetails, WaterLevel } from '@/types'

const WATER_LEVELS: { label: string; value: WaterLevel }[] = [
  { label: '거의 안 마심', value: 'very_low' },
  { label: '평소보다 적게', value: 'low' },
  { label: '평소만큼', value: 'normal' },
  { label: '평소보다 많이', value: 'high' },
  { label: '매우 많이 마심', value: 'very_high' },
]

const ML_CHIPS = ['10ml', '30ml', '50ml', '100ml']

interface InitialValues { recordedAt: string; note?: string; details: WaterDetails }

interface Props {
  onSave: (details: WaterDetails, recordedAt: string, note: string) => void
  loading?: boolean
  onDirty?: () => void
  initialValues?: InitialValues
}

export function WaterForm({ onSave, loading, onDirty, initialValues }: Props) {
  const iv = initialValues?.details
  const [recordedAt, setRecordedAt] = useState(
    initialValues ? toLocalDateTimeString(new Date(initialValues.recordedAt)) : toLocalDateTimeString()
  )
  const [waterLevel, setWaterLevel] = useState<WaterLevel | null>(iv?.waterLevel ?? null)
  const [showMl, setShowMl] = useState(!!iv?.waterAmountMl)
  const [mlChip, setMlChip] = useState(iv?.waterAmountMl ? 'custom' : '')
  const [mlCustom, setMlCustom] = useState(iv?.waterAmountMl ? String(iv.waterAmountMl) : '')
  const [note, setNote] = useState(initialValues?.note ?? '')

  const getMl = () => {
    if (!showMl) return undefined
    if (mlChip && mlChip !== 'custom') return parseInt(mlChip)
    return parseFloat(mlCustom) || undefined
  }

  const handleSave = () => {
    if (!waterLevel) return
    onSave(
      {
        waterLevel,
        measurementType: showMl ? 'direct' : 'estimated',
        waterAmountMl: getMl(),
      },
      new Date(recordedAt).toISOString(),
      note
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <DateTimeInput label="날짜 및 시간" value={recordedAt} onChange={setRecordedAt} />

      <SectionLabel>음수량</SectionLabel>
      <div className="flex flex-col gap-2">
        {WATER_LEVELS.map(w => (
          <button
            key={w.value}
            type="button"
            onClick={() => { setWaterLevel(w.value); onDirty?.() }}
            className={[
              'w-full text-left px-4 py-3 rounded-2xl text-sm font-medium transition-all',
              waterLevel === w.value
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-text-primary hover:bg-gray-200',
            ].join(' ')}
          >
            {w.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setShowMl(!showMl)}
        className="text-sm text-primary-600 font-medium text-left"
      >
        {showMl ? '▲ 정량 입력 닫기' : '▼ 정량으로 입력하기 (선택)'}
      </button>

      {showMl && (
        <>
          <div className="flex flex-wrap gap-2">
            {ML_CHIPS.map(c => (
              <Chip key={c} label={c} selected={mlChip === c} onClick={() => setMlChip(c)} />
            ))}
            <Chip label="직접 입력" selected={mlChip === 'custom'} onClick={() => setMlChip('custom')} />
          </div>
          {mlChip === 'custom' && (
            <input
              type="number"
              value={mlCustom}
              onChange={e => setMlCustom(e.target.value)}
              placeholder="ml 입력"
              className="px-4 py-3 bg-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
          )}
        </>
      )}

      <TextArea label="메모" value={note} onChange={setNote} placeholder="추가 메모 (선택)" />

      <Button size="lg" onClick={handleSave} loading={loading} disabled={!waterLevel}>
        저장하기
      </Button>
    </div>
  )
}
