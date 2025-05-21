import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Supabase-Konfiguration
const supabaseUrl = 'https://hmqzpwvofjvrlvkjwvgf.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtcXpwd3ZvZmp2cmx2a2p3dmdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMjQ5MzksImV4cCI6MjA2MjgwMDkzOX0.RxhzSRQ4MC_McVrBvS2o2WyPyFegidWwnN5N6m8qXF8' 
const supabase = createClient(supabaseUrl, supabaseKey)

// Elemente
const authView = document.getElementById('authView')
const profileView = document.getElementById('profileView')
const searchView = document.getElementById('searchView')

const emailInput = document.getElementById('email')
const passwordInput = document.getElementById('password')
const loginBtn = document.getElementById('loginBtn')
const signupBtn = document.getElementById('signupBtn')
const message = document.getElementById('message')

const infoInput = document.getElementById('info')
const talentsInput = document.getElementById('talents')
const saveProfile = document.getElementById('saveProfile')
const profileMsg = document.getElementById('profileMsg')
const logoutBtn = document.getElementById('logoutBtn')
const gotoSearch = document.getElementById('gotoSearch')

const searchInput = document.getElementById('searchInput')
const searchBtn = document.getElementById('searchBtn')
const results = document.getElementById('results')
const backToProfile = document.getElementById('backToProfile')

// Auth-Handling
loginBtn.onclick = async () => {
  const { error } = await supabase.auth.signInWithPassword({
    email: emailInput.value,
    password: passwordInput.value,
  })
  if (error) message.textContent = '❌ ' + error.message
  else await loadProfile()
}

signupBtn.onclick = async () => {
  const { error } = await supabase.auth.signUp({
    email: emailInput.value,
    password: passwordInput.value,
  })
  if (error) message.textContent = '❌ ' + error.message
  else message.textContent = '✅ Bitte E-Mail bestätigen.'
}

// Profil speichern
saveProfile.onclick = async () => {
  const user = await supabase.auth.getUser()
  const user_id = user.data.user.id
  const info = infoInput.value.trim()
  const talents = talentsInput.value.split(',').map(t => t.trim()).filter(t => t)

  const { error } = await supabase.from('profiles').upsert({
    user_id,
    info,
    talents,
  })

  profileMsg.textContent = error ? '❌ Fehler beim Speichern' : '✅ Profil gespeichert'
}

// Logout
logoutBtn.onclick = async () => {
  await supabase.auth.signOut()
  showView('auth')
}

// Navigation
gotoSearch.onclick = () => showView('search')
backToProfile.onclick = () => showView('profile')

// Suche
searchBtn.onclick = async () => {
  const term = searchInput.value.trim()
  results.innerHTML = '⏳ Suche...'

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .contains('talents', [term])

  if (error) {
    results.textContent = '❌ Fehler bei der Suche.'
  } else if (data.length === 0) {
    results.textContent = '❌ Keine passenden Profile gefunden.'
  } else {
    results.innerHTML = data.map(p =>
      `<div><strong>Info:</strong> ${p.info}<br/><strong>Talente:</strong> ${p.talents.join(', ')}</div><hr/>`
    ).join('')
  }
}

// Ansicht wechseln
function showView(view) {
  authView.style.display = view === 'auth' ? 'block' : 'none'
  profileView.style.display = view === 'profile' ? 'block' : 'none'
  searchView.style.display = view === 'search' ? 'block' : 'none'
}

// Automatisch einloggen, wenn Session existiert
window.onload = async () => {
  const session = await supabase.auth.getSession()
  if (session.data.session) loadProfile()
}

async function loadProfile() {
  showView('profile')
  const user = await supabase.auth.getUser()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.data.user.id)
    .single()
  if (data) {
    infoInput.value = data.info
    talentsInput.value = data.talents.join(', ')
  }
}
