import React, { useState } from 'react';
import { Play, FastForward, RotateCcw, CheckCircle2, ArrowRight, Zap, Terminal, Activity } from 'lucide-react';

export default function ScanSimulator({ campaign, onRefresh }) {
  const [simLogs, setSimLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [burstStats, setBurstStats] = useState(null);

  const activeLinks = campaign.links ? campaign.links.filter(l => l.active) : [];

  const handleSimulateOne = async () => {
    setLoading(true);
    setBurstStats(null);
    try {
      const res = await fetch(`/api/campaigns/${campaign.id}/simulate`, { method: 'POST' });
      const data = await res.json();

      if (data.selectedLink) {
        setSimLogs(prev => [
          {
            id: Date.now() + Math.random(),
            scanIndex: data.scanIndex,
            pos: data.positionInCycle,
            total: data.totalInCycle,
            linkTitle: data.selectedLink.title,
            targetUrl: data.selectedLink.url,
            time: new Date().toLocaleTimeString()
          },
          ...prev.slice(0, 29)
        ]);
        onRefresh();
      }
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateFive = async () => {
    setLoading(true);
    setBurstStats(null);
    for (let i = 0; i < 5; i++) {
      try {
        const res = await fetch(`/api/campaigns/${campaign.id}/simulate`, { method: 'POST' });
        const data = await res.json();
        if (data.selectedLink) {
          setSimLogs(prev => [
            {
              id: Date.now() + Math.random() + i,
              scanIndex: data.scanIndex,
              pos: data.positionInCycle,
              total: data.totalInCycle,
              linkTitle: data.selectedLink.title,
              targetUrl: data.selectedLink.url,
              time: new Date().toLocaleTimeString()
            },
            ...prev.slice(0, 29)
          ]);
        }
      } catch (err) {
        console.error('Simulation step error:', err);
      }
    }
    onRefresh();
    setLoading(false);
  };

  // HIGH-SPEED BURST SIMULATOR: 300 PARALLEL REQUESTS
  const handleSimulateBurst300 = async () => {
    setLoading(true);
    setBurstStats({ message: 'Firing 300 concurrent requests in parallel...', successCount: 0 });

    const startTime = performance.now();
    const totalRequests = 300;
    const batchSize = 50;
    let successCount = 0;
    const newEntries = [];

    for (let i = 0; i < totalRequests; i += batchSize) {
      const promises = Array.from({ length: Math.min(batchSize, totalRequests - i) }, () =>
        fetch(`/api/campaigns/${campaign.id}/simulate`, { method: 'POST' })
          .then(res => res.json())
          .then(data => {
            if (data.selectedLink) {
              successCount++;
              newEntries.push({
                id: Date.now() + Math.random() + successCount,
                scanIndex: data.scanIndex,
                pos: data.positionInCycle,
                total: data.totalInCycle,
                linkTitle: data.selectedLink.title,
                targetUrl: data.selectedLink.url,
                time: new Date().toLocaleTimeString()
              });
            }
          })
          .catch(err => console.error('Burst error:', err))
      );
      await Promise.all(promises);
    }

    const endTime = performance.now();
    const durationMs = Math.round(endTime - startTime);
    const rps = durationMs > 0 ? Math.round((successCount / durationMs) * 1000) : totalRequests;

    setBurstStats({
      durationMs,
      successCount,
      rps,
      message: `⚡ Successfully processed ${successCount} of 300 scans in ${durationMs}ms (~${rps} scans/sec)`
    });

    setSimLogs(prev => [...newEntries.slice(0, 30), ...prev.slice(0, 20)]);
    onRefresh();
    setLoading(false);
  };

  const handleResetCounter = async () => {
    if (confirm('Reset sequence counter and clear test click stats?')) {
      try {
        await fetch(`/api/campaigns/${campaign.id}/reset`, { method: 'POST' });
        setSimLogs([]);
        setBurstStats(null);
        onRefresh();
      } catch (err) {
        console.error('Reset error:', err);
      }
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={20} style={{ color: '#f59e0b' }} /> Live Round-Robin Scan Simulator
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>
            Test sequential allocation logic or simulate high-speed scan traffic bursts.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-sm" onClick={handleSimulateOne} disabled={loading || activeLinks.length === 0}>
            <Play size={14} /> 1 Scan
          </button>

          <button className="btn btn-success btn-sm" onClick={handleSimulateFive} disabled={loading || activeLinks.length === 0}>
            <FastForward size={14} /> 5 Scans
          </button>

          <button className="btn btn-primary btn-sm" style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)' }} onClick={handleSimulateBurst300} disabled={loading || activeLinks.length === 0}>
            <Activity size={14} /> ⚡ Burst 300 Scans
          </button>

          <button className="btn btn-secondary btn-sm" onClick={handleResetCounter}>
            <RotateCcw size={14} /> Reset
          </button>
        </div>
      </div>

      {/* Burst Stats Callout */}
      {burstStats && (
        <div style={{ background: 'rgba(168, 85, 247, 0.15)', border: '1px solid rgba(168, 85, 247, 0.35)', color: '#e9d5ff', padding: '12px 16px', borderRadius: '12px', fontSize: '13px', marginBottom: '16px', fontWeight: '600' }}>
          {burstStats.message}
        </div>
      )}

      {/* Simulator Terminal Output Box */}
      <div style={{ background: '#090d16', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '18px', fontFamily: 'var(--font-code)', fontSize: '13px' }}>
        <div style={{ color: '#64748b', fontSize: '11px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Terminal size={13} color="#10b981" /> LIVE SEQUENCE SIMULATOR LOG
          </span>
          <span>Current Counter Index: #{campaign.sequenceCounter || 0}</span>
        </div>

        {simLogs.length === 0 ? (
          <div style={{ color: '#475569', textAlign: 'center', padding: '20px 0', fontStyle: 'italic' }}>
            Click "Simulate 1 Scan", "5 Scans", or "⚡ Burst 300 Scans" to watch round-robin sequence distribution in real-time.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '260px', overflowY: 'auto' }}>
            {simLogs.map((log) => (
              <div key={log.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: '3px solid #6366f1' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: '#a5b4fc', fontWeight: 'bold' }}>[Person #{log.scanIndex}]</span>
                  <ArrowRight size={13} style={{ color: '#64748b' }} />
                  <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>Link #{log.pos} of {log.total}</span>
                  <span style={{ color: '#f1f5f9' }}>({log.linkTitle})</span>
                </div>
                <span style={{ color: '#64748b', fontSize: '11px' }}>{log.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
