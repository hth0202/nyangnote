import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { OfflineBanner } from '@/components/layout/OfflineBanner'
import { PageHeader } from '@/components/layout/PageHeader'
import type { Cat } from '@/types'
import type { User } from 'firebase/auth'

interface Props {
  cat: Cat
  user: User
}

export function SettingsScreen({ cat, user }: Props) {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="min-h-dvh bg-app-bg pb-24">
      <OfflineBanner />

      <PageHeader title="설정" />

      {/* Profile */}
      <div className="px-5 mb-4">
        <div className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm">
          {user.photoURL ? (
            <img src={user.photoURL} alt="profile" className="w-12 h-12 rounded-full" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-xl">👤</div>
          )}
          <div>
            <p className="font-semibold text-text-primary">{user.displayName}</p>
            <p className="text-xs text-text-secondary">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Cat info */}
      <div className="px-5 mb-4">
        <p className="text-xs font-semibold text-text-secondary mb-2 px-1">고양이</p>
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <div className="px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🐱</span>
              <div>
                <p className="font-semibold text-text-primary">{cat.name}</p>
                {cat.birthDate && (
                  <p className="text-xs text-text-secondary">생일: {cat.birthDate}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Guardian */}
      <div className="px-5 mb-4">
        <p className="text-xs font-semibold text-text-secondary mb-2 px-1">보호자</p>
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm divide-y divide-divider">
          <button
            type="button"
            onClick={() => navigate('/guardian')}
            className="w-full px-4 py-4 text-left text-sm text-text-primary font-medium flex items-center justify-between"
          >
            공동 보호자 관리
            <span className="text-gray-300">›</span>
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="px-5">
        <p className="text-xs font-semibold text-text-secondary mb-2 px-1">계정</p>
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm divide-y divide-divider">
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full px-4 py-4 text-left text-sm text-error font-medium flex items-center justify-between"
          >
            로그아웃
            <span className="text-gray-300">›</span>
          </button>
        </div>
      </div>

    </div>
  )
}
