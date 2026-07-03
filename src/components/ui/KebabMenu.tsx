import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ConfirmDialog } from './ConfirmDialog'

interface Props {
  onEdit: () => void
  onDelete: () => void
}

const MENU_WIDTH = 112
const MENU_HEIGHT = 98 // 수정+삭제 두 항목 예상 높이 (아래 공간 부족 시 위로 펼침 판단용)

export function KebabMenu({ onEdit, onDelete }: Props) {
  const [open, setOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // 드롭다운은 portal로 body에 렌더 — 카드의 overflow-hidden·transform에 잘리거나
  // 다음 카드에 가려지는 문제를 원천 차단
  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (open) { setOpen(false); return }
    const r = btnRef.current!.getBoundingClientRect()
    const left = Math.max(8, Math.min(r.right - MENU_WIDTH, window.innerWidth - MENU_WIDTH - 8))
    const top =
      r.bottom + 4 + MENU_HEIGHT > window.innerHeight
        ? r.top - 4 - MENU_HEIGHT
        : r.bottom + 4
    setPos({ top, left })
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return
    const close = (e: Event) => {
      const t = e.target as Node
      if (btnRef.current?.contains(t) || menuRef.current?.contains(t)) return
      setOpen(false)
    }
    const closeNow = () => setOpen(false)
    document.addEventListener('mousedown', close)
    document.addEventListener('touchstart', close)
    window.addEventListener('scroll', closeNow, true)
    window.addEventListener('resize', closeNow)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('touchstart', close)
      window.removeEventListener('scroll', closeNow, true)
      window.removeEventListener('resize', closeNow)
    }
  }, [open])

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-label="더보기"
        onClick={toggle}
        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-text-secondary transition-colors shrink-0"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="12" cy="19" r="1.5" />
        </svg>
      </button>

      {open && pos && createPortal(
        <div
          ref={menuRef}
          style={{ position: 'fixed', top: pos.top, left: pos.left, width: MENU_WIDTH }}
          className="z-50 bg-white rounded-2xl shadow-lg border border-divider overflow-hidden"
        >
          <button
            type="button"
            onClick={e => { e.stopPropagation(); setOpen(false); onEdit() }}
            className="w-full px-4 py-3 text-left text-sm font-medium text-text-primary hover:bg-gray-50 active:bg-gray-100"
          >
            수정
          </button>
          <div className="h-px bg-divider" />
          <button
            type="button"
            onClick={e => { e.stopPropagation(); setOpen(false); setConfirmDelete(true) }}
            className="w-full px-4 py-3 text-left text-sm font-medium text-error hover:bg-red-50 active:bg-red-100"
          >
            삭제
          </button>
        </div>,
        document.body
      )}

      <ConfirmDialog
        open={confirmDelete}
        message="이 기록을 삭제할까요?"
        confirmLabel="삭제"
        cancelLabel="취소"
        onConfirm={() => { setConfirmDelete(false); onDelete() }}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  )
}
