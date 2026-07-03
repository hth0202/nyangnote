import { useEffect } from 'react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { recordInfo } from '@/lib/recordDisplay'
import type {
  HealthRecord, RecordType,
  FoodDetails, WaterDetails, MoodDetails, SymptomDetails, ToiletDetails, WeightDetails,
} from '@/types'

const TYPE_EMOJI: Record<RecordType, string> = {
  food: '🍚', water: '💧', toilet: '🚽', mood: '😸', symptom: '🌡️', weight: '⚖️',
}
const TYPE_LABEL: Record<RecordType, string> = {
  food: '사료', water: '음수', toilet: '화장실', mood: '기분', symptom: '증상', weight: '체중',
}

const FOOD_TYPE: Record<string, string> = { dry: '건식', wet: '습식', snack: '간식', prescription: '처방식', other: '기타' }
const FOOD_UNIT: Record<string, string> = { can: '캔', pouch: '파우치', bowl: '그릇', cup: '컵', spoon: '스푼', g: 'g', ml: 'ml' }
const EATEN: Record<number, string> = { 100: '전부', 75: '거의 다', 50: '절반', 25: '조금', 10: '거의 안 먹음', 0: '안 먹음' }
const APPETITE: Record<string, string> = { good: '좋음', normal: '보통', poor: '적음', none: '없음', unusual: '이상함' }
const WATER_LEVEL: Record<string, string> = { very_low: '거의 안 마심', low: '평소보다 적게', normal: '평소만큼', high: '평소보다 많이', very_high: '매우 많이' }
const WATER_MEASURE: Record<string, string> = { direct: '직접 측정', estimated: '추정', dispenser: '급수기 확인' }
const MOOD: Record<string, string> = { calm: '평온함', active: '활발함', sensitive: '예민함', hiding: '숨어있음', lethargic: '무기력함', aggressive: '공격적', anxious: '불안해 보임' }
const ACTIVITY: Record<string, string> = { high: '많음', normal: '보통', low: '적음', very_low: '매우 적음' }
const SYMPTOM: Record<string, string> = { vomit: '구토', cough: '기침', sneeze: '재채기', cry: '울음', limp: '절뚝거림', anorexia: '식욕부진', dyspnea: '호흡곤란', drool: '침 흘림', scratch: '과도한 긁기', tremor: '떨림', other: '기타' }
const SEVERITY: Record<string, string> = { mild: '경미', moderate: '중등도', severe: '심각' }
const VOMIT_TIMING: Record<string, string> = { before_meal: '식전', within_30min: '식후 30분 이내', after_1hr: '식후 1시간 이후', unknown: '시간 모름' }
const TOILET_AMOUNT: Record<string, string> = { none: '없음', small: '적음', normal: '보통', large: '많음', very_large: '매우 많음' }
const CONSISTENCY: Record<string, string> = { hard: '단단함', normal: '정상', soft: '부드러움', loose: '묽음', liquid: '액상' }
const WEIGHT_CONTEXT: Record<string, string> = { self: '자가 측정', clinic: '병원 측정' }

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-divider last:border-0">
      <span className="text-xs text-gray-400 shrink-0">{label}</span>
      <span className="text-sm font-medium text-text-primary text-right ml-4">{value}</span>
    </div>
  )
}

function Tags({ label, tags }: { label: string; tags: string[] }) {
  if (!tags.length) return null
  return (
    <div className="py-2.5 border-b border-divider last:border-0">
      <p className="text-xs text-gray-400 mb-2">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {tags.map(t => (
          <span key={t} className="text-xs bg-gray-100 text-text-secondary px-2.5 py-1 rounded-full">{t}</span>
        ))}
      </div>
    </div>
  )
}

