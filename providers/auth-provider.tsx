'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import axios from 'axios'
import { usePathname, useRouter } from 'next/navigation'
import LoadingIndicator from '@/components/loading-indicator'
import { isAuthPath } from '@/utils/auth.u'

export interface AuthState {
  user_id: string
  user_email: string
  user_name: string
}

interface AuthContextType extends AuthState {
  updateAuthState: (state: Partial<AuthState>) => void;
}

const AuthContext = createContext<AuthContextType>({
  user_id: '',
  user_email: '',
  user_name: '',
  updateAuthState: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathName = usePathname()
  const [isLoading, setIsLoading] = useState(true)
  const [authState, setAuthState] = useState<AuthState>({
    user_id: '',
    user_email: '',
    user_name: '',
  })

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true)

      if (isAuthPath(pathName)) {
        setIsLoading(false)
        return
      }

      const { data: { user }, status } = await axios.get<{ user: AuthState }>('/api/user')
      if (status === 200) {
        setAuthState({ ...user })
      } else {
        router.push('/login')
      }
      setIsLoading(false)
    }
    void fetchUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateAuthState = (newState: Partial<AuthState>) => {
    setAuthState((prev) => ({ ...prev, ...newState }))
  }

  if (isLoading) {
    return <LoadingIndicator />
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