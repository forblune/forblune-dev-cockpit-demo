import { registerSW } from 'virtual:pwa-register'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { persister, queryClient } from './app/queryClient'
import { useCockpit } from './app/store'
import './styles/tokens.css'
import './styles/reset.css'

// apply the persisted theme before first paint
document.documentElement.dataset.theme = useCockpit.getState().theme

registerSW({ immediate: true })

const root = document.getElementById('root')
if (!root) throw new Error('#root element not found')

createRoot(root).render(
  <StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister, maxAge: 1000 * 60 * 60 * 24 }}
    >
      <App />
    </PersistQueryClientProvider>
  </StrictMode>,
)
