import { useState } from 'react'
import { downloadBackup, lastBackup, readBackup } from './backup.js'
import { formatTime } from './history.js'

// The Backup part of Settings: download all data as a file, or load one
// back (after asking first, because it replaces everything here).
function BackupSection({ items, events, settings, onRestore }) {
  const [last, setLast] = useState(lastBackup)
  const [pending, setPending] = useState(null) // a backup waiting for "Yes"
  const [message, setMessage] = useState('')

  function download() {
    downloadBackup({ items, events, settings })
    setLast(lastBackup())
    setMessage('Backup downloaded.')
  }

  async function pickFile(e) {
    const file = e.target.files[0]
    e.target.value = ''
    if (!file) return
    try {
      setPending(await readBackup(file))
      setMessage('')
    } catch (err) {
      setMessage(err.message)
    }
  }

  return (
    <section className="backup">
      <h2>Backup</h2>
      <p className="goal-meta">
        Your data lives only on this device. Download a backup now and then and keep it somewhere safe
        (Files, iCloud, email to yourself).
      </p>
      <p className="goal-meta">{last ? `Last backup: ${formatTime(last)}` : 'No backup yet.'}</p>
      <div className="row">
        <button type="button" onClick={download}>
          Download backup
        </button>
        <label className="button-like secondary">
          Load backup
          <input type="file" accept="application/json,.json" onChange={pickFile} hidden />
        </label>
      </div>
      {message && <p className="goal-meta">{message}</p>}

      {pending && (
        <div className="confirm-all">
          <p>
            Load the backup from {pending.exportedAt ? formatTime(pending.exportedAt) : 'this file'} (
            {pending.items.length} items, {pending.events.length} history entries)? This replaces everything
            on this device.
          </p>
          <div className="row">
            <button type="button" className="secondary" onClick={() => setPending(null)}>
              Cancel
            </button>
            <button
              type="button"
              className="danger-button"
              onClick={() => {
                onRestore(pending)
                setPending(null)
                setMessage('Backup loaded.')
              }}
            >
              Replace and load
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

export default BackupSection
