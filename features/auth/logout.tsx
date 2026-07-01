'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import LoadingIndicator from '@/components/loading-indicator'
import { createClient } from '@/utils/supabase/client'

const LogOutPage = () => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    const signOut = async () => {
      setIsLoading(true)
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()
      if (error) {
      } else {
        router.push('/login')
      }
      setIsLoading(false)
    }
    void signOut()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return isLoading ? <LoadingIndicator /> : <></>
}

export default LogOutPage
