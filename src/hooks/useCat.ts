import { useState, useEffect } from 'react'
import { getCat, getCatsByMember } from '@/lib/db'
import type { Cat } from '@/types'

const SELECTED_CAT_KEY = 'nyangnote_selected_cat'

export function useSelectedCat() {
  const [catId, setCatId] = useState<string | null>(() => localStorage.getItem(SELECTED_CAT_KEY))
  const [cat, setCat] = useState<Cat | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!catId) { setLoading(false); return }
    let cancelled = false
    getCat(catId)
      .then(c => { if (!cancelled) setCat(c) })
      .catch(err => {
        // 삭제됐거나 접근 권한이 없는 고양이 — 선택 해제해서 무한 로딩 방지
        console.error('고양이 조회 실패:', err)
        if (!cancelled) {
          localStorage.removeItem(SELECTED_CAT_KEY)
          setCat(null)
        }
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [catId])

  const selectCat = (id: string) => {
    localStorage.setItem(SELECTED_CAT_KEY, id)
    setCatId(id)
  }

  return { cat, catId, loading, selectCat }
}

export function useCatList(userId: string | null) {
  const [cats, setCats] = useState<Cat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) { setLoading(false); return }
    let cancelled = false
    getCatsByMember(userId)
      .then(c => { if (!cancelled) setCats(c) })
      .catch(err => console.error('고양이 목록 조회 실패:', err))
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [userId])

  return {
    cats,
    loading,
    refetch: () =>
      getCatsByMember(userId!).then(setCats).catch(err => console.error('고양이 목록 조회 실패:', err)),
  }
}
