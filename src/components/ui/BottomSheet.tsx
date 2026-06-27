import { useEffect, type ReactNode } from 'react'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

export function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end items-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
        onClick={onClose}
      />
      {/* Sheet */}
      <div className="relative bg-white rounded-t-3xl max-h-[90dvh] flex flex-col animate-slide-up w-full max-w-[430px]">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>
        {title && (
          <div className="px-6 pt-2 pb-4 border-b border-divider">
            <h2 className="text-lg font-bold text-text-primary">{title}</h2>
          </div>
        )}
        <div className="overflow-y-auto overscroll-contain flex-1 px-6 pb-8 pt-4">
          {children}
        </div>
      </div>
    </div>
  )
}
