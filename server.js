import express from 'express';
import { fileURLToPath } from 'node:url';
import { issuesRouter } from './routes/issues.js';

const app = express();

// Middleware: parse JSON request bodies into req.body
app.use(express.json());

// Health check — used by Docker HEALTHCHECK and Kubernetes probes later
app.get('/healthz', (req, res) => {
  res.json({ status: 'ok' });
});

// API routes
app.use('/api/issues', issuesRouter);

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Central error handler (500)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;

// Export the app so tests (week 11) can import it without binding a port
export { app };

// Only start listening when this file is run directly (not when imported)
export function start(port = PORT) {
  return app.listen(port, () => {
    console.log(`Issue Tracker API listening on http://localhost:${port}`);
  });
}

if (process.argv[1] && process.argv[1] === fileURLToPath(import.meta.url)) {
  start();
}
