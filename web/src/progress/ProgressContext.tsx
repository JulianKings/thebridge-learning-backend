import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { LEVELS, request } from '../levels/levels'
import type { ApiResponse, CheckContext } from '../levels/levels'

export type CheckStatus = 'idle' | 'running' | 'pass' | 'fail'
export type CheckResult = { status: CheckStatus; message?: string }
type Results = Record<number, Record<string, CheckResult>>

type ProgressValue = {
  completed: number
  results: Results
  checkCount: { passed: number; total: number }
  running: boolean
  failedLevel: number | null
  checkedAt: Date | null
  statusResponse: ApiResponse | null
  celebrate: number | null
  editorial: boolean
  isUnlocked: (level: number) => boolean
  runChecks: () => void
  dismissCelebration: () => void
  setEditorial: (on: boolean) => void
}

const CELEBRATED_KEY = 'hilo-celebrated'
const EDITORIAL_KEY = 'hilo-editorial'
const POLL_MS = 30_000
const EDITORIAL_LEVEL = 4

const ProgressContext = createContext<ProgressValue | null>(null)

const idleResults = (): Results =>
  Object.fromEntries(LEVELS.map((l) => [l.id, Object.fromEntries(l.checks.map((c) => [c.id, { status: 'idle' }]))]))

function readNumber(key: string) {
  try {
    return Number(localStorage.getItem(key)) || 0
  } catch {
    return 0
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Without storage the celebration may repeat on reload; harmless.
  }
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [results, setResults] = useState<Results>(idleResults)
  const [completed, setCompleted] = useState(0)
  const [running, setRunning] = useState(false)
  const [failedLevel, setFailedLevel] = useState<number | null>(null)
  const [checkedAt, setCheckedAt] = useState<Date | null>(null)
  const [statusResponse, setStatusResponse] = useState<ApiResponse | null>(null)
  const [celebrate, setCelebrate] = useState<number | null>(null)
  const [editorialPref, setEditorialPref] = useState(() => readNumber(EDITORIAL_KEY) === 1)
  const busy = useRef(false)
  const lastWriteOutcome = useRef<Record<number, boolean>>({})

  // Background runs (poll, window focus) pass `writes: false`: levels that create
  // test data keep their last outcome instead of hitting the database again.
  const run = useCallback(async ({ writes }: { writes: boolean }) => {
    if (busy.current) return
    busy.current = true
    setRunning(true)

    const cache = new Map<string, Promise<ApiResponse>>()
    const get = (path: string) => {
      if (!cache.has(path)) cache.set(path, request(path))
      return cache.get(path)!
    }
    const setCheck = (level: number, id: string, result: CheckResult) =>
      setResults((prev) => ({ ...prev, [level]: { ...prev[level], [id]: result } }))

    // Levels unlock in order: once one fails (or has no checks yet), the rest stay idle.
    let passed = 0
    let failed: number | null = null
    let blocked = false
    for (const level of LEVELS) {
      if (blocked || level.checks.length === 0) {
        level.checks.forEach((c) => setCheck(level.id, c.id, { status: 'idle' }))
        blocked = true
        continue
      }
      const reuse = level.writes && !writes && level.id in lastWriteOutcome.current
      if (reuse) {
        if (lastWriteOutcome.current[level.id]) {
          passed = level.id
        } else {
          failed = level.id
          blocked = true
        }
        continue
      }

      const ctx: CheckContext = { get, send: (method, path, body) => request(path, method, body), state: {} }
      // Within a level, stop at the first failure so students fix one thing at a time.
      let levelOk = true
      for (const check of level.checks) {
        if (!levelOk) {
          setCheck(level.id, check.id, { status: 'idle' })
          continue
        }
        setCheck(level.id, check.id, { status: 'running' })
        try {
          await check.run(ctx)
          setCheck(level.id, check.id, { status: 'pass' })
        } catch (e) {
          levelOk = false
          setCheck(level.id, check.id, { status: 'fail', message: e instanceof Error ? e.message : String(e) })
        }
      }
      await level.cleanup?.(ctx).catch(() => {})
      if (level.writes) lastWriteOutcome.current[level.id] = levelOk
      if (levelOk) {
        passed = level.id
      } else {
        failed = level.id
        blocked = true
      }
    }

    setStatusResponse(await get('/status').catch(() => null))
    setCompleted(passed)
    setFailedLevel(failed)
    setCheckedAt(new Date())
    if (passed > readNumber(CELEBRATED_KEY)) {
      write(CELEBRATED_KEY, String(passed))
      setCelebrate(passed)
      if (passed >= EDITORIAL_LEVEL) {
        setEditorialPref(true)
        write(EDITORIAL_KEY, '1')
      }
    }
    setRunning(false)
    busy.current = false
  }, [])

  const runChecks = useCallback(() => {
    run({ writes: true })
  }, [run])

  useEffect(() => {
    runChecks()
    const background = () => run({ writes: false })
    const poll = setInterval(() => document.visibilityState === 'visible' && background(), POLL_MS)
    window.addEventListener('focus', background)
    return () => {
      clearInterval(poll)
      window.removeEventListener('focus', background)
    }
  }, [run, runChecks])

  // The editorial theme is a level-4 reward, so it switches off if the API regresses.
  const editorial = editorialPref && completed >= EDITORIAL_LEVEL

  useEffect(() => {
    document.documentElement.dataset.editorial = editorial ? 'on' : 'off'
  }, [editorial])

  const checkCount = {
    passed: Object.values(results).reduce((n, level) => n + Object.values(level).filter((r) => r.status === 'pass').length, 0),
    total: LEVELS.reduce((n, l) => n + l.checks.length, 0),
  }

  const value: ProgressValue = {
    completed,
    results,
    checkCount,
    running,
    failedLevel,
    checkedAt,
    statusResponse,
    celebrate,
    editorial,
    isUnlocked: (level) => completed >= level,
    runChecks,
    dismissCelebration: () => setCelebrate(null),
    setEditorial: (on) => {
      setEditorialPref(on)
      write(EDITORIAL_KEY, on ? '1' : '0')
    },
  }

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}

export function useProgress() {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress must be used inside ProgressProvider')
  return ctx
}
