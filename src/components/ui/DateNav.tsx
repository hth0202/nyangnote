import { useState } from 'react'
import {
  format, addDays, addMonths, isToday, isSameDay, isSameMonth,
  startOfDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  differenceInCalendarDays, eachDayOfInterval,
} from 'date-fns'
import { ko } from 'date-fns/locale'
import { BottomSheet } from './BottomSheet'
import { IconChevronLeft, IconChevronRight, IconCalendar, IconClose } from './Icons'

export interface DateRange {
  start: Date
  end: Date
}

interface Props {
  /** null = 전체 기간 */
  range: DateRange | null
  onChange: (range: DateRange | null) => void
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

/** 노션식 범위 선택 캘린더 — 첫 탭 = 시작일, 두 번째 탭 = 종료일 */
function RangeCalendar({
  selStart, selEnd, onSelect,
}: {
  selStart: Date | null
  selEnd: Date | null
  onSelect: (start: Date | null, end: Date | null) => void
}) {
  const today = startOfDay(new Date())
  const [viewMonth, setViewMonth] = useState<Date>(() => startOfMonth(selStart ?? today))

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(viewMonth)),
    end: endOfWeek(endOfMonth(viewMonth)),
  })

  const handleTap = (d: Date) => {
    if (!selStart || (selStart && selEnd)) {
      // 새 선택 시작
      onSelect(d, null)
    } else {
      // 두 번째 탭 — 순서 자동 정렬로 범위 확정
      if (d < selStart) onSelect(d, selStart)
      else onSelect(selStart, d)
    }
  }

  const atCurrentMonth = isSameMonth(viewMonth, today)

  return (
    <div>
      {/* 월 이동 */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => setViewMonth(m => addMonths(m, -1))}
          aria-label="이전 달"
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 active:scale-95 transition-all text-text-secondary"
        >
          <IconChevronLeft size={18} />
        </button>
        <p className="text-sm font-bold text-text-primary">
          {format(viewMonth, 'yyyy년 M월', { locale: ko })}
        </p>
        <button
          type="button"
          onClick={() => setViewMonth(m => addMonths(m, 1))}
          disabled={atCurrentMonth}
          aria-label="다음 달"
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 active:scale-95 transition-all text-text-secondary disabled:opacity-30"
        >
          <IconChevronRight size={18} />
        </button>
      </div>

      {/* 요일 */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map(w => (
          <p key={w} className="text-center text-[11px] font-semibold text-gray-400 py-1">{w}</p>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-y-1">
        {days.map(d => {
          const future = d > today
          const outside = !isSameMonth(d, viewMonth)
          const isStart = selStart != null && isSameDay(d, selStart)
          const isEnd = (selEnd != null && isSameDay(d, selEnd)) || (isStart && selEnd == null)
          const inBetween =
            selStart != null && selEnd != null && d > selStart && d < selEnd

          return (
            <div
              key={d.toISOString()}
              className={[
                'h-10 flex items-center justify-center',
                // 범위 밴드 — 시작/끝 셀은 반쪽만 칠해서 원과 자연스럽게 이어짐
                inBetween ? 'bg-primary-50' : '',
                isStart && selEnd != null && !isSameDay(selStart!, selEnd) ? 'bg-gradient-to-r from-transparent from-50% to-primary-50 to-50%' : '',
                !isStart && isEnd && selStart != null && selEnd != null && !isSameDay(selStart, selEnd) ? 'bg-gradient-to-l from-transparent from-50% to-primary-50 to-50%' : '',
              ].join(' ')}
            >
              <button
                type="button"
                onClick={() => handleTap(d)}
                disabled={future}
                className={[
                  'w-9 h-9 rounded-full text-sm tabular-nums flex items-center justify-center transition-colors',
                  isStart || isEnd
                    ? 'bg-primary-500 text-white font-bold'
                    : future
                      ? 'text-gray-300'
                      : outside
                        ? 'text-gray-300 hover:bg-gray-100'
                        : isToday(d)
                          ? 'text-primary-500 font-bold hover:bg-primary-50'
                          : 'text-text-primary hover:bg-gray-100',
                ].join(' ')}
              >
                {format(d, 'd')}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function DateNav({ range, onChange }: Props) {
  const [sheetOpen, setSheetOpen] = useState(false)
  // 시트 안에서 편집 중인 선택 (적용 전까지 실제 필터에 반영 안 함)
  const [selStart, setSelStart] = useState<Date | null>(null)
  const [selEnd, setSelEnd] = useState<Date | null>(null)

  const isSingle = range != null && isSameDay(range.start, range.end)
  const atToday = range != null && isToday(range.end)

  const label =
    range == null
      ? '전체 기간'
      : isSingle
        ? isToday(range.start)
          ? `오늘 · ${format(range.start, 'M월 d일', { locale: ko })}`
          : format(range.start, 'M월 d일 EEEE', { locale: ko })
        : `${format(range.start, 'M월 d일', { locale: ko })} – ${format(range.end, 'M월 d일', { locale: ko })}`

  // ‹ › — 기간 길이만큼 창을 이동 (하루 선택이면 ±1일)
  const shift = (dir: -1 | 1) => {
    const today = startOfDay(new Date())
    if (range == null) {
      // 전체 기간 상태에서 ‹ 누르면 어제부터 하루 단위 탐색 시작
      if (dir === -1) onChange({ start: addDays(today, -1), end: addDays(today, -1) })
      return
    }
    const span = differenceInCalendarDays(range.end, range.start) + 1
    let start = addDays(startOfDay(range.start), dir * span)
    let end = addDays(startOfDay(range.end), dir * span)
    if (end > today) {
      // 오늘을 넘지 않게 창 길이 유지한 채 클램프
      end = today
      start = addDays(end, -(span - 1))
    }
    onChange({ start, end })
  }

  const openSheet = () => {
    setSelStart(range?.start ?? null)
    setSelEnd(range?.end ?? null)
    setSheetOpen(true)
  }

  const applySelection = () => {
    if (!selStart) return
    onChange({ start: selStart, end: selEnd ?? selStart })
    setSheetOpen(false)
  }

  const applyPreset = (days: number) => {
    const today = startOfDay(new Date())
    onChange({ start: addDays(today, -(days - 1)), end: today })
    setSheetOpen(false)
  }

  const selectionLabel = !selStart
    ? '날짜를 선택하세요'
    : !selEnd || isSameDay(selStart, selEnd)
      ? format(selStart, 'M월 d일 EEEE', { locale: ko })
      : `${format(selStart, 'M월 d일', { locale: ko })} – ${format(selEnd, 'M월 d일', { locale: ko })}`

  return (
    <>
      <div className="flex items-center justify-center gap-1.5">
        <button
          type="button"
          onClick={() => shift(-1)}
          aria-label="이전 기간"
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-divider text-text-secondary active:scale-95 transition-all shrink-0"
        >
          <IconChevronLeft size={16} />
        </button>

        {/* 중앙 pill 전체가 탭 영역 — 해제(✕)는 pill 내부라 레이아웃이 밀리지 않음 */}
        <button
          type="button"
          onClick={openSheet}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-divider text-sm font-semibold text-text-primary active:scale-95 transition-all"
        >
          <IconCalendar size={14} className="text-primary-500 shrink-0" />
          {label}
          {range != null && (
            <span
              role="button"
              aria-label="전체 기간 보기"
              onClick={e => { e.stopPropagation(); onChange(null) }}
              className="-mr-1 w-5 h-5 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200"
            >
              <IconClose size={10} />
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => shift(1)}
          disabled={range == null || atToday}
          aria-label="다음 기간"
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-divider text-text-secondary active:scale-95 transition-all disabled:opacity-30 shrink-0"
        >
          <IconChevronRight size={16} />
        </button>
      </div>

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="기간 선택">
        <div className="flex flex-col gap-4">
          {/* 빠른 선택 */}
          <div className="grid grid-cols-4 gap-2">
            {([['오늘', 1], ['최근 7일', 7], ['최근 30일', 30]] as const).map(([text, days]) => (
              <button
                key={days}
                type="button"
                onClick={() => applyPreset(days)}
                className="py-2.5 rounded-xl bg-gray-50 border border-divider text-[13px] font-medium text-text-primary whitespace-nowrap active:scale-95 transition-all"
              >
                {text}
              </button>
            ))}
            <button
              type="button"
              onClick={() => { onChange(null); setSheetOpen(false) }}
              className="py-2.5 rounded-xl bg-gray-50 border border-divider text-[13px] font-medium text-text-primary whitespace-nowrap active:scale-95 transition-all"
            >
              전체 기간
            </button>
          </div>

          {/* 캘린더 — 첫 탭 시작일, 두 번째 탭 종료일 */}
          <RangeCalendar
            key={sheetOpen ? 'open' : 'closed'}
            selStart={selStart}
            selEnd={selEnd}
            onSelect={(s, e) => { setSelStart(s); setSelEnd(e) }}
          />

          {/* 현재 선택 표시 */}
          <p className="text-center text-sm font-semibold text-primary-500 min-h-5">
            {selectionLabel}
          </p>

          <button
            type="button"
            onClick={applySelection}
            disabled={!selStart}
            className="w-full py-3 rounded-2xl bg-primary-500 text-white font-semibold active:scale-95 transition-all disabled:opacity-40"
          >
            적용
          </button>
        </div>
      </BottomSheet>
    </>
  )
}
