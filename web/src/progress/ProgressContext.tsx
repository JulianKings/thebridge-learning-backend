import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { LEVELS } from '../levels/levels'

export type CheckStatus = 'idle' | 'running' | 'pass' | 'fail'
export type Role = 'invitado' | 'cliente' | 'trabajador' | 'encargado'

type CheckState = Record<number, Record<string, CheckStatus>>

type ProgressValue = {
  completed: number
  checks: CheckState
  running: number | null
  failedLevel: number | null
  celebrate: number | null
  role: Role
  editorial: boolean
  isUnlocked: (level: number) => boolean
  simulateNext: (opts?: { fail?: boolean }) => void
  jumpTo: (level: number) => void
  reset: () => void
  dismissCelebration: () => void
  setRole: (role: Role) => void
  setEditorial: (on: boolean) => void
}

const STORAGE_KEY = 'hilo-progress-v1'
const CHECK_DELAY = 650

const ProgressContext = createContext<ProgressValue | null>(null)

function checksUpTo(level: number): CheckState {
  const state: CheckState = {}
  for (const l of LEVELS) {
    state[l.id] = Object.fromEntries(l.checks.map((c) => [c.id, l.id <= level ? 'pass' : 'idle']))
  }
  return state
}

function roleFor(level: number): Role {
  return level >= 7 ? 'encargado' : level >= 4 ? 'trabajador' : level >= 3 ? 'cliente' : 'invitado'
}

function loadSaved(): { completed: number; role: Role; editorial: boolean } {
  // ?nivel=N opens the demo at a given level (handy for bookmarking each stage).
  const param = new URLSearchParams(location.search).get('nivel')
  if (param !== null) {
    const level = Math.max(0, Math.min(7, Number(param) || 0))
    return { completed: level, role: roleFor(level), editorial: level >= 6 }
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { completed: 0, role: 'invitado', editorial: false, ...JSON.parse(raw) }
  } catch {
    // Storage unavailable: start fresh.
  }
  return { completed: 0, role: 'invitado', editorial: false }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export function ProgressProvider({ children }: { children: ReactNode }) {
  const saved = useMemo(loadSaved, [])
  const [completed, setCompleted] = useState(saved.completed)
  const [checks, setChecks] = useState<CheckState>(() => checksUpTo(saved.completed))
  const [running, setRunning] = useState<number | null>(null)
  const [failedLevel, setFailedLevel] = useState<number | null>(null)
  const [celebrate, setCelebrate] = useState<number | null>(null)
  const [role, setRole] = useState<Role>(saved.role)
  const [editorial, setEditorial] = useState(saved.editorial)
  const runId = useRef(0)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ completed, role, editorial }))
    } catch {
      // Ignore: persistence is a convenience only.
    }
  }, [completed, role, editorial])

  useEffect(() => {
    document.documentElement.dataset.editorial = editorial ? 'on' : 'off'
  }, [editorial])

  const setCheck = (level: number, id: string, status: CheckStatus) =>
    setChecks((prev) => ({ ...prev, [level]: { ...prev[level], [id]: status } }))

  const simulateNext = useCallback(
    async ({ fail = false }: { fail?: boolean } = {}) => {
      const level = LEVELS.find((l) => l.id === completed + 1)
      if (!level || running) return
      const myRun = ++runId.current
      setRunning(level.id)
      setFailedLevel(null)
      setChecks((prev) => ({
        ...prev,
        [level.id]: Object.fromEntries(level.checks.map((c) => [c.id, 'idle'])),
      }))
      const failAt = fail ? Math.min(2, level.checks.length - 1) : -1

      for (const [i, check] of level.checks.entries()) {
        setCheck(level.id, check.id, 'running')
        await sleep(CHECK_DELAY)
        if (runId.current !== myRun) return
        if (i === failAt) {
          setCheck(level.id, check.id, 'fail')
          setFailedLevel(level.id)
          setRunning(null)
          return
        }
        setCheck(level.id, check.id, 'pass')
      }

      await sleep(300)
      if (runId.current !== myRun) return
      setRunning(null)
      setCompleted(level.id)
      setCelebrate(level.id)
      if (level.id === 3) setRole('cliente')
      if (level.id === 4) setRole('trabajador')
      if (level.id === 6) setEditorial(true)
    },
    [completed, running],
  )

  const jumpTo = useCallback((level: number) => {
    runId.current++
    setRunning(null)
    setFailedLevel(null)
    setCelebrate(null)
    setCompleted(level)
    setChecks(checksUpTo(level))
    setRole(roleFor(level))
    setEditorial(level >= 6)
  }, [])

  const value: ProgressValue = {
    completed,
    checks,
    running,
    failedLevel,
    celebrate,
    role,
    editorial,
    isUnlocked: (level) => completed >= level,
    simulateNext,
    jumpTo,
    reset: () => jumpTo(0),
    dismissCelebration: () => setCelebrate(null),
    setRole,
    setEditorial,
  }

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}

export function useProgress() {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress must be used inside ProgressProvider')
  return ctx
}
