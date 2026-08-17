import React, { useRef, useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, Copy, Printer, Check, QrCode, ExternalLink, Sparkles, Maximize2, X, Wifi, Monitor } from 'lucide-react';
import { normalizeImageUrl } from '../utils/imageUtils';

export default function QRCodeStudio({ campaign }) {
  const [copied, setCopied] = useState(false);
  const [fgColor, setFgColor] = useState('#0f172a');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [size, setSize] = useState(260);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [networkInfo, setNetworkInfo] = useState(null);
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    fetch('/api/network-ip')
      .then((res) => res.json())
      .then((data) => {
        setNetworkInfo(data);
        // Automatically default QR encoding to Wi-Fi IP if browsing on localhost
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
          setBaseUrl(data.wifiUrl);
        } else {
          setBaseUrl(window.location.origin);
        }
      })
      .catch(() => {
        setBaseUrl(window.location.origin);
      });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsFullScreen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const effectiveBaseUrl = baseUrl || window.location.origin;
  const redirectUrl = `${effectiveBaseUrl}/r/${campaign.shortCode}`;
  const isWifiUrl = networkInfo && effectiveBaseUrl.includes(networkInfo.localIp);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(redirectUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPNG = (canvasId = 'qr-studio-canvas') => {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${campaign.shortCode}-qr-code.png`;
    link.href = url;
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="glass-panel" style={{ padding: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <QrCode size={20} style={{ color: '#06b6d4' }} /> QR Code Studio
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>
            Share this master QR code. Anyone who scans it will be distributed to target webpages in round-robin order.
          </p>
        </div>

        <span className="badge badge-cyan" style={{ fontSize: '12px' }}>
          Dynamic Router QR
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 340px) 1fr', gap: '32px', alignItems: 'start' }}>
        
        {/* QR Preview Card with Click to Fullscreen */}
        <div
          onClick={() => setIsFullScreen(true)}
          title="Click to view full screen"
          style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '24px',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            border: '2px solid transparent',
            width: '100%',
            boxSizing: 'border-box',
            cursor: 'pointer',
            position: 'relative',
            transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)';
            e.currentTarget.style.borderColor = '#6366f1';
            e.currentTarget.style.boxShadow = '0 0 30px rgba(99, 102, 241, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.borderColor = 'transparent';
            e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.5)';
          }}
        >
          <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <img
              src={normalizeImageUrl(campaign.logoUrl || '/logo.jpg')}
              alt="Logo"
              onError={(e) => { e.currentTarget.src = '/logo.jpg'; }}
              style={{ width: '28px', height: '28px', borderRadius: '8px', objectFit: 'cover' }}
            />
            <span style={{ color: '#0f172a', fontWeight: '800', fontSize: '16px' }}>{campaign.title}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '12px', background: bgColor, borderRadius: '16px', maxWidth: '100%', boxSizing: 'border-box', position: 'relative' }}>
            <QRCodeCanvas
              id="qr-studio-canvas"
              value={redirectUrl}
              size={size}
              fgColor={fgColor}
              bgColor={bgColor}
              level="H"
              includeMargin={true}
              style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
            />
          </div>

          <div style={{ color: '#6366f1', fontSize: '12px', marginTop: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <Maximize2 size={13} /> Click to expand full screen
          </div>
        </div>

        {/* Customization & Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
          
          {/* Target URL & Network Switcher Box */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="input-label" style={{ margin: 0 }}>Rotator Redirect QR Encoded URL</label>

              {networkInfo && (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    className={`btn btn-sm ${isWifiUrl ? 'btn-success' : 'btn-secondary'}`}
                    style={{ fontSize: '11px', padding: '3px 8px' }}
                    onClick={() => setBaseUrl(networkInfo.wifiUrl)}
                  >
                    <Wifi size={12} /> Wi-Fi IP ({networkInfo.localIp})
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${!isWifiUrl ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '11px', padding: '3px 8px' }}
                    onClick={() => setBaseUrl(window.location.origin)}
                  >
                    <Monitor size={12} /> Localhost / Current
                  </button>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={redirectUrl}
                onChange={(e) => {
                  const val = e.target.value;
                  const idx = val.indexOf('/r/');
                  if (idx !== -1) {
                    setBaseUrl(val.substring(0, idx));
                  } else {
                    setBaseUrl(val);
                  }
                }}
                className="input-field"
                style={{ fontFamily: 'var(--font-code)', fontSize: '13px', color: '#38bdf8' }}
              />
              <button className="btn btn-secondary" onClick={handleCopyUrl}>
                {copied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            {/* Network mode helper callout */}
            {isWifiUrl && (
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#6ee7b7', padding: '8px 12px', borderRadius: '10px', fontSize: '12px', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Wifi size={14} /> <strong>Phone-Scannable Mode Active:</strong> Encoded as <code>{networkInfo.wifiUrl}</code> so any phone on your Wi-Fi connects directly!
              </div>
            )}
          </div>

          {/* Color pickers */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label className="input-label">QR Color</label>
              <input
                type="color"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                style={{ width: '100%', height: '40px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'transparent' }}
              />
            </div>
            <div>
              <label className="input-label">Background</label>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                style={{ width: '100%', height: '40px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'transparent' }}
              />
            </div>
            <div>
              <label className="input-label">Size ({size}px)</label>
              <input
                type="range"
                min="180"
                max="400"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                style={{ width: '100%', marginTop: '10px' }}
              />
            </div>
          </div>

          {/* Download & Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '10px', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => setIsFullScreen(true)}>
              <Maximize2 size={16} /> Fullscreen QR
            </button>

            <button className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }} onClick={() => handleDownloadPNG('qr-studio-canvas')}>
              <Download size={16} /> Download High-Res PNG
            </button>

            <button className="btn btn-secondary" onClick={handlePrint}>
              <Printer size={16} /> Print QR Flyer
            </button>

            <a href={redirectUrl} target="_blank" rel="noreferrer" className="btn btn-secondary">
              <ExternalLink size={16} /> Test Scan Link
            </a>
          </div>

          {/* How it works info */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px', fontSize: '13px', color: 'var(--text-muted)' }}>
            <div style={{ color: '#fff', fontWeight: '700', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={14} color="#f59e0b" /> How Scanners Experience This:
            </div>
            When a user scans this QR code with their camera, they see a 1-second branded logo splash screen showing their queue position (e.g. <em>Visitor #6 → Link #1</em>) and are instantly directed to the webpage.
          </div>

        </div>

      </div>

      {/* FULL-PAGE FULLSCREEN POPUP MODAL */}
      {isFullScreen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(9, 13, 22, 0.94)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '30px',
            animation: 'fadeIn 0.25s ease-out'
          }}
          onClick={() => setIsFullScreen(false)}
        >
          {/* Main Pop-up Container */}
          <div
            style={{
              background: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '28px',
              padding: '40px',
              maxWidth: '560px',
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 50px rgba(99, 102, 241, 0.35)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsFullScreen(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(244, 63, 94, 0.3)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
            >
              <X size={20} />
            </button>

            {/* Campaign Branding Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '12px' }}>
              <img
                src={normalizeImageUrl(campaign.logoUrl || '/logo.jpg')}
                alt="Logo"
                onError={(e) => { e.currentTarget.src = '/logo.jpg'; }}
                style={{ width: '38px', height: '38px', borderRadius: '10px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.2)' }}
              />
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', margin: 0 }}>{campaign.title}</h2>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '0 0 24px' }}>
              Scan this QR code to join the sequential traffic allocator queue
            </p>

            {/* Large QR Display Card */}
            <div
              style={{
                background: bgColor,
                borderRadius: '24px',
                padding: '24px',
                display: 'inline-block',
                boxShadow: '0 15px 35px rgba(0,0,0,0.4)',
                marginBottom: '28px'
              }}
            >
              <QRCodeCanvas
                id="qr-fullscreen-canvas"
                value={redirectUrl}
                size={420}
                fgColor={fgColor}
                bgColor={bgColor}
                level="H"
                includeMargin={true}
                style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
              />
            </div>

            {/* Action Bar */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                className="btn btn-primary"
                onClick={() => handleDownloadPNG('qr-fullscreen-canvas')}
              >
                <Download size={16} /> Download PNG
              </button>

              <button className="btn btn-secondary" onClick={handleCopyUrl}>
                {copied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>

              <button className="btn btn-secondary" onClick={() => setIsFullScreen(false)}>
                Close Fullscreen
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
