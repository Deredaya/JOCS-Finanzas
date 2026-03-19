import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
)

async function singIn() {
  const { data, error} = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      reditectTo:'http://localhost:4321'
    }
  })
}