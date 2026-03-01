import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ConfigProvider } from 'antd'
import enUS from 'antd/locale/en_US'
import zhCN from 'antd/locale/zh_CN'
import { useTranslation } from 'react-i18next'
import AppRouter from './Router'
import { useAuthStore } from '@/stores/authStore'
import { queryClient } from '@/lib/queryClient'
import './i18n'
import { antdTheme } from '@/theme/antdTheme'
import { applySemanticTokensToRoot } from '@/theme/semanticTokens'
import './styles/globals.css'
import 'antd/dist/reset.css'

if (typeof document !== 'undefined') {
  applySemanticTokensToRoot()
}

function AntdProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation()
  const locale = i18n.resolvedLanguage?.startsWith('zh') ? zhCN : enUS

  return (
    <ConfigProvider locale={locale} theme={antdTheme}>
      {children}
    </ConfigProvider>
  )
}

function Bootstrapper() {
  useEffect(() => {
    void useAuthStore.getState().bootstrap()
  }, [])

  return <AppRouter />
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AntdProvider>
        <BrowserRouter>
          <Bootstrapper />
        </BrowserRouter>
      </AntdProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
