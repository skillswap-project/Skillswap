// Deine Supabase URL und Anonymer API-Schlüssel
const SUPABASE_URL = 'https://hmqzpwvofjvrlvkjwvgf.supabase.co';
const SUPABASE_ANON_KEY = 'dein-anonymer-api-schlüssel';

// Supabase Initialisierung
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM-Elemente für das Formular und die Anzeige
const signupForm = document.getElementById('signupForm');
const loginForm = document.getElementById('loginForm');
const offerServiceForm = document.getElementById('offerServiceForm');
const errorMessage = document.getElementById('errorMessage');
const loggedInArea = document.getElementById('loggedInArea');
const loggedOutArea = document.getElementById('loggedOutArea');
const serviceList = document.getElementById('serviceList');

// Registrierungsfunktion
signupForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;

  try {
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) throw error;

    alert('Registrierung erfolgreich! Bitte bestätige deine E-Mail.');
  } catch (error) {
    errorMessage.textContent = `Fehler: ${error.message}`;
  }
});

// Login-Funktion
loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Benutzer erfolgreich eingeloggt, zeige Profilbereich
    loggedInArea.style.display = 'block';
    loggedOutArea.style.display = 'none';
    fetchServices(); // Lade Dienstleistungen des Nutzers
  } catch (error) {
    errorMessage.textContent = `Fehler: ${error.message}`;
  }
});

// Dienstleistung hinzufügen
offerServiceForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const serviceName = document.getElementById('serviceName').value;
  const serviceDescription = document.getElementById('serviceDescription').value;

  try {
    const user = supabase.auth.user();
    if (!user) throw new Error('Du musst eingeloggt sein, um einen Service anzubieten.');

    // Dienstleistung in der "services"-Tabelle speichern
    const { data, error } = await supabase
      .from('services')
      .insert([{ user_id: user.id, name: serviceName, description: serviceDescription }]);

    if (error) throw error;

    alert('Dienstleistung erfolgreich hinzugefügt!');
    fetchServices(); // Lade die Dienstleistungen nach der Hinzufügung
  } catch (error) {
    errorMessage.textContent = `Fehler: ${error.message}`;
  }
});

// Dienstleistungen des Nutzers abrufen
async function fetchServices() {
  try {
    const user = supabase.auth.user();
    if (!user) return;

    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('user_id', user.id);

    if (error) throw error;

    // Dienstleistungsliste anzeigen
    serviceList.innerHTML = '';
    data.forEach((service) => {
      const li = document.createElement('li');
      li.textContent = `${service.name}: ${service.description}`;
      serviceList.appendChild(li);
    });
  } catch (error) {
    errorMessage.textContent = `Fehler beim Abrufen der Dienstleistungen: ${error.message}`;
  }
}

// Benutzer abmelden
async function logout() {
  await supabase.auth.signOut();
  loggedInArea.style.display = 'none';
  loggedOutArea.style.display = 'block';
}
