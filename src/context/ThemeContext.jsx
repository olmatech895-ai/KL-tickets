import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext(null)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('appTheme')
    if (saved) return saved
    
    const oldTodoBoardTheme = localStorage.getItem('todoBoardTheme')
    if (oldTodoBoardTheme) {
      localStorage.setItem('appTheme', oldTodoBoardTheme)
      localStorage.removeItem('todoBoardTheme')
      return oldTodoBoardTheme
    }
    
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('appTheme', theme)
  }, [theme])

  useEffect(() => {
    const root = document.documentElement
    const savedTheme = localStorage.getItem('appTheme')
    const initialTheme = savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    if (initialTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}




