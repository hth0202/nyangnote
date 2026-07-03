import { useState, useRef, type ReactNode } from 'react'
import { ConfirmDialog } from './ConfirmDialog'

interface Props {
  onDelete: () => void
  onTap: () => void
  children: ReactNode
}

const REVEAL = 72
const THRESHOLD = REVEAL * 0.45

// Pointer Events 기반 — 터치(모바일)와 마우스 드래그(데스크톱) 모두 지원
export function SwipeableCard({ onDelete, onTap, children }: Props) {
  const [offset, setOffset] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const offsetRef = useRef(0)
  const pressed = useRef(false)
  const startX = useRef(0)
  const startY = useRef(0)
  const startOffset = useRef(0)
  const axis = useRef<'h' | 'v' | null>(null)
  const moved = useRef(false)

  const updateOffset = (val: number) => {
    offsetRef.current = val
    setOffset(val)
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    pressed.current = true
    startX.current = e.clientX
    startY.current = e.clientY
    startOffset.current = offsetRef.current
    axis.current = null
    moved.current = false
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!pressed.current) return
    const dx = e.clientX - startX.current
    const dy = e.clientY - startY.current

    if (axis.current === null) {
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        axis.current = Math.abs(dy) > Math.abs(dx) ? 'v' : 'h'
        if (axis.current === 'h') {
          setDragging(true)
          // 가로 스와이프 확정 시에만 캡처 — 세로 스크롤은 브라우저에 맡김
          e.currentTarget.setPointerCapture(e.pointerId)
        }
      }
      return
    }
    if (axis.current === 'v') return

    moved.current = true
    updateOffset(Math.min(0, Math.max(-REVEAL, startOffset.current + dx)))
  }

  const finish = () => {
    if (!pressed.current) return
    pressed.current = false
    setDragging(false)
    if (axis.current === 'h' && moved.current) {
      if (offsetRef.current < -THRESHOLD) {
        // 임계값 넘게 스와이프하면 바로 삭제 확인 얼럿
        updateOffset(-REVEAL)
        setConfirmOpen(true)
      } else {
        updateOffset(0)
      }
    }
    axis.current = null
  }

  // 가로 드래그 중엔 포인터 캡처가 pointerup을 보장하므로,
  // 캡처 없이 요소를 벗어난 경우(축 미확정·세로)만 leave에서 정리
  const handleLeave = () => {
    if (axis.current !== 'h') finish()
  }

  const handleClick = () => {
    if (moved.current) { moved.current = false; return }
    if (offsetRef.current !== 0) { updateOffset(0); return }
    onTap()
  }

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-sm">
      {/* 삭제 배경 — 스와이프 중 시각적 피드백 (릴리즈 시 얼럿이 뜨므로 버튼 아님) */}
      <div className="absolute inset-y-0 right-0 w-[72px] bg-red-500 flex flex-col items-center justify-center gap-1 text-white pointer-events-none">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14H6L5 6" />
          <path d="M10 11v6M14 11v6" />
          <path d="M9 6V4h6v2" />
        </svg>
        <span className="text-[11px] font-semibold">삭제</span>
      </div>

      {/* 슬라이딩 카드 */}
      <div
        style={{
          transform: `translateX(${offset}px)`,
          transition: dragging ? 'none' : 'transform 0.22s ease',
          touchAction: 'pan-y',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finish}
        onPointerCancel={finish}
        onPointerLeave={handleLeave}
        onClick={handleClick}
      >
        {children}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        message="이 기록을 삭제할까요?"
        confirmLabel="삭제"
        cancelLabel="취소"
        onConfirm={() => { setConfirmOpen(false); onDelete() }}
        onCancel={() => { setConfirmOpen(false); updateOffset(0) }}
      />
    </div>
  )
}
