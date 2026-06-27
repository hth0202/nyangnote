import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { lookupInviteCode, acceptInviteCode } from '@/lib/db'
import type { CatInvite } from '@/types'
import type { User } from 'firebase/auth'

interface Props {
  user: User
  onJoined: (catId: string) => void
}

export function JoinScreen({ user, onJoined }: Props) {
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [invite, setInvite] = useState<CatInvite | null>(null)
  const [error, setError] = useState('')
  const [looking, setLooking] = useState(false)
  const [joining, setJoining] = useState(false)

  const handleCodeChange = (val: string) => {
    setCode(val.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))
    setInvite(null)
    setError('')
  }

  const handleLookup = async () => {
    if (code.length < 6) return
    setLooking(true)
    setError('')
    setInvite(null)
    const result = await lookupInviteCode(code)
    if (!result) setError('유효하지 않은 코드예요. 다시 확인해 주세요.')
    else setInvite(result)
    setLooking(false)
  }

  const handleJoin = async () => {
    if (!invite) return
    setJoining(true)
    setError('')
    try {
      await acceptInviteCode(invite.code, {
        userId: user.uid,
        role: 'caregiver',
        displayName: user.displayName ?? '알 수 없음',
        email: user.email ?? '',
        photoURL: user.photoURL ?? undefined,
        joinedAt: new Date().toISOString(),
      })
      onJoined(invite.catId)
    } catch (e) {
      setError(e instanceof Error ? e.message : '참여에 실패했어요')
    } finally {
      setJoining(false)
    }
  }

  return (
    <div className="min-h-dvh bg-app-bg flex flex-col px-6 py-12">
      <div className="flex flex-col gap-8 max-w-sm mx-auto w-full">
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="self-start w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-xl"
          >
            ‹
          </button>
          <div className="text-4xl">🔑</div>
          <h1 className="text-2xl font-bold text-text-primary">초대 코드 입력</h1>
          <p className="text-text-secondary text-sm">보호자에게 받은 6자리 코드를 입력하세요</p>
        </div>

        <div className="flex flex-col gap-4">
          <input
            type="text"
            value={code}
            onChange={e => handleCodeChange(e.target.value)}
            placeholder="AB3K7R"
            maxLength={6}
            autoCapitalize="characters"
            className="px-4 py-4 bg-white rounded-2xl border border-divider text-text-primary text-2xl font-bold tracking-[0.3em] text-center uppercase font-mono focus:outline-none focus:ring-2 focus:ring-primary-300"
          />

          {error && (
            <p className="text-sm text-error text-center">{error}</p>
          )}

          {invite && (
            <div className="bg-primary-50 rounded-2xl p-4 text-center border border-primary-100">
              <p className="text-text-secondary text-sm mb-1">초대받은 고양이</p>
              <p className="text-xl font-bold text-text-primary">🐱 {invite.catName}</p>
              <p className="text-xs text-text-secondary mt-1">{invite.invitedByName}님이 초대했어요</p>
            </div>
          )}

          {!invite ? (
            <button
              type="button"
              onClick={handleLookup}
              disabled={code.length < 6 || looking}
              className="w-full py-4 rounded-2xl bg-primary-500 text-white font-semibold text-base disabled:opacity-40 active:scale-95 transition-all"
            >
              {looking ? '확인 중...' : '코드 확인하기'}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleJoin}
              disabled={joining}
              className="w-full py-4 rounded-2xl bg-primary-500 text-white font-semibold text-base disabled:opacity-40 active:scale-95 transition-all"
            >
              {joining ? '참여 중...' : `${invite.catName}의 보호자로 참여하기`}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
