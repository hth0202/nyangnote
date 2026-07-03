import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { createCat } from '@/lib/db'
import type { User } from 'firebase/auth'

const SEX_OPTIONS = [
  { label: '남아', value: 'male' as const },
  { label: '여아', value: 'female' as const },
  { label: '모름', value: 'unknown' as const },
]

interface Props {
  user: User
  onCreated: (catId: string) => void
}

export function CatSetupScreen({ user, onCreated }: Props) {
  const [name, setName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [sex, setSex] = useState<'male' | 'female' | 'unknown'>('unknown')
  const [neutered, setNeutered] = useState<boolean | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleCreate = async () => {
    if (!name.trim()) return
    setLoading(true)
    setError('')
    try {
      const id = await createCat(
        { name: name.trim(), ownerId: user.uid, birthDate: birthDate || undefined, sex, neutered },
        { displayName: user.displayName ?? '알 수 없음', email: user.email ?? '', photoURL: user.photoURL ?? undefined }
      )
      onCreated(id)
      navigate('/')
    } catch (e) {
      console.error('고양이 등록 실패:', e)
      setError('등록에 실패했어요. 네트워크 상태를 확인하고 다시 시도해 주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-app-bg flex flex-col px-6 py-12">
      <div className="flex flex-col gap-8 max-w-sm mx-auto w-full">
        <div className="flex flex-col gap-2">
          <div className="text-4xl">🐱</div>
          <h1 className="text-2xl font-bold text-text-primary">고양이를 등록해요</h1>
          <p className="text-text-secondary text-sm">기본 정보를 입력하면 기록을 시작할 수 있어요</p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-secondary">이름 *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="예: 나비, 루미, 콩이"
              className="px-4 py-3 bg-white rounded-2xl border border-divider text-text-primary text-base focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-secondary">생일 (선택)</label>
            <input
              type="date"
              value={birthDate}
              onChange={e => setBirthDate(e.target.value)}
              className="px-4 py-3 bg-white rounded-2xl border border-divider text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-text-secondary">성별</label>
            <div className="flex gap-2">
              {SEX_OPTIONS.map(o => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setSex(o.value)}
                  className={[
                    'flex-1 py-3 rounded-2xl text-sm font-medium transition-all',
                    sex === o.value ? 'bg-primary-500 text-white' : 'bg-white border border-divider text-text-primary',
                  ].join(' ')}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-text-secondary">중성화 여부</label>
            <div className="flex gap-2">
              {([{ label: '했어요', value: true }, { label: '안 했어요', value: false }, { label: '모름', value: undefined }] as const).map(o => (
                <button
                  key={String(o.value)}
                  type="button"
                  onClick={() => setNeutered(o.value)}
                  className={[
                    'flex-1 py-3 rounded-2xl text-sm font-medium transition-all',
                    neutered === o.value ? 'bg-primary-500 text-white' : 'bg-white border border-divider text-text-primary',
                  ].join(' ')}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-error text-center">{error}</p>}

        <Button size="lg" onClick={handleCreate} loading={loading} disabled={!name.trim()}>
          등록하기
        </Button>
      </div>
    </div>
  )
}
