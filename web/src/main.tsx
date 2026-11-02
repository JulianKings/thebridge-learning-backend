import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { arrancarDemo } from './auth/demo'
import './index.css'
import { ProgressProvider } from './progress/ProgressContext'

// Waits (briefly) for the showcase admin login, so the first check run already has a session.
const render = () =>
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ProgressProvider>
        <App />
      </ProgressProvider>
    </StrictMode>,
  )

Promise.race([arrancarDemo(), new Promise((r) => setTimeout(r, 4000))]).finally(render)
