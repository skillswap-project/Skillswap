// Supabase initialisieren – ersetze durch deine echten Keys!
const supabase = window.supabase.createClient(
  'https://hmqzpwvofjvrlvkjwvgf.supabase.co',     // z. B. https://abcd1234.supabase.co
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtcXpwd3ZvZmp2cmx2a2p3dmdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMjQ5MzksImV4cCI6MjA2MjgwMDkzOX0.RxhzSRQ4MC_McVrBvS2o2WyPyFegidWwnN5N6m8qXF8'                            // z. B. eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
);

// Registrierung
async function signUp() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    alert("Fehler bei der Registrierung: " + error.message);
  } else {
    alert("Registrierung erfolgreich! Bestätige deine E-Mail.");
  }
}

// Anmeldung
async function signIn() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    alert("Login fehlgeschlagen: " + error.message);
  } else {
    alert("Erfolgreich eingeloggt!");
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('profile-section').classList.remove('hidden');
    document.getElementById('search-section').classList.remove('hidden');
    loadProfile();
  }
}

// Profil speichern / aktualisieren
async function saveProfile() {
  const { data: sessionData } = await supabase.auth.getUser();
  const user = sessionData.user;

  const name = document.getElementById('name').value;
  const age = parseInt(document.getElementById('age').value);
  const location = document.getElementById('location').value;
  const talents = document.getElementById('talents').value
    .split(',')
    .map(t => t.trim().toLowerCase());
  const avatar_url = document.getElementById('avatar_url').value;

  const { error } = await supabase.from('profiles').upsert({
    id: user.id,
    name,
    age,
    location,
    talents,
    avatar_url
  });

  if (error) {
    alert("Fehler beim Speichern: " + error.message);
  } else {
    alert("Profil gespeichert!");
  }
}

// Profil beim Login laden (optional)
async function loadProfile() {
  const { data: sessionData } = await supabase.auth.getUser();
  const user = sessionData.user;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (data) {
    document.getElementById('name').value = data.name || '';
    document.getElementById('age').value = data.age || '';
    document.getElementById('location').value = data.location || '';
    document.getElementById('talents').value = data.talents?.join(', ') || '';
    document.getElementById('avatar_url').value = data.avatar_url || '';
  }
}

// Suche nach Talenten
async function searchUsers() {
  const term = document.getElementById('search-term').value.toLowerCase().trim();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .contains('talents', [term]);

  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '';

  if (error) {
    resultsDiv.innerText = "Fehler bei der Suche.";
    return;
  }

  if (!data.length) {
    resultsDiv.innerText = "Keine Treffer.";
    return;
  }

  data.forEach(user => {
    const div = document.createElement('div');
    div.classList.add('result-card');
    div.innerHTML = `
      <img src="${user.avatar_url}" alt="Avatar" width="50">
      <strong>${user.name}</strong> (${user.age}), ${user.location}<br>
      <em>Talente:</em> ${user.talents.join(', ')}
      <hr>
    `;
    resultsDiv.appendChild(div);
  });
}
