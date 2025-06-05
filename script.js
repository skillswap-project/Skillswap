// Supabase-Initialisierung
const { createClient } = supabase;
const supabaseClient = createClient(
  'https://jdabagmcyxjjrknqrgkh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkYWJhZ21jeXhqanJrbnFyZ2toIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4NjMxMDAsImV4cCI6MjA2MzQzOTEwMH0.MRmKYrl9BWwKwNwqenGV_Lvrtci7BO59GhxLQWd3a3A'
);

// Globale Chat-Variablen
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
  document.getElementById('messages-section').classList.add('hidden');
  document.getElementById('chat-view-section').classList.add('hidden');
  document.getElementById('logout-button').style.display = 'none';
}

// Profilfunktionen (save/load/avatar)
// ... wie in deiner bestehenden Datei (abgekürzt für Klarheit)
// siehe vorherige Versionen für Details

// Nachrichtenempfang
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

// Chat öffnen & Verlauf laden
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
    .order('created_at', { ascending: true });

  const container = document.getElementById('chat-view');
  container.innerHTML = `<h3>Chat mit ${activeChatUserName}</h3>`;

  if (error) {
    container.innerHTML += `<p>Fehler beim Laden der Konversation: ${error.message}</p>`;
    return;
  }

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

  if (error) {
    alert("Fehler beim Senden: " + error.message);
  } else {
    document.getElementById('reply-text').value = '';
    await loadConversation();
  }
}

function closeChat() {
  document.getElementById('chat-view-section').classList.add('hidden');
  document.getElementById('messages-section').classList.remove('hidden');
  activeChatUserId = null;
  activeChatUserName = null;
}

// Automatisch prüfen, ob eingeloggt
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
window.loadReceivedMessages = loadReceivedMessages;
window.openChat = openChat;
window.sendReply = sendReply;
window.closeChat = closeChat;
// + ggf. weitere vorhandene Funktionen wie saveProfile etc.
