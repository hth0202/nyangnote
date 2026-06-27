import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { useOnline } from '@/hooks/useOnline'

export function OfflineBanner() {
  const { isOnline, lastSync } = useOnline()

  if (isOnline) return null

  const syncText = lastSync
    ? format(lastSync, 'yyyy.MM.dd HH:mm', { locale: ko })
    : '알 수 없음'

  return (
    <div className="fixed top-0 z-40 bg-gray-800 text-white text-sm px-4 py-2 flex items-center gap-2 w-full max-w-[430px] left-1/2 -translate-x-1/2">
      <span className="w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0" />
      <span>오프라인 상태 · 마지막 연동 {syncText}</span>
    </div>
  )
}
