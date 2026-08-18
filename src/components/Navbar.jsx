import React from 'react';
import { QrCode, Plus, Layers, Zap, Activity, ShieldCheck, LogOut } from 'lucide-react';

export default function Navbar({ campaigns = [], onNewCampaign, activeCampaignId, onSelectCampaign, passcode, onLogout }) {
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

        {/* Global Stats & Account Info Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div className="badge badge-cyan" style={{ padding: '6px 12px', fontSize: '12px' }}>
            <Layers size={13} />
            <span>{campaigns.length} Campaigns</span>
          </div>

          <div className="badge badge-emerald" style={{ padding: '6px 12px', fontSize: '12px' }}>
            <Activity size={13} />
            <span>{totalScansAll} Scans</span>
          </div>

          {/* Passcode Account Indicator & Logout */}
          {passcode && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '4px 6px 4px 12px', borderRadius: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#a5b4fc', fontWeight: 'bold' }}>
                <ShieldCheck size={14} color="#818cf8" />
                <span>Passcode: <code style={{ color: '#fff', fontSize: '13px' }}>{passcode}</code></span>
              </div>
              
              <button
                className="btn btn-secondary btn-sm"
                style={{ padding: '4px 8px', fontSize: '11px', height: '26px' }}
                onClick={onLogout}
                title="Lock Dashboard & Logout"
              >
                <LogOut size={12} /> Lock
              </button>
            </div>
          )}

          {/* Create Button */}
          <button className="btn btn-primary" onClick={onNewCampaign}>
            <Plus size={16} /> New Campaign
          </button>
        </div>

      </div>
    </header>
  );
}
