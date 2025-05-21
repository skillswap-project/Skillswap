// Supabase-Konfiguration
const supabaseUrl = 'https://hmqzpwvofjvrlvkjwvgf.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtcXpwd3ZvZmp2cmx2a2p3dmdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMjQ5MzksImV4cCI6MjA2MjgwMDkzOX0.RxhzSRQ4MC_McVrBvS2o2WyPyFegidWwnN5N6m8qXF8' 
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const authSection = document.getElementById("auth-section");
const profileSection = document.getElementById("profile-section");
const searchSection = document.getElementById("search-section");

const nameInput = document.getElementById("name");
const ageInput = document.getElementById("age");
const locationInput = document.getElementById("location");
const skillsInput = document.getElementById("skills");
const avatarInput = document.getElementById("avatar_url");
const saveProfileBtn = document.getElementById("save-profile-btn");

const searchInput = document.getElementById("search-skill");
const searchBtn = document.getElementById("search-btn");
const resultsDiv = document.getElementById("results");

loginBtn.addEventListener("click", async () => {
  const { user, error } = await supabase.auth.signInWithPassword({
    email: emailInput.value,
    password: passwordInput.value
  });

  if (!user && error?.message.includes("Invalid login")) {
    await supabase.auth.signUp({
      email: emailInput.value,
      password: passwordInput.value
    });
  }

  checkAuth();
});

logoutBtn.addEventListener("click", async () => {
  await supabase.auth.signOut();
  location.reload();
});

saveProfileBtn.addEventListener("click", async () => {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return;

  const { data, error } = await supabase.from("profiles").upsert({
    id: user.id,
    name: nameInput.value,
    age: parseInt(ageInput.value),
    location: locationInput.value,
    skills: skillsInput.value.split(",").map(s => s.trim()),
    avatar_url: avatarInput.value
  });

  alert("Profil gespeichert!");
});

searchBtn.addEventListener("click", async () => {
  const search = searchInput.value.toLowerCase();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .contains("skills", [search]);

  resultsDiv.innerHTML = "";
  data.forEach(profile => {
    const card = document.createElement("div");
    card.className = "profile-card";
    card.innerHTML = `
      <img src="${profile.avatar_url}" alt="Avatar" style="width:100px;height:100px;">
      <h3>${profile.name}</h3>
      <p>Alter: ${profile.age}</p>
      <p>Ort: ${profile.location}</p>
      <p>Talente: ${profile.skills.join(", ")}</p>
    `;
    resultsDiv.appendChild(card);
  });
});

async function checkAuth() {
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  if (user) {
    authSection.classList.add("hidden");
    profileSection.classList.remove("hidden");
    searchSection.classList.remove("hidden");
  }
}

checkAuth();
