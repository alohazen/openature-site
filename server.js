const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';
const ROOT_DIR = __dirname;
const BASE_PATH = '/openature-site';

const BLOCKED_PREFIXES = [
  '/server.js',
  '/package.json',
  '/package-lock.json',
  '/node_modules',
];

function blockServerFiles(req, res, next) {
  const normalized = req.path.toLowerCase();
  if (
    BLOCKED_PREFIXES.some(
      (prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`)
    )
  ) {
    return res.status(404).sendFile(path.join(ROOT_DIR, '404.html'));
  }
  next();
}

const staticOptions = {
  dotfiles: 'ignore',
  extensions: ['html'],
  redirect: true,
};

// Prevent exposing server/package files at either root or basePath
app.use(blockServerFiles);
app.use(BASE_PATH, blockServerFiles);

// Serve static Next.js export at its configured GitHub Pages basePath
app.use(BASE_PATH, express.static(ROOT_DIR, staticOptions));

// Also serve static files at root so the preview loads directly at /
app.use(express.static(ROOT_DIR, staticOptions));

// Serve the exported 404 page for unmatched routes
app.use((req, res) => {
  const notFoundPath = path.join(ROOT_DIR, '404.html');
  if (fs.existsSync(notFoundPath)) {
    return res.status(404).sendFile(notFoundPath);
  }
  return res.status(404).send('Not Found');
});

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});
