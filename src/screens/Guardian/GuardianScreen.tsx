import { useState, useEffect, useCallback } from 'react'
import { getCatMembers, removeCatMember, getOrCreateInviteCode, getCatInviteCode } from '@/lib/db'
import { PageHeader } from '@/components/layout/PageHeader'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import type { Cat, CatMember, CatInvite } from '@/types'
import type { User } from 'firebase/auth'

interface Props {
  cat: Cat
  user: User
}

export function GuardianScreen({ cat, user }: Props) {
  const [members, setMembers] = useState<CatMember[]>([])
  const [invite, setInvite] = useState<CatInvite | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [generatingCode, setGeneratingCode] = useState(false)
  const [copied, setCopied] = useState(false)
  const [actionError, setActionError] = useState('')
  const [removeTarget, setRemoveTarget] = useState<CatMember | null>(null)

  const isOwner = members.find(m => m.userId === user.uid)?.role === 'owner'

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      const [mems, inv] = await Promise.all([
        getCatMembers(cat.id),
        getCatInviteCode(cat.id),
      ])
      setMembers([...mems].sort((a, b) => a.joinedAt.localeCompare(b.joinedAt)))
      setInvite(inv)
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : '데이터를 불러오지 못했어요')
    } finally {
      setLoading(false)
    }
  }, [cat.id])

  useEffect(() => { load() }, [load])

  const handleGetCode = async () => {
    setGeneratingCode(true)
    setActionError('')
    try {
      const code = await getOrCreateInviteCode(cat.id, cat.name, user.uid, user.displayName ?? '알 수 없음')
      setInvite({
        code,
        catId: cat.id,
        catName: cat.name,
        invitedBy: user.uid,
        invitedByName: user.displayName ?? '알 수 없음',
        createdAt: new Date().toISOString(),
      })
    } catch (e) {
      setActionError(e instanceof Error ? e.message : '초대 코드 생성에 실패했어요')
    } finally {
      setGeneratingCode(false)
    }
  }

  const handleCopy = async () => {
    if (!invite) return
    try {
      await navigator.clipboard.writeText(invite.code)
    } catch {
      // HTTP(비보안 컨텍스트) 등 clipboard API 미지원 환경 폴백
      const ta = document.createElement('textarea')
      ta.value = invite.code
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    if (!invite) return
    const text = `${cat.name}의 보호자로 초대합니다!\n냥노트 앱에서 초대 코드를 입력하세요: ${invite.code}`
    if (navigator.share) {
      try {
        await navigator.share({ title: '냥노트 초대', text })
      } catch {
        // 사용자가 공유 시트를 닫은 경우(AbortError) — 무시
      }
    } else {
      handleCopy()
    }
  }

  const handleRemove = async (memberId: string) => {
    setActionError('')
    try {
      await removeCatMember(cat.id, memberId)
      setMembers(prev => prev.filter(m => m.userId !== memberId))
    } catch (e) {
      setActionError(e instanceof Error ? e.message : '보호자 제거에 실패했어요')
    }
  }

  return (
    <div className="min-h-dvh bg-app-bg pb-24">
      <PageHeader title="공동 보호자" />

      {loading ? (
        <div className="flex items-center justify-center py-20 text-text-secondary text-sm">불러오는 중...</div>
      ) : loadError ? (
        <div className="px-5 py-20 flex flex-col items-center gap-3">
          <p className="text-text-secondary text-sm text-center">{loadError}</p>
          <button type="button" onClick={load} className="text-sm text-primary-500 font-medium">다시 시도</button>
        </div>
      ) : (
        <>
          {isOwner && (
            <div className="px-5 mb-6">
              <p className="text-xs font-semibold text-text-secondary mb-2 px-1">초대 코드</p>
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                {invite ? (
                  <>
                    <p className="text-3xl font-bold tracking-[0.3em] text-primary-500 font-mono mb-4">{invite.code}</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleShare}
                        className="flex-1 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-medium active:scale-95 transition-all"
                      >
                        공유하기
                      </button>
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="flex-1 py-2.5 rounded-xl bg-gray-100 text-text-primary text-sm font-medium active:scale-95 transition-all"
                      >
                        {copied ? '복사됨!' : '복사하기'}
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleGetCode}
                    disabled={generatingCode}
                    className="w-full py-3 rounded-xl bg-primary-500 text-white text-sm font-medium disabled:opacity-50"
                  >
                    {generatingCode ? '생성 중...' : '초대 코드 생성하기'}
                  </button>
                )}
              </div>
            </div>
          )}

          {actionError && (
            <div className="px-5 mb-4">
              <p className="text-sm text-error bg-red-50 border border-red-200 rounded-2xl px-4 py-3">{actionError}</p>
            </div>
          )}

          <div className="px-5">
            <p className="text-xs font-semibold text-text-secondary mb-2 px-1">
              보호자 목록 ({members.length}명)
            </p>
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm divide-y divide-divider">
              {members.map((member, idx) => (
                <div key={member.userId} className="px-4 py-4 flex items-center gap-3">
                  {member.photoURL ? (
                    <img src={member.photoURL} alt="" className="w-11 h-11 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-primary-100 flex items-center justify-center text-xl shrink-0">👤</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-primary-500 mb-0.5">보호자{idx + 1}</p>
                    <p className="text-sm font-medium text-text-primary truncate">{member.displayName}</p>
                    <p className="text-xs text-text-secondary truncate">{member.email}</p>
                  </div>
                  {member.userId === user.uid && (
                    <span className="text-xs text-primary-500 bg-primary-50 px-2 py-1 rounded-lg shrink-0">나</span>
                  )}
                  {isOwner && member.userId !== user.uid && (
                    <button
                      type="button"
                      onClick={() => setRemoveTarget(member)}
                      className="text-xs text-error px-2 py-1 rounded-lg hover:bg-red-50 transition-colors shrink-0"
                    >
                      제거
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <ConfirmDialog
        open={removeTarget !== null}
        message={`${removeTarget?.displayName ?? ''}님을 보호자에서 제거할까요?`}
        confirmLabel="제거"
        cancelLabel="취소"
        onConfirm={() => {
          const target = removeTarget
          setRemoveTarget(null)
          if (target) handleRemove(target.userId)
        }}
        onCancel={() => setRemoveTarget(null)}
      />
    </div>
  )
}
