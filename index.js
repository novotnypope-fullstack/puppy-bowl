const BASE = "https://fsa-puppy-bowl.herokuapp.com/api";
const COHORT = "/2601-beatdump";
const API = BASE + COHORT;

let allPlayers = [];
let allTeams = [];
let selectedPlayer = null;

async function fetchAllPlayers() {
  try {
    const res = await fetch(`${API}/players`);
    const data = await res.json();
    allPlayers = data.data.players;
    render();
  } catch (err) {
    console.error("Error fetching players:", err);
  }
}

async function fetchAllTeams() {
  try {
    const res = await fetch(`${API}/teams`);
    const data = await res.json();
    allTeams = data.data.teams;
  } catch (err) {
    console.error("Error fetching teams:", err);
  }
}

async function fetchPlayerDetails(id) {
  try {
    const res = await fetch(`${API}/players/${id}`);
    const data = await res.json();
    selectedPlayer = data.data.player;
    render();
  } catch (err) {
    console.error("Error fetching player details:", err);
  }
}

async function removePlayer(id) {
  try {
    await fetch(`${API}/players/${id}`, { method: "DELETE" });
    selectedPlayer = null;
    await fetchAllPlayers();
  } catch (err) {
    console.error("Error removing player:", err);
  }
}

async function addPlayer(name, breed, teamId) {
  try {
    const body = { name, breed };
    if (teamId) body.teamId = teamId;
    
    await fetch(`${API}/players`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    await fetchAllPlayers();
    document.getElementById("addForm").reset();
  } catch (err) {
    console.error("Error adding player:", err);
  }
}

function getTeamName(teamId) {
  if (!teamId) return "Unassigned";
  const team = allTeams.find(t => t.id === teamId);
  return team ? team.name : "Unassigned";
}

function renderRoster() {
  return `
    <section id="roster">
      <h2>Roster</h2>
      <div id="players-list">
        ${allPlayers.map(player => `
          <div class="player-card" onclick="selectPlayer(${player.id})">
            <img src="${player.imageUrl}" alt="${player.name}" />
            <p>${player.name}</p>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function renderDetails() {
  if (!selectedPlayer) {
    return `<section id="details"><p>Select a player to see details</p></section>`;
  }
  
  return `
    <section id="details">
      <h2>${selectedPlayer.name}</h2>
      <img src="${selectedPlayer.imageUrl}" alt="${selectedPlayer.name}" />
      <p><strong>ID:</strong> ${selectedPlayer.id}</p>
      <p><strong>Breed:</strong> ${selectedPlayer.breed}</p>
      <p><strong>Status:</strong> ${selectedPlayer.status}</p>
      <p><strong>Team:</strong> ${getTeamName(selectedPlayer.teamId)}</p>
      <button onclick="removePlayerClick(${selectedPlayer.id})">Remove from roster</button>
    </section>
  `;
}

function renderForm() {
  return `
    <section id="form">
      <h2>Add Puppy</h2>
      <form id="addForm" onsubmit="handleFormSubmit(event)">
        <input type="text" id="name" placeholder="Name" required />
        <input type="text" id="breed" placeholder="Breed" required />
        <select id="team">
          <option value="">Unassigned</option>
          ${allTeams.map(team => `<option value="${team.id}">${team.name}</option>`).join("")}
        </select>
        <button type="submit">Add Puppy</button>
      </form>
    </section>
  `;
}

function render() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <header><h1>Puppy Bowl</h1></header>
    <main>
      ${renderRoster()}
      ${renderDetails()}
      ${renderForm()}
    </main>
  `;
}

function selectPlayer(id) {
  fetchPlayerDetails(id);
}

function removePlayerClick(id) {
  removePlayer(id);
}

function handleFormSubmit(e) {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const breed = document.getElementById("breed").value;
  const teamId = document.getElementById("team").value || null;
  addPlayer(name, breed, teamId);
}

async function init() {
  await fetchAllTeams();
  await fetchAllPlayers();
}

init();
