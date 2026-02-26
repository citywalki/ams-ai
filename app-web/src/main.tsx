import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import AppRouter from './Router'
import { useAuthStore } from '@/stores/authStore'
import { queryClient } from '@/lib/queryClient'
import './i18n'
import './styles/globals.css'

function Bootstrapper() {
  useEffect(() => {
    void useAuthStore.getState().bootstrap()
  }, [])

  return <AppRouter />
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Bootstrapper />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)
