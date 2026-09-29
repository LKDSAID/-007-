let token = null;
let username = null;

const $ = (id) => document.getElementById(id);

async function login() {
  const res = await fetch("/api/login", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      username: $("username").value.trim(),
      password: $("password").value
    })
  });
  const data = await res.json();
  if (!res.ok) {
    $("loginMsg").textContent = data.error || "Login failed";
    return;
  }
  token = data.token;
  username = data.username;
  $("loginBox").classList.add("hidden");
  $("app").classList.remove("hidden");
  $("who").textContent = username;
  await refreshMe();
}

async function refreshMe() {
  const res = await fetch("/api/me", {
    headers: { Authorization: "Bearer " + token }
  });
  const data = await res.json();
  if (!res.ok) return;
  render(data);
}

function render(data) {
  $("coins").textContent = data.coins;
  $("likes").textContent = data.likes;
  $("followers").textContent = data.followers;
  $("xp").textContent = data.xp;
  $("inventory").textContent = JSON.stringify(data.inventory, null, 2);
}

async function addLike() {
  const res = await fetch("/api/add-like", {
    method: "POST",
    headers: { Authorization: "Bearer " + token }
  });
  const data = await res.json();
  if (res.ok) $("likes").textContent = data.likes;
}

async function claimXp() {
  const res = await fetch("/api/claim-xp", {
    method: "POST",
    headers: { Authorization: "Bearer " + token }
  });
  const data = await res.json();
  if (res.ok) $("xp").textContent = data.xp;
}

async function compare() {
  const user = $("compareUser").value.trim();
  const res = await fetch("/api/public/" + encodeURIComponent(user));
  const data = await res.json();
  $("compareResult").textContent = JSON.stringify(data, null, 2);
}

function logout() {
  token = null;
  username = null;
  $("app").classList.add("hidden");
  $("loginBox").classList.remove("hidden");
  $("loginMsg").textContent = "";
}

window.addEventListener("load", () => {
  $("username").focus();
});