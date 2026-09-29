const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Demo server-side data. Restarting the server resets it.
const accounts = {
  alice: { password: "alice123", coins: 100, likes: 7, followers: 12, xp: 250, inventory: ["Starter Sword"] },
  bob:   { password: "bob123",   coins: 500, likes: 20, followers: 31, xp: 800, inventory: ["Blue Shield"] }
};

const sessions = new Map();

function getAccount(req) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  const username = sessions.get(token);
  return username ? accounts[username] : null;
}

app.post("/api/login", (req, res) => {
  const { username, password } = req.body || {};
  const account = accounts[username];
  if (!account || account.password !== password) {
    return res.status(401).json({ error: "Invalid username or password" });
  }
  const token = Math.random().toString(36).slice(2) + Date.now().toString(36);
  sessions.set(token, username);
  res.json({ token, username });
});

app.get("/api/me", (req, res) => {
  const account = getAccount(req);
  if (!account) return res.status(401).json({ error: "Not logged in" });

  res.json({
    coins: account.coins,
    likes: account.likes,
    followers: account.followers,
    xp: account.xp,
    inventory: account.inventory
  });
});

// Safe demo operation: the server decides the amount.
app.post("/api/add-like", (req, res) => {
  const account = getAccount(req);
  if (!account) return res.status(401).json({ error: "Not logged in" });

  account.likes += 1;
  res.json({ likes: account.likes });
});

// Intentionally demonstrates a server-side validation boundary.
// The client cannot choose an arbitrary amount here.
app.post("/api/claim-xp", (req, res) => {
  const account = getAccount(req);
  if (!account) return res.status(401).json({ error: "Not logged in" });

  account.xp += 10;
  res.json({ xp: account.xp });
});

// Returns a server-controlled copy for comparison.
app.get("/api/public/:username", (req, res) => {
  const account = accounts[req.params.username];
  if (!account) return res.status(404).json({ error: "Account not found" });

  res.json({
    username: req.params.username,
    coins: account.coins,
    likes: account.likes,
    followers: account.followers,
    xp: account.xp,
    inventory: account.inventory
  });
});

app.listen(PORT, () => {
  console.log(`Test site running on http://localhost:${PORT}`);
});