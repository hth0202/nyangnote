import { useState, useEffect } from 'react'
import { setLastSync, getLastSync } from '@/lib/offline'

export function useOnline() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [lastSync, setLastSyncState] = useState<Date | null>(getLastSync)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      const d = new Date()
      setLastSync(d)
      setLastSyncState(d)
    }
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    if (navigator.onLine) {
      const d = new Date()
      setLastSync(d)
      setLastSyncState(d)
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return { isOnline, lastSync }
}
