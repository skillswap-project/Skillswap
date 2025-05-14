// Import Supabase SDK
import { createClient } from 'https://esm.sh/@supabase/supabase-js'

// 🔐 Deine Supabase-Projekt-Daten
const SUPABASE_URL = https://hmqzpwvofjvrlvkjwvgf.supabase.co
const SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtcXpwd3ZvZmp2cmx2a2p3dmdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMjQ5MzksImV4cCI6MjA2MjgwMDkzOX0.RxhzSRQ4MC_McVrBvS2o2WyPyFegidWwnN5N6m8qXF8
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ============ AUTH ============

// Login
document.getElementById('login-form')?.addEventListener('submit', async (e) => {
  e.preventDefault()
  const email = document.getElementById('email').value
  const password = document.getElementById('password').value

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    alert('Login fehlgeschlagen: ' + error.message)
  } else {
    alert('Login erfolgreich!')
    window.location.reload()
  }
})

// Registrierung
document.getElementById('signup-form')?.addEventListener('submit', async (e) => {
  e.preventDefault()
  const email = document.getElementById('signup-email').value
  const password = document.getElementById('signup-password').value

  const { error } = await supabase.auth.signUp({ email, password })
  if (error) {
    alert('Registrierung fehlgeschlagen: ' + error.message)
  } else {
    alert('Registrierung erfolgreich! Bitte E-Mail bestätigen.')
  }
})

// Logout
document.getElementById('logout-btn')?.addEventListener('click', async () => {
  await supabase.auth.signOut()
  alert('Abgemeldet.')
  window.location.reload()
})

// ============ SESSION CHECK ============

async function checkSession() {
  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (session) {
    document.getElementById('auth-section')?.classList.add('hidden')
    document.getElementById('app-section')?.classList.remove('hidden')
    loadProfile()
    loadOffers()
    loadNeeds()
  } else {
    document.getElementById('auth-section')?.classList.remove('hidden')
    document.getElementById('app-section')?.classList.add('hidden')
  }
}

checkSession()

// ============ PROFILE ============

async function loadProfile() {
  const {
    data: { user }
  } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('Profil konnte nicht geladen werden:', error.message)
  } else {
    document.getElementById('username-display').textContent = data.username
  }
}

// ============ ANGEBOT ERSTELLEN ============

document.getElementById('offer-form')?.addEventListener('submit', async (e) => {
  e.preventDefault()
  const skill = document.getElementById('offer-skill').value
  const desc = document.getElementById('offer-description').value

  const skillResult = await getOrCreateSkill(skill)

  const {
    data: { user }
  } = await supabase.auth.getUser()

  const { error } = await supabase.from('user_offers').insert({
    user_id: user.id,
    skill_id: skillResult.id,
    description: desc
  })

  if (error) {
    alert('Angebot konnte nicht erstellt werden: ' + error.message)
  } else {
    alert('Angebot hinzugefügt.')
    loadOffers()
  }
})

// ============ GESUCH ERSTELLEN ============

document.getElementById('need-form')?.addEventListener('submit', async (e) => {
  e.preventDefault()
  const skill = document.getElementById('need-skill').value
  const desc = document.getElementById('need-description').value

  const skillResult = await getOrCreateSkill(skill)

  const {
    data: { user }
  } = await supabase.auth.getUser()

  const { error } = await supabase.from('user_needs').insert({
    user_id: user.id,
    skill_id: skillResult.id,
    description: desc
  })

  if (error) {
    alert('Gesuch konnte nicht erstellt werden: ' + error.message)
  } else {
    alert('Gesuch hinzugefügt.')
    loadNeeds()
  }
})

// ============ SKILL ERSTELLEN ODER LADEN ============

async function getOrCreateSkill(skillName) {
  let { data, error } = await supabase
    .from('skills')
    .select('*')
    .ilike('name', skillName)
    .single()

  if (data) return data

  const insertResult = await supabase
    .from('skills')
    .insert({ name: skillName })
    .select()
    .single()

  if (insertResult.error) {
    console.error('Skill-Fehler:', insertResult.error.message)
    throw insertResult.error
  }

  return insertResult.data
}

// ============ ANGEBOTE LADEN ============

async function loadOffers() {
  const offersList = document.getElementById('offers-list')
  if (!offersList) return

  const { data, error } = await supabase
    .from('user_offers')
    .select('id, description, skills(name), profiles(username)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Fehler beim Laden der Angebote:', error.message)
    return
  }

  offersList.innerHTML = ''
  data.forEach((offer) => {
    const li = document.createElement('li')
    li.textContent = `${offer.profiles.username} bietet: ${offer.skills.name} (${offer.description})`
    offersList.appendChild(li)
  })
}

// ============ GESUCHE LADEN ============

async function loadNeeds() {
  const needsList = document.getElementById('needs-list')
  if (!needsList) return

  const { data, error } = await supabase
    .from('user_needs')
    .select('id, description, skills(name), profiles(username)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Fehler beim Laden der Gesuche:', error.message)
    return
  }

  needsList.innerHTML = ''
  data.forEach((need) => {
    const li = document.createElement('li')
    li.textContent = `${need.profiles.username} sucht: ${need.skills.name} (${need.description})`
    needsList.appendChild(li)
  })
}
