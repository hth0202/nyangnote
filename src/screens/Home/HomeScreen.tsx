import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { useRecords, useLastRecord } from '@/hooks/useRecords'
import { AppHeader } from '@/components/layout/AppHeader'
import { TabBar } from '@/components/layout/TabBar'
import { OfflineBanner } from '@/components/layout/OfflineBanner'
import { KebabMenu } from '@/components/ui/KebabMenu'
import { recordInfo, WATER_LABEL } from '@/lib/recordDisplay'
import type { Cat, RecordType, FoodDetails, WaterDetails, ToiletDetails, WeightDetails, HealthRecord } from '@/types'
import type { User } from 'firebase/auth'

const QUICK_BUTTONS: { type: RecordType; label: string; emoji: string }[] = [
  { type: 'food', label: '사료', emoji: '🍚' },
  { type: 'water', label: '음수', emoji: '💧' },
  { type: 'toilet', label: '화장실', emoji: '🚽' },
  { type: 'symptom', label: '증상', emoji: '🌡️' },
  { type: 'mood', label: '기분', emoji: '😸' },
  { type: 'weight', label: '체중', emoji: '⚖️' },
]

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return '방금'
  if (min < 60) return `${min}분 전`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}시간 전`
  return format(new Date(iso), 'M월 d일', { locale: ko })
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="text-xs font-semibold text-gray-400 tracking-wider uppercase mb-3">
      {children}
    </p>
  )
}

function SummaryCard({ emoji, label, value, sub }: { emoji: string; label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl px-4 py-4 flex flex-col gap-2 shadow-sm">
      <div className="flex items-center gap-1 text-text-secondary text-xs">
        <span>{emoji}</span>
        <span>{label}</span>
      </div>
      <p className="text-text-primary font-bold text-[15px] leading-none">{value}</p>
      {sub && <p className="text-text-secondary text-xs">{sub}</p>}
    </div>
  )
}

const EATEN_RATIO_LABEL: Record<number, string> = {
  100: '전부', 75: '거의 다', 50: '절반', 25: '조금', 10: '거의 안', 0: '안 먹음',
}

const TYPE_EMOJI: Record<RecordType, string> = {
  food: '🍚', water: '💧', toilet: '🚽', mood: '😸', symptom: '🌡️', weight: '⚖️',
}
const TYPE_LABEL: Record<RecordType, string> = {
  food: '사료', water: '음수', toilet: '화장실', mood: '기분', symptom: '증상', weight: '체중',
}

function RecentRecordItem({
  record,
  onEdit,
  onDelete,
}: {
  record: HealthRecord
  onEdit: (r: HealthRecord) => void
  onDelete: (r: HealthRecord) => void
}) {
  const info = recordInfo(record)
  const sub = info.detail ? `${info.main} · ${info.detail}` : info.main

  return (
    <div className={[
      'bg-white rounded-2xl px-4 py-3 flex items-center gap-2.5 shadow-sm border',
      info.alert ? 'border-red-200 bg-red-50/20' : info.warning ? 'border-amber-200' : 'border-transparent',
    ].join(' ')}>
      <span className="text-xl shrink-0">{TYPE_EMOJI[record.type]}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-semibold text-text-primary">{TYPE_LABEL[record.type]}</p>
          {info.alert && (
            <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-px rounded-full font-semibold leading-none shrink-0 my-0.5">
              주의
            </span>
          )}
          {!info.alert && info.warning && (
            <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-px rounded-full font-semibold leading-none shrink-0 my-0.5">
              확인
            </span>
          )}
        </div>
        <p className="text-xs text-text-secondary truncate mt-[1px]">{sub}</p>
      </div>
      <span className="text-xs text-text-secondary shrink-0">{timeAgo(record.recordedAt)}</span>
      <KebabMenu onEdit={() => onEdit(record)} onDelete={() => onDelete(record)} />
    </div>
  )
}

interface Props {
  cat: Cat
  user: User
  openSheet: (type?: RecordType) => void
  onEdit: (record: HealthRecord) => void
  onDelete: (record: HealthRecord) => void
}

export function HomeScreen({ cat, user: _user, openSheet, onEdit, onDelete }: Props) {
  const { records } = useRecords(cat.id)

  const lastFood = useLastRecord(records, 'food')
  const lastWater = useLastRecord(records, 'water')
  const lastToilet = useLastRecord(records, 'toilet')
  const lastWeight = useLastRecord(records, 'weight')

  const todayStr = new Date().toDateString()
  const todayRecords = records.filter(r => new Date(r.recordedAt).toDateString() === todayStr)
  const todayAlerts = todayRecords.filter(r => recordInfo(r).alert)
  const todayWarnings = todayRecords.filter(r => !recordInfo(r).alert && recordInfo(r).warning)

  return (
    <div className="min-h-dvh bg-app-bg pb-24">
      <OfflineBanner />

      <AppHeader
        title={`${cat.name} 오늘의 기록`}
        subtitle={format(new Date(), 'M월 d일 EEEE', { locale: ko })}
      />

      {(todayAlerts.length > 0 || todayWarnings.length > 0) && (
        <div className="px-5 mb-4 flex gap-2">
          {todayAlerts.length > 0 && (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-red-100 text-red-600 text-xs font-semibold">
              🚨 주의 {todayAlerts.length}건
            </span>
          )}
          {todayWarnings.length > 0 && (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
              ⚠️ 확인 {todayWarnings.length}건
            </span>
          )}
        </div>
      )}

      {/* Summary cards */}
      <div className="px-5 grid grid-cols-2 gap-2.5 mb-6">
        <SummaryCard
          emoji="🍚" label="마지막 식사"
          value={lastFood ? timeAgo(lastFood.recordedAt) : '기록 없음'}
          sub={lastFood ? `먹은 양 ${EATEN_RATIO_LABEL[(lastFood.details as FoodDetails).eatenRatio]}` : undefined}
        />
        <SummaryCard
          emoji="💧" label="마지막 음수"
          value={lastWater ? timeAgo(lastWater.recordedAt) : '기록 없음'}
          sub={lastWater ? WATER_LABEL[(lastWater.details as WaterDetails).waterLevel] : undefined}
        />
        <SummaryCard
          emoji="🚽" label="마지막 화장실"
          value={lastToilet ? timeAgo(lastToilet.recordedAt) : '기록 없음'}
          sub={lastToilet ? ((lastToilet.details as ToiletDetails).toiletType === 'urine' ? '소변' : '대변') : undefined}
        />
        <SummaryCard
          emoji="⚖️" label="최근 체중"
          value={lastWeight ? `${(lastWeight.details as WeightDetails).weightKg}kg` : '기록 없음'}
          sub={lastWeight ? timeAgo(lastWeight.recordedAt) : undefined}
        />
      </div>

      {/* Quick record buttons */}
      <div className="px-5">
        <SectionLabel>빠른 기록</SectionLabel>
        <div className="grid grid-cols-3 gap-2.5">
          {QUICK_BUTTONS.map(b => (
            <button
              key={b.type}
              type="button"
              onClick={() => openSheet(b.type)}
              className="flex flex-col items-center gap-1.5 pt-4 pb-3.5 bg-white rounded-2xl shadow-sm active:scale-95 transition-all"
            >
              <span className="text-2xl leading-none">{b.emoji}</span>
              <span className="text-[11px] font-semibold text-text-primary">{b.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent records */}
      {records.length > 0 && (
        <div className="px-5 mt-7">
          <SectionLabel>최근 기록</SectionLabel>
          <div className="flex flex-col gap-2">
            {records.slice(0, 3).map(r => (
              <RecentRecordItem key={r.id} record={r} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </div>
        </div>
      )}

      <TabBar />
    </div>
  )
}
