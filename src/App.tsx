import { useState } from 'react'
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

  const handleDelete = (record: HealthRecord) => remove(record.id)

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

  if (!cat && cats.length > 0) {
    selectCat(cats[0].id)
    return null
  }

  if (!cat) return null

  const handleSave = async (
    type: RecordType,
    details: FoodDetails | WaterDetails | ToiletDetails | MoodDetails | SymptomDetails | WeightDetails,
    recordedAt: string,
    note: string
  ) => {
    await add({
      type,
      catId: cat.id,
      userId: user.uid,
      userDisplayName: user.displayName ?? '알 수 없음',
      recordedAt,
      details,
      note: note || undefined,
    } as Omit<HealthRecord, 'id' | 'createdAt' | 'updatedAt'>)
  }

  const handleUpdate = async (
    recordId: string,
    details: FoodDetails | WaterDetails | ToiletDetails | MoodDetails | SymptomDetails | WeightDetails,
    recordedAt: string,
    note: string
  ) => {
    await update(recordId, { details, recordedAt, note: note || undefined })
  }

  return (
    <RecordSheetProvider onOpen={openSheet}>
      <Routes>
        <Route path="/" element={<HomeScreen cat={cat} user={user} openSheet={openSheet} onEdit={openEdit} onDelete={handleDelete} />} />
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
