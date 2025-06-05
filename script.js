const supabase = window.supabase.createClient(
  'https://jdabagmcyxjjrknqrgkh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkYWJhZ21jeXhqanJrbnFyZ2toIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4NjMxMDAsImV4cCI6MjA2MzQzOTEwMH0.MRmKYrl9BWwKwNwqenGV_Lvrtci7BO59GhxLQWd3a3A'
);

// Registrierung
async function signUp() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) alert("Fehler bei der Registrierung: " + error.message);
  else alert("Registrierung erfolgreich! Bestätige deine E-Mail.");
}

// Anmeldung
async function signIn() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) alert("Login fehlgeschlagen: " + error.message);
  else {
    alert("Erfolgreich eingeloggt!");
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('profile-section').classList.remove('hidden');
    loadTalentChips();
    loadProfile();
  }
}

// Profil speichern
async function saveProfile() {
  updateHiddenTalentField(); // sicherstellen, dass Chips synchron sind

  const { data: sessionData } = await supabase.auth.getUser();
  const user = sessionData.user;

  const name = document.getElementById('name').value;
  const age = parseInt(document.getElementById('age').value);
  const location = document.getElementById('location').value;
  const talents = document.getElementById('talents').value
    .split(',')
    .map(t => t.trim().toLowerCase())
    .filter(t => t.length > 0);
  const avatar_url = document.getElementById('avatar_url').value;

  const { error } = await supabase.from('profiles').upsert({
    id: user.id,
    name,
    age,
    location,
    talents,
    avatar_url
  });

  if (error) alert("Fehler beim Speichern: " + error.message);
  else alert("Profil gespeichert!");
}

// Profil laden
async function loadProfile() {
  const { data: sessionData } = await supabase.auth.getUser();
  const user = sessionData.user;
  const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  if (data) {
    document.getElementById('name').value = data.name || '';
    document.getElementById('age').value = data.age || '';
    document.getElementById('location').value = data.location || '';
    document.getElementById('avatar_url').value = data.avatar_url || '';
    previewAvatar();

    const chips = document.querySelectorAll('#chip-container .chip');
    const talents = data.talents || [];
    document.getElementById('talents').value = talents.join(',');

    chips.forEach(chip => {
      const chipText = chip.textContent.toLowerCase();
      if (talents.includes(chipText)) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });
  }
}

// Avatar-Vorschau
function previewAvatar() {
  const url = document.getElementById('avatar_url').value;
  const img = document.getElementById('avatar-preview');
  if (url) {
    img.src = url;
    img.classList.remove('hidden');
  } else {
    img.classList.add('hidden');
  }
}

// Talente suchen
async function searchUsers() {
  const terms = document.getElementById('search-term').value
    .toLowerCase()
    .split(',')
    .map(t => t.trim())
    .filter(t => t.length > 0);

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .overlaps('talents', terms);

  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '';

  if (error || !data.length) {
    resultsDiv.innerText = error ? "Fehler bei der Suche." : "Keine Treffer.";
    return;
  }

  data.forEach(user => {
    const div = document.createElement('div');
    div.classList.add('result-card');
    div.innerHTML = `
      <img src="${user.avatar_url}" alt="Avatar" width="60" style="border-radius: 50%">
      <strong>${user.name}</strong> (${user.age}), ${user.location}<br>
      <div>${user.talents.map(t => `<span class="talent-tag">${t}</span>`).join(' ')}</div>
    `;
    resultsDiv.appendChild(div);
  });
}

// Ansicht umschalten
function toggleSearch() {
  document.getElementById('profile-section').classList.toggle('hidden');
  document.getElementById('search-section').classList.toggle('hidden');
}

// Chip aktivieren/deaktivieren
function toggleTalent(element) {
  element.classList.toggle('active');
  updateHiddenTalentField();
}

// Talente-Feld aus aktiven Chips aktualisieren
function updateHiddenTalentField() {
  const activeChips = Array.from(document.querySelectorAll('.chip.active'))
    .map(c => c.textContent.toLowerCase());
  document.getElementById('talents').value = activeChips.join(',');
}

// Neues Talent hinzufügen
async function checkNewTalent(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    const input = document.getElementById('new-talent');
    const talent = input.value.trim().toLowerCase();
    input.value = '';
    if (!talent) return;

    const existing = Array.from(document.querySelectorAll('#chip-container .chip'))
      .map(chip => chip.textContent.toLowerCase());

    if (existing.includes(talent)) return;

    const newChip = document.createElement('div');
    newChip.classList.add('chip', 'active');
    newChip.textContent = talent;
    newChip.onclick = () => toggleTalent(newChip);
    document.getElementById('chip-container').appendChild(newChip);

    try {
      await supabase.from('talent_tags').insert({ name: talent });
    } catch (e) {
      // ignorieren (z. B. Duplikat)
    }

    updateHiddenTalentField();
  }
}

// Avatar-Datei hochladen
async function uploadAvatar() {
  const fileInput = document.getElementById('avatar_file');
  const file = fileInput.files[0];
  if (!file) return;

  const { data: session } = await supabase.auth.getUser();
  const userId = session.user.id;
  const filePath = `${userId}/${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    alert("Fehler beim Hochladen des Bildes: " + uploadError.message);
    return;
  }

  const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
  const url = data.publicUrl;

  document.getElementById('avatar_url').value = url;
  previewAvatar();
}

// Talente aus DB laden und anzeigen
async function loadTalentChips() {
  const { data, error } = await supabase.from('talent_tags').select('*').order('name');
  const chipContainer = document.getElementById('chip-container');
  chipContainer.innerHTML = '';

  if (error) return;

  data.forEach(t => {
    const chip = document.createElement('div');
    chip.classList.add('chip');
    chip.textContent = t.name;
    chip.onclick = () => toggleTalent(chip);
    chipContainer.appendChild(chip);
  });

  updateHiddenTalentField(); // initial synchronisieren
  // Benutzer abmelden
async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    alert("Fehler beim Abmelden: " + error.message);
    return;
  }

  // Nutzer erfolgreich abgemeldet
  alert("Du wurdest abgemeldet.");

  // Sichtbarkeit der Sektionen anpassen:
  document.getElementById('auth-section').classList.remove('hidden');    // Anmeldebereich anzeigen
  document.getElementById('profile-section').classList.add('hidden');    // Profilbereich ausblenden
  document.getElementById('search-section').classList.add('hidden');     // Suchbereich ausblenden (falls offen)

  // Logout-Button verstecken
  document.getElementById('logout-button').style.display = 'none';
}
window.addEventListener('load', async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('profile-section').classList.remove('hidden');
    document.getElementById('logout-button').style.display = 'block';
    loadTalentChips();
    loadProfile();
  } else {
    document.getElementById('auth-section').classList.remove('hidden');
    document.getElementById('profile-section').classList.add('hidden');
    document.getElementById('logout-button').style.display = 'none';
  }
});
window.signOut = signOut;


}
