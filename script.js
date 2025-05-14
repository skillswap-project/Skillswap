// Deine Supabase URL und Anonymer API-Schlüssel
const SUPABASE_URL = 'https://hmqzpwvofjvrlvkjwvgf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtcXpwd3ZvZmp2cmx2a2p3dmdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMjQ5MzksImV4cCI6MjA2MjgwMDkzOX0.RxhzSRQ4MC_McVrBvS2o2WyPyFegidWwnN5N6m8qXF8';

// Supabase Initialisierung
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Das Formular und die Felder für die Benutzerregistrierung
const signupForm = document.getElementById('signupForm');
const emailField = document.getElementById('email');
const passwordField = document.getElementById('password');
const errorMessage = document.getElementById('errorMessage');

// Formularverarbeitung
signupForm.addEventListener('submit', async (event) => {
  event.preventDefault(); // Verhindert das automatische Absenden des Formulars

  // Die E-Mail und das Passwort aus den Formularfeldern holen
  const email = emailField.value;
  const password = passwordField.value;

  // Fehlernachricht zurücksetzen
  errorMessage.textContent = '';

  try {
    // Registrierung über Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    // Fehlerbehandlung
    if (error) {
      throw error;
    }

    // Erfolgreiche Registrierung
    alert('Registrierung erfolgreich! Bitte überprüfe deine E-Mails, um den Account zu bestätigen.');
    console.log('Erfolgreiche Registrierung:', data);
  } catch (error) {
    // Fehler im Falle eines Fehlers
    errorMessage.textContent = `Fehler: ${error.message}`;
    console.error('Fehler bei der Registrierung:', error);
  }
});
