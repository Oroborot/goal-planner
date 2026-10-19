import { useEffect, useState } from 'react'

// The current time, refreshed twice a second while `active` is true,
// so a running timer's numbers keep moving.
export function useNow(active) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!active) return
    const id = setInterval(() => setNow(Date.now()), 500)
    return () => clearInterval(id)
  }, [active])
  return now
}
