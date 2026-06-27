import {
  collection,
  collectionGroup,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
  onSnapshot,
  type QueryConstraint,
} from 'firebase/firestore'
import { db } from './firebase'
import type { AppUser, Cat, CatMember, HealthRecord, CatInvite } from '@/types'

const now = () => new Date().toISOString()

function stripUndefined(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(stripUndefined)
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, stripUndefined(v)])
    )
  }
  return obj
}

// ── Users ─────────────────────────────────────────────────────

export async function upsertUser(user: AppUser) {
  await setDoc(doc(db, 'users', user.id), { ...user, lastLoginAt: now() }, { merge: true })
}

export async function getUser(userId: string): Promise<AppUser | null> {
  const snap = await getDoc(doc(db, 'users', userId))
  return snap.exists() ? (snap.data() as AppUser) : null
}

// ── Cats ──────────────────────────────────────────────────────

export async function createCat(
  cat: Omit<Cat, 'id' | 'createdAt' | 'updatedAt'>,
  ownerInfo: { displayName: string; email: string; photoURL?: string }
): Promise<string> {
  const ref = doc(collection(db, 'cats'))
  const now_ = now()
  const data: Cat = { ...cat, id: ref.id, createdAt: now_, updatedAt: now_ }
  await setDoc(ref, data)
  const member: CatMember = {
    userId: cat.ownerId,
    role: 'owner',
    displayName: ownerInfo.displayName,
    email: ownerInfo.email,
    photoURL: ownerInfo.photoURL,
    joinedAt: now_,
  }
  await setDoc(doc(db, 'cats', ref.id, 'members', cat.ownerId), stripUndefined(member))
  return ref.id
}

export async function getCat(catId: string): Promise<Cat | null> {
  const snap = await getDoc(doc(db, 'cats', catId))
  return snap.exists() ? (snap.data() as Cat) : null
}

export async function updateCat(catId: string, data: Partial<Cat>) {
  await updateDoc(doc(db, 'cats', catId), { ...data, updatedAt: now() })
}

export async function getCatsByMember(userId: string): Promise<Cat[]> {
  // Get cats where user is owner
  const ownerSnap = await getDocs(
    query(collection(db, 'cats'), where('ownerId', '==', userId))
  )
  const ownedIds = new Set(ownerSnap.docs.map(d => d.id))
  const owned = ownerSnap.docs.map(d => d.data() as Cat)

  // Get cats where user is caregiver (collectionGroup query)
  const memberSnap = await getDocs(
    query(collectionGroup(db, 'members'), where('userId', '==', userId))
  )
  const caregiverCatIds = memberSnap.docs
    .map(d => d.ref.parent.parent!.id)
    .filter(id => !ownedIds.has(id))

  const caregiverCats = await Promise.all(
    caregiverCatIds.map(id => getDoc(doc(db, 'cats', id)).then(s => s.data() as Cat))
  )

  return [...owned, ...caregiverCats]
}

// ── Members ───────────────────────────────────────────────────

export async function getCatMembers(catId: string): Promise<CatMember[]> {
  const snap = await getDocs(collection(db, 'cats', catId, 'members'))
  return snap.docs.map(d => d.data() as CatMember)
}

export async function removeCatMember(catId: string, userId: string) {
  await deleteDoc(doc(db, 'cats', catId, 'members', userId))
}

// ── Invite codes ──────────────────────────────────────────────

function randomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export async function getOrCreateInviteCode(
  catId: string,
  catName: string,
  invitedBy: string,
  invitedByName: string
): Promise<string> {
  // 고양이당 코드 하나 — 이미 있으면 그대로 반환
  const existing = await getDocs(
    query(collection(db, 'inviteCodes'), where('catId', '==', catId))
  )
  if (!existing.empty) return existing.docs[0].data().code as string

  const code = randomCode()
  const invite: CatInvite = { code, catId, catName, invitedBy, invitedByName, createdAt: now() }
  await setDoc(doc(db, 'inviteCodes', code), invite)
  return code
}

export async function lookupInviteCode(code: string): Promise<CatInvite | null> {
  const snap = await getDoc(doc(db, 'inviteCodes', code.toUpperCase()))
  if (!snap.exists()) return null
  return snap.data() as CatInvite
}

export async function acceptInviteCode(code: string, member: CatMember): Promise<void> {
  const invite = await lookupInviteCode(code)
  if (!invite) throw new Error('유효하지 않은 초대 코드예요')
  const members = await getCatMembers(invite.catId)
  if (members.length >= 6) throw new Error('보호자가 최대 인원(6명)에 도달했어요')
  if (members.some(m => m.userId === member.userId)) throw new Error('이미 이 고양이의 보호자예요')
  await setDoc(doc(db, 'cats', invite.catId, 'members', member.userId), stripUndefined(member))
}

export async function getCatInviteCode(catId: string): Promise<CatInvite | null> {
  const snap = await getDocs(
    query(collection(db, 'inviteCodes'), where('catId', '==', catId))
  )
  if (snap.empty) return null
  return snap.docs[0].data() as CatInvite
}

// ── Records ───────────────────────────────────────────────────

export async function addRecord(catId: string, record: Omit<HealthRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const ref = doc(collection(db, 'cats', catId, 'records'))
  const now_ = now()
  const data = stripUndefined({ ...record, id: ref.id, catId, createdAt: now_, updatedAt: now_ })
  await setDoc(ref, data)
  return ref.id
}

export async function updateRecord(catId: string, recordId: string, data: Partial<HealthRecord>) {
  await updateDoc(doc(db, 'cats', catId, 'records', recordId), stripUndefined({ ...data, updatedAt: now() }) as Record<string, unknown>)
}

export async function deleteRecord(catId: string, recordId: string) {
  await deleteDoc(doc(db, 'cats', catId, 'records', recordId))
}

export function subscribeToRecords(
  catId: string,
  constraints: QueryConstraint[],
  onData: (records: HealthRecord[]) => void
) {
  const q = query(collection(db, 'cats', catId, 'records'), ...constraints, orderBy('recordedAt', 'desc'))
  return onSnapshot(q, snap => {
    onData(snap.docs.map(d => d.data() as HealthRecord))
  })
}

export async function getRecentRecords(catId: string, limitCount = 50): Promise<HealthRecord[]> {
  const snap = await getDocs(
    query(
      collection(db, 'cats', catId, 'records'),
      orderBy('recordedAt', 'desc'),
      limit(limitCount)
    )
  )
  return snap.docs.map(d => d.data() as HealthRecord)
}

void Timestamp; void serverTimestamp
