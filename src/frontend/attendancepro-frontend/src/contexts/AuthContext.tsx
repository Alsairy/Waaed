import React, { createContext, useContext, useEffect, useState } from 'react'
import { authService } from '../services/authService'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber?: string
  employeeId?: string
  department?: string
  position?: string
  profilePictureUrl?: string
  status: string
  roles: string[]
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string, twoFactorCode?: string) => Promise<{ success: boolean; requiresTwoFactor?: boolean; error?: string }>
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>

  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>
  resetPassword: (token: string, newPassword: string) => Promise<{ success: boolean; error?: string }>
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>
}

interface RegisterData {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  phoneNumber?: string
  employeeId?: string
  department?: string
  position?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('accessToken')
      if (token) {
        try {
          const userData = await authService.getCurrentUser()
          setUser(userData)
        } catch (error) {
          console.error('Failed to get current user:', error)
          localStorage.removeItem('accessToken')
        }
      }
      setIsLoading(false)
    }

    initializeAuth()
  }, [])

  const login = async (email: string, password: string, twoFactorCode?: string) => {
    try {
      const response = await authService.login(email, password, twoFactorCode)
      
      if (response.requiresTwoFactor) {
        return { success: true, requiresTwoFactor: true }
      }

      if (response.access_token && response.user) {
        localStorage.setItem('accessToken', response.access_token)
        setUser(response.user)
        return { success: true }
      }

      return { success: false, error: 'Invalid response from server' }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed'
      return { success: false, error: errorMessage }
    }
  }

  const register = async (userData: RegisterData) => {
    try {
      await authService.register(userData)
      return { success: true }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed'
      return { success: false, error: errorMessage }
    }
  }

  const logout = async () => {
    try {
      if (user) {
        await authService.logout(user.id)
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('accessToken')
      setUser(null)
    }
  }



  const forgotPassword = async (email: string) => {
    try {
      await authService.forgotPassword(email)
      return { success: true }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send reset email'
      return { success: false, error: errorMessage }
    }
  }

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      await authService.resetPassword(token, newPassword)
      return { success: true }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Password reset failed'
      return { success: false, error: errorMessage }
    }
  }

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      if (!user) throw new Error('User not authenticated')
      await authService.changePassword(user.id, currentPassword, newPassword)
      return { success: true }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Password change failed'
      return { success: false, error: errorMessage }
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,

    forgotPassword,
    resetPassword,
    changePassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
