const express = require('express');
const path = require('path');

const app = express();
const PORT = 3333;

// Serve static files from project root
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`Evan Hunt for Congress — running at http://localhost:${PORT}`);
});
