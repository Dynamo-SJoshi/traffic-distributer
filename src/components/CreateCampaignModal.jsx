import React, { useState } from 'react';
import { X, Plus, Sparkles, Layers } from 'lucide-react';

export default function CreateCampaignModal({ onClose, onCreate }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [shortCode, setShortCode] = useState(Math.random().toString(36).substring(2, 7));
  const [redirectBehavior, setRedirectBehavior] = useState('splash_1s');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title) return;

    // Pre-populate with 5 sample quiz links so user has instant working stack out-of-the-box!
    const defaultLinks = [
      { id: 'link-1', title: 'Quiz Webpage 1', url: 'https://example.com/quiz-1', active: true, clicks: 0, weight: 1, maxScans: 0 },
      { id: 'link-2', title: 'Quiz Webpage 2', url: 'https://example.com/quiz-2', active: true, clicks: 0, weight: 1, maxScans: 0 },
      { id: 'link-3', title: 'Quiz Webpage 3', url: 'https://example.com/quiz-3', active: true, clicks: 0, weight: 1, maxScans: 0 },
      { id: 'link-4', title: 'Quiz Webpage 4', url: 'https://example.com/quiz-4', active: true, clicks: 0, weight: 1, maxScans: 0 },
      { id: 'link-5', title: 'Quiz Webpage 5', url: 'https://example.com/quiz-5', active: true, clicks: 0, weight: 1, maxScans: 0 },
    ];

    onCreate({
      title,
      description,
      shortCode,
      strategy: 'round_robin',
      redirectBehavior,
      links: defaultLinks
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} color="#818cf8" /> New Rotator Campaign
          </h3>
          <button className="btn btn-secondary btn-sm" onClick={onClose} style={{ padding: '6px' }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div>
            <label className="input-label">Campaign Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Science Event Quiz Group Allocator"
              className="input-field"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="input-label">Description (Optional)</label>
            <textarea
              placeholder="Distributes incoming QR scanners across 5 webpages sequentially..."
              className="input-field"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="input-label">Short Code (/r/:code)</label>
              <input
                type="text"
                required
                className="input-field"
                style={{ fontFamily: 'var(--font-code)' }}
                value={shortCode}
                onChange={(e) => setShortCode(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
              />
            </div>

            <div>
              <label className="input-label">Redirect Mode</label>
              <select
                className="input-field"
                value={redirectBehavior}
                onChange={(e) => setRedirectBehavior(e.target.value)}
              >
                <option value="splash_1s">1-Sec Logo Splash (Default)</option>
                <option value="instant_302">Instant 302 Redirect</option>
              </select>
            </div>
          </div>

          <div style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px dashed rgba(99, 102, 241, 0.3)', padding: '12px', borderRadius: '12px', fontSize: '13px', color: '#c7d2fe' }}>
            ⚡ <strong>Includes 5 Pre-configured Links Stack!</strong> You can edit or replace the links immediately after creation.
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              <Plus size={16} /> Create Campaign
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
