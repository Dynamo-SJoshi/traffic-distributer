import React from 'react';
import { Layers, QrCode, ExternalLink, Trash2, ArrowRight, Play, CheckCircle2, RotateCw } from 'lucide-react';
import { normalizeImageUrl } from '../utils/imageUtils';

export default function CampaignList({ campaigns = [], onSelectCampaign, onDeleteCampaign, onNewCampaign }) {
  if (campaigns.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center', maxWidth: '600px', margin: '40px auto' }}>
        <div style={{ width: '64px', height: '64px', background: 'rgba(99, 102, 241, 0.15)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#818cf8' }}>
          <QrCode size={32} />
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '10px' }}>No Rotator Campaigns Yet</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
          Create your first QR rotator campaign to start sequentially allocating visitors across a list of target links!
        </p>
        <button className="btn btn-primary" onClick={onNewCampaign}>
          Create First Campaign
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '800' }}>Rotator Campaigns</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Select a campaign to customize link stacks, test round-robin sequence, and download QR codes.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
        {campaigns.map((camp) => {
          const activeLinksCount = camp.links ? camp.links.filter((l) => l.active).length : 0;
          const redirectUrl = `${window.location.origin}/r/${camp.shortCode}`;
          const currentPos = ((camp.sequenceCounter || 0) % (activeLinksCount || 1)) + 1;

          return (
            <div key={camp.id} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
              
              <div>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img
                      src={normalizeImageUrl(camp.logoUrl || '/logo.jpg')}
                      alt="Logo"
                      onError={(e) => { e.currentTarget.src = '/logo.jpg'; }}
                      style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.15)' }}
                    />
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: '#fff' }}>{camp.title}</h3>
                      <span className="badge badge-indigo" style={{ marginTop: '4px' }}>
                        code: {camp.shortCode}
                      </span>
                    </div>
                  </div>

                  <button
                    className="btn btn-danger btn-sm"
                    title="Delete Campaign"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Are you sure you want to delete "${camp.title}"?`)) {
                        onDeleteCampaign(camp.id);
                      }
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px', minHeight: '38px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {camp.description || 'Sequential QR redirect campaign.'}
                </p>

                {/* Info Pills */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.04)', padding: '10px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>ATTACHED LINKS</div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#38bdf8' }}>
                      {camp.links ? camp.links.length : 0} <span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--text-muted)' }}>({activeLinksCount} active)</span>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.04)', padding: '10px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL SCANS</div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#34d399' }}>
                      {camp.totalScans || 0}
                    </div>
                  </div>
                </div>

                {/* Round Robin Status Indicator */}
                <div style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', padding: '10px 14px', borderRadius: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                    <RotateCw size={14} className="text-indigo-400" style={{ color: '#818cf8' }} />
                    <span style={{ color: '#c7d2fe' }}>
                      Next Scan $\rightarrow$ <strong>Link #{currentPos}</strong>
                    </span>
                  </div>
                  <span className="badge badge-cyan" style={{ fontSize: '11px' }}>
                    {camp.redirectBehavior === 'instant_302' ? 'Instant 302' : '1s Logo Splash'}
                  </span>
                </div>

              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  onClick={() => onSelectCampaign(camp.id)}
                >
                  Manage Campaign <ArrowRight size={15} />
                </button>

                <a
                  href={`/r/${camp.shortCode}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary"
                  title="Test scan in new tab"
                >
                  <ExternalLink size={15} />
                </a>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
