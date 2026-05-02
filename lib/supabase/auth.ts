import { createClient } from './server'

/**
 * Get the current authenticated user from Supabase
 * Returns the user object if authenticated, null otherwise
 * This function should be used in Server Components or Server Actions
 */
export async function getCurrentUser() {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    console.error('Error getting current user:', error)
    return null
  }
  
  return user
}

/**
 * Check if a user is authenticated
 * Returns true if user is logged in, false otherwise
 */
export async function isAuthenticated() {
  const user = await getCurrentUser()
  return user !== null
}
