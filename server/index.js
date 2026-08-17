import express from 'express';
import cors from 'cors';
import path from 'path';
import os from 'os';
import QRCode from 'qrcode';
import { fileURLToPath } from 'url';
import { db } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve static assets from public folder
app.use('/public', express.static(path.join(__dirname, '../public')));
app.use('/logo.jpg', express.static(path.join(__dirname, '../public/logo.jpg')));

// Serve React production build if available
app.use(express.static(path.join(__dirname, '../dist')));


// ----------------------------------------------------
// PUBLIC REDIRECT ROUTE /r/:code
// ----------------------------------------------------
app.get('/r/:code', (req, res) => {
  const code = req.params.code;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || 'Web Browser';

  const result = db.getNextLinkAndAllocate(code, { ip, userAgent });

  if (result.error) {
    return res.status(404).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Link Rotator Error</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { background: #0b0f19; color: #f3f4f6; font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
            .card { background: rgba(31, 41, 55, 0.7); border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(12px); border-radius: 16px; padding: 32px; text-align: center; max-width: 420px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
            h2 { color: #f87171; margin-top: 0; }
            p { color: #9ca3af; font-size: 15px; }
            a { color: #60a5fa; text-decoration: none; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>⚠️ Rotator Error</h2>
            <p>${result.error}</p>
            <a href="/">Go to Dashboard</a>
          </div>
        </body>
      </html>
    `);
  }

  const { campaign, selectedLink, scanIndex, positionInCycle, totalInCycle } = result;

  // Check redirect behavior
  if (campaign.redirectBehavior === 'instant_302') {
    return res.redirect(302, selectedLink.url);
  }

  // DEFAULT: Render Customized Logo Splash screen
  const splash = campaign.splashSettings || {};
  const logoSrc = normalizeImageUrl(splash.logoUrl || campaign.logoUrl || '/logo.jpg');
  const headlineText = splash.headline || campaign.splashMessage || campaign.title || 'Allocating your webpage...';
  const subtextText = splash.subtext || 'Opening your assigned destination link';
  const delaySec = Number(splash.delaySeconds) || 1.0;
  const delayMs = Math.round(delaySec * 1000);
  const themeKey = splash.theme || 'dark_cyber';
  const showBadge = splash.showBadge !== false;
  const showTargetPill = splash.showTargetPill !== false;
  const showProgressBar = splash.showProgressBar !== false;
  const showLogo = splash.showLogo !== false;

  const themes = {
    dark_cyber: { bg: '#090d16', accent: '#6366f1', text: '#f9fafb', cardBg: 'rgba(17, 24, 39, 0.85)', glow: 'rgba(99, 102, 241, 0.4)' },
    midnight_purple: { bg: '#110c24', accent: '#a855f7', text: '#f3e8ff', cardBg: 'rgba(30, 20, 50, 0.85)', glow: 'rgba(168, 85, 247, 0.4)' },
    emerald_glass: { bg: '#061a14', accent: '#10b981', text: '#ecfdf5', cardBg: 'rgba(12, 38, 28, 0.85)', glow: 'rgba(16, 185, 129, 0.4)' },
    sunset_amber: { bg: '#1c0f0a', accent: '#f59e0b', text: '#fffbeb', cardBg: 'rgba(40, 20, 12, 0.85)', glow: 'rgba(245, 158, 11, 0.4)' },
    clean_light: { bg: '#f8fafc', accent: '#2563eb', text: '#0f172a', cardBg: '#ffffff', glow: 'rgba(37, 99, 235, 0.25)' }
  };
  const activeTheme = themes[themeKey] || themes.dark_cyber;

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Redirecting to ${escapeHtml(selectedLink.title)}</title>
        <!-- Immediate backup refresh meta after ${delaySec + 0.3}s -->
        <meta http-equiv="refresh" content="${delaySec + 0.3};url=${escapeHtml(selectedLink.url)}" />
        <style>
          :root {
            --bg-color: ${activeTheme.bg};
            --card-bg: ${activeTheme.cardBg};
            --accent: ${activeTheme.accent};
            --primary-glow: ${activeTheme.glow};
            --text-main: ${activeTheme.text};
            --text-muted: rgba(156, 163, 175, 0.9);
          }
          * { box-sizing: border-box; }
          body {
            background-color: var(--bg-color);
            background-image: 
              radial-gradient(at 0% 0%, ${activeTheme.glow} 0px, transparent 50%),
              radial-gradient(at 100% 100%, ${activeTheme.glow} 0px, transparent 50%);
            color: var(--text-main);
            font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
          }
          .splash-card {
            background: var(--card-bg);
            border: 1px solid rgba(255, 255, 255, 0.12);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border-radius: 24px;
            padding: 40px 32px;
            text-align: center;
            max-width: 440px;
            width: 100%;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px var(--primary-glow);
            animation: fadeIn 0.4s ease-out;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(12px) scale(0.97); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          .logo-wrapper {
            position: relative;
            width: 88px;
            height: 88px;
            margin: 0 auto 20px;
          }
          .logo-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 20px;
            border: 2px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 10px 25px var(--primary-glow);
            animation: pulse 1.5s infinite alternate ease-in-out;
          }
          @keyframes pulse {
            0% { transform: scale(1); box-shadow: 0 0 15px var(--primary-glow); }
            100% { transform: scale(1.05); box-shadow: 0 0 30px var(--primary-glow); }
          }
          .badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: rgba(99, 102, 241, 0.15);
            border: 1px solid ${activeTheme.accent};
            color: ${activeTheme.accent};
            padding: 6px 14px;
            border-radius: 9999px;
            font-size: 13px;
            font-weight: 600;
            margin-bottom: 16px;
            letter-spacing: 0.3px;
          }
          .title {
            font-size: 20px;
            font-weight: 700;
            margin: 0 0 8px;
            color: var(--text-main);
          }
          .subtext {
            color: var(--text-muted);
            font-size: 14px;
            margin: 0 0 24px;
          }
          .target-pill {
            background: rgba(255, 255, 255, 0.05);
            border: 1px dashed rgba(255, 255, 255, 0.2);
            padding: 12px 16px;
            border-radius: 12px;
            font-family: monospace;
            font-size: 13px;
            color: ${activeTheme.accent};
            margin-bottom: 24px;
            word-break: break-all;
          }
          .progress-bar-container {
            width: 100%;
            height: 6px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 9999px;
            overflow: hidden;
            margin-bottom: 20px;
          }
          .progress-bar {
            height: 100%;
            width: 0%;
            background: ${activeTheme.accent};
            border-radius: 9999px;
            animation: fillProgress ${delaySec}s linear forwards;
          }
          @keyframes fillProgress {
            0% { width: 0%; }
            100% { width: 100%; }
          }
          .redirect-link {
            font-size: 13px;
            color: var(--text-muted);
          }
          .redirect-link a {
            color: ${activeTheme.accent};
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="splash-card">
          ${showLogo ? `
            <div class="logo-wrapper">
              <img src="${escapeHtml(logoSrc)}" alt="Logo" class="logo-img" onerror="this.onerror=null; this.src='/logo.jpg';" />
            </div>
          ` : ''}

          ${showBadge ? `
            <div class="badge">
              ⚡ Visitor #${scanIndex} &nbsp;•&nbsp; Link ${positionInCycle} of ${totalInCycle}
            </div>
          ` : ''}

          <h1 class="title">${escapeHtml(headlineText)}</h1>
          <p class="subtext">${escapeHtml(subtextText)}</p>

          ${showTargetPill ? `
            <div class="target-pill">
              🎯 ${escapeHtml(selectedLink.title)}
            </div>
          ` : ''}

          ${showProgressBar ? `
            <div class="progress-bar-container">
              <div class="progress-bar"></div>
            </div>
          ` : ''}

          <div class="redirect-link">
            Opening webpage in ${delaySec} second${delaySec === 1 ? '' : 's'}... <br/>
            If not redirected, <a href="${escapeHtml(selectedLink.url)}" id="manualLink">click here</a>.
          </div>
        </div>

        <script>
          const targetUrl = ${JSON.stringify(selectedLink.url)};
          setTimeout(function() {
            window.location.href = targetUrl;
          }, ${delayMs});
        </script>
      </body>
    </html>
  `);
});

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function normalizeImageUrl(url) {
  if (!url) return '/logo.jpg';
  let trimmed = String(url).trim();
  if (trimmed.includes('drive.google.com')) {
    const matchFileD = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    const matchIdParam = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    const fileId = (matchFileD && matchFileD[1]) || (matchIdParam && matchIdParam[1]);
    if (fileId) {
      return `https://lh3.googleusercontent.com/d/${fileId}`;
    }
  }
  if (trimmed.includes('dropbox.com')) {
    return trimmed.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('?dl=0', '');
  }
  return trimmed;
}

// ----------------------------------------------------
// REST API ROUTES
// ----------------------------------------------------

// Get local network Wi-Fi IP address
app.get('/api/network-ip', (req, res) => {
  const localIp = getLocalIpAddress();
  const protocol = req.protocol || 'http';
  res.json({
    localIp,
    port: PORT,
    wifiUrl: `${protocol}://${localIp}:${PORT}`,
    localhostUrl: `${protocol}://localhost:${PORT}`
  });
});

// Get all campaigns
app.get('/api/campaigns', (req, res) => {
  res.json(db.getCampaigns());
});

// Get campaign detail
app.get('/api/campaigns/:id', (req, res) => {
  const campaign = db.getCampaignById(req.params.id);
  if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
  res.json(campaign);
});

// Create campaign
app.post('/api/campaigns', (req, res) => {
  const newCamp = db.createCampaign(req.body);
  res.status(201).json(newCamp);
});

// Update campaign
app.put('/api/campaigns/:id', (req, res) => {
  const updated = db.updateCampaign(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Campaign not found' });
  res.json(updated);
});

// Delete campaign
app.delete('/api/campaigns/:id', (req, res) => {
  const deleted = db.deleteCampaign(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Campaign not found' });
  res.json({ success: true });
});

// Add link to campaign
app.post('/api/campaigns/:id/links', (req, res) => {
  const campaign = db.getCampaignById(req.params.id);
  if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

  const { title, url, weight, maxScans } = req.body;
  const newLink = {
    id: 'link-' + Date.now(),
    title: title || `Webpage ${campaign.links.length + 1}`,
    url: url || 'https://example.com',
    active: true,
    clicks: 0,
    weight: Number(weight) || 1,
    maxScans: Number(maxScans) || 0
  };

  campaign.links.push(newLink);
  db.save();
  res.status(201).json(newLink);
});

// Update link
app.put('/api/campaigns/:id/links/:linkId', (req, res) => {
  const campaign = db.getCampaignById(req.params.id);
  if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

  const link = campaign.links.find((l) => l.id === req.params.linkId);
  if (!link) return res.status(404).json({ error: 'Link not found' });

  Object.assign(link, req.body);
  db.save();
  res.json(link);
});

// Delete link
app.delete('/api/campaigns/:id/links/:linkId', (req, res) => {
  const campaign = db.getCampaignById(req.params.id);
  if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

  const index = campaign.links.findIndex((l) => l.id === req.params.linkId);
  if (index === -1) return res.status(404).json({ error: 'Link not found' });

  campaign.links.splice(index, 1);
  db.save();
  res.json({ success: true });
});

// Reset campaign sequence & stats
app.post('/api/campaigns/:id/reset', (req, res) => {
  const campaign = db.resetSequence(req.params.id);
  if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
  res.json(campaign);
});

// Reorder links
app.post('/api/campaigns/:id/reorder', (req, res) => {
  const campaign = db.getCampaignById(req.params.id);
  if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

  const { linkIds } = req.body;
  if (Array.isArray(linkIds)) {
    const reordered = [];
    linkIds.forEach((id) => {
      const found = campaign.links.find((l) => l.id === id);
      if (found) reordered.push(found);
    });
    // Add any remaining
    campaign.links.forEach((l) => {
      if (!reordered.includes(l)) reordered.push(l);
    });
    campaign.links = reordered;
    db.save();
  }
  res.json(campaign);
});

// Simulate scan step
app.post('/api/campaigns/:id/simulate', (req, res) => {
  const result = db.getNextLinkAndAllocate(req.params.id, {
    ip: '127.0.0.1 (Simulator)',
    userAgent: 'Dashboard Simulator'
  });
  res.json(result);
});

// Server-side QR Code Data URL Generator
app.get('/api/campaigns/:id/qr', async (req, res) => {
  const campaign = db.getCampaignById(req.params.id);
  if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

  const protocol = req.protocol;
  const host = req.get('host');
  const redirectUrl = `${protocol}://${host}/r/${campaign.shortCode}`;

  try {
    const qrDataUrl = await QRCode.toDataURL(redirectUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    });
    res.json({ redirectUrl, qrDataUrl });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// Serve SPA fallback for non-API/non-redirect routes
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, '../dist/index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.send('QRoute Server is running! Run "npm run build" to serve the frontend dashboard here.');
  }
});

function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

// Start Express Server on 0.0.0.0 (Network Listening)
app.listen(PORT, '0.0.0.0', () => {
  const localIp = getLocalIpAddress();
  console.log(`\n🚀 QRoute Server running on shared network!`);
  console.log(`💻 Local Laptop:   http://localhost:${PORT}`);
  console.log(`📱 Shared Wi-Fi:   http://${localIp}:${PORT}`);
  console.log(`🔗 QR Target Link: http://${localIp}:${PORT}/r/demo5\n`);
});
