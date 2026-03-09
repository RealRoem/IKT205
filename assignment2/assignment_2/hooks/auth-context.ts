import { createContext, useContext } from 'react'

export type AuthData = {
    session?: any | null
    user?: any | null
    isLoading: boolean
    isLoggedIn: boolean
}

export const AuthContext = createContext<AuthData>({
    session: undefined,
    user: undefined,
    isLoading: true,
    isLoggedIn: false,
})

export const useAuthContext = () => useContext(AuthContext)
