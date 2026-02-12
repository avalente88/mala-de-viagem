// server.js
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const Amadeus = require('amadeus');

const port = process.env.PORT || 3000;
const baseDir = process.cwd();

// ✅ Initialize Amadeus client with ENV VARS only (no inline secrets!)
const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_CLIENT_ID,
  clientSecret: process.env.AMADEUS_CLIENT_SECRET,
});

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const map = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.gif': 'image/gif',
  };
  return map[ext] || 'application/octet-stream';
}

// Simple helper to send JSON
function sendJSON(res, status, body, headers = {}) {
  res.writeHead(status, { 'Content-Type': 'application/json', ...headers });
  res.end(JSON.stringify(body));
}

// CORS helper (optionally restrict in production)
function setCORS(res) {
  res.setHeader('Access-Control-Allow-Origin', '*'); // ← replace with your domain in prod
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // ---- API: /api/flights ----------------------------------------------
  if (pathname === '/api/flights') {
    setCORS(res);
    if (req.method === 'OPTIONS') {
      // Preflight
      res.writeHead(204);
      return res.end();
    }
    if (req.method !== 'GET') {
      return sendJSON(res, 405, { error: 'Method not allowed' });
    }

    const { origin, destination, departureDate, adults = '1', max = '10' } = parsedUrl.query;

    // Basic validation
    if (!origin || !destination || !departureDate) {
      return sendJSON(res, 400, { error: 'origin, destination and departureDate are required' });
    }
    // Rudimentary IATA + date checks (you can enhance this)
    if (!/^[A-Z]{3}$/.test(String(origin)) || !/^[A-Z]{3}$/.test(String(destination))) {
      return sendJSON(res, 400, { error: 'origin and destination must be IATA 3-letter codes' });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(departureDate))) {
      return sendJSON(res, 400, { error: 'departureDate must be YYYY-MM-DD' });
    }

    // Ensure keys exist
    if (!process.env.AMADEUS_CLIENT_ID || !process.env.AMADEUS_CLIENT_SECRET) {
      return sendJSON(res, 500, { error: 'Server missing Amadeus credentials' });
    }

    try {
      const response = await amadeus.shopping.flightOffersSearch.get({
        originLocationCode: String(origin),
        destinationLocationCode: String(destination),
        departureDate: String(departureDate),
        adults: Number(adults) || 1,
        max: Number(max) || 10,
      });

      // Normalize to { data: [...] } for your front-end
      return sendJSON(res, 200, { data: response.result.data });
    } catch (e) {
      console.error('Amadeus search failed:', e?.response?.data || e?.message || e);
      return sendJSON(res, 500, { error: 'Flight search failed' });
    }
  }
  // ---------------------------------------------------------------------

  // Static files (your current logic)
  const safePath = path.normalize(decodeURIComponent(pathname.split('?')[0]));
  let filePath = path.join(baseDir, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err) {
      res.statusCode = 404;
      res.end('Not found');
      return;
    }
    if (stats.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }
    fs.readFile(filePath, (err2, data) => {
      if (err2) {
        res.statusCode = 500;
        res.end('Server error');
        return;
      }
      res.setHeader('Content-Type', getContentType(filePath));
      res.end(data);
    });
  });
});

server.listen(port, () => {
  console.log(`Static + API server running at http://localhost:${port}`);
});