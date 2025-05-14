import { createClient } from 'https://esm.sh/@supabase/supabase-js'

// Supabase Konfiguration
const SUPABASE_URL = https://hmqzpwvofjvrlvkjwvgf.supabase.co
const SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtcXpwd3ZvZmp2cmx2a2p3dmdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMjQ5MzksImV4cCI6MjA2MjgwMDkzOX0.RxhzSRQ4MC_McVrBvS2o2WyPyFegidWwnN5N6m8qXF8
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
