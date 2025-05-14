import { createClient } from 'https://esm.sh/@supabase/supabase-js'

// Supabase Konfiguration
const SUPABASE_URL = 'https://dein-projekt.supabase.co'
const SUPABASE_ANON_KEY = 'dein-anon-key'
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const loginForm = document.getElementById('login-form')
const statusDiv = document.getElementById('status')

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault()

  const email = document.getElementById('email').value
  const password = document.getElementById('password').value

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    statusDiv.textContent = `Fehler: ${error.message}`
  } else {
    statusDiv.textContent = 'Erfolgreich eingeloggt!'
    console.log(data)
  }
})
