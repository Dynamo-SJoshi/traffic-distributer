import React, { useState } from 'react';
import { Palette, Sparkles, Image, Clock, Check, Layers, Eye, Shield, Award, Star, RefreshCw, Upload, AlertCircle } from 'lucide-react';
import { normalizeImageUrl } from '../utils/imageUtils';

const PRESET_LOGOS = [
  { label: 'Default QRoute Logo', url: '/logo.jpg' },
  { label: 'Quiz Shield Icon', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80' },
  { label: 'Science Cyber Orb', url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=150&auto=format&fit=crop&q=80' },
  { label: 'Golden Trophy Star', url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=150&auto=format&fit=crop&q=80' }
];

const THEMES = [
  { id: 'dark_cyber', name: 'Dark Cyber (Default)', bg: '#090d16', accent: '#6366f1', text: '#f9fafb', cardBg: 'rgba(17, 24, 39, 0.85)' },
  { id: 'midnight_purple', name: 'Midnight Purple', bg: '#110c24', accent: '#a855f7', text: '#f3e8ff', cardBg: 'rgba(30, 20, 50, 0.85)' },
  { id: 'emerald_glass', name: 'Emerald Glass', bg: '#061a14', accent: '#10b981', text: '#ecfdf5', cardBg: 'rgba(12, 38, 28, 0.85)' },
  { id: 'sunset_amber', name: 'Sunset Amber', bg: '#1c0f0a', accent: '#f59e0b', text: '#fffbeb', cardBg: 'rgba(40, 20, 12, 0.85)' },
  { id: 'clean_light', name: 'Clean Light', bg: '#f8fafc', accent: '#2563eb', text: '#0f172a', cardBg: '#ffffff' }
];

export default function SplashCustomizer({ campaign, onRefresh }) {
  const settings = campaign.splashSettings || {
    headline: campaign.title || 'Allocating your webpage...',
    subtext: 'Opening your assigned destination link',
    logoUrl: campaign.logoUrl || '/logo.jpg',
    delaySeconds: 1.0,
    theme: 'dark_cyber',
    showBadge: true,
    showTargetPill: true,
    showProgressBar: true,
    showLogo: true
  };

  const [headline, setHeadline] = useState(settings.headline);
  const [subtext, setSubtext] = useState(settings.subtext);
  const [rawLogoInput, setRawLogoInput] = useState(settings.logoUrl || '/logo.jpg');
  const [logoUrl, setLogoUrl] = useState(normalizeImageUrl(settings.logoUrl || '/logo.jpg'));
  const [delaySeconds, setDelaySeconds] = useState(settings.delaySeconds || 1.0);
  const [theme, setTheme] = useState(settings.theme || 'dark_cyber');
  const [showBadge, setShowBadge] = useState(settings.showBadge !== false);
  const [showTargetPill, setShowTargetPill] = useState(settings.showTargetPill !== false);
  const [showProgressBar, setShowProgressBar] = useState(settings.showProgressBar !== false);
  const [showLogo, setShowLogo] = useState(settings.showLogo !== false);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const isGoogleDriveLink = rawLogoInput.includes('drive.google.com');

  const handleLogoUrlChange = (value) => {
    setRawLogoInput(value);
    setLogoUrl(normalizeImageUrl(value));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Image file is too large. Please select an image under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (dataUrl) {
        setRawLogoInput(dataUrl);
        setLogoUrl(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const currentTheme = THEMES.find((t) => t.id === theme) || THEMES[0];

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    const finalLogoUrl = normalizeImageUrl(logoUrl);

    const updatedSettings = {
      headline,
      subtext,
      logoUrl: finalLogoUrl,
      delaySeconds: Number(delaySeconds),
      theme,
      showBadge,
      showTargetPill,
      showProgressBar,
      showLogo
    };

    try {
      const res = await fetch(`/api/campaigns/${campaign.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          splashMessage: headline,
          logoUrl: finalLogoUrl,
          splashSettings: updatedSettings
        })
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        onRefresh();
      }
    } catch (err) {
      console.error('Failed to save splash settings:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '28px', alignItems: 'start' }}>
      
      {/* Settings Form */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Palette size={20} style={{ color: '#a5b4fc' }} /> Redirect Screen Customizer
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>
              Customize what scanners see during the brief redirection delay.
            </p>
          </div>

          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saved ? <Check size={16} color="#10b981" /> : <Sparkles size={16} />}
            {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Headline */}
          <div>
            <label className="input-label">Redirect Headline Title</label>
            <input
              type="text"
              className="input-field"
              value={headline}
              placeholder="e.g. Allocating your webpage..."
              onChange={(e) => setHeadline(e.target.value)}
            />
          </div>

          {/* Subtext */}
          <div>
            <label className="input-label">Subtitle Message</label>
            <input
              type="text"
              className="input-field"
              value={subtext}
              placeholder="e.g. Redirecting you to your assigned quiz webpage"
              onChange={(e) => setSubtext(e.target.value)}
            />
          </div>

          {/* Logo URL with Drive Auto-Converter & File Upload */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="input-label" style={{ margin: 0 }}>Branding Logo (URL or Upload)</label>
              <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', padding: '4px 10px', fontSize: '12px' }}>
                <Upload size={13} /> Upload File
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                />
              </label>
            </div>

            <input
              type="text"
              className="input-field"
              value={rawLogoInput}
              placeholder="Paste Google Drive link, image URL, or upload file"
              onChange={(e) => handleLogoUrlChange(e.target.value)}
              style={{ marginBottom: '8px' }}
            />

            {isGoogleDriveLink && (
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#6ee7b7', padding: '8px 12px', borderRadius: '10px', fontSize: '12px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Check size={14} /> Google Drive link detected! Converted to direct image URL. Ensure file sharing is set to "Anyone with link".
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {PRESET_LOGOS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '11px', padding: '4px 8px' }}
                  onClick={() => handleLogoUrlChange(preset.url)}
                >
                  <Image size={12} /> {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Redirect Delay Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="input-label" style={{ margin: 0 }}>Redirect Delay Duration</label>
              <span className="badge badge-indigo" style={{ fontSize: '12px' }}>
                <Clock size={12} /> {delaySeconds} seconds
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="5.0"
              step="0.5"
              value={delaySeconds}
              onChange={(e) => setDelaySeconds(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          {/* Theme Selector */}
          <div>
            <label className="input-label">Color Theme</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' }}>
              {THEMES.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  style={{
                    background: t.bg,
                    border: theme === t.id ? `2px solid ${t.accent}` : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    padding: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: theme === t.id ? `0 0 15px ${t.accent}40` : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: t.accent }} />
                    <span style={{ fontSize: '11px', fontWeight: '700', color: t.text }}>{t.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Element Display Toggles */}
          <div>
            <label className="input-label">Display Options</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: 'var(--text-muted)' }}>
                <input
                  type="checkbox"
                  checked={showLogo}
                  onChange={(e) => setShowLogo(e.target.checked)}
                />
                Show Brand Logo
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: 'var(--text-muted)' }}>
                <input
                  type="checkbox"
                  checked={showBadge}
                  onChange={(e) => setShowBadge(e.target.checked)}
                />
                Show Sequence Badge
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: 'var(--text-muted)' }}>
                <input
                  type="checkbox"
                  checked={showTargetPill}
                  onChange={(e) => setShowTargetPill(e.target.checked)}
                />
                Show Target Webpage Name
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: 'var(--text-muted)' }}>
                <input
                  type="checkbox"
                  checked={showProgressBar}
                  onChange={(e) => setShowProgressBar(e.target.checked)}
                />
                Show Progress Bar
              </label>

            </div>
          </div>

        </form>
      </div>

      {/* Live Smartphone Phone Mockup Preview */}
      <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
        <div style={{ color: '#a5b4fc', fontSize: '13px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <Eye size={16} /> LIVE SCANNER SMARTPHONE PREVIEW
        </div>

        {/* Smartphone Outer Container */}
        <div
          style={{
            maxWidth: '320px',
            margin: '0 auto',
            background: '#000',
            borderRadius: '40px',
            padding: '14px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8), 0 0 30px rgba(99,102,241,0.2)',
            border: '4px solid #1e293b'
          }}
        >
          {/* Phone Notch */}
          <div style={{ width: '100px', height: '16px', background: '#1e293b', borderRadius: '0 0 12px 12px', margin: '0 auto 12px' }} />

          {/* Screen Content */}
          <div
            style={{
              background: currentTheme.bg,
              color: currentTheme.text,
              borderRadius: '28px',
              padding: '28px 18px',
              minHeight: '440px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-main)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Logo */}
            {showLogo && (
              <div style={{ width: '64px', height: '64px', borderRadius: '16px', overflow: 'hidden', margin: '0 auto 16px', border: '2px solid rgba(255,255,255,0.2)', boxShadow: `0 8px 20px ${currentTheme.accent}40` }}>
                <img src={logoUrl || '/logo.jpg'} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}

            {/* Sequence Badge */}
            {showBadge && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: `${currentTheme.accent}20`, border: `1px solid ${currentTheme.accent}40`, color: currentTheme.accent, padding: '4px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: '600', marginBottom: '14px' }}>
                ⚡ Visitor #6 &bull; Link 1 of 5
              </div>
            )}

            {/* Headline */}
            <h4 style={{ fontSize: '16px', fontWeight: '800', margin: '0 0 6px', textAlign: 'center' }}>
              {headline || 'Allocating your webpage...'}
            </h4>

            {/* Subtext */}
            <p style={{ fontSize: '12px', opacity: 0.8, margin: '0 0 20px', textAlign: 'center' }}>
              {subtext || 'Opening your assigned destination link'}
            </p>

            {/* Target Pill */}
            {showTargetPill && (
              <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px dashed rgba(255,255,255,0.2)', padding: '8px 12px', borderRadius: '10px', fontSize: '11px', color: '#38bdf8', marginBottom: '20px', wordBreak: 'break-all' }}>
                🎯 Quiz Webpage 1
              </div>
            )}

            {/* Progress Bar */}
            {showProgressBar && (
              <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.1)', borderRadius: '9999px', overflow: 'hidden', marginBottom: '14px' }}>
                <div style={{ height: '100%', width: '70%', background: currentTheme.accent, borderRadius: '9999px' }} />
              </div>
            )}

            <div style={{ fontSize: '10px', opacity: 0.6, marginTop: '8px' }}>
              Opening webpage in {delaySeconds} seconds...
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
