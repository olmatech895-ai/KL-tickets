import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { ToastContainer } from '../components/ui/toast'
import { Ticket, AlertCircle } from 'lucide-react'
import {
  validateUsername,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validateRegistration,
} from '../utils/validation'

export const Login = () => {
  const [loginData, setLoginData] = useState({ username: '', password: '' })
  const [registerData, setRegisterData] = useState({ username: '', password: '', confirmPassword: '', email: '' })
  const [registerErrors, setRegisterErrors] = useState({})
  const [touchedFields, setTouchedFields] = useState({})
  const [toasts, setToasts] = useState([])
  const { login, register } = useAuth()
  const navigate = useNavigate()

  const showToast = (title, description, variant = 'default') => {
    const id = Date.now().toString()
    setToasts([...toasts, { id, title, description, variant }])
    setTimeout(() => {
      setToasts(toasts.filter((t) => t.id !== id))
    }, 3000)
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    const result = await login(loginData.username, loginData.password)
    if (result.success) {
      navigate('/')
    } else {
      showToast('Ошибка входа', result.error, 'destructive')
    }
  }

  const handleFieldBlur = (fieldName) => {
    setTouchedFields((prev) => ({ ...prev, [fieldName]: true }))
    validateField(fieldName, registerData[fieldName])
  }

  const validateField = (fieldName, value) => {
    const errors = { ...registerErrors }

    switch (fieldName) {
      case 'username':
        const usernameValidation = validateUsername(value)
        if (!usernameValidation.isValid) {
          errors.username = usernameValidation.error
        } else {
          delete errors.username
        }
        break
      case 'email':
        const emailValidation = validateEmail(value)
        if (!emailValidation.isValid) {
          errors.email = emailValidation.error
        } else {
          delete errors.email
        }
        break
      case 'password':
        const passwordValidation = validatePassword(value)
        if (!passwordValidation.isValid) {
          errors.password = passwordValidation.error
        } else {
          delete errors.password
          // Перепроверяем подтверждение пароля, если оно уже введено
          if (registerData.confirmPassword) {
            const confirmValidation = validateConfirmPassword(value, registerData.confirmPassword)
            if (!confirmValidation.isValid) {
              errors.confirmPassword = confirmValidation.error
            } else {
              delete errors.confirmPassword
            }
          }
        }
        break
      case 'confirmPassword':
        const confirmValidation = validateConfirmPassword(registerData.password, value)
        if (!confirmValidation.isValid) {
          errors.confirmPassword = confirmValidation.error
        } else {
          delete errors.confirmPassword
        }
        break
      default:
        break
    }

    setRegisterErrors(errors)
  }

  const handleRegister = async (e) => {
    e.preventDefault()

    // Помечаем все поля как touched
    setTouchedFields({
      username: true,
      email: true,
      password: true,
      confirmPassword: true,
    })

    // Валидация всех полей
    const validation = validateRegistration(registerData)
    setRegisterErrors(validation.errors)

    if (!validation.isValid) {
      // Показываем первую ошибку в тосте
      const firstError = Object.values(validation.errors)[0]
      showToast('Ошибка регистрации', firstError, 'destructive')
      return
    }

    // Регистрация пользователя
    const result = await register(registerData.username, registerData.password, 'user', registerData.email)
    if (result.success) {
      showToast('Успешно', 'Регистрация прошла успешно!', 'default')
      navigate('/')
    } else {
      showToast('Ошибка регистрации', result.error, 'destructive')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6 md:mb-8">
          <div className="flex items-center gap-2 text-2xl sm:text-3xl font-bold">
            <Ticket className="h-6 w-6 sm:h-8 sm:w-8" />
            <span>Тикет-система</span>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Вход в систему</CardTitle>
            <CardDescription>
              Войдите в систему или зарегистрируйтесь
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              defaultValue="login"
              className="w-full"
              onValueChange={(value) => {
                // Очищаем ошибки и touched поля при переключении вкладок
                if (value === 'login') {
                  setRegisterErrors({})
                  setTouchedFields({})
                  setRegisterData({ username: '', password: '', confirmPassword: '', email: '' })
                }
              }}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Вход</TabsTrigger>
                <TabsTrigger value="register">Регистрация</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-username">Логин</Label>
                    <Input
                      id="login-username"
                      value={loginData.username}
                      onChange={(e) =>
                        setLoginData({ ...loginData, username: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Пароль</Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={loginData.password}
                      onChange={(e) =>
                        setLoginData({ ...loginData, password: e.target.value })
                      }
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Войти
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-username">Логин</Label>
                    <Input
                      id="register-username"
                      value={registerData.username}
                      onChange={(e) => {
                        setRegisterData({ ...registerData, username: e.target.value })
                        if (touchedFields.username) {
                          validateField('username', e.target.value)
                        }
                      }}
                      onBlur={() => handleFieldBlur('username')}
                      className={registerErrors.username ? 'border-red-500' : ''}
                      required
                    />
                    {touchedFields.username && registerErrors.username && (
                      <div className="flex items-center gap-1 text-sm text-red-500">
                        <AlertCircle className="h-4 w-4" />
                        <span>{registerErrors.username}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      value={registerData.email}
                      onChange={(e) => {
                        setRegisterData({ ...registerData, email: e.target.value })
                        if (touchedFields.email) {
                          validateField('email', e.target.value)
                        }
                      }}
                      onBlur={() => handleFieldBlur('email')}
                      placeholder="example@kostalegal.com"
                      className={registerErrors.email ? 'border-red-500' : ''}
                      required
                    />
                    {touchedFields.email && registerErrors.email && (
                      <div className="flex items-center gap-1 text-sm text-red-500">
                        <AlertCircle className="h-4 w-4" />
                        <span>{registerErrors.email}</span>
                      </div>
                    )}
                    {!registerErrors.email && (
                      <p className="text-xs text-muted-foreground">
                        Email должен быть с доменом @kostalegal.com
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Пароль</Label>
                    <Input
                      id="register-password"
                      type="password"
                      value={registerData.password}
                      onChange={(e) => {
                        setRegisterData({ ...registerData, password: e.target.value })
                        if (touchedFields.password) {
                          validateField('password', e.target.value)
                        }
                      }}
                      onBlur={() => handleFieldBlur('password')}
                      className={registerErrors.password ? 'border-red-500' : ''}
                      required
                    />
                    {touchedFields.password && registerErrors.password && (
                      <div className="flex items-center gap-1 text-sm text-red-500">
                        <AlertCircle className="h-4 w-4" />
                        <span>{registerErrors.password}</span>
                      </div>
                    )}
                    {!registerErrors.password && (
                      <p className="text-xs text-muted-foreground">
                        Минимум 8 символов, должна быть хотя бы одна буква и одна цифра
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Подтвердите пароль</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={registerData.confirmPassword}
                      onChange={(e) => {
                        setRegisterData({ ...registerData, confirmPassword: e.target.value })
                        if (touchedFields.confirmPassword) {
                          validateField('confirmPassword', e.target.value)
                        }
                      }}
                      onBlur={() => handleFieldBlur('confirmPassword')}
                      className={registerErrors.confirmPassword ? 'border-red-500' : ''}
                      required
                    />
                    {touchedFields.confirmPassword && registerErrors.confirmPassword && (
                      <div className="flex items-center gap-1 text-sm text-red-500">
                        <AlertCircle className="h-4 w-4" />
                        <span>{registerErrors.confirmPassword}</span>
                      </div>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={
                      Object.keys(registerErrors).length > 0 ||
                      !registerData.username ||
                      !registerData.email ||
                      !registerData.password ||
                      !registerData.confirmPassword
                    }
                  >
                    Зарегистрироваться
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      <ToastContainer toasts={toasts} setToasts={setToasts} />
    </div>
  )
}

