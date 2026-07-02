const AUTH_PATHS = ['/login', '/sign-up', '/forgot-password', '/reset-password', '/api/auth', '/logout']

export const isAuthPath = (path: string) => {
  return AUTH_PATHS.some((p) => path.startsWith(p))
}

