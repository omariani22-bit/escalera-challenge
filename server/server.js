const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'your-secret-key'; // Use an environment variable in production

app.use(cors({
  origin: process.env.VERCEL_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../client/build')));

// MongoDB connection
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

let db;

async function connectToDatabase() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    db = client.db('escalera_challenge'); // Your database name
    return db;
  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
    process.exit(1);
  }
}

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
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 8);

  try {
    const result = await db.collection('users').insertOne({ username, password: hashedPassword });
    const token = jwt.sign({ id: result.insertedId }, SECRET_KEY, { expiresIn: 86400 }); // 24 hours
    res.status(201).json({ auth: true, token });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'An error occurred during registration' });
  }
});

// Login user
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await db.collection('users').findOne({ username });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) return res.status(401).json({ auth: false, token: null });

    const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: 86400 }); // 24 hours
    res.json({ auth: true, token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'An error occurred during login' });
  }
});

// Protected route to log daily activity
app.post('/api/log', verifyToken, async (req, res) => {
  const { date, upstairs, downstairs, liftUsesUp, liftUsesDown } = req.body;
  try {
    const result = await db.collection('daily_logs').insertOne({
      userId: new ObjectId(req.userId),
      date,
      upstairs,
      downstairs,
      liftUsesUp,
      liftUsesDown
    });
    res.json({ id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// New endpoint to get all logs (only accessible by authenticated users)
app.get('/api/all-logs', verifyToken, async (req, res) => {
  try {
    const logs = await db.collection('daily_logs').aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      { $sort: { date: -1 } },
      {
        $project: {
          date: 1,
          upstairs: 1,
          downstairs: 1,
          liftUsesUp: 1,
          liftUsesDown: 1,
          username: '$user.username'
        }
      }
    ]).toArray();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Protected route to get user's logs
app.get('/api/logs', verifyToken, async (req, res) => {
  try {
    const logs = await db.collection('daily_logs').find({ userId: new ObjectId(req.userId) }).toArray();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => {
  res.json({ message: "Welcome to the Escalera Challenge API!" });
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// Connect to MongoDB before starting the server
connectToDatabase().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});