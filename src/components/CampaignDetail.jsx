import React, { useState } from 'react';
import { ArrowLeft, Layers, QrCode, Zap, BarChart2, Settings, RotateCcw, Sparkles, Image, Check, ExternalLink, Palette } from 'lucide-react';
import LinkStackEditor from './LinkStackEditor';
import QRCodeStudio from './QRCodeStudio';
import ScanSimulator from './ScanSimulator';
import AnalyticsView from './AnalyticsView';
import SplashCustomizer from './SplashCustomizer';
import { normalizeImageUrl } from '../utils/imageUtils';

export default function CampaignDetail({ campaign, onBack, onRefresh }) {
  const [activeTab, setActiveTab] = useState('stack');
  const [strategy, setStrategy] = useState(campaign.strategy || 'round_robin');
  const [redirectBehavior, setRedirectBehavior] = useState(campaign.redirectBehavior || 'splash_1s');

  const handleUpdateSettings = async (newStrategy, newBehavior) => {
    try {
      await fetch(`/api/campaigns/${campaign.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategy: newStrategy,
          redirectBehavior: newBehavior
        })
      });
      onRefresh();
    } catch (err) {
      console.error('Failed to update settings:', err);
    }
  };

  const handleStrategyChange = (e) => {
    const val = e.target.value;
    setStrategy(val);
    handleUpdateSettings(val, redirectBehavior);
  };

  const handleBehaviorChange = (e) => {
    const val = e.target.value;
    setRedirectBehavior(val);
    handleUpdateSettings(strategy, val);
  };

  return (
    <div>
      
      {/* Top Header Card */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button className="btn btn-secondary btn-sm" onClick={onBack}>
              <ArrowLeft size={16} /> Back
            </button>

            <img
              src={normalizeImageUrl(campaign.logoUrl || '/logo.jpg')}
              alt="Logo"
              onError={(e) => { e.currentTarget.src = '/logo.jpg'; }}
              style={{ width: '48px', height: '48px', borderRadius: '12px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.2)' }}
            />

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: '800', margin: 0, color: '#fff' }}>{campaign.title}</h2>
                <span className="badge badge-indigo">
                  /r/{campaign.shortCode}
                </span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>
                {campaign.description || 'Sequential QR redirect campaign.'}
              </p>
            </div>
          </div>

          {/* Quick Strategy & Behavior Selectors */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            
            <div>
              <label className="input-label" style={{ marginBottom: '2px', fontSize: '11px' }}>ALLOCATION STRATEGY</label>
              <select
                className="input-field"
                style={{ padding: '6px 12px', fontSize: '13px', fontWeight: '600' }}
                value={strategy}
                onChange={handleStrategyChange}
              >
                <option value="round_robin">🔄 Round-Robin (1 → 2 → 3 → 4 → 5 → 1)</option>
                <option value="weighted">⚖️ Weighted Percentage</option>
                <option value="random">🎲 Equal Random</option>
              </select>
            </div>

            <div>
              <label className="input-label" style={{ marginBottom: '2px', fontSize: '11px' }}>REDIRECT EXPERIENCE</label>
              <select
                className="input-field"
                style={{ padding: '6px 12px', fontSize: '13px', fontWeight: '600' }}
                value={redirectBehavior}
                onChange={handleBehaviorChange}
              >
                <option value="splash_1s">✨ Logo Splash Screen (Customizable)</option>
                <option value="instant_302">⚡ Instant HTTP 302 Direct Redirect</option>
              </select>
            </div>

          </div>

        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button
          className={`btn ${activeTab === 'stack' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('stack')}
        >
          <Layers size={16} /> Link Stack ({campaign.links ? campaign.links.length : 0})
        </button>

        <button
          className={`btn ${activeTab === 'splash' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('splash')}
        >
          <Palette size={16} /> Customize Redirect Screen
        </button>

        <button
          className={`btn ${activeTab === 'qr' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('qr')}
        >
          <QrCode size={16} /> QR Code Studio
        </button>

        <button
          className={`btn ${activeTab === 'simulator' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('simulator')}
        >
          <Zap size={16} /> Scan Simulator
        </button>

        <button
          className={`btn ${activeTab === 'analytics' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('analytics')}
        >
          <BarChart2 size={16} /> Analytics & Logs
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'stack' && (
        <LinkStackEditor campaign={campaign} onUpdateCampaign={handleUpdateSettings} onRefresh={onRefresh} />
      )}

      {activeTab === 'splash' && (
        <SplashCustomizer campaign={campaign} onRefresh={onRefresh} />
      )}

      {activeTab === 'qr' && (
        <QRCodeStudio campaign={campaign} />
      )}

      {activeTab === 'simulator' && (
        <ScanSimulator campaign={campaign} onRefresh={onRefresh} />
      )}

      {activeTab === 'analytics' && (
        <AnalyticsView campaign={campaign} />
      )}

    </div>
  );
}
