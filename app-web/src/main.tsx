import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import AppRouter from './Router'
import { useAuthStore } from '@/stores/authStore'
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
    <BrowserRouter>
      <Bootstrapper />
    </BrowserRouter>
  </React.StrictMode>,
)