function Details({ record }: { record: HealthRecord }) {
  // 화장실 빠른 기록: 사용자가 선택한 종류는 실제 데이터
  if (record.isQuick && record.type === 'toilet') {
    const td = record.details as ToiletDetails
    return (
      <div>
        <Row label="종류" value={td.toiletType === 'urine' ? '소변' : '대변'} />
        <p className="text-xs text-gray-400 mt-4 text-center">수정에서 상세 내용을 입력해 주세요.</p>
      </div>
    )
  }
  if (record.isQuick) {
    return <p className="text-sm text-gray-400 py-6 text-center">수정에서 상세 내용을 입력해 주세요.</p>
  }

  const d = record.details
  switch (record.type) {
    case 'food': {
      const fd = d as FoodDetails
      return (
        <div>
          <Row label="종류" value={FOOD_TYPE[fd.foodType] ?? fd.foodType} />
          {fd.foodName && <Row label="브랜드/이름" value={fd.foodName} />}
          <Row label="급여량" value={`${fd.servedAmount}${FOOD_UNIT[fd.servedUnit] ?? fd.servedUnit}`} />
          <Row label="섭취량" value={EATEN[fd.eatenRatio] ?? `${fd.eatenRatio}%`} />
          {fd.appetite && <Row label="식욕" value={APPETITE[fd.appetite]} />}
          <Tags label="반응" tags={fd.reactionTags ?? []} />
          <Tags label="이상 증상" tags={fd.symptomTags ?? []} />
        </div>
      )
    }
    case 'water': {
      const wd = d as WaterDetails
      return (
        <div>
          <Row label="음수량" value={WATER_LEVEL[wd.waterLevel]} />
          {wd.waterAmountMl != null && <Row label="정량" value={`${wd.waterAmountMl}ml`} />}
          {wd.measurementType && <Row label="측정 방법" value={WATER_MEASURE[wd.measurementType]} />}
        </div>
      )
    }
    case 'mood': {
      const md = d as MoodDetails
      return (
        <div>
          <Row label="기분" value={MOOD[md.mood]} />
          <Row label="활동량" value={ACTIVITY[md.activityLevel]} />
          <Tags label="행동" tags={md.behaviorTags ?? []} />
        </div>
      )
    }
    case 'symptom': {
      const sd = d as SymptomDetails
      return (
        <div>
          <Row label="증상" value={SYMPTOM[sd.symptomType] ?? sd.symptomType} />
          {sd.severity && <Row label="심각도" value={SEVERITY[sd.severity]} />}
          {sd.count != null && <Row label="횟수" value={`${sd.count}회`} />}
          {sd.vomitExtra?.count != null && <Row label="구토 횟수" value={`${sd.vomitExtra.count}회`} />}
          {sd.vomitExtra?.timing && <Row label="발생 시점" value={VOMIT_TIMING[sd.vomitExtra.timing]} />}
          <Tags label="구토물" tags={sd.vomitExtra?.content ?? []} />
        </div>
      )
    }
    case 'toilet': {
      const td = d as ToiletDetails
      return (
        <div>
          <Row label="종류" value={td.toiletType === 'urine' ? '소변' : '대변'} />
          <Row label="양" value={TOILET_AMOUNT[td.amount]} />
          {td.consistency && <Row label="굳기" value={CONSISTENCY[td.consistency]} />}
          {td.count != null && <Row label="횟수" value={`${td.count}회`} />}
          <Tags label="상태" tags={td.conditionTags?.filter(t => t !== '평소와 같음') ?? []} />
        </div>
      )
    }
    case 'weight': {
      const wd = d as WeightDetails
      return (
        <div>
          <Row label="체중" value={`${wd.weightKg}kg`} />
          {wd.measurementContext && <Row label="측정 방법" value={WEIGHT_CONTEXT[wd.measurementContext]} />}
        </div>
      )
    }
    default:
      return null
  }
}

interface Props {
  record: HealthRecord
  onClose: () => void
  onEdit: (record: HealthRecord) => void
}

export function RecordDetailModal({ record, onClose, onEdit }: Props) {
  const info = recordInfo(record)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end items-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white rounded-t-3xl max-h-[82dvh] flex flex-col w-full max-w-[430px]">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 py-3 border-b border-divider flex items-center gap-3 flex-shrink-0">
          <span className="text-2xl leading-none">{TYPE_EMOJI[record.type]}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="font-bold text-text-primary">{TYPE_LABEL[record.type]}</p>
              {info.quick && (
                <span className="text-[10px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full font-semibold shrink-0">빠른 기록</span>
              )}
              {!info.quick && info.alert && (
                <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-semibold shrink-0">주의</span>
              )}
              {!info.quick && !info.alert && info.warning && (
                <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-semibold shrink-0">확인</span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              {format(new Date(record.recordedAt), 'M월 d일 EEEE HH:mm', { locale: ko })}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 flex-shrink-0"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-1">
          <Details record={record} />

          {record.note && (
            <div className="mt-2 pt-3 border-t border-divider">
              <p className="text-xs text-gray-400 mb-1.5">메모</p>
              <p className="text-sm text-text-primary leading-relaxed">{record.note}</p>
            </div>
          )}

          <p className="text-xs text-gray-300 mt-4 mb-2">기록자: {record.userDisplayName}</p>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-divider flex-shrink-0">
          <button
            type="button"
            onClick={() => { onClose(); onEdit(record) }}
            className="w-full py-3 rounded-2xl bg-primary-500 text-white font-semibold active:scale-95 transition-all"
          >
            수정하기
          </button>
        </div>
      </div>
    </div>
  )
}
