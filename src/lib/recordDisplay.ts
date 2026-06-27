import type { HealthRecord, FoodDetails, WaterDetails, MoodDetails, SymptomDetails, ToiletDetails, WeightDetails } from '@/types'

export interface RecordInfo {
  main: string       // 항상 표시 — 핵심 지표 (사료 종류+양, 증상명 등)
  detail?: string    // 항상 표시 — 보조 지표 (먹은 양, 심각도 등)
  tags?: string[]    // 펼쳤을 때 표시 — 부가 태그
  alert?: boolean    // 빨간 배지/테두리
  warning?: boolean  // 노란 배지/테두리
}

const FOOD_TYPE_LABEL: Record<string, string> = {
  dry: '건식', wet: '습식', snack: '간식', prescription: '처방식', other: '기타',
}

const FOOD_UNIT_LABEL: Record<string, string> = {
  can: '캔', pouch: '파우치', bowl: '그릇', cup: '컵', spoon: '스푼', g: 'g', ml: 'ml',
}

const FRACTION_MAP: Record<number, string> = {
  0.25: '1/4', 0.5: '1/2', 0.75: '3/4',
}

function formatAmount(amount: number, unit: string): string {
  if (!amount) return ''
  const num = FRACTION_MAP[amount] ?? (Number.isInteger(amount) ? String(amount) : String(amount))
  return `${num}${FOOD_UNIT_LABEL[unit] ?? unit}`
}

const EATEN_LABEL: Record<number, string> = {
  100: '전부 먹음', 75: '거의 다', 50: '절반', 25: '조금', 10: '거의 안 먹음', 0: '안 먹음',
}

const APPETITE_LABEL: Record<string, string> = {
  good: '식욕 좋음', normal: '식욕 보통', poor: '식욕 적음', none: '식욕 없음', unusual: '식욕 이상',
}

export const WATER_LABEL: Record<string, string> = {
  very_low: '거의 안 마심', low: '평소보다 적게', normal: '평소만큼',
  high: '평소보다 많이', very_high: '매우 많이 마심',
}

const MOOD_LABEL: Record<string, string> = {
  calm: '평온함', active: '활발함', sensitive: '예민함', hiding: '숨어있음',
  lethargic: '무기력함', aggressive: '공격적', anxious: '불안해 보임',
}

const ACTIVITY_LABEL: Record<string, string> = {
  high: '활동량 많음', normal: '활동량 보통', low: '활동량 적음', very_low: '활동량 매우 적음',
}

export const SYMPTOM_TYPE_LABEL: Record<string, string> = {
  vomit: '구토', cough: '기침', sneeze: '재채기', cry: '울음',
  limp: '절뚝거림', anorexia: '식욕부진', dyspnea: '호흡곤란',
  drool: '침 흘림', scratch: '과도한 긁기', tremor: '떨림', other: '기타 증상',
}

const SEVERITY_LABEL: Record<string, string> = {
  mild: '경미', moderate: '중등도', severe: '심각',
}

const VOMIT_TIMING_LABEL: Record<string, string> = {
  before_meal: '식전', within_30min: '식후 30분 이내', after_1hr: '식후 1시간 이후', unknown: '시간 모름',
}

const TOILET_AMOUNT_LABEL: Record<string, string> = {
  none: '없음', small: '적음', normal: '보통', large: '많음', very_large: '매우 많음',
}

const CONSISTENCY_LABEL: Record<string, string> = {
  hard: '굳기 단단함', normal: '굳기 정상', soft: '굳기 부드러움', loose: '묽음', liquid: '액상',
}

const CONCERNING_TOILET_TAGS = new Set(['혈뇨', '혈변', '점액', '거품', '탁함', '색이 이상함'])

