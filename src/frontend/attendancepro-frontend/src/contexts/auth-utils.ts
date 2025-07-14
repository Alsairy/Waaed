import React, { useContext } from 'react'

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

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export { AuthContext, type User, type AuthContextType, type RegisterData }
