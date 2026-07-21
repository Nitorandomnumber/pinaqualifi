import type { ScanResult } from './machine'

const DB_NAME = 'pinaqualifi'
const DB_VERSION = 1
const STORE = 'scans'

export interface StoredScan extends ScanResult {
  id?: number
  mode: string
  synced: boolean
  createdAt: number
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB unavailable'))
      return
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, {
          keyPath: 'id',
          autoIncrement: true,
        })
        store.createIndex('synced', 'synced', { unique: false })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function addScan(scan: StoredScan): Promise<void> {
  try {
    const db = await openDB()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite')
      tx.objectStore(STORE).add(scan)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
    db.close()
  } catch {
    /* offline storage is best-effort */
  }
}

export async function countUnsynced(): Promise<number> {
  try {
    const db = await openDB()
    const count = await new Promise<number>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly')
      const all = tx.objectStore(STORE).getAll()
      all.onsuccess = () =>
        resolve((all.result as StoredScan[]).filter((s) => !s.synced).length)
      all.onerror = () => reject(all.error)
    })
    db.close()
    return count
  } catch {
    return 0
  }
}

export async function getUnsynced(): Promise<StoredScan[]> {
  try {
    const db = await openDB()
    const rows = await new Promise<StoredScan[]>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly')
      const all = tx.objectStore(STORE).getAll()
      all.onsuccess = () =>
        resolve((all.result as StoredScan[]).filter((s) => !s.synced))
      all.onerror = () => reject(all.error)
    })
    db.close()
    return rows
  } catch {
    return []
  }
}

export async function markAllSynced(): Promise<number> {
  try {
    const db = await openDB()
    const synced = await new Promise<number>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite')
      const store = tx.objectStore(STORE)
      const all = store.getAll()
      let updated = 0
      all.onsuccess = () => {
        const rows = all.result as StoredScan[]
        for (const row of rows) {
          if (!row.synced) {
            row.synced = true
            store.put(row)
            updated++
          }
        }
      }
      tx.oncomplete = () => resolve(updated)
      tx.onerror = () => reject(tx.error)
    })
    db.close()
    return synced
  } catch {
    return 0
  }
}
