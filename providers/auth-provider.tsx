'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

export interface AuthState {
  user_id: string
  user_email: string
  user_name: string
}

interface AuthContextType extends AuthState {
  updateAuthState: (state: Partial<AuthState>) => void;
}

export const emptyAuthState: AuthState = {
  user_id: '',
  user_email: '',
  user_name: '',
}

const AuthContext = createContext<AuthContextType>({
  ...emptyAuthState,
  updateAuthState: () => {},
})

export function AuthProvider({
  initialState,
  children,
}: {
  initialState: AuthState;
  children: ReactNode;
}) {
  const [authState, setAuthState] = useState<AuthState>(initialState)

  const updateAuthState = (newState: Partial<AuthState>) => {
    setAuthState((prev) => ({ ...prev, ...newState }))
  }

  return (
    <AuthContext.Provider value={{ ...authState, updateAuthState }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
