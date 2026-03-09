import { AuthContext } from '@/hooks/auth-context'
import { supabase } from '@/lib/supabase'
import { PropsWithChildren, useEffect, useState } from 'react'

export default function AuthProvider({ children }: PropsWithChildren) {
    const [session, setSession] = useState<any>()
    const [user, setUser] = useState<any>()
    const [isLoading, setIsLoading] = useState<boolean>(true)

    // Fetch the session once, and subscribe to auth state changes
    useEffect(() => {
        const fetchSession = async () => {
            setIsLoading(true)

            const { data, error } = await supabase.auth.getSession()

            if (error) {
                console.error('Error fetching session:', error)
            }

            setSession(data?.session ?? null)
            setUser(data?.session?.user ?? null)
            setIsLoading(false)
        }

        fetchSession()

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, _session) => {
            console.log('Auth state changed:', { event: _event })
            setSession(_session ?? null)
            setUser(_session?.user ?? null)
            setIsLoading(false)
        })

        // Cleanup subscription on unmount
        return () => {
            subscription.unsubscribe()
        }
    }, [])

    return (
        <AuthContext.Provider
            value={{
                session,
                user,
                isLoading,
                isLoggedIn: !!session,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}
