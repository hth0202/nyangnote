import { createPortal } from 'react-dom'

interface Props {
  open: boolean
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ open, message, confirmLabel = '나가기', cancelLabel = '계속 입력', onConfirm, onCancel }: Props) {
  if (!open) return null
  // portal로 body에 렌더 — transform·overflow-hidden 조상(스와이프 카드 등)에 갇히지 않게
  // stopPropagation: portal 이벤트는 React 트리로 버블링되므로, 카드 안에서 렌더된 경우
  // 얼럿 버튼 클릭이 카드의 onClick(상세 열기)까지 올라가는 것을 차단
  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center px-6"
      onClick={e => e.stopPropagation()}
      onPointerDown={e => e.stopPropagation()}
    >
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-3xl p-6 w-full max-w-sm flex flex-col gap-4 shadow-xl">
        <p className="text-text-primary font-medium text-center leading-relaxed">{message}</p>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onConfirm}
            className="w-full py-3 rounded-2xl bg-error text-white font-semibold text-sm"
          >
            {confirmLabel}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="w-full py-3 rounded-2xl bg-gray-100 text-text-primary font-semibold text-sm"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
