import React from 'react';
import { QrCode, Plus, Layers, Zap, Activity } from 'lucide-react';

export default function Navbar({ campaigns = [], onNewCampaign, activeCampaignId, onSelectCampaign }) {
  const totalScansAll = campaigns.reduce((acc, c) => acc + (c.totalScans || 0), 0);

  return (
    <header className="glass-panel" style={{ borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0, marginBottom: '28px', padding: '16px 28px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Left Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }} onClick={() => onSelectCampaign(null)}>
          <div className="pulse-glow" style={{ width: '42px', height: '42px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.2)' }}>
            <img src="/logo.jpg" alt="QRoute" onError={(e) => { e.currentTarget.src = '/logo.jpg'; }} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px', background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                QRoute
              </span>
              <span className="badge badge-indigo">
                <Zap size={11} /> Sequential Rotator
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
              Smart Round-Robin QR Link Allocator
            </p>
          </div>
        </div>

        {/* Global Stats Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="badge badge-cyan" style={{ padding: '8px 14px', fontSize: '13px' }}>
            <Layers size={14} />
            <span>{campaigns.length} Active Campaigns</span>
          </div>

          <div className="badge badge-emerald" style={{ padding: '8px 14px', fontSize: '13px' }}>
            <Activity size={14} />
            <span>{totalScansAll} Total Scans Logged</span>
          </div>

          {/* Create Button */}
          <button className="btn btn-primary" onClick={onNewCampaign}>
            <Plus size={16} /> New Campaign
          </button>
        </div>

      </div>
    </header>
  );
}
