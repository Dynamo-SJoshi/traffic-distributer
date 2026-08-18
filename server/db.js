import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'data.json');

const DEFAULT_DATA = {
  accounts: [
    {
      passcode: '123456',
      createdAt: new Date().toISOString()
    }
  ],
  campaigns: [
    {
      id: 'quiz-allocator-demo',
      shortCode: 'demo5',
      passcode: '123456',
      title: 'Quiz Group Allocator (5 Links)',
      description: 'Distributes incoming QR scanners sequentially across 5 target webpages in round-robin order.',
      strategy: 'round_robin', // 'round_robin' | 'weighted' | 'random'
      redirectBehavior: 'splash_1s', // 'splash_1s' | 'instant_302'
      splashMessage: 'Allocating your webpage...',
      logoUrl: '/logo.jpg',
      splashSettings: {
        headline: 'Allocating your webpage...',
        subtext: 'Opening your assigned destination link',
        logoUrl: '/logo.jpg',
        delaySeconds: 1.0,
        theme: 'dark_cyber',
        showBadge: true,
        showTargetPill: true,
        showProgressBar: true,
        showLogo: true
      },
      sequenceCounter: 0,
      totalScans: 0,
      createdAt: new Date().toISOString(),
      links: [
        {
          id: 'link-1',
          title: 'Quiz Webpage 1 (General Knowledge)',
          url: 'https://example.com/quiz-1',
          active: true,
          clicks: 0,
          weight: 1,
          maxScans: 0 // 0 = unlimited
        },
        {
          id: 'link-2',
          title: 'Quiz Webpage 2 (Science & Tech)',
          url: 'https://example.com/quiz-2',
          active: true,
          clicks: 0,
          weight: 1,
          maxScans: 0
        },
        {
          id: 'link-3',
          title: 'Quiz Webpage 3 (History & Culture)',
          url: 'https://example.com/quiz-3',
          active: true,
          clicks: 0,
          weight: 1,
          maxScans: 0
        },
        {
          id: 'link-4',
          title: 'Quiz Webpage 4 (Logic & Puzzles)',
          url: 'https://example.com/quiz-4',
          active: true,
          clicks: 0,
          weight: 1,
          maxScans: 0
        },
        {
          id: 'link-5',
          title: 'Quiz Webpage 5 (Creative Arts)',
          url: 'https://example.com/quiz-5',
          active: true,
          clicks: 0,
          weight: 1,
          maxScans: 0
        }
      ],
      scanLogs: []
    }
  ]
};

class JSONDatabase {
  constructor() {
    this.data = { accounts: [], campaigns: [] };
    this.saveTimeout = null;
    this.dirty = false;
    this.init();
    this.setupExitHandlers();
  }

  init() {
    try {
      if (fs.existsSync(DB_PATH)) {
        const raw = fs.readFileSync(DB_PATH, 'utf-8');
        this.data = JSON.parse(raw);
        if (!this.data.accounts) {
          this.data.accounts = [{ passcode: '123456', createdAt: new Date().toISOString() }];
        }
        if (!this.data.campaigns) this.data.campaigns = [];
        
        // Ensure legacy campaigns have a passcode
        this.data.campaigns.forEach(c => {
          if (!c.passcode) c.passcode = '123456';
        });
      } else {
        this.data = DEFAULT_DATA;
        this.saveSync();
      }
    } catch (err) {
      console.error('Error reading JSON DB, initializing default data:', err);
      this.data = DEFAULT_DATA;
      this.saveSync();
    }
  }

  // Legacy save alias
  save() {
    this.scheduleSave(true);
  }

