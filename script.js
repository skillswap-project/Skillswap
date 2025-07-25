const { createClient } = supabase;
const supabaseClient = createClient(
  'https://jdabagmcyxjjrknqrgkh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkYWJhZ21jeXhqanJrbnFyZ2toIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4NjMxMDAsImV4cCI6MjA2MzQzOTEwMH0.MRmKYrl9BWwKwNwqenGV_Lvrtci7BO59GhxLQWd3a3A'
);

let selectedRecipientId = null;
let activeChatUserId = null;
let activeChatUserName = null;

// Registrierung
async function signUp() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const { error } = await supabaseClient.auth.signUp({ email, password });
  if (error) alert("Fehler bei der Registrierung: " + error.message);
  else alert("Registrierung erfolgreich! Bestätige deine E-Mail.");
}

// Anmeldung
async function signIn() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) {
    alert("Login fehlgeschlagen: " + error.message);
  } else {
    alert("Erfolgreich eingeloggt!");
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('profile-section').classList.remove('hidden');
    document.getElementById('messages-section').classList.remove('hidden');
    document.getElementById('logout-button').style.display = 'block';
    loadTalentChips();
    loadProfile();
    loadReceivedMessages();
  }
}

// Abmelden
async function signOut() {
  const { error } = await supabaseClient.auth.signOut();
  if (error) {
    alert("Fehler beim Abmelden: " + error.message);
    return;
  }
  alert("Du wurdest abgemeldet.");
  document.getElementById('auth-section').classList.remove('hidden');
  document.getElementById('profile-section').classList.add('hidden');
  document.getElementById('search-section').classList.add('hidden');
  document.getElementById('messages-section').classList.add('hidden');
  document.getElementById('chat-view-section').classList.add('hidden');
  document.getElementById('logout-button').style.display = 'none';
}

