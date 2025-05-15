// script.js
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Supabase Konfiguration – deine echten Werte hier
const supabaseUrl = 'https://hmqzpwvofjvrlvkjwvgf.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtcXpwd3ZvZmp2cmx2a2p3dmdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMjQ5MzksImV4cCI6MjA2MjgwMDkzOX0.RxhzSRQ4MC_McVrBvS2o2WyPyFegidWwnN5N6m8qXF8'

const supabase = createClient(supabaseUrl, supabaseKey)

// DOM Elemente
const emailInput = document.getElementById('email')
const passwordInput = document.getElementById('password')
const loginBtn = document.getElementById('loginBtn')
const signupBtn = document.getElementById('signupBtn')
const message = document.getElementById('message')

// Login-Handler
loginBtn.addEventListener('click', async () => {
  const email = emailInput.value.trim()
  const password = passwordInput.value.trim()

  if (!email || !password) {
    message.textContent = '❌ Bitte E-Mail und Passwort eingeben.'
    return
  }

  try {
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
  } catch (err) {
    message.textContent = '❌ Netzwerkfehler (Fetch fehlgeschlagen)'
    console.error('Netzwerkfehler:', err)
  }
})

// Registrieren-Handler
signupBtn.addEventListener('click', async () => {
  const email = emailInput.value.trim()
  const password = passwordInput.value.trim()

  if (!email || !password) {
    message.textContent = '❌ Bitte E-Mail und Passwort eingeben.'
    return
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      message.textContent = '❌ ' + error.message
      console.error('Registrierungsfehler:', error)
    } else {
      message.textContent = '✅ Registrierung erfolgreich. Bitte E-Mail bestätigen.'
      console.log('Signup erfolgreich:', data)
    }
  } catch (err) {
    message.textContent = '❌ Netzwerkfehler (Fetch fehlgeschlagen)'
    console.error('Netzwerkfehler:', err)
  }
})
