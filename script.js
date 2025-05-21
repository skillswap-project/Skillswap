const supabase = supabase.createClient('https://hmqzpwvofjvrlvkjwvgf.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtcXpwd3ZvZmp2cmx2a2p3dmdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMjQ5MzksImV4cCI6MjA2MjgwMDkzOX0.RxhzSRQ4MC_McVrBvS2o2WyPyFegidWwnN5N6m8qXF8');

async function signUp() {
  const { user, error } = await supabase.auth.signUp({
    email: document.getElementById('email').value,
    password: document.getElementById('password').value
  });
  if (error) return alert(error.message);
  alert("Check deine Email zur Bestätigung.");
}

async function signIn() {
  const { user, error } = await supabase.auth.signInWithPassword({
    email: document.getElementById('email').value,
    password: document.getElementById('password').value
  });
  if (error) return alert(error.message);
  alert("Angemeldet!");
  document.getElementById('auth-section').classList.add('hidden');
  document.getElementById('profile-section').classList.remove('hidden');
  document.getElementById('search-section').classList.remove('hidden');
}

async function saveProfile() {
  const user = await supabase.auth.getUser();
  const { error } = await supabase.from('profiles').upsert({
    id: user.data.user.id,
    name: document.getElementById('name').value,
    age: parseInt(document.getElementById('age').value),
    location: document.getElementById('location').value,
    talents: document.getElementById('talents').value.split(',').map(t => t.trim()),
    avatar_url: document.getElementById('avatar_url').value
  });
  if (error) return alert(error.message);
  alert("Profil gespeichert!");
}

async function searchUsers() {
  const term = document.getElementById('search-term').value.toLowerCase();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .contains('talents', [term]);

  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '';

  if (error) return resultsDiv.innerText = "Fehler bei der Suche.";
  if (data.length === 0) return resultsDiv.innerText = "Keine Treffer.";

  data.forEach(user => {
    const div = document.createElement('div');
    div.innerHTML = `<strong>${user.name}</strong> (${user.age}), ${user.location}<br>Talente: ${user.talents.join(', ')}<br><img src="${user.avatar_url}" width="50">`;
    resultsDiv.appendChild(div);
  });
}
