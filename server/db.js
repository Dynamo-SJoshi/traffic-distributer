import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'data.json');

const DEFAULT_DATA = {
  campaigns: [
    {
      id: 'quiz-allocator-demo',
      shortCode: 'demo5',
      title: 'Quiz Group Allocator (5 Links)',
      description: 'Distributes incoming QR scanners sequentially across 5 target webpages in round-robin order.',
      strategy: 'round_robin', // 'round_robin' | 'weighted' | 'random'
      redirectBehavior: 'splash_1s', // 'splash_1s' | 'instant_302'
      splashMessage: 'Allocating your webpage...',
      logoUrl: '/logo.jpg',
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
    this.data = { campaigns: [] };
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(DB_PATH)) {
        const raw = fs.readFileSync(DB_PATH, 'utf-8');
        this.data = JSON.parse(raw);
        if (!this.data.campaigns) this.data.campaigns = [];
      } else {
        this.data = DEFAULT_DATA;
        this.save();
      }
    } catch (err) {
      console.error('Error reading JSON DB, initializing default data:', err);
      this.data = DEFAULT_DATA;
      this.save();
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving DB:', err);
    }
  }

  getCampaigns() {
    return this.data.campaigns;
  }

  getCampaignById(idOrCode) {
    return this.data.campaigns.find(
      (c) => c.id === idOrCode || c.shortCode === idOrCode
    );
  }

  createCampaign(campaignData) {
    const newCampaign = {
      id: campaignData.id || 'camp-' + Date.now(),
      shortCode: campaignData.shortCode || Math.random().toString(36).substring(2, 7),
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
    this.save();
    return newCampaign;
  }

  updateCampaign(id, updateData) {
    const campaign = this.getCampaignById(id);
    if (!campaign) return null;
    Object.assign(campaign, updateData);
    this.save();
    return campaign;
  }

  deleteCampaign(id) {
    const index = this.data.campaigns.findIndex((c) => c.id === id);
    if (index !== -1) {
      this.data.campaigns.splice(index, 1);
      this.save();
      return true;
    }
    return false;
  }

  // Next link calculator & scan event recorder
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
      // Weighted distribution calculation
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
      // Random
      assignedIndex = Math.floor(Math.random() * activeLinks.length);
      selectedLink = activeLinks[assignedIndex];
      campaign.sequenceCounter = (campaign.sequenceCounter || 0) + 1;
    }

    // Update link clicks & total scans
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

    this.save();

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
    this.save();
    return campaign;
  }
}

export const db = new JSONDatabase();
