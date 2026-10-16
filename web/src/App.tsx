import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Celebration } from './components/Celebration'
import { DemoPanel } from './components/DemoPanel'
import { Header } from './components/Header'
import { ProgressPanel } from './components/ProgressPanel'
import { useProgress } from './progress/ProgressContext'
import { Account } from './sections/Account'
import { Admin, Finale } from './sections/Admin'
import { Backoffice } from './sections/Backoffice'
import { Catalog } from './sections/Catalog'
import { Docs } from './sections/Docs'
import { Hero } from './sections/Hero'
import { Intro } from './sections/Intro'
import { Security } from './sections/Security'
import { SlideNav } from './slides/SlideNav'
import { goToSlide, useSlide } from './slides/slides'

const SLIDES = [
  <Intro />,
  <Hero />,
  <Catalog />,
  <Account />,
  <Backoffice />,
  <Security />,
  <Docs />,
  <>
    <Admin />
    <Finale />
  </>,
]

const slideVariants = {
  enter: (dir: number) => ({ x: dir * 80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir * -80, opacity: 0 }),
}

export default function App() {
  const { editorial, celebrate } = useProgress()
  const { index, dir } = useSlide()
  const [drawer, setDrawer] = useState(false)
  const headerH = editorial ? '93px' : '65px'

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (celebrate || ['INPUT', 'SELECT', 'TEXTAREA'].includes(tag)) return
      if (e.key === 'ArrowRight') goToSlide(index + 1)
      if (e.key === 'ArrowLeft') goToSlide(index - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, celebrate])

  return (
    <>
      <Header onOpenProgress={() => setDrawer(true)} />
      <div
        className="mx-auto grid max-w-[1400px] grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_340px]"
        style={{ height: `calc(100dvh - ${headerH})` }}
      >
        <main className="flex min-h-0 min-w-0 flex-col">
          <SlideNav index={index} />
          <div className="relative min-h-0 flex-1 overflow-hidden">
            <AnimatePresence initial={false} custom={dir}>
              <motion.div
                key={index}
                custom={dir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 overflow-y-auto"
              >
                {SLIDES[index]}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
        <aside className="hidden min-h-0 border-l border-line lg:block">
          <ProgressPanel />
        </aside>
      </div>

      <AnimatePresence>
        {drawer && (
          <motion.div className="fixed inset-0 z-50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/40" onClick={() => setDrawer(false)} />
            <motion.div
              className="absolute inset-y-0 right-0 w-[min(360px,90vw)] bg-paper"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
            >
              <button onClick={() => setDrawer(false)} className="absolute right-4 top-5 p-1 text-muted" aria-label="Cerrar">
                <X className="h-5 w-5" />
              </button>
              <ProgressPanel onNavigate={() => setDrawer(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <DemoPanel />
      <Celebration />
    </>
  )
}
