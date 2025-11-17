const express = require('express');
const path = require('path');
const compression = require('compression');

const app = express();
app.use(compression());
app.use(express.json());

// API example
app.get('/api/health', (req, res) => res.json({ ok: true, ts: Date.now() }));

// Serve static built client when in production
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath, { maxAge: '1d' }));

// fallback to index.html (SPA)
app.get('*', (req, res) => {
  const index = path.join(distPath, 'index.html');
  res.sendFile(index, (err) => {
    if (err) res.status(500).send(err.message);
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));
