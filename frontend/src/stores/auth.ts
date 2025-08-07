import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { User, LoginForm, RegisterForm } from '@/types'
import { supabase } from '@/utils/supabase'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!user.value)
  const userRole = computed(() => user.value?.role || 'viewer')

  // Actions
  const initialize = async () => {
    try {
      isLoading.value = true
      error.value = null

      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Session error:', sessionError)
        throw sessionError
      }

      console.log('Session found:', !!session, 'User:', session?.user?.id)

      if (session?.user) {
        await fetchUserProfile(session.user.id)
      } else {
        // Clear any existing user data if no session
        user.value = null
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state change:', event, 'User:', session?.user?.id)
        
        if (event === 'SIGNED_IN' && session?.user) {
          await fetchUserProfile(session.user.id)
        } else if (event === 'SIGNED_OUT') {
          user.value = null
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          // Re-fetch profile when token is refreshed
          await fetchUserProfile(session.user.id)
        }
      })
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to initialize auth'
      console.error('Auth initialization error:', err)
      // Clear user data on error
      user.value = null
    } finally {
      isLoading.value = false
    }
  }

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId)
      
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (profileError) {
        console.error('Profile error:', profileError)
        
        // If profile doesn't exist, try to create one
        if (profileError.code === 'PGRST116') { // No rows returned
          console.log('Profile not found, creating default profile')
          user.value = {
            id: userId,
            email: '',
            role: 'clerk',
            name: 'User'
          }
          return
        }
        
        // For other errors, still create a basic user object
        user.value = {
          id: userId,
          email: '',
          role: 'clerk',
          name: 'User'
        }
        return
      }

      console.log('Profile found:', data)
      user.value = {
        id: data.user_id,
        email: '',
        role: data.role,
        name: data.name
      }
    } catch (err) {
      console.error('Failed to fetch user profile:', err)
      // If profile doesn't exist, create a basic user object
      user.value = {
        id: userId,
        email: '',
        role: 'clerk',
        name: 'User'
      }
    }
  }

  const login = async (credentials: LoginForm) => {
    try {
      isLoading.value = true
      error.value = null

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      })

      if (authError) {
        throw authError
      }

      if (data.user) {
        await fetchUserProfile(data.user.id)
      }

      return { success: true }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Login failed'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const register = async (userData: RegisterForm) => {
    try {
      isLoading.value = true
      error.value = null

      // Check if passwords match
      if (userData.password !== userData.confirmPassword) {
        throw new Error('Passwords do not match')
      }

      const { data, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name
          }
        }
      })

      if (authError) {
        throw authError
      }

      if (data.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              user_id: data.user.id,
              name: userData.name,
              role: 'clerk' // Default role for new users
            }
          ])

        if (profileError) {
          console.error('Failed to create user profile:', profileError)
        }

        await fetchUserProfile(data.user.id)
      }

      return { success: true }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Registration failed'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    try {
      isLoading.value = true
      error.value = null

      console.log('Starting secure logout process...')

      // Sign out from Supabase
      const { error: logoutError } = await supabase.auth.signOut()

      if (logoutError) {
        console.error('Supabase logout error:', logoutError)
        throw logoutError
      }

      // Clear user data
      user.value = null
      
      // Clear all stored session data
      localStorage.removeItem('supabase.auth.token')
      localStorage.removeItem('sb-grmyycdrzhhtbjsmqvrg-auth-token') // Supabase specific
      sessionStorage.clear()
      
      // Clear any other potential auth-related storage
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (key.includes('supabase') || key.includes('auth') || key.includes('token'))) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key))
      
      console.log('Secure logout completed successfully')
      return { success: true }
    } catch (err) {
      console.error('Logout error:', err)
      error.value = err instanceof Error ? err.message : 'Logout failed'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const updateProfile = async (updates: Partial<User>) => {
    try {
      isLoading.value = true
      error.value = null

      if (!user.value) {
        throw new Error('No user logged in')
      }

      const { data, error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.value.id)
        .select()
        .single()

      if (updateError) {
        throw updateError
      }

      user.value = data
      return { success: true }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Profile update failed'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const resetPassword = async (email: string) => {
    try {
      isLoading.value = true
      error.value = null

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (resetError) {
        throw resetError
      }

      return { success: true }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Password reset failed'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const changePassword = async (newPassword: string) => {
    try {
      isLoading.value = true
      error.value = null

      const { error: changeError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (changeError) {
        throw changeError
      }

      return { success: true }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Password change failed'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  const getAuthToken = async (): Promise<string | null> => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      return session?.access_token || null
    } catch (error) {
      console.error('Failed to get auth token:', error)
      return null
    }
  }

  return {
    // State
    user,
    isLoading,
    error,
    
    // Getters
    isAuthenticated,
    userRole,
    
    // Actions
    initialize,
    login,
    register,
    logout,
    updateProfile,
    resetPassword,
    changePassword,
    clearError,
    getAuthToken
  }
}) 