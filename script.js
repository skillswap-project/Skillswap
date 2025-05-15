import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = 'https://hmqzpwvofjvrlvkjwvgf.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtcXpwd3ZvZmp2cmx2a2p3dmdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMjQ5MzksImV4cCI6MjA2MjgwMDkzOX0.RxhzSRQ4MC_McVrBvS2o2WyPyFegidWwnN5N6m8qXF8'
const supabase = createClient(supabaseUrl, supabaseKey)

const emailInput = document.getElementById('email')
const passwordInput = document.getElementById('password')
const loginBtn = document.getElementById('loginBtn')
const signupBtn = document.getElementById('signupBtn')
const message = document.getElementById('message')

loginBtn.addEventListener('click', async () => {
  const email = emailInput.value
  const password = passwordInput.value

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    message.textContent = '❌ ' + error.message
    console.error('Login-Fehler:', error)
  } else {
    message.textContent = '✅ Login erfolgreich!'
    console.log('Login erfolgreich:', data)
  }
})

signupBtn.addEventListener('click', async () => {
  const email = emailInput.value
  const password = passwordInput.value

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    message.textContent = '❌ ' + error.message
    console.error('Registrierungsfehler:', error)
  } else {
    message.textContent = '✅ Registrierung erfolgreich. Bestätige deine E-Mail.'
    console.log('Signup erfolgreich:', data)
  }
})
