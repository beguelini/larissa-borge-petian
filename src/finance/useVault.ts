import { useCallback, useEffect, useRef, useState } from 'react'
import { blankFamily, type Family } from './model'
import { deriveKeys, readVault, writeVault, type Edit, type VaultKeys } from './vault'

const storageKey = 'casa-em-rota.session.v1'
const message = (error: unknown) => error instanceof Error && error.name === 'Error'
  ? error.message : 'Não foi possível conectar. Verifique sua internet.'

export function useVault() {
  const [family, setFamily] = useState<Family | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [stale, setStale] = useState(false)
  const [accessCode, setAccessCode] = useState('')
  const [demo, setDemo] = useState(false)
  const keys = useRef<VaultKeys | null>(null)
  const version = useRef(-1)
  const locked = useRef(false)

  const unlock = useCallback(async (input: string) => {
    if (locked.current) return
    locked.current = true
    setBusy(true)
    setError('')
    try {
      const code = input.trim()
      const next = await deriveKeys(code)
      const snapshot = await readVault(next)
      try { sessionStorage.setItem(storageKey, code) } catch { /* Storage can be disabled. */ }
      keys.current = next
      version.current = snapshot.row.revision
      setAccessCode(code)
      setFamily(snapshot.family)
    } catch (cause) {
      setError(message(cause))
    } finally {
      locked.current = false
      setBusy(false)
    }
  }, [])

  useEffect(() => {
    let code = ''
    try { code = sessionStorage.getItem(storageKey) ?? '' } catch { /* Storage can be disabled. */ }
    const timer = window.setTimeout(() => { if (code) void unlock(code) }, 0)
    return () => window.clearTimeout(timer)
  }, [unlock])

  const refresh = useCallback(async () => {
    const current = keys.current
    if (!current || locked.current || document.visibilityState === 'hidden') return
    try {
      const snapshot = await readVault(current)
      if (keys.current !== current) return
      if (snapshot.row.revision > version.current) {
        version.current = snapshot.row.revision
        setFamily(snapshot.family)
      }
      setStale(false)
    } catch {
      if (keys.current === current) setStale(true)
    }
  }, [])

  useEffect(() => {
    if (!accessCode) return
    const timer = window.setInterval(refresh, 20000)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [accessCode, refresh])

  async function save(edit: Edit) {
    if (locked.current) return false
    if (demo && family) {
      try { setFamily(edit(family)); setError(''); return true } catch (cause) { setError(message(cause)); return false }
    }
    const current = keys.current
    if (!current) return false
    locked.current = true
    setBusy(true)
    setError('')
    try {
      const snapshot = await writeVault(current, edit)
      version.current = snapshot.row.revision
      setFamily(snapshot.family)
      setStale(false)
      return true
    } catch (cause) {
      setError(message(cause))
      return false
    } finally {
      locked.current = false
      setBusy(false)
    }
  }

  function lock() {
    keys.current = null
    version.current = -1
    try { sessionStorage.removeItem(storageKey) } catch { /* Storage can be disabled. */ }
    setFamily(null)
    setAccessCode('')
    setDemo(false)
    setError('')
    setStale(false)
  }

  function openDemo() {
    setDemo(true)
    setFamily(blankFamily)
    setError('')
  }

  return { family, error, busy, stale, accessCode, demo, unlock, lock, save, refresh, openDemo, clearError: () => setError('') }
}
