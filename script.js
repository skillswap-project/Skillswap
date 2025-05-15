import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = 'hhttps://hmqzpwvofjvrlvkjwvgf.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtcXpwd3ZvZmp2cmx2a2p3dmdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMjQ5MzksImV4cCI6MjA2MjgwMDkzOX0.RxhzSRQ4MC_McVrBvS2o2WyPyFegidWwnN5N6m8qXF8'
const supabase = createClient(supabaseUrl, supabaseKey)

const emailInput = document.getElementById('email')
const passwordInput = document.getElementById('password')
const loginBtn = document.getElementById('loginBtn')
const signupBtn = document.getElementById('signupBtn')
const message = document.getElementById('message')

loginBtn.addEventListener('click', async () => {
  const { error } = await supabase.auth.signInWithPassword({
    email: emailInput.value,
    password: passwordInput.value,
  })
  message.textContent = error ? error.message : 'Erfolgreich eingeloggt!'
})

signupBtn.addEventListener('click', async () => {
  const { error } = await supabase.auth.signUp({
    email: emailInput.value,
    password: passwordInput.value,
  })
  message.textContent = error ? error.message : 'Registrierung erfolgreich. Bitte E-Mail bestätigen.'
})
