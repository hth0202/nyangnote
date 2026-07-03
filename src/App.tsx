import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useSelectedCat, useCatList } from '@/hooks/useCat'
import { useRecords } from '@/hooks/useRecords'
import { RecordSheetProvider } from '@/context/RecordSheetContext'
import { RecordOverlay } from '@/components/records/RecordOverlay'
import { LoginScreen } from '@/screens/Login/LoginScreen'
import { OnboardingScreen } from '@/screens/Onboarding/OnboardingScreen'
import { CatSetupScreen } from '@/screens/CatSetup/CatSetupScreen'
import { JoinScreen } from '@/screens/Join/JoinScreen'
import { HomeScreen } from '@/screens/Home/HomeScreen'
import { TimelineScreen } from '@/screens/Timeline/TimelineScreen'
import { SettingsScreen } from '@/screens/Settings/SettingsScreen'
import { GuardianScreen } from '@/screens/Guardian/GuardianScreen'
import type { RecordType, HealthRecord, FoodDetails, WaterDetails, ToiletDetails, MoodDetails, SymptomDetails, WeightDetails } from '@/types'

export default function App() {
  const { user, loading: authLoading } = useAuth()
  const { cat, loading: catLoading, selectCat } = useSelectedCat()
  const { cats, loading: catsLoading, refetch } = useCatList(user?.uid ?? null)

  const [sheetOpen, setSheetOpen] = useState(false)
  const [sheetType, setSheetType] = useState<RecordType | undefined>(undefined)
  const [editRecord, setEditRecord] = useState<HealthRecord | undefined>(undefined)

  const openSheet = (type?: RecordType) => {
    setEditRecord(undefined)
    setSheetType(type)
    setSheetOpen(true)
  }

  const openEdit = (record: HealthRecord) => {
    setSheetType(undefined)
    setEditRecord(record)
    setSheetOpen(true)
  }

  const handleClose = () => {
    setSheetOpen(false)
    setEditRecord(undefined)
  }

  const { add, update, remove } = useRecords(cat?.id ?? null)

  // 선택된 고양이가 없는데 목록이 있으면 첫 번째 고양이 자동 선택
  useEffect(() => {
    if (!catLoading && !catsLoading && !cat && cats.length > 0) selectCat(cats[0].id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cat, cats, catLoading, catsLoading])

  const handleDelete = (record: HealthRecord) => {
    // 오프라인 퍼시스턴스: 서버 ack를 기다리지 않음 (로컬 캐시에 즉시 반영됨)
    remove(record.id).catch(err => console.error('기록 삭제 실패:', err))
  }

  const handleQuickAdd = async (type: 'food' | 'water' | 'toilet', toiletType?: 'urine' | 'feces') => {
    const recordedAt = new Date().toISOString()
    let details: FoodDetails | WaterDetails | ToiletDetails
    if (type === 'food') {
      details = { foodType: 'dry', servedAmount: 1, servedUnit: 'bowl', eatenRatio: 100 }
    } else if (type === 'water') {
      details = { waterLevel: 'normal' }
    } else {
      details = { toiletType: toiletType ?? 'urine', amount: 'normal' }
    }
    // await하지 않음 — 오프라인이면 서버 ack가 안 와서 저장 피드백이 영영 안 뜨기 때문
    add({
      type,
      catId: cat!.id,
      userId: user!.uid,
      userDisplayName: user!.displayName ?? '알 수 없음',
      recordedAt,
      details,
      isQuick: true,
    } as Omit<HealthRecord, 'id' | 'createdAt' | 'updatedAt'>).catch(err => console.error('빠른 기록 저장 실패:', err))
  }

  if (authLoading || catLoading || catsLoading) {
    return (
      <div className="min-h-dvh bg-app-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary-500 flex items-center justify-center text-3xl animate-pulse">
            🐱
          </div>
          <p className="text-text-secondary text-sm">냥노트 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!user) return <LoginScreen />

  if (!cat && cats.length === 0) {
    const handleCreated = (id: string) => { refetch(); selectCat(id) }
    const handleJoined = (catId: string) => { refetch(); selectCat(catId) }

    return (
      <Routes>
        <Route path="/cat-setup" element={<CatSetupScreen user={user} onCreated={handleCreated} />} />
        <Route path="/join" element={<JoinScreen user={user} onJoined={handleJoined} />} />
        <Route path="*" element={<OnboardingScreen />} />
      </Routes>
    )
  }

  // 자동 선택 useEffect가 처리할 때까지 대기
  if (!cat) return null

  const handleSave = async (
    type: RecordType,
    details: FoodDetails | WaterDetails | ToiletDetails | MoodDetails | SymptomDetails | WeightDetails,
    recordedAt: string,
    note: string
  ) => {
    // 오프라인에서도 즉시 저장 완료 처리 — Firestore가 로컬 캐시에 기록 후 자동 동기화
    add({
      type,
      catId: cat.id,
      userId: user.uid,
      userDisplayName: user.displayName ?? '알 수 없음',
      recordedAt,
      details,
      note: note || undefined,
    } as Omit<HealthRecord, 'id' | 'createdAt' | 'updatedAt'>).catch(err => console.error('기록 저장 실패:', err))
  }

  const handleUpdate = async (
    recordId: string,
    details: FoodDetails | WaterDetails | ToiletDetails | MoodDetails | SymptomDetails | WeightDetails,
    recordedAt: string,
    note: string
  ) => {
    // 폼에서 수정하는 순간 '빠른 기록(내용 미입력)' 상태 해제 — 실제 값이 입력된 일반 기록이 됨
    update(recordId, { details, recordedAt, note: note || undefined, isQuick: false }).catch(err => console.error('기록 수정 실패:', err))
  }

  return (
    <RecordSheetProvider onOpen={openSheet}>
      <Routes>
        <Route path="/" element={<HomeScreen cat={cat} user={user} openSheet={openSheet} onQuickAdd={handleQuickAdd} onEdit={openEdit} onDelete={handleDelete} />} />
        <Route path="/timeline" element={<TimelineScreen cat={cat} onEdit={openEdit} onDelete={handleDelete} />} />
        <Route path="/settings" element={<SettingsScreen cat={cat} user={user} />} />
        <Route path="/guardian" element={<GuardianScreen cat={cat} user={user} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <RecordOverlay
        open={sheetOpen}
        onClose={handleClose}
        onSave={handleSave}
        onUpdate={handleUpdate}
        initialType={sheetType}
        editRecord={editRecord}
      />
    </RecordSheetProvider>
  )
}
