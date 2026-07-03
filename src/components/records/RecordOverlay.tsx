import { useState, useEffect, useCallback } from 'react'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { IconChevronLeft } from '@/components/ui/Icons'
import { FoodForm } from './FoodForm'
import { WaterForm } from './WaterForm'
import { ToiletForm } from './ToiletForm'
import { MoodForm } from './MoodForm'
import { SymptomForm } from './SymptomForm'
import { WeightForm } from './WeightForm'
import type {
  RecordType, ToiletType, HealthRecord,
  FoodDetails, WaterDetails, ToiletDetails, MoodDetails, SymptomDetails, WeightDetails,
} from '@/types'

type Step = 'type' | 'toilet_type' | 'form'

const RECORD_BUTTONS: { type: RecordType; label: string; emoji: string; color: string }[] = [
  { type: 'food',    label: '사료',   emoji: '🍚', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { type: 'water',   label: '음수',   emoji: '💧', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { type: 'toilet',  label: '화장실', emoji: '🚽', color: 'bg-green-50 text-green-700 border-green-200' },
  { type: 'symptom', label: '증상',   emoji: '🌡️', color: 'bg-red-50 text-red-700 border-red-200' },
  { type: 'mood',    label: '기분',   emoji: '😸', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { type: 'weight',  label: '체중',   emoji: '⚖️', color: 'bg-teal-50 text-teal-700 border-teal-200' },
]

const TITLES: Record<RecordType, string> = {
  food: '사료 기록', water: '음수 기록', toilet: '화장실 기록',
  mood: '활동/기분 기록', symptom: '증상 기록', weight: '체중 기록',
}

interface Props {
  open: boolean
  onClose: () => void
  onSave: (
    type: RecordType,
    details: FoodDetails | WaterDetails | ToiletDetails | MoodDetails | SymptomDetails | WeightDetails,
    recordedAt: string,
    note: string
  ) => Promise<void>
  onUpdate?: (
    recordId: string,
    details: FoodDetails | WaterDetails | ToiletDetails | MoodDetails | SymptomDetails | WeightDetails,
    recordedAt: string,
    note: string
  ) => Promise<void>
  initialType?: RecordType
  editRecord?: HealthRecord
}

export function RecordOverlay({ open, onClose, onSave, onUpdate, initialType, editRecord }: Props) {
  const [step, setStep] = useState<Step>('type')
  const [selectedType, setSelectedType] = useState<RecordType | null>(null)
  const [toiletType, setToiletType] = useState<ToiletType>('urine')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    if (!open) return
    setSaved(false)
    setIsDirty(false)
    setSaveError(null)
    if (editRecord) {
      setSelectedType(editRecord.type)
      setStep('form')
      if (editRecord.type === 'toilet') {
        setToiletType((editRecord.details as ToiletDetails).toiletType)
      }
    } else {
      setSelectedType(initialType ?? null)
      setStep(initialType ? (initialType === 'toilet' ? 'toilet_type' : 'form') : 'type')
    }
  }, [open, initialType, editRecord])

  const markDirty = useCallback(() => setIsDirty(true), [])

  const handleBack = () => {
    if (step === 'form' && isDirty) { setShowConfirm(true); return }
    if (editRecord) { onClose(); return }
    if (step === 'form') { setStep(selectedType === 'toilet' ? 'toilet_type' : 'type'); setIsDirty(false); return }
    if (step === 'toilet_type') { setStep('type'); return }
    onClose()
  }

  const handleSave = async (
    details: FoodDetails | WaterDetails | ToiletDetails | MoodDetails | SymptomDetails | WeightDetails,
    recordedAt: string,
    note: string
  ) => {
    if (!selectedType) return
    setSaving(true)
    setSaveError(null)
    try {
      if (editRecord && onUpdate) {
        await onUpdate(editRecord.id, details, recordedAt, note)
      } else {
        await onSave(selectedType, details, recordedAt, note)
      }
      setSaved(true)
      setTimeout(() => onClose(), 700)
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : '저장 중 오류가 발생했어요')
    } finally {
      setSaving(false)
    }
  }

  const headerTitle = () => {
    if (saved) return editRecord ? '수정 완료!' : '저장 완료!'
    if (editRecord && selectedType) return `${TITLES[selectedType]} 수정`
    if (step === 'type') return '기록 유형 선택'
    if (step === 'toilet_type') return '화장실 기록'
    return selectedType ? TITLES[selectedType] : ''
  }

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  const editIV = editRecord ? { recordedAt: editRecord.recordedAt, note: editRecord.note } : undefined

  return (
    <>
      <div className="fixed top-0 bottom-0 z-50 w-full max-w-[430px] left-1/2 -translate-x-1/2 bg-app-bg flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 pt-6 pb-4 bg-app-bg border-b border-divider flex-shrink-0">
          <button
            type="button"
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all text-text-primary flex-shrink-0"
          >
            <IconChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-text-primary flex-1">{headerTitle()}</h1>
        </div>

        {/* Error banner */}
        {saveError && (
          <div className="flex-shrink-0 mx-4 mt-3 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-700">
            ⚠️ {saveError}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {saved ? (
            <div className="flex flex-col items-center py-20 gap-4">
              <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center text-4xl">✓</div>
              <p className="text-text-secondary">{editRecord ? '기록이 수정되었어요' : '기록이 저장되었어요'}</p>
            </div>
          ) : step === 'type' ? (
            <div className="p-5 grid grid-cols-2 gap-3">
              {RECORD_BUTTONS.map(b => (
                <button
                  key={b.type}
                  type="button"
                  onClick={() => {
                    setSelectedType(b.type)
                    setIsDirty(false)
                    setStep(b.type === 'toilet' ? 'toilet_type' : 'form')
                  }}
                  className={`flex items-center gap-3 px-4 py-5 rounded-2xl border ${b.color} transition-all active:scale-95`}
                >
                  <span className="text-2xl">{b.emoji}</span>
                  <span className="font-semibold">{b.label}</span>
                </button>
              ))}
            </div>
          ) : step === 'toilet_type' ? (
            <div className="p-5 flex flex-col gap-4">
              <p className="text-text-secondary text-sm text-center mt-4">어떤 화장실 기록인가요?</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setToiletType('urine'); setIsDirty(false); setStep('form') }}
                  className="flex-1 flex flex-col items-center gap-2 py-8 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200 active:scale-95 transition-all"
                >
                  <span className="text-4xl">💧</span>
                  <span className="font-semibold text-lg">소변</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setToiletType('feces'); setIsDirty(false); setStep('form') }}
                  className="flex-1 flex flex-col items-center gap-2 py-8 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 active:scale-95 transition-all"
                >
                  <span className="text-4xl">🟤</span>
                  <span className="font-semibold text-lg">대변</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-5">
              {selectedType === 'food'    && <FoodForm    onSave={handleSave} loading={saving} onDirty={markDirty} initialValues={editIV && editRecord?.type === 'food'    ? { ...editIV, details: editRecord.details as FoodDetails    } : undefined} />}
              {selectedType === 'water'   && <WaterForm   onSave={handleSave} loading={saving} onDirty={markDirty} initialValues={editIV && editRecord?.type === 'water'   ? { ...editIV, details: editRecord.details as WaterDetails   } : undefined} />}
              {selectedType === 'toilet'  && <ToiletForm  initialType={toiletType} onSave={handleSave} loading={saving} onDirty={markDirty} initialValues={editIV && editRecord?.type === 'toilet'  ? { ...editIV, details: editRecord.details as ToiletDetails  } : undefined} />}
              {selectedType === 'mood'    && <MoodForm    onSave={handleSave} loading={saving} onDirty={markDirty} initialValues={editIV && editRecord?.type === 'mood'    ? { ...editIV, details: editRecord.details as MoodDetails    } : undefined} />}
              {selectedType === 'symptom' && <SymptomForm onSave={handleSave} loading={saving} onDirty={markDirty} initialValues={editIV && editRecord?.type === 'symptom' ? { ...editIV, details: editRecord.details as SymptomDetails } : undefined} />}
              {selectedType === 'weight'  && <WeightForm  onSave={handleSave} loading={saving} onDirty={markDirty} initialValues={editIV && editRecord?.type === 'weight'  ? { ...editIV, details: editRecord.details as WeightDetails  } : undefined} />}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={showConfirm}
        message={'입력한 내용이 저장되지 않아요.\n그래도 나가시겠어요?'}
        confirmLabel="나가기"
        cancelLabel="계속 입력"
        onConfirm={() => { setShowConfirm(false); setIsDirty(false); onClose() }}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  )
}
