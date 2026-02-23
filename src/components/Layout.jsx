import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { cn } from '../lib/utils'

export const Layout = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const isTodoBoard = location.pathname === '/todos' || location.pathname === '/todos/archive'
  const isKostaDaily = location.pathname === '/kosta-daily'
  const isTimeTracking = location.pathname === '/time-tracking'
  const isFullPage = isTodoBoard || isTimeTracking
  const isFullHeight = isTodoBoard || isKostaDaily || isTimeTracking

  return (
    <div className="min-h-screen bg-background flex">
      {!isFullPage && <Sidebar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />}
      <main className={`flex-1 overflow-hidden ${!isFullPage ? 'lg:ml-64' : ''} ${isFullHeight ? 'h-screen' : 'overflow-y-auto'} scrollbar-hide`}>
        <div className={cn(
          !isFullHeight ? 'min-h-screen pt-4 lg:pt-6' : 'h-full'
        )}>
          {children}
        </div>
      </main>
    </div>
  )
}
