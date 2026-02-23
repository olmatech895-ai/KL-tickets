import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { ToastContainer } from '../components/ui/toast'
import { Ticket, AlertCircle } from 'lucide-react'
import { validateEmail } from '../utils/validation'

export const Login = () => {
  const [email, setEmail] = useState('')
  const [loginError, setLoginError] = useState('')
  const [toasts, setToasts] = useState([])
  const [isMounted, setIsMounted] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const showToast = (title, description, variant = 'default') => {
    const id = Date.now().toString()
    setToasts([...toasts, { id, title, description, variant }])
    setTimeout(() => {
      setToasts(toasts.filter((t) => t.id !== id))
    }, 3000)
  }

  const handleLogin = async (e) => {
    e.preventDefault()

    // Validate email domain
    const emailValidation = validateEmail(email)
    if (!emailValidation.isValid) {
      setLoginError(emailValidation.error)
      showToast('Ошибка входа', emailValidation.error, 'destructive')
      return
    }

    setLoginError('')
    const result = await login(email)
    if (result.success) {
      navigate('/')
    } else {
      showToast('Ошибка входа', result.error, 'destructive')
    }
  }



  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted px-4">
      <div className="w-full max-w-md">
        <div className={`flex justify-center mb-6 md:mb-8 transition-all duration-700 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          }`}>
          <div className="flex items-center gap-2 text-2xl sm:text-3xl font-bold">
            <Ticket className="h-6 w-6 sm:h-8 sm:w-8" />
            <span>Тикет-система</span>
          </div>
        </div>
        <Card className={`transition-all duration-700 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`} style={{ transitionDelay: '150ms' }}>
          <CardHeader>
            <CardTitle>Вход в систему</CardTitle>
            <CardDescription>
              Войдите используя вашу корпоративную почту @kostalegal.com
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className={`space-y-2 transition-all duration-500 ${isMounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                }`} style={{ transitionDelay: '300ms' }}>
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@kostalegal.com"
                  required
                />
                {loginError && (
                  <div className="flex items-center gap-1 text-sm text-red-500">
                    <AlertCircle className="h-4 w-4" />
                    <span>{loginError}</span>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Используйте вашу корпоративную почту @kostalegal.com
                </p>
              </div>
              <div className={`transition-all duration-500 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`} style={{ transitionDelay: '450ms' }}>
                <Button type="submit" className="w-full">
                  Войти
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      <ToastContainer toasts={toasts} setToasts={setToasts} />
    </div>
  )
}

