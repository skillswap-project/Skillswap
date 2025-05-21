// Supabase Setup
const supabaseUrl = 'https://hmqzpwvofjvrlvkjwvgf.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtcXpwd3ZvZmp2cmx2a2p3dmdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMjQ5MzksImV4cCI6MjA2MjgwMDkzOX0.RxhzSRQ4MC_McVrBvS2o2WyPyFegidWwnN5N6m8qXF8' 
const client = window.supabase.createClient(supabaseUrl, supabaseKey);

// Elemente
const email = document.getElementById("email");
const password = document.getElementById("password");
const loginBtn = document.getElementById("login-btn");
const registerBtn = document.getElementById("register-btn");
const logoutBtn = document.getElementById("logout-btn");

const authSection = document.getElementById("auth-section");
const profileSection = document.getElementById("profile-section");
const searchSection = document.getElementById("search-section");

const nameInput = document.getElementById("name");
const ageInput = document.getElementById("age");
const locationInput = document.getElementById("location");
const skillsInput = document.getElementById("skills");
const avatarInput = document.getElementById("avatar_url");

const saveBtn = document.getElementById("save-profile-btn");
const searchBtn = document.getElementById("search-btn");
const searchInput = document.getElementById("search-skill");
const resultsDiv = document.getElementById("results");

// Login
loginBtn.addEventListener("click", async () => {
  const { error } = await client.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  });

  if (error) {
    alert("Login fehlgeschlagen: " + error.message);
  } else {
    checkAuth();
  }
});

// Registrierung
registerBtn.addEventListener("click", async () => {
  const { error } = await client.auth.signUp({
    email: email.value,
    password: password.value,
  });

  if (error) {
    alert("Registrierung fehlgeschlagen: " + error.message);
  } else {
    alert("Registrierung erfolgreich! Du kannst dich jetzt einloggen.");
  }
});

// Logout
logoutBtn.addEventListener("click", async () => {
  await client.auth.signOut();
  location.reload();
});

// Profil speichern
saveBtn.addEventListener("click", async () => {
  const user = (await client.auth.getUser()).data.user;
  if (!user) return;

  const { error } = await client.from("profiles").upsert({
    id: user.id,
    name: nameInput.value,
    age: parseInt(ageInput.value),
    location: locationInput.value,
    skills: skillsInput.value.split(",").map(s => s.trim()),
    avatar_url: avatarInput.value || "https://via.placeholder.com/80"
  });

  if (error) {
    alert("Fehler beim Speichern: " + error.message);
  } else {
    alert("Profil gespeichert!");
  }
});

// Suche nach Skills
searchBtn.addEventListener("click", async () => {
  const searchTerm = searchInput.value.toLowerCase();
  const { data, error } = await client
    .from("profiles")
    .select("*")
    .contains("skills", [searchTerm]);

  resultsDiv.innerHTML = "";
  if (error) {
    resultsDiv.textContent = "Fehler bei der Suche.";
    return;
  }

  data.forEach(profile => {
    const card = document.createElement("div");
    card.className = "profile-card";
    card.innerHTML = `
      <img src="${profile.avatar_url || "https://via.placeholder.com/80"}" alt="Avatar">
      <div>
        <h3>${profile.name}</h3>
        <p>Alter: ${profile.age || "-"}</p>
        <p>Ort: ${profile.location || "-"}</p>
        <p>Talente: ${profile.skills?.join(", ")}</p>
      </div>
    `;
    resultsDiv.appendChild(card);
  });
});

// Auth-Status prüfen
async function checkAuth() {
  const { data } = await client.auth.getSession();
  const user = data.session?.user;

  if (user) {
    authSection.classList.add("hidden");
    profileSection.classList.remove("hidden");
    searchSection.classList.remove("hidden");
    logoutBtn.classList.remove("hidden");
  }
}

checkAuth();
