export interface AppUser {
  id: string
  displayName: string
  email: string
  photoURL?: string
  createdAt: string
  lastLoginAt: string
}

export interface Cat {
  id: string
  name: string
  ownerId: string
  birthDate?: string
  sex?: 'male' | 'female' | 'unknown'
  neutered?: boolean
  profilePhotoUrl?: string
  createdAt: string
  updatedAt: string
}

export type MemberRole = 'owner' | 'caregiver'

export interface CatMember {
  userId: string
  role: MemberRole
  displayName: string
  email: string
  photoURL?: string
  joinedAt: string
  inviteCode?: string  // stored only for Firestore rule verification on join
}

export interface CatInvite {
  code: string
  catId: string
  catName: string
  invitedBy: string
  invitedByName: string
  createdAt: string
}

// ── Records ──────────────────────────────────────────────────

export type RecordType = 'food' | 'water' | 'mood' | 'symptom' | 'toilet' | 'weight'

export interface PhotoMetadata {
  id: string
  url: string
  storagePath: string
  width?: number
  height?: number
  createdAt: string
}

export interface BaseRecord {
  id: string
  catId: string
  userId: string
  userDisplayName: string
  type: RecordType
  recordedAt: string
  createdAt: string
  updatedAt: string
  tags?: string[]
  photoUrls?: string[]
  photoMetadata?: PhotoMetadata[]
  note?: string
  isQuick?: boolean
}

// Food
export type FoodType = 'wet' | 'dry' | 'snack' | 'prescription' | 'other'
export type FoodUnit = 'can' | 'pouch' | 'bowl' | 'cup' | 'spoon' | 'g' | 'ml'
export type EatenRatio = 100 | 75 | 50 | 25 | 10 | 0

export interface FoodDetails {
  foodType: FoodType
  foodName?: string
  servedAmount: number
  servedUnit: FoodUnit
  eatenRatio: EatenRatio
  appetite?: 'good' | 'normal' | 'poor' | 'none' | 'unusual'
  reactionTags?: string[]
  symptomTags?: string[]
}

// Water
export type WaterLevel = 'very_low' | 'low' | 'normal' | 'high' | 'very_high'

export interface WaterDetails {
  waterLevel: WaterLevel
  measurementType?: 'direct' | 'estimated' | 'dispenser'
  waterAmountMl?: number
}

// Mood
export type MoodType = 'calm' | 'active' | 'sensitive' | 'hiding' | 'lethargic' | 'aggressive' | 'anxious'
export type ActivityLevel = 'high' | 'normal' | 'low' | 'very_low'

export interface MoodDetails {
  mood: MoodType
  activityLevel: ActivityLevel
  behaviorTags?: string[]
}

// Symptom
export type SymptomType = 'vomit' | 'cough' | 'sneeze' | 'cry' | 'limp' | 'anorexia' | 'dyspnea' | 'drool' | 'scratch' | 'tremor' | 'other'

export interface VomitExtra {
  content?: string[]
  count?: 1 | 2 | 3
  timing?: 'before_meal' | 'within_30min' | 'after_1hr' | 'unknown'
}

export interface SymptomDetails {
  symptomType: SymptomType
  severity?: 'mild' | 'moderate' | 'severe'
  count?: number
  durationMin?: number
  vomitExtra?: VomitExtra
}

// Toilet
export type ToiletType = 'urine' | 'feces'
export type ToiletAmount = 'none' | 'small' | 'normal' | 'large' | 'very_large'
export type Consistency = 'hard' | 'normal' | 'soft' | 'loose' | 'liquid'

export interface ToiletDetails {
  toiletType: ToiletType
  amount: ToiletAmount
  conditionTags?: string[]
  // feces only
  count?: 1 | 2 | 3
  consistency?: Consistency
}

// Weight
export interface WeightDetails {
  weightKg: number
  measurementContext?: 'self' | 'clinic'
}

export type RecordDetails = FoodDetails | WaterDetails | MoodDetails | SymptomDetails | ToiletDetails | WeightDetails

export interface HealthRecord extends BaseRecord {
  details: RecordDetails
}

// ── Offline queue ─────────────────────────────────────────────

export interface OfflineRecord {
  tempId: string
  record: Omit<HealthRecord, 'id'>
  syncedAt?: string
}
