// Backup: all your data in one file you can keep somewhere safe, and load
// back later (on the same phone, or a new one).
import { todayKey } from './repeat.js'

const LAST_BACKUP_KEY = 'planner-last-backup'

// Makes the file and starts the download.
export function downloadBackup({ items, events, settings }) {
  const data = {
    app: 'goal-planner',
    version: 1,
    exportedAt: new Date().toISOString(),
    items,
    events,
    settings,
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `goal-planner-backup-${todayKey()}.json`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
  localStorage.setItem(LAST_BACKUP_KEY, data.exportedAt)
}

export function lastBackup() {
  return localStorage.getItem(LAST_BACKUP_KEY)
}

// Reads a backup file. Resolves with { items, events, settings }, or
// rejects with a short message if it isn't a Goal Planner backup.
export function readBackup(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result)
        if (data.app !== 'goal-planner' || !Array.isArray(data.items) || !Array.isArray(data.events)) {
          reject(new Error("This file isn't a Goal Planner backup."))
          return
        }
        resolve({ items: data.items, events: data.events, settings: data.settings || {}, exportedAt: data.exportedAt })
      } catch {
        reject(new Error("This file couldn't be read."))
      }
    }
    reader.onerror = () => reject(new Error("This file couldn't be read."))
    reader.readAsText(file)
  })
}
