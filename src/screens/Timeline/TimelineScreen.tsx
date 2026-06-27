import { useState } from 'react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { useRecords } from '@/hooks/useRecords'
import { AppHeader } from '@/components/layout/AppHeader'
import { TabBar } from '@/components/layout/TabBar'
import { OfflineBanner } from '@/components/layout/OfflineBanner'
import { KebabMenu } from '@/components/ui/KebabMenu'
import { recordInfo } from '@/lib/recordDisplay'
import type { Cat, HealthRecord, RecordType } from '@/types'

const TYPE_EMOJI: Record<RecordType, string> = {
  food: '🍚', water: '💧', toilet: '🚽', mood: '😸', symptom: '🌡️', weight: '⚖️',
}
const TYPE_LABEL: Record<RecordType, string> = {
  food: '사료', water: '음수', toilet: '화장실', mood: '기분/활동', symptom: '증상', weight: '체중',
}

const FILTER_TABS: { label: string; type: RecordType | 'all' }[] = [
  { label: '전체', type: 'all' },
  { label: '🍚', type: 'food' },
  { label: '💧', type: 'water' },
  { label: '🚽', type: 'toilet' },
  { label: '🌡️', type: 'symptom' },
  { label: '😸', type: 'mood' },
  { label: '⚖️', type: 'weight' },
]

function groupByDate(records: HealthRecord[]): Map<string, HealthRecord[]> {
  const map = new Map<string, HealthRecord[]>()
  for (const r of records) {
    const key = format(new Date(r.recordedAt), 'yyyy-MM-dd')
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(r)
  }
  return map
}

interface Props {
  cat: Cat
  onEdit: (record: HealthRecord) => void
  onDelete: (record: HealthRecord) => void
}

export function TimelineScreen({ cat, onEdit, onDelete }: Props) {
  const [filterType, setFilterType] = useState<RecordType | 'all'>('all')
  const { records } = useRecords(cat.id)

  const filtered = filterType === 'all' ? records : records.filter(r => r.type === filterType)
  const grouped = groupByDate(filtered)
  const dates = Array.from(grouped.keys()).sort((a, b) => b.localeCompare(a))

  return (
    <div className="min-h-dvh bg-app-bg pb-24">
      <OfflineBanner />

      <AppHeader title={`${cat.name} 기록`} />

      {/* Filter tabs */}
      <div className="px-5 mb-5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        <div className="flex gap-2 w-max">
          {FILTER_TABS.map(t => (
            <button
              key={t.type}
              type="button"
              onClick={() => setFilterType(t.type)}
              className={[
                'px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all',
                filterType === t.type
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-text-secondary border border-divider',
              ].join(' ')}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      {dates.length === 0 ? (
        <div className="flex flex-col items-center py-20 gap-3">
          <span className="text-4xl">📋</span>
          <p className="text-text-secondary text-sm">기록이 없어요</p>
        </div>
      ) : (
        <div className="px-5 flex flex-col gap-6">
          {dates.map(date => (
            <div key={date}>
              <p className="text-[11px] font-semibold text-gray-400 tracking-wide uppercase mb-2.5">
                {format(new Date(date), 'M월 d일 EEEE', { locale: ko })}
              </p>
              <div className="flex flex-col gap-2">
                {grouped.get(date)!.map(r => (
                  <TimelineItem key={r.id} record={r} onEdit={onEdit} onDelete={onDelete} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <TabBar />
    </div>
  )
}

function TimelineItem({
  record,
  onEdit,
  onDelete,
}: {
  record: HealthRecord
  onEdit: (r: HealthRecord) => void
  onDelete: (r: HealthRecord) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const info = recordInfo(record)
  const hasExpandable = (info.tags && info.tags.length > 0) || !!record.note

  return (
    <div
      className={[
        'bg-white rounded-2xl px-4 py-3 shadow-sm border transition-all',
        info.alert ? 'border-red-200 bg-red-50/20' : info.warning ? 'border-amber-200' : 'border-transparent',
      ].join(' ')}
    >
      <div className="flex items-start gap-2.5">
        <span className="text-[20px] leading-none shrink-0 mt-[3px]">{TYPE_EMOJI[record.type]}</span>

        <button
          type="button"
          onClick={() => hasExpandable && setExpanded(v => !v)}
          className="flex-1 min-w-0 text-left"
        >
          {/* 헤더 행: 타입명 + 심각도 배지 */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-semibold text-text-primary">{TYPE_LABEL[record.type]}</span>
            {info.alert && (
              <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-px rounded-full font-semibold leading-none my-0.5">
                주의
              </span>
            )}
            {!info.alert && info.warning && (
              <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-px rounded-full font-semibold leading-none my-0.5">
                확인
              </span>
            )}
          </div>
          {/* 항상 표시되는 정보 */}
          <p className="text-xs font-medium text-text-primary mt-0.5">{info.main}</p>
          {info.detail && (
            <p className="text-xs text-text-secondary mt-px">{info.detail}</p>
          )}
        </button>

        <span className="text-xs text-text-secondary shrink-0 tabular-nums mt-[3px]">
          {format(new Date(record.recordedAt), 'HH:mm')}
        </span>
        <KebabMenu onEdit={() => onEdit(record)} onDelete={() => onDelete(record)} />
      </div>

      {/* 펼쳤을 때 추가 정보 */}
      {expanded && hasExpandable && (
        <div className="mt-3 pt-3 border-t border-divider flex flex-col gap-1.5">
          {info.tags && info.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {info.tags.map(t => (
                <span key={t} className="text-xs bg-gray-100 text-text-secondary px-2 py-1 rounded-full">{t}</span>
              ))}
            </div>
          )}
          {record.note && <p className="text-xs text-text-secondary">{record.note}</p>}
          <p className="text-xs text-gray-300">기록자: {record.userDisplayName}</p>
        </div>
      )}
    </div>
  )
}
