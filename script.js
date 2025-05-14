// Supabase-Konfiguration
const SUPABASE_URL = 'https://hmqzpwvofjvrlvkjwvgf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtcXpwd3ZvZmp2cmx2a2p3dmdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMjQ5MzksImV4cCI6MjA2MjgwMDkzOX0.RxhzSRQ4MC_McVrBvS2o2WyPyFegidWwnN5N6m8qXF8'; // <- HIER DEINEN KEY EINTRAGEN
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM-Elemente
const signupForm = document.getElementById('signupForm');
const loginForm = document.getElementById('loginForm');
const offerServiceForm = document.getElementById('offerServiceForm');
const errorMessage = document.getElementById('errorMessage');
const loggedInArea = document.getElementById('loggedInArea');
const loggedOutArea = document.getElementById('loggedOutArea');
const serviceList = document.getElementById('serviceList');

// Registrierung
signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;

  const { error } = await supabase.auth.signUp({ email, password });
  if (error) {
    errorMessage.textContent = 'Fehler bei der Registrierung: ' + error.message;
  } else {
    alert('Registrierung erfolgreich! Bitte bestätige deine E-Mail.');
    window.location.href = 'https://deine-zielseite.de'; // <- WEITERLEITUNG NACH REGISTRIERUNG
  }
});

// Login
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    errorMessage.textContent = 'Login fehlgeschlagen: ' + error.message;
  } else {
    // Erfolgreich eingeloggt
    loggedOutArea.style.display = 'none';
    loggedInArea.style.display = 'block';
    fetchServices();
    // Weiterleitung nach Login
    window.location.href = 'https://deine-zielseite.de'; // <- WEITERLEITUNG NACH LOGIN
  }
});

// Dienstleistung hinzufügen
offerServiceForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const { data: { user } } = await supabase.auth.getUser();
  const name = document.getElementById('serviceName').value;
  const description = document.getElementById('serviceDescription').value;

  const { error } = await supabase
    .from('services')
    .insert([{ user_id: user.id, name, description }]);

  if (error) {
    errorMessage.textContent = 'Fehler beim Hinzufügen: ' + error.message;
  } else {
    fetchServices();
    offerServiceForm.reset();
  }
});

// Dienstleistungen abrufen
async function fetchServices() {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('user_id', user.id);

  if (error) {
    errorMessage.textContent = 'Fehler beim Laden: ' + error.message;
    return;
  }

  serviceList.innerHTML = '';
  data.forEach(service => {
    const li = document.createElement('li');
    li.textContent = `${service.name}: ${service.description}`;
    serviceList.appendChild(li);
  });
}

// Abmelden
async function logout() {
  await supabase.auth.signOut();
  window.location.href = 'index.html';
}
