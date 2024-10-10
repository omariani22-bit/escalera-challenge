const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
const SECRET_KEY = 'your-secret-key'; // In a real app, use an environment variable

app.use(cors({
  origin: process.env.VERCEL_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(bodyParser.json());
// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/build')));

// Connect to SQLite database
const db = new sqlite3.Database(path.join(__dirname, 'stair_challenge.db'), (err) => {
  if (err) {
    console.error('Error opening database', err);
  } else {
    console.log('Connected to the SQLite database.');
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS daily_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      date TEXT,
      upstairs INTEGER,
      downstairs INTEGER,
      lift_uses_up INTEGER,
      lift_uses_down INTEGER,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`);
  }
});

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ error: 'No token provided' });

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(500).json({ error: 'Failed to authenticate token' });
    req.userId = decoded.id;
    next();
  });
};

// Register user
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 8);

  db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    const token = jwt.sign({ id: this.lastID }, SECRET_KEY, { expiresIn: 86400 }); // 24 hours
    res.status(201).json({ auth: true, token });
  });
});

// Login user
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) return res.status(401).json({ auth: false, token: null });

    const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: 86400 }); // 24 hours
    res.json({ auth: true, token });
  });
});

// Protected route to log daily activity
app.post('/api/log', verifyToken, (req, res) => {
  const { date, upstairs, downstairs, liftUsesUp, liftUsesDown } = req.body;
  db.run(
    `INSERT INTO daily_logs (user_id, date, upstairs, downstairs, lift_uses_up, lift_uses_down) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [req.userId, date, upstairs, downstairs, liftUsesUp, liftUsesDown],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

// New endpoint to get all logs (only accessible by authenticated users)
app.get('/api/all-logs', verifyToken, (req, res) => {
  db.all(`
    SELECT daily_logs.*, users.username 
    FROM daily_logs 
    JOIN users ON daily_logs.user_id = users.id 
    ORDER BY date DESC
  `, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Protected route to get user's logs
app.get('/api/logs', verifyToken, (req, res) => {
  db.all('SELECT * FROM daily_logs WHERE user_id = ?', [req.userId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/', (req, res) => {
  res.json({ message: "Welcome to the Escalera Challenge API!" });
});

// The catchall handler
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});