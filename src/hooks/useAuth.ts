import { useState, useEffect } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth'
import { auth, googleProvider } from '@/lib/firebase'
import { upsertUser } from '@/lib/db'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) {
        await upsertUser({
          id: u.uid,
          displayName: u.displayName ?? '알 수 없음',
          email: u.email ?? '',
          photoURL: u.photoURL ?? undefined,
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        })
      }
      setLoading(false)
    })
  }, [])

  const signIn = () => signInWithPopup(auth, googleProvider)
  const signOutUser = () => signOut(auth)

  return { user, loading, signIn, signOut: signOutUser }
}
