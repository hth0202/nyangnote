import { useState, useEffect } from 'react'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { FoodForm } from './FoodForm'
import { WaterForm } from './WaterForm'
import { ToiletForm } from './ToiletForm'
import { MoodForm } from './MoodForm'
import { SymptomForm } from './SymptomForm'
import { WeightForm } from './WeightForm'
import type { RecordType, ToiletType, FoodDetails, WaterDetails, ToiletDetails, MoodDetails, SymptomDetails, WeightDetails } from '@/types'

type Step = 'type' | 'toilet_type' | 'form'

const RECORD_BUTTONS: { type: RecordType; label: string; emoji: string; color: string }[] = [
  { type: 'food', label: '사료', emoji: '🍚', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { type: 'water', label: '음수', emoji: '💧', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { type: 'toilet', label: '화장실', emoji: '🚽', color: 'bg-green-50 text-green-700 border-green-200' },
  { type: 'symptom', label: '증상', emoji: '🌡️', color: 'bg-red-50 text-red-700 border-red-200' },
  { type: 'mood', label: '기분', emoji: '😸', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { type: 'weight', label: '체중', emoji: '⚖️', color: 'bg-teal-50 text-teal-700 border-teal-200' },
]

const TITLES: Record<RecordType, string> = {
  food: '사료 기록', water: '음수 기록', toilet: '화장실 기록',
  mood: '활동/기분 기록', symptom: '증상 기록', weight: '체중 기록',
}

interface Props {
  open: boolean
  onClose: () => void
  onSave: (type: RecordType, details: FoodDetails | WaterDetails | ToiletDetails | MoodDetails | SymptomDetails | WeightDetails, recordedAt: string, note: string) => Promise<void>
  initialType?: RecordType
}

export function QuickRecordSheet({ open, onClose, onSave, initialType }: Props) {
  const [step, setStep] = useState<Step>(() => {
    if (!initialType) return 'type'
    return initialType === 'toilet' ? 'toilet_type' : 'form'
  })
  const [selectedType, setSelectedType] = useState<RecordType | null>(initialType ?? null)
  const [toiletType, setToiletType] = useState<ToiletType>('urine')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (open) {
      setSelectedType(initialType ?? null)
      setStep(initialType ? (initialType === 'toilet' ? 'toilet_type' : 'form') : 'type')
      setSaved(false)
    }
  }, [open, initialType])

  const reset = () => {
    setStep(initialType ? (initialType === 'toilet' ? 'toilet_type' : 'form') : 'type')
    setSelectedType(initialType ?? null)
    setSaved(false)
  }

  const handleClose = () => { reset(); onClose() }

  const handleTypeSelect = (type: RecordType) => {
    setSelectedType(type)
    if (type === 'toilet') setStep('toilet_type')
    else setStep('form')
  }

  const handleSave = async (
    details: FoodDetails | WaterDetails | ToiletDetails | MoodDetails | SymptomDetails | WeightDetails,
    recordedAt: string,
    note: string
  ) => {
    if (!selectedType) return
    setSaving(true)
    await onSave(selectedType, details, recordedAt, note)
    setSaving(false)
    setSaved(true)
    setTimeout(() => { handleClose() }, 700)
  }

  const title = saved ? '저장 완료! ✓' : (selectedType ? TITLES[selectedType] : '기록 유형 선택')

  return (
    <BottomSheet open={open} onClose={handleClose} title={title}>
      {saved ? (
        <div className="flex flex-col items-center py-8 gap-3">
          <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-3xl">✓</div>
          <p className="text-text-secondary text-sm">기록이 저장되었어요</p>
        </div>
      ) : step === 'type' ? (
        <div className="grid grid-cols-3 gap-3">
          {RECORD_BUTTONS.map(b => (
            <button
              key={b.type}
              type="button"
              onClick={() => handleTypeSelect(b.type)}
              className={`flex flex-col items-center gap-2 py-4 rounded-2xl border ${b.color} transition-all active:scale-95`}
            >
              <span className="text-2xl">{b.emoji}</span>
              <span className="text-xs font-semibold">{b.label}</span>
            </button>
          ))}
        </div>
      ) : step === 'toilet_type' ? (
        <div className="flex flex-col gap-4">
          <p className="text-text-secondary text-sm text-center">어떤 화장실 기록인가요?</p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => { setToiletType('urine'); setStep('form') }}
              className="flex-1 flex flex-col items-center gap-2 py-6 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200 transition-all active:scale-95"
            >
              <span className="text-3xl">💧</span>
              <span className="font-semibold">소변</span>
            </button>
            <button
              type="button"
              onClick={() => { setToiletType('feces'); setStep('form') }}
              className="flex-1 flex flex-col items-center gap-2 py-6 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 transition-all active:scale-95"
            >
              <span className="text-3xl">🟤</span>
              <span className="font-semibold">대변</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {selectedType === 'food' && <FoodForm onSave={(d, at, n) => handleSave(d, at, n)} loading={saving} />}
          {selectedType === 'water' && <WaterForm onSave={(d, at, n) => handleSave(d, at, n)} loading={saving} />}
          {selectedType === 'toilet' && <ToiletForm initialType={toiletType} onSave={(d, at, n) => handleSave(d, at, n)} loading={saving} />}
          {selectedType === 'mood' && <MoodForm onSave={(d, at, n) => handleSave(d, at, n)} loading={saving} />}
          {selectedType === 'symptom' && <SymptomForm onSave={(d, at, n) => handleSave(d, at, n)} loading={saving} />}
          {selectedType === 'weight' && <WeightForm onSave={(d, at, n) => handleSave(d, at, n)} loading={saving} />}
        </>
      )}
    </BottomSheet>
  )
}
