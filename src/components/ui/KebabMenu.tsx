import { useState, useRef, useEffect } from 'react'
import { ConfirmDialog } from './ConfirmDialog'

interface Props {
  onEdit: () => void
  onDelete: () => void
}

export function KebabMenu({ onEdit, onDelete }: Props) {
  const [open, setOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <>
      <div ref={ref} className="relative shrink-0">
        <button
          type="button"
          aria-label="더보기"
          onClick={e => { e.stopPropagation(); setOpen(v => !v) }}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-text-secondary transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="12" cy="19" r="1.5" />
          </svg>
        </button>

        {open && (
          <div className="absolute right-0 top-9 z-50 bg-white rounded-2xl shadow-lg border border-divider overflow-hidden min-w-[96px]">
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
          </div>
        )}
      </div>

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
