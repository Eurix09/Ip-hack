const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const DATA_FILE = 'data.json';

// Load existing data from file
let userData = [];
try {
  if (fs.existsSync(DATA_FILE)) {
    userData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  }
} catch (error) {
  console.error('Error reading data.json:', error);
}

// Middleware to log IP addresses
app.use((req, res, next) => {
  console.log('Request IP:', req.ip);
  next();
});

// Endpoint to retrieve and store user IP
app.get('/', (req, res) => {
  const userIp = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
  const timestamp = new Date().toISOString();

  // Check if the IP already exists in the data
  const ipExists = userData.some(entry => entry.ip === userIp);
  if (!ipExists) {
    userData.push({ ip: userIp, timestamp });

    // Save updated userData to data.json
    fs.writeFile(DATA_FILE, JSON.stringify(userData, null, 2), (err) => {
      if (err) {
        console.error('Error writing to data.json:', err);
      }
    });
  } else {
    console.log(`IP ${userIp} is already recorded.`);
  }

  res.send(userIp);
});

// Endpoint to serve the IP list
app.get('/iplist', (req, res) => {
  res.sendFile(path.join(__dirname, DATA_FILE));
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});