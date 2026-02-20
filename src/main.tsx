import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,       // 5 dakika — veri "taze" sayılır, refetch yapılmaz
      gcTime: 10 * 60 * 1000,         // 10 dakika — cache bellekte tutulur
      refetchOnWindowFocus: false,      // Sekme değişiminde otomatik refetch kapalı
      retry: 1,                         // Hata durumunda 1 kez tekrar dene
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
)