import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true // Vital para Google OAuth
    }
  }
)

<<<<<<< HEAD
async function signIn() { // Corregido el nombre de la función
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'http://localhost:4321' // Corregido: redirectTo
=======
async function signIn() {
  const { data, error} = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: import.meta.env.SITE || 'http://localhost:4321'
>>>>>>> 2e7b3a377ba6d5aa7bf996486f3c43a0d1863993
    }
  })
}