// Profil speichern
async function saveProfile() {
  updateHiddenTalentField();
  const { data: sessionData } = await supabaseClient.auth.getUser();
  const user = sessionData.user;

  const name = document.getElementById('name').value;
  const age = parseInt(document.getElementById('age').value);
  const location = document.getElementById('location').value;
  const talents = document.getElementById('talents').value
    .split(',')
    .map(t => t.trim().toLowerCase())
    .filter(t => t.length > 0);
  const avatar_url = document.getElementById('avatar_url').value;

  const { error } = await supabaseClient.from('profiles').upsert({
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
  const { data: sessionData } = await supabaseClient.auth.getUser();
  const user = sessionData.user;

  const { data, error } = await supabaseClient
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (data) {
    document.getElementById('name').value = data.name || '';
    document.getElementById('age').value = data.age || '';
    document.getElementById('location').value = data.location || '';
    document.getElementById('avatar_url').value = data.avatar_url || '';
    previewAvatar();

    const talents = data.talents || [];
    document.getElementById('talents').value = talents.join(',');
    const chips = document.querySelectorAll('#chip-container .chip');
    chips.forEach(chip => {
      const chipText = chip.textContent.toLowerCase();
      chip.classList.toggle('active', talents.includes(chipText));
    });
  } else {
    document.getElementById('name').value = '';
    document.getElementById('age').value = '';
    document.getElementById('location').value = '';
    document.getElementById('avatar_url').value = '';
    previewAvatar();
    document.getElementById('talents').value = '';
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

// Avatar hochladen
async function uploadAvatar() {
  const fileInput = document.getElementById('avatar_file');
  const file = fileInput.files[0];
  if (!file) return;

  const { data: session } = await supabaseClient.auth.getUser();
  const userId = session.user.id;
  const filePath = `${userId}/${file.name}`;

  const { error: uploadError } = await supabaseClient
    .storage.from('avatars')
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    alert("Fehler beim Hochladen: " + uploadError.message);
    return;
  }

  const { data } = supabaseClient.storage.from('avatars').getPublicUrl(filePath);
  const url = data.publicUrl;
  document.getElementById('avatar_url').value = url;
  previewAvatar();
}

// Talente laden
async function loadTalentChips() {
  const { data, error } = await supabaseClient
    .from('talent_tags')
    .select('*')
    .order('name');

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

  updateHiddenTalentField();
}

// Neues Talent hinzufügen
async function checkNewTalent(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    const input = document.getElementById('new-talent');
    const talent = input.value.trim().toLowerCase();
    input.value = '';
    if (!talent) return;

    const existing = Array.from(document.querySelectorAll('#chip-container .chip')).map(chip => chip.textContent.toLowerCase());
    if (existing.includes(talent)) return;

    const newChip = document.createElement('div');
    newChip.classList.add('chip', 'active');
    newChip.textContent = talent;
    newChip.onclick = () => toggleTalent(newChip);
    document.getElementById('chip-container').appendChild(newChip);

    try {
      await supabaseClient.from('talent_tags').insert({ name: talent });
    } catch (e) {}

    updateHiddenTalentField();
  }
}

// Suche
async function searchUsers() {
  const term = document.getElementById('search-term').value.trim().toLowerCase();
  if (!term) {
    document.getElementById('results').innerText = "Bitte Suchbegriff eingeben.";
    return;
  }

  const { data, error } = await supabaseClient
    .from('profiles')
    .select('*')
    .or(`name.ilike.%${term}%,location.ilike.%${term}%,talents.cs.{${term}}`);

  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '';

  if (error) {
    resultsDiv.innerText = "Fehler bei der Suche: " + error.message;
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
      <img src="${user.avatar_url}" alt="Avatar" width="60" style="border-radius: 50%">
      <strong>${user.name}</strong> (${user.age}), ${user.location}<br>
      <div>${user.talents.map(t => `<span class="talent-tag">${t}</span>`).join(' ')}</div>
      <button onclick="openMessageModal('${user.id}', '${user.name}')">Nachricht senden</button>
    `;
    resultsDiv.appendChild(div);
  });
}

// Nachricht empfangen
async function loadReceivedMessages() {
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) return;

  const { data: messages, error } = await supabaseClient
    .from('messages')
    .select('*, sender:profiles(name)')
    .eq('receiver_id', user.id)
    .order('created_at', { ascending: false });

  const container = document.getElementById('received-messages');
  container.innerHTML = '';

  if (error) {
    container.innerText = "Fehler beim Laden der Nachrichten: " + error.message;
    return;
  }

  if (!messages.length) {
    container.innerText = "Keine empfangenen Nachrichten.";
    return;
  }

  for (const msg of messages) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `
      <p><strong>Von:</strong> ${msg.sender?.name || 'Unbekannt'}</p>
      <p>${msg.content}</p>
      <small>${new Date(msg.created_at).toLocaleString()}</small><br/>
      <button onclick="openChat('${msg.sender_id}', '${msg.sender?.name || 'Unbekannt'}')">Antworten</button>
      <hr />
    `;
    container.appendChild(div);
  }
}

// Chat-Funktionen
async function openChat(userId, userName) {
  activeChatUserId = userId;
  activeChatUserName = userName;
  document.getElementById('messages-section').classList.add('hidden');
  document.getElementById('chat-view-section').classList.remove('hidden');
  await loadConversation();
}

async function loadConversation() {
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user || !activeChatUserId) return;

  const { data: messages, error } = await supabaseClient
    .from('messages')
    .select('*')
    .or(`and(sender_id.eq.${user.id},receiver_id.eq.${activeChatUserId}),and(sender_id.eq.${activeChatUserId},receiver_id.eq.${user.id})`)
    .order('created_at');

  const container = document.getElementById('chat-view');
  container.innerHTML = `<h3>Chat mit ${activeChatUserName}</h3>`;

  messages.forEach(msg => {
    const div = document.createElement('div');
    div.classList.add('chat-bubble');
    div.classList.add(msg.sender_id === user.id ? 'me' : 'them');
    div.textContent = msg.content;
    container.appendChild(div);
  });
}

async function sendReply() {
  const content = document.getElementById('reply-text').value.trim();
  if (!content || !activeChatUserId) return;

  const { data: { user } } = await supabaseClient.auth.getUser();
  const { error } = await supabaseClient.from('messages').insert({
    sender_id: user.id,
    receiver_id: activeChatUserId,
    content
  });

  if (!error) {
    document.getElementById('reply-text').value = '';
    await loadConversation();
  } else {
    alert("Fehler beim Senden: " + error.message);
  }
}

function closeChat() {
  document.getElementById('chat-view-section').classList.add('hidden');
  document.getElementById('messages-section').classList.remove('hidden');
  activeChatUserId = null;
  activeChatUserName = null;
}

// Modal für neue Nachricht
function openMessageModal(userId, userName) {
  selectedRecipientId = userId;
  document.getElementById('message-recipient-name').textContent = userName;
  document.getElementById('message-modal').classList.remove('hidden');
}

function closeMessageModal() {
  selectedRecipientId = null;
  document.getElementById('message-modal').classList.add('hidden');
  document.getElementById('message-text').value = '';
}

async function sendMessage() {
  const content = document.getElementById('message-text').value.trim();
  if (!content || !selectedRecipientId) return;

  const { data: { user: currentUser } } = await supabaseClient.auth.getUser();
  const { error } = await supabaseClient.from('messages').insert({
    sender_id: currentUser.id,
    receiver_id: selectedRecipientId,
    content
  });

  if (error) alert("Fehler beim Senden: " + error.message);
  else {
    alert("Nachricht gesendet!");
    closeMessageModal();
  }
}

// UI
function toggleSearch() {
  document.getElementById('profile-section').classList.toggle('hidden');
  document.getElementById('search-section').classList.toggle('hidden');
}

function toggleTalent(element) {
  element.classList.toggle('active');
  updateHiddenTalentField();
}

function updateHiddenTalentField() {
  const activeChips = Array.from(document.querySelectorAll('.chip.active')).map(c => c.textContent.toLowerCase());
  document.getElementById('talents').value = activeChips.join(',');
}

// Auto-Login prüfen
window.addEventListener('load', async () => {
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (user) {
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('profile-section').classList.remove('hidden');
    document.getElementById('messages-section').classList.remove('hidden');
    document.getElementById('logout-button').style.display = 'block';
    loadTalentChips();
    loadProfile();
    loadReceivedMessages();
  } else {
    document.getElementById('auth-section').classList.remove('hidden');
    document.getElementById('profile-section').classList.add('hidden');
    document.getElementById('messages-section').classList.add('hidden');
    document.getElementById('chat-view-section').classList.add('hidden');
    document.getElementById('logout-button').style.display = 'none';
  }
});

// Globale Funktionen verfügbar machen
window.signUp = signUp;
window.signIn = signIn;
window.signOut = signOut;
window.saveProfile = saveProfile;
window.loadProfile = loadProfile;
window.uploadAvatar = uploadAvatar;
window.loadTalentChips = loadTalentChips;
window.checkNewTalent = checkNewTalent;
window.searchUsers = searchUsers;
window.sendMessage = sendMessage;
window.openMessageModal = openMessageModal;
window.closeMessageModal = closeMessageModal;
window.toggleSearch = toggleSearch;
window.loadReceivedMessages = loadReceivedMessages;
window.openChat = openChat;
window.sendReply = sendReply;
window.closeChat = closeChat;
