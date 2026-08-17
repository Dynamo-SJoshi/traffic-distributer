import React, { useState } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, ExternalLink, Link2, CheckCircle, XCircle, BarChart2 } from 'lucide-react';

export default function LinkStackEditor({ campaign, onUpdateCampaign, onRefresh }) {
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [maxScans, setMaxScans] = useState(0);

  const links = campaign.links || [];

  const handleAddLink = async (e) => {
    e.preventDefault();
    if (!newUrl) return;

    try {
      const res = await fetch(`/api/campaigns/${campaign.id}/links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle || `Webpage ${links.length + 1}`,
          url: newUrl.startsWith('http') ? newUrl : `https://${newUrl}`,
          maxScans: Number(maxScans) || 0
        })
      });
      if (res.ok) {
        setNewTitle('');
        setNewUrl('');
        setMaxScans(0);
        onRefresh();
      }
    } catch (err) {
      console.error('Failed to add link:', err);
    }
  };

  const handleToggleActive = async (link) => {
    try {
      await fetch(`/api/campaigns/${campaign.id}/links/${link.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !link.active })
      });
      onRefresh();
    } catch (err) {
      console.error('Failed to toggle active state:', err);
    }
  };

  const handleDeleteLink = async (linkId) => {
    try {
      await fetch(`/api/campaigns/${campaign.id}/links/${linkId}`, {
        method: 'DELETE'
      });
      onRefresh();
    } catch (err) {
      console.error('Failed to delete link:', err);
    }
  };

  const handleMove = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= links.length) return;

    const newLinks = [...links];
    const temp = newLinks[index];
    newLinks[index] = newLinks[targetIndex];
    newLinks[targetIndex] = temp;

    const linkIds = newLinks.map((l) => l.id);

    try {
      await fetch(`/api/campaigns/${campaign.id}/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkIds })
      });
      onRefresh();
    } catch (err) {
      console.error('Failed to reorder links:', err);
    }
  };

  const totalClicksAll = links.reduce((sum, l) => sum + (l.clicks || 0), 0);

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link2 size={20} style={{ color: '#818cf8' }} /> Attached Target Webpages
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>
            Incoming scanners will be distributed across this list in sequential order (1 → 2 → 3 → 4 → 5 → 1...).
          </p>
        </div>

        <div className="badge badge-indigo" style={{ fontSize: '13px', padding: '6px 12px' }}>
          {links.length} Webpages in Stack
        </div>
      </div>

      {/* Add New Link Form */}
      <form onSubmit={handleAddLink} style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.1)', padding: '16px', borderRadius: '14px', marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr 1fr auto', gap: '12px', alignItems: 'end' }}>
          <div>
            <label className="input-label">Webpage Title / Label</label>
            <input
              type="text"
              placeholder="e.g. Webpage 1 (General Quiz)"
              className="input-field"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="input-label">Target Destination URL *</label>
            <input
              type="text"
              required
              placeholder="https://example.com/quiz-1"
              className="input-field"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
            />
          </div>
          <div>
            <label className="input-label">Scan Limit (0 = ∞)</label>
            <input
              type="number"
              min="0"
              placeholder="0"
              className="input-field"
              value={maxScans}
              onChange={(e) => setMaxScans(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ height: '42px' }}>
            <Plus size={16} /> Add Link
          </button>
        </div>
      </form>

      {/* Links List Stack */}
      {links.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '14px' }}>
          No target links added yet. Add at least 2 links to enable sequential round-robin distribution.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {links.map((link, idx) => {
            const isNext = (campaign.sequenceCounter % (links.filter(l=>l.active).length || 1)) === idx;
            const clickPercent = totalClicksAll > 0 ? Math.round(((link.clicks || 0) / totalClicksAll) * 100) : 0;

            return (
              <div
                key={link.id}
                style={{
                  background: link.active ? 'rgba(30, 41, 59, 0.6)' : 'rgba(15, 23, 42, 0.4)',
                  border: isNext ? '1px solid #818cf8' : '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: isNext ? '0 0 15px rgba(99, 102, 241, 0.25)' : 'none',
                  borderRadius: '14px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  opacity: link.active ? 1 : 0.6
                }}
              >
                {/* Left Sequence badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: isNext ? 'linear-gradient(135deg, #6366f1, #06b6d4)' : 'rgba(255,255,255,0.08)',
                    color: isNext ? '#fff' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '800',
                    fontSize: '15px'
                  }}>
                    #{idx + 1}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '15px', fontWeight: '700', color: '#fff' }}>{link.title}</span>
                      {isNext && <span className="badge badge-indigo">NEXT UP FOR SCAN</span>}
                      {!link.active && <span className="badge badge-amber">PAUSED</span>}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: '13px', color: '#38bdf8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        {link.url} <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Right stats & actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  
                  {/* Click counter */}
                  <div style={{ textAlign: 'right', minWidth: '90px' }}>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#10b981' }}>
                      {link.clicks || 0} scans
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {clickPercent}% of total
                    </div>
                  </div>

                  {/* Reorder Buttons */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '2px 6px' }}
                      disabled={idx === 0}
                      onClick={() => handleMove(idx, -1)}
                      title="Move Up"
                    >
                      <ArrowUp size={12} />
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '2px 6px' }}
                      disabled={idx === links.length - 1}
                      onClick={() => handleMove(idx, 1)}
                      title="Move Down"
                    >
                      <ArrowDown size={12} />
                    </button>
                  </div>

                  {/* Toggle Active */}
                  <button
                    className={`btn btn-sm ${link.active ? 'btn-secondary' : 'btn-success'}`}
                    onClick={() => handleToggleActive(link)}
                    title={link.active ? 'Pause Link' : 'Enable Link'}
                  >
                    {link.active ? <XCircle size={14} /> : <CheckCircle size={14} />}
                  </button>

                  {/* Delete */}
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteLink(link.id)}
                    title="Delete Link"
                  >
                    <Trash2 size={14} />
                  </button>

                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
