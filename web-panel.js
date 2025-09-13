const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
require('dotenv').config();

const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme';
const app = express();
app.use(bodyParser.json());

// ensure directories
const tokensDir = path.join(__dirname, 'tokens');
const botsDir = path.join(__dirname, 'bots');
if (!fs.existsSync(tokensDir)) fs.mkdirSync(tokensDir, { recursive: true });
if (!fs.existsSync(botsDir)) fs.mkdirSync(botsDir, { recursive: true });

// Simple auth middleware
function auth(req, res, next) {
  const pw = req.headers['x-admin-password'] || req.body.adminPassword || req.query.adminPassword;
  if (pw && pw === ADMIN_PASSWORD) return next();
  return res.status(401).json({ success: false, message: 'Unauthorized' });
}

// helper to run shell commands
function run(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, { maxBuffer: 1024 * 500 }, (err, stdout, stderr) => {
      if (err) return reject({ err, stderr });
      resolve({ stdout, stderr });
    });
  });
}

// List PM2 bots (processes)
app.get('/api/bots', auth, async (req, res) => {
  try {
    const result = await run('pm2 jlist || true');
    let procs = [];
    try { procs = JSON.parse(result.stdout || '[]'); } catch(e) { procs = []; }
    const bots = procs.map(p => ({
      name: p.name,
      pm_id: p.pm_id,
      status: p.pm2_env?.status,
      uptime: p.pm2_env?.pm_uptime,
    }));
    res.json({ success: true, bots });
  } catch (e) {
    res.status(500).json({ success: false, error: String(e) });
  }
});

// Create a new bot: body { name, token }
app.post('/api/bots', auth, async (req, res) => {
  const { name, token } = req.body;
  if (!name || !token) return res.status(400).json({ success: false, message: 'name and token required' });

  try {
    // 1. store token securely (file not committed)
    const tokenPath = path.join(tokensDir, `${name}.token`);
    fs.writeFileSync(tokenPath, token, { mode: 0o600 });

    // 2. create bot file from template (bots/<name>.js)
    const templatePath = path.join(__dirname, 'bots', 'template-bot.js');
    const newBotPath = path.join(botsDir, `${name}.js`);
    if (!fs.existsSync(templatePath)) {
      return res.status(500).json({ success: false, message: 'Template bot not found. Add bots/template-bot.js to repo.' });
    }
    let tpl = fs.readFileSync(templatePath, 'utf8');
    tpl = tpl.replace(/__BOT_NAME__/g, name);
    fs.writeFileSync(newBotPath, tpl, { mode: 0o644 });

    // 3. Start with PM2 (the bot reads token from tokens/<name>.token)
    await run(`pm2 start ${newBotPath} --name "${name}" --update-env || pm2 start ${newBotPath} --name "${name}"`);
    await run('pm2 save || true');

    res.json({ success: true, message: `Bot ${name} created and started` });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// Control endpoints
app.post('/api/bots/:name/:action', auth, async (req, res) => {
  const { name, action } = req.params;
  if (!['start', 'stop', 'restart', 'delete'].includes(action)) return res.status(400).json({ success: false, message: 'invalid action' });
  try {
    if (action === 'delete') {
      // stop and remove pm2, delete bot file and token
      await run(`pm2 stop "${name}" || true`);
      await run(`pm2 delete "${name}" || true`);
      const botFile = path.join(botsDir, `${name}.js`);
      const tokenFile = path.join(tokensDir, `${name}.token`);
      if (fs.existsSync(botFile)) fs.unlinkSync(botFile);
      if (fs.existsSync(tokenFile)) fs.unlinkSync(tokenFile);
      await run('pm2 save || true');
      return res.json({ success: true, message: `Bot ${name} deleted` });
    } else {
      await run(`pm2 ${action} "${name}"`);
      return res.json({ success: true, message: `Action ${action} executed on ${name}` });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// Simple health check
app.get('/api/health', (req, res) => res.json({ success: true, time: Date.now() }));

// Start server
app.listen(PORT, () => {
  console.log(`Web panel running on http://localhost:${PORT} (set ADMIN_PASSWORD in .env)`);
});
