// Simple offline queue using localStorage
// Firestore's built-in IndexedDB persistence handles most cases;
// this queue handles explicit tracking for the status banner.

const LAST_SYNC_KEY = 'nyangnote_last_sync'
const ONLINE_KEY = 'nyangnote_online'

export function setLastSync(date: Date = new Date()) {
  localStorage.setItem(LAST_SYNC_KEY, date.toISOString())
}

export function getLastSync(): Date | null {
  const v = localStorage.getItem(LAST_SYNC_KEY)
  return v ? new Date(v) : null
}

export function setOnlineStatus(online: boolean) {
  localStorage.setItem(ONLINE_KEY, String(online))
}
