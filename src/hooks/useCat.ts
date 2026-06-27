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
    getCat(catId).then(c => { setCat(c); setLoading(false) })
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
    getCatsByMember(userId).then(c => { setCats(c); setLoading(false) })
  }, [userId])

  return { cats, loading, refetch: () => getCatsByMember(userId!).then(setCats) }
}
