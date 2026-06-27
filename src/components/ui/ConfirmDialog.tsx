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
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
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
    </div>
  )
}