export function recordInfo(r: HealthRecord): RecordInfo {
  const d = r.details

  switch (r.type) {
    case 'food': {
      const fd = d as FoodDetails
      const amountStr = formatAmount(fd.servedAmount, fd.servedUnit)
      const main = [FOOD_TYPE_LABEL[fd.foodType], amountStr].filter(Boolean).join(' · ')

      // 심각 증상 태그 인라인 표시 (가장 중요한 정보)
      const symptomStr = fd.symptomTags?.length ? fd.symptomTags.join(' · ') : ''
      const eatenStr = EATEN_LABEL[fd.eatenRatio]
      const appetiteStr =
        fd.appetite && fd.appetite !== 'good' && fd.appetite !== 'normal'
          ? APPETITE_LABEL[fd.appetite] : ''
      const detail = [eatenStr, appetiteStr, symptomStr].filter(Boolean).join(' · ')

      const alert = fd.eatenRatio === 0 || (fd.symptomTags?.length ?? 0) > 0
      const warning = !alert && (fd.eatenRatio <= 25 || fd.appetite === 'poor' || fd.appetite === 'none')

      return { main, detail, tags: fd.reactionTags, alert, warning }
    }

    case 'water': {
      const wd = d as WaterDetails
      return {
        main: WATER_LABEL[wd.waterLevel],
        detail: wd.waterAmountMl ? `${wd.waterAmountMl}ml` : undefined,
        alert: wd.waterLevel === 'very_low',
        warning: wd.waterLevel === 'low',
      }
    }

    case 'mood': {
      const md = d as MoodDetails
      return {
        main: MOOD_LABEL[md.mood],
        detail: ACTIVITY_LABEL[md.activityLevel],
        tags: md.behaviorTags,
        alert: md.mood === 'aggressive',
        warning: ['hiding', 'lethargic', 'anxious'].includes(md.mood),
      }
    }

    case 'symptom': {
      const sd = d as SymptomDetails
      const severityStr = sd.severity ? SEVERITY_LABEL[sd.severity] : ''
      const count = sd.vomitExtra?.count ?? sd.count
      const countStr = count ? (count >= 3 ? '3회 이상' : `${count}회`) : ''
      const timingStr = sd.vomitExtra?.timing ? VOMIT_TIMING_LABEL[sd.vomitExtra.timing] : ''
      const hasBloody = sd.vomitExtra?.content?.includes('피 섞임')

      return {
        main: SYMPTOM_TYPE_LABEL[sd.symptomType] ?? sd.symptomType,
        detail: [severityStr, countStr, timingStr].filter(Boolean).join(' · ') || undefined,
        alert: sd.severity === 'severe' || sd.severity === 'moderate' || !!hasBloody,
        warning: sd.severity === 'mild',
      }
    }

    case 'toilet': {
      const td = d as ToiletDetails
      const typeStr = td.toiletType === 'urine' ? '소변' : '대변'
      const conditions = td.conditionTags?.filter(t => t !== '평소와 같음') ?? []
      const isSeriousConcern = conditions.some(t => CONCERNING_TOILET_TAGS.has(t))
      const consistencyStr =
        td.consistency && td.consistency !== 'normal'
          ? CONSISTENCY_LABEL[td.consistency] : ''

      // 이상 태그는 항상 표시, 굳기는 이상할 때만
      const detail = conditions.length
        ? conditions.join(' · ')
        : consistencyStr || undefined

      return {
        main: `${typeStr} · ${TOILET_AMOUNT_LABEL[td.amount]}`,
        detail,
        tags: conditions.length ? undefined : undefined, // conditions는 detail에 인라인 표시
        alert: isSeriousConcern || td.amount === 'none',
        warning:
          !isSeriousConcern &&
          (td.consistency === 'liquid' || td.consistency === 'loose'),
      }
    }

    case 'weight': {
      const wd = d as WeightDetails
      return {
        main: `${wd.weightKg}kg`,
        detail: wd.measurementContext === 'clinic' ? '병원 측정' : '자가 측정',
      }
    }

    default:
      return { main: '' }
  }
}
