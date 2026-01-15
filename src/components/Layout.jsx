import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'

export const Layout = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const isTodoBoard = location.pathname === '/todos'

  return (
    <div className="min-h-screen bg-background flex">
      {!isTodoBoard && <Sidebar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />}
      <main className={`flex-1 overflow-hidden ${!isTodoBoard ? 'lg:ml-64' : ''} ${isTodoBoard ? 'h-screen' : 'overflow-y-auto'} scrollbar-hide`}>
        <div className={`${!isTodoBoard ? 'min-h-screen' : 'h-full'}`}>
          {children}
        </div>
      </main>
    </div>
  )
}