  // Synchronous immediate save (for campaign creation/deletion)
  saveSync() {
    try {
      if (this.saveTimeout) {
        clearTimeout(this.saveTimeout);
        this.saveTimeout = null;
      }
      fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2), 'utf-8');
      this.dirty = false;
    } catch (err) {
      console.error('Error saving DB synchronously:', err);
    }
  }

  // Optimized Debounced Asynchronous Save
  scheduleSave(immediate = false) {
    if (immediate) {
      this.saveSync();
      return;
    }

    this.dirty = true;
    if (!this.saveTimeout) {
      this.saveTimeout = setTimeout(() => {
        this.saveTimeout = null;
        if (this.dirty) {
          fs.writeFile(DB_PATH, JSON.stringify(this.data, null, 2), 'utf-8', (err) => {
            if (err) console.error('Error saving DB asynchronously:', err);
            else this.dirty = false;
          });
        }
      }, 1000);
    }
  }

  setupExitHandlers() {
    const saveOnExit = () => {
      if (this.dirty) {
        this.saveSync();
      }
    };
    process.on('SIGINT', () => { saveOnExit(); process.exit(0); });
    process.on('SIGTERM', () => { saveOnExit(); process.exit(0); });
  }

  // Passcode verification & account registration
  verifyOrRegisterPasscode(rawPasscode, isRegistering = false) {
    if (!rawPasscode) return { valid: false, error: 'Passcode is required' };
    const passcode = String(rawPasscode).trim();
    if (passcode.length !== 6) {
      return { valid: false, error: 'Passcode must be exactly 6 characters long' };
    }

    let account = this.data.accounts.find(a => a.passcode === passcode);

    if (!account) {
      if (isRegistering) {
        account = { passcode, createdAt: new Date().toISOString() };
        this.data.accounts.push(account);
        
        // Auto-create initial sample campaign for new account
        const sampleCamp = {
          id: 'camp-' + Date.now(),
          shortCode: passcode.toLowerCase() + '5',
          passcode: passcode,
          title: `Rotator Campaign (${passcode})`,
          description: 'Sequential QR allocator stack for your account.',
          strategy: 'round_robin',
          redirectBehavior: 'splash_1s',
          splashMessage: 'Allocating your webpage...',
          logoUrl: '/logo.jpg',
          splashSettings: {
            headline: 'Allocating your webpage...',
            subtext: 'Opening your assigned destination link',
            logoUrl: '/logo.jpg',
            delaySeconds: 1.0,
            theme: 'dark_cyber',
            showBadge: true,
            showTargetPill: true,
            showProgressBar: true,
            showLogo: true
          },
          sequenceCounter: 0,
          totalScans: 0,
          createdAt: new Date().toISOString(),
          links: [
            { id: 'link-1', title: 'Webpage 1', url: 'https://example.com/page-1', active: true, clicks: 0, weight: 1, maxScans: 0 },
            { id: 'link-2', title: 'Webpage 2', url: 'https://example.com/page-2', active: true, clicks: 0, weight: 1, maxScans: 0 },
            { id: 'link-3', title: 'Webpage 3', url: 'https://example.com/page-3', active: true, clicks: 0, weight: 1, maxScans: 0 },
            { id: 'link-4', title: 'Webpage 4', url: 'https://example.com/page-4', active: true, clicks: 0, weight: 1, maxScans: 0 },
            { id: 'link-5', title: 'Webpage 5', url: 'https://example.com/page-5', active: true, clicks: 0, weight: 1, maxScans: 0 }
          ],
          scanLogs: []
        };
        this.data.campaigns.push(sampleCamp);
        this.scheduleSave(true);
        return { valid: true, passcode, account, isNew: true };
      } else {
        return { valid: false, error: 'Passcode not registered yet. Click "Register New Account" to create it!' };
      }
    }

    return { valid: true, passcode, account, isNew: false };
  }

  getCampaigns(passcode) {
    if (!passcode) return [];
    return this.data.campaigns.filter((c) => (c.passcode || '123456') === passcode);
  }

  getCampaignById(idOrCode) {
    return this.data.campaigns.find(
      (c) => c.id === idOrCode || c.shortCode === idOrCode
    );
  }

  createCampaign(campaignData, passcode) {
    const pCode = passcode || '123456';
    const newCampaign = {
      id: campaignData.id || 'camp-' + Date.now(),
      shortCode: campaignData.shortCode || Math.random().toString(36).substring(2, 7),
      passcode: pCode,
      title: campaignData.title || 'New Rotator Campaign',
      description: campaignData.description || '',
      strategy: campaignData.strategy || 'round_robin',
      redirectBehavior: campaignData.redirectBehavior || 'splash_1s',
      splashMessage: campaignData.splashMessage || 'Allocating your webpage...',
      logoUrl: campaignData.logoUrl || '/logo.jpg',
      splashSettings: campaignData.splashSettings || {
        headline: 'Allocating your webpage...',
        subtext: 'Opening your assigned destination link',
        logoUrl: '/logo.jpg',
        delaySeconds: 1.0,
        theme: 'dark_cyber',
        showBadge: true,
        showTargetPill: true,
        showProgressBar: true,
        showLogo: true
      },
      sequenceCounter: 0,
      totalScans: 0,
      createdAt: new Date().toISOString(),
      links: campaignData.links || [],
      scanLogs: []
    };
    this.data.campaigns.push(newCampaign);
    this.scheduleSave(true);
    return newCampaign;
  }

  updateCampaign(id, updateData) {
    const campaign = this.getCampaignById(id);
    if (!campaign) return null;
    Object.assign(campaign, updateData);
    this.scheduleSave(true);
    return campaign;
  }

  deleteCampaign(id) {
    const index = this.data.campaigns.findIndex((c) => c.id === id);
    if (index !== -1) {
      this.data.campaigns.splice(index, 1);
      this.scheduleSave(true);
      return true;
    }
    return false;
  }

  // Next link calculator & scan event recorder (HIGH THROUGHPUT IN-MEMORY ALLOCATION)
  getNextLinkAndAllocate(idOrCode, visitorInfo = {}) {
    const campaign = this.getCampaignById(idOrCode);
    if (!campaign) return { error: 'Campaign not found' };

    // Get active links
    const activeLinks = campaign.links.filter(
      (l) => l.active && (l.maxScans <= 0 || l.clicks < l.maxScans)
    );

    if (activeLinks.length === 0) {
      return { error: 'No active links available in this campaign' };
    }

    let selectedLink = null;
    let assignedIndex = 0;

    if (campaign.strategy === 'round_robin') {
      const currentCounter = campaign.sequenceCounter || 0;
      assignedIndex = currentCounter % activeLinks.length;
      selectedLink = activeLinks[assignedIndex];
      campaign.sequenceCounter = currentCounter + 1;
    } else if (campaign.strategy === 'weighted') {
      const totalWeight = activeLinks.reduce((sum, l) => sum + (l.weight || 1), 0);
      let rand = Math.random() * totalWeight;
      for (let i = 0; i < activeLinks.length; i++) {
        rand -= (activeLinks[i].weight || 1);
        if (rand <= 0) {
          selectedLink = activeLinks[i];
          assignedIndex = i;
          break;
        }
      }
      if (!selectedLink) {
        selectedLink = activeLinks[0];
        assignedIndex = 0;
      }
      campaign.sequenceCounter = (campaign.sequenceCounter || 0) + 1;
    } else {
      assignedIndex = Math.floor(Math.random() * activeLinks.length);
      selectedLink = activeLinks[assignedIndex];
      campaign.sequenceCounter = (campaign.sequenceCounter || 0) + 1;
    }

    // Update link clicks & total scans in RAM
    selectedLink.clicks = (selectedLink.clicks || 0) + 1;
    campaign.totalScans = (campaign.totalScans || 0) + 1;

    const scanIndex = campaign.totalScans;
    const positionInCycle = (assignedIndex + 1);
    const totalInCycle = activeLinks.length;

    // Log scan record (keep latest 200 logs)
    const logEntry = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      timestamp: new Date().toISOString(),
      scanIndex,
      assignedIndex: positionInCycle,
      linkId: selectedLink.id,
      linkTitle: selectedLink.title,
      targetUrl: selectedLink.url,
      ip: visitorInfo.ip || '127.0.0.1',
      userAgent: visitorInfo.userAgent || 'Web Scanner'
    };

    campaign.scanLogs.unshift(logEntry);
    if (campaign.scanLogs.length > 200) {
      campaign.scanLogs = campaign.scanLogs.slice(0, 200);
    }

    this.scheduleSave(false);

    return {
      campaign,
      selectedLink,
      scanIndex,
      positionInCycle,
      totalInCycle
    };
  }

  resetSequence(id) {
    const campaign = this.getCampaignById(id);
    if (!campaign) return null;
    campaign.sequenceCounter = 0;
    campaign.totalScans = 0;
    campaign.scanLogs = [];
    campaign.links.forEach((l) => (l.clicks = 0));
    this.scheduleSave(true);
    return campaign;
  }
}

export const db = new JSONDatabase();
