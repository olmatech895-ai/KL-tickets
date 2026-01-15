import { createContext, useContext, useState, useEffect } from 'react'
import { api, getAuthToken, removeAuthToken } from '../config/api'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getAuthToken()
    if (token) {
      loadCurrentUser()
    } else {
      setLoading(false)
    }
  }, [])

  const loadCurrentUser = async () => {
    try {
      const userData = await api.getCurrentUser()
      setUser(userData)
      await loadUsers()
    } catch (error) {
      removeAuthToken()
      setUser(null)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const login = async (username, password) => {
    try {
      const response = await api.login({ username, password })
      await loadCurrentUser()
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message || 'Неверный логин или пароль' }
    }
  }

  const register = async (username, password, role = 'user', email = '') => {
    try {
      const response = await api.register({
        username,
        email,
        password,
        role,
      })
      await loadCurrentUser()
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message || 'Ошибка регистрации' }
    }
  }

  const logout = () => {
    setUser(null)
    removeAuthToken()
  }

  const toggleUserBlock = async (userId) => {
    try {
      const currentUser = await api.getUser(userId)
      const updatedUser = await api.updateUser(userId, {
        blocked: !currentUser.blocked,
      })
      
      await loadUsers()
      
      if (user?.id === userId && !currentUser.blocked) {
        logout()
      }
      
      return updatedUser
    } catch (error) {
      throw error
    }
  }

  const deleteUser = async (userId) => {
    try {
      await api.deleteUser(userId)
      
      await loadUsers()
      
      if (user?.id === userId) {
        logout()
      }
    } catch (error) {
      throw error
    }
  }

  const loadUsers = async () => {
    try {
      const usersList = await api.getUsers()
      setUsers(usersList)
      return usersList
    } catch (error) {
      setUsers([])
      return []
    }
  }

  const updateUserRole = async (userId, newRole) => {
    try {
      const updatedUser = await api.updateUser(userId, {
        role: newRole,
      })
      
      await loadUsers()
      
      if (user?.id === userId) {
        await loadCurrentUser()
      }
      
      return updatedUser
    } catch (error) {
      throw error
    }
  }

  const getAllUsers = () => {
    return users
  }

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAdmin: user?.role === 'admin',
    isIT: user?.role === 'it',
    isUser: user?.role === 'user',
    toggleUserBlock,
    deleteUser,
    updateUserRole,
    getAllUsers,
    loadUsers,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

