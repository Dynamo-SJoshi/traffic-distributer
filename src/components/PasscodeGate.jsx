import React, { useState } from 'react';
import { Lock, KeyRound, UserPlus, ArrowRight, ShieldCheck, Sparkles, Eye, EyeOff, AlertCircle, RefreshCw } from 'lucide-react';

export default function PasscodeGate({ onLoginSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleFormatInput = (val) => {
    // Keep max 6 characters, uppercase for crisp look
    const cleaned = val.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    setPasscode(cleaned);
    setError('');
  };

  const handleGenerateRandomPasscode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPasscode(result);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passcode.length !== 6) {
      setError('Passcode must be exactly 6 characters long.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/verify';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Authentication failed. Please check your passcode.');
        return;
      }

      if (mode === 'register') {
        setSuccessMsg(`🎉 Account registered successfully! Your passcode is ${passcode}. Logging you in...`);
        setTimeout(() => {
          onLoginSuccess(passcode);
        }, 1200);
      } else {
        onLoginSuccess(passcode);
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: '20px' }}>
      
      <div className="glass-panel" style={{ maxWidth: '440px', width: '100%', padding: '36px 32px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 40px rgba(99, 102, 241, 0.25)' }}>
        
        {/* Lock Icon Header */}
        <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(6,182,212,0.2))', border: '1px solid rgba(99,102,241,0.4)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 10px 25px rgba(99, 102, 241, 0.3)' }}>
          {mode === 'register' ? <UserPlus size={32} /> : <ShieldCheck size={32} />}
        </div>

        <h2 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 6px', color: '#fff' }}>
          {mode === 'register' ? 'Register New Account' : 'Account Passcode'}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '0 0 24px' }}>
          {mode === 'register'
            ? 'Create a 6-character passcode to isolate and secure your rotator campaigns.'
            : 'Enter your 6-character passcode to unlock your rotator dashboard.'}
        </p>

        {/* Mode Toggle Buttons */}
        <div style={{ display: 'flex', background: 'rgba(15,23,42,0.8)', padding: '4px', borderRadius: '12px', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <button
            type="button"
            className="btn"
            style={{ flex: 1, padding: '8px', fontSize: '13px', background: mode === 'login' ? 'var(--primary)' : 'transparent', color: mode === 'login' ? '#fff' : 'var(--text-muted)', borderRadius: '8px' }}
            onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
          >
            <KeyRound size={14} /> Enter Passcode
          </button>
          <button
            type="button"
            className="btn"
            style={{ flex: 1, padding: '8px', fontSize: '13px', background: mode === 'register' ? 'var(--primary)' : 'transparent', color: mode === 'register' ? '#fff' : 'var(--text-muted)', borderRadius: '8px' }}
            onClick={() => { setMode('register'); setError(''); setSuccessMsg(''); }}
          >
            <UserPlus size={14} /> Register New Account
          </button>
        </div>

        {/* Passcode Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label className="input-label" style={{ margin: 0 }}>6-Character Passcode</label>
              <span className={`badge ${passcode.length === 6 ? 'badge-emerald' : 'badge-indigo'}`} style={{ fontSize: '11px' }}>
                {passcode.length} / 6 chars
              </span>
            </div>

            <div style={{ position: 'relative' }}>
              <input
                type={showPasscode ? 'text' : 'password'}
                required
                maxLength={6}
                value={passcode}
                placeholder="e.g. 123456 or AB9K2M"
                onChange={(e) => handleFormatInput(e.target.value)}
                className="input-field"
                style={{
                  fontFamily: 'var(--font-code)',
                  fontSize: '20px',
                  letterSpacing: '6px',
                  textAlign: 'center',
                  paddingRight: '44px',
                  fontWeight: '700',
                  color: '#38bdf8'
                }}
              />
              
              <button
                type="button"
                onClick={() => setShowPasscode(!showPasscode)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                title={showPasscode ? 'Hide Passcode' : 'Show Passcode'}
              >
                {showPasscode ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Random Passcode Generator Button for Register mode */}
            {mode === 'register' && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ marginTop: '10px', width: '100%', fontSize: '12px' }}
                onClick={handleGenerateRandomPasscode}
              >
                <RefreshCw size={13} /> Generate Random 6-Char Passcode
              </button>
            )}
          </div>

          {/* Feedback Messages */}
          {error && (
            <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#fb7185', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left' }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#6ee7b7', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', textAlign: 'left' }}>
              {successMsg}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || passcode.length !== 6}
            style={{ width: '100%', height: '44px', fontSize: '15px' }}
          >
            {loading ? 'Verifying...' : mode === 'register' ? 'Create Account & Unlock' : 'Unlock Dashboard'} <ArrowRight size={16} />
          </button>

        </form>

        {/* Demo Tip */}
        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '12px', color: 'var(--text-muted)' }}>
          <Sparkles size={12} color="#f59e0b" style={{ display: 'inline', marginRight: '4px' }} />
          Default Demo Passcode: <strong style={{ color: '#38bdf8' }}>123456</strong>
        </div>

      </div>

    </div>
  );
}
