import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { ProgressProvider } from './progress/ProgressContext'
import { StoreProvider } from './store/StoreContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ProgressProvider>
      <StoreProvider>
        <App />
      </StoreProvider>
    </ProgressProvider>
  </StrictMode>,
)
