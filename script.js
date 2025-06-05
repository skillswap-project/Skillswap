const { createClient } = supabase;
const supabaseClient = createClient(
  'https://jdabagmcyxjjrknqrgkh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkYWJhZ21jeXhqanJrbnFyZ2toIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4NjMxMDAsImV4cCI6MjA2MzQzOTEwMH0.MRmKYrl9BWwKwNwqenGV_Lvrtci7BO59GhxLQWd3a3A'
);

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
    document.getElementById('logout-button').style.display = 'block';
    loadTalentChips();
    loadProfile();
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
  document.getElementById('logout-button').style.display = 'none';
}
// Modal öffnen
let selectedRecipientId = null;

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

// Nachricht senden
async function sendMessage() {
  const content = document.getElementById('message-text').value.trim();
  if (!content || !selectedRecipientId) return;

  const { data: { user: currentUser } } = await supabaseClient.auth.getUser();
  const { error } = await supabaseClient.from('messages').insert({
    sender_id: currentUser.id,
    receiver_id: selectedRecipientId,
    content
  });

  if (error) {
    alert("Fehler beim Senden: " + error.message);
  } else {
    alert("Nachricht gesendet!");
    closeMessageModal();
  }
}

// Globale Funktionen zuweisen
window.signUp = signUp;
window.signIn = signIn;
window.signOut = signOut;
window.sendMessage = sendMessage;
window.openMessageModal = openMessageModal;
window.closeMessageModal = closeMessageModal;
