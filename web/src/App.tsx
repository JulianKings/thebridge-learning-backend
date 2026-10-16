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
import { ApiConsole } from './components/ApiConsole'
import { BrowserFrame } from './fx/BrowserFrame'
import { Aurora } from './fx/fx'
import { ViewSwitch } from './components/ViewSwitch'
import { isShopPath, useHashPath } from './shop/router'
import { ShopApp } from './shop/ShopApp'
import { SlideNav } from './slides/SlideNav'
import { goToSlide, useSlide } from './slides/slides'

// Slide 0 is the flashy overview; each level shows its part of the store
// inside a browser frame, in the store's own (sober) style.
const SLIDES = [
  <Intro />,
  <BrowserFrame level={1}>
    <Hero />
  </BrowserFrame>,
  <BrowserFrame level={2}>
    <Catalog />
  </BrowserFrame>,
  <BrowserFrame level={3}>
    <Account />
  </BrowserFrame>,
  <BrowserFrame level={4}>
    <Backoffice />
  </BrowserFrame>,
  <BrowserFrame level={5}>
    <Security />
  </BrowserFrame>,
  <BrowserFrame level={6}>
    <Docs />
  </BrowserFrame>,
  <BrowserFrame level={7}>
    <Admin />
    <Finale />
  </BrowserFrame>,
]

const slideVariants = {
  enter: (dir: number) => ({ x: dir * 80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir * -80, opacity: 0 }),
}

export default function App() {
  const { completed } = useProgress()
  const path = useHashPath()

  // The finished shop is the reward for passing every level.
  if (completed >= 7 && isShopPath(path)) {
    return (
      <>
        <ShopApp />
        <ViewSwitch to="progress" />
        <ApiConsole />
      </>
    )
  }
  return <ProgressView />
}

function ProgressView() {
  const { celebrate, completed } = useProgress()
  const { index, dir } = useSlide()
  const [drawer, setDrawer] = useState(false)

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
    <div className="text-fx-text">
      <Aurora />
      <Header onOpenProgress={() => setDrawer(true)} />
      <div
        className="mx-auto grid max-w-[1400px] grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_340px]"
        style={{ height: 'calc(100dvh - 65px)' }}
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
                className={`absolute inset-0 ${index === 0 ? 'overflow-y-auto' : 'px-3 pb-4 pt-2 sm:px-5 sm:pb-5'}`}
              >
                {SLIDES[index]}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
        <aside className="hidden min-h-0 border-l border-fx-line bg-fx-bg/40 backdrop-blur-sm lg:block">
          <ProgressPanel />
        </aside>
      </div>

      <AnimatePresence>
        {drawer && (
          <motion.div className="fixed inset-0 z-50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/40" onClick={() => setDrawer(false)} />
            <motion.div
              className="absolute inset-y-0 right-0 w-[min(360px,90vw)] bg-fx-bg"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
            >
              <button onClick={() => setDrawer(false)} className="absolute right-4 top-5 z-10 p-1 text-fx-muted" aria-label="Cerrar">
                <X className="h-5 w-5" />
              </button>
              <ProgressPanel onNavigate={() => setDrawer(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {completed >= 7 && <ViewSwitch to="shop" />}
      <DemoPanel />
      <Celebration />
    </div>
  )
}
