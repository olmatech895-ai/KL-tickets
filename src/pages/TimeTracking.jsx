import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { ArrowLeft, Timer } from 'lucide-react'
import { cn } from '../lib/utils'

export const TimeTracking = () => {
  const navigate = useNavigate()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <div className="h-full flex flex-col">
      {/* Круглая кнопка «Назад» 30×30 в левом верхнем углу */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate('/')}
        className={cn(
          'fixed top-4 left-4 z-50 h-[30px] w-[30px] min-h-[30px] min-w-[30px] rounded-full transition-all',
          'bg-background/80 hover:bg-muted border border-border shadow-sm backdrop-blur-sm',
          isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
        )}
        title="Назад"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>

      {/* Контент */}
      <main className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        <div className={cn(
          'flex-1 flex flex-col items-center justify-center p-4 md:p-6 pt-16 transition-all duration-700',
          isMounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        )} style={{ transitionDelay: '100ms' }}>
          <Timer className="h-16 w-16 mb-4 opacity-50 text-muted-foreground" />
          <p className="text-muted-foreground text-center">
            Функционал учёта времени будет доступен здесь
          </p>
        </div>
      </main>
    </div>
  )
}
