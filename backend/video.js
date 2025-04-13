const express = require('express');
const cors = require('cors');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure CORS with options to allow x-auth-token header
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization', 'x-auth-token']
}));

app.use(express.static(path.join(__dirname, 'public')));



// Server başlat
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
