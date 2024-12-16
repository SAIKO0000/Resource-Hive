const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Serve scheduleData.json
app.get('/scheduleData', (req, res) => {
  const filePath = path.join(__dirname, 'json', 'scheduleData.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error reading file');
    }
    res.json(JSON.parse(data));
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
