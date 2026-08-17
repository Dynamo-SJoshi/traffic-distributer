import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart3, Download, ListFilter, Activity } from 'lucide-react';

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6'];

export default function AnalyticsView({ campaign }) {
  const links = campaign.links || [];
  const logs = campaign.scanLogs || [];

  const chartData = links.map((l, i) => ({
    name: `Link ${i + 1}`,
    title: l.title,
    scans: l.clicks || 0
  }));

  const handleExportCSV = () => {
    if (logs.length === 0) return alert('No scan logs recorded yet.');

    const headers = ['Scan Index', 'Timestamp', 'Queue Position', 'Assigned Link Title', 'Target URL', 'IP Address', 'User Agent'];
    const rows = logs.map((log) => [
      log.scanIndex,
      log.timestamp,
      `Link #${log.assignedIndex}`,
      `"${(log.linkTitle || '').replace(/"/g, '""')}"`,
      `"${(log.targetUrl || '').replace(/"/g, '""')}"`,
      log.ip,
      `"${(log.userAgent || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${campaign.shortCode}-scan-analytics.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Chart Panel */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 size={20} style={{ color: '#10b981' }} /> Traffic Distribution Chart
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>
              Scans received per target link in the sequence stack.
            </p>
          </div>

          <div className="badge badge-emerald" style={{ fontSize: '13px' }}>
            Total Scans: {campaign.totalScans || 0}
          </div>
        </div>

        <div style={{ width: '100%', height: '240px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#fff' }}
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
              />
              <Bar dataKey="scans" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Live Scan Audit Logs Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={20} style={{ color: '#a5b4fc' }} /> Recent Scan Logs & Audit Feed
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>
              Detailed breakdown of recent visitors and their assigned round-robin link.
            </p>
          </div>

          <button className="btn btn-secondary btn-sm" onClick={handleExportCSV}>
            <Download size={14} /> Export CSV
          </button>
        </div>

        {logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '14px' }}>
            No scan logs recorded yet for this campaign.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '10px' }}>Scan #</th>
                  <th style={{ padding: '10px' }}>Timestamp</th>
                  <th style={{ padding: '10px' }}>Queue Pos</th>
                  <th style={{ padding: '10px' }}>Assigned Target Webpage</th>
                  <th style={{ padding: '10px' }}>Visitor IP</th>
                </tr>
              </thead>
              <tbody>
                {logs.slice(0, 30).map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '10px', fontWeight: 'bold', color: '#a5b4fc' }}>#{log.scanIndex}</td>
                    <td style={{ padding: '10px', color: 'var(--text-muted)' }}>{new Date(log.timestamp).toLocaleString()}</td>
                    <td style={{ padding: '10px' }}>
                      <span className="badge badge-cyan" style={{ fontSize: '11px' }}>
                        Link #{log.assignedIndex}
                      </span>
                    </td>
                    <td style={{ padding: '10px', fontWeight: '600', color: '#fff' }}>{log.linkTitle}</td>
                    <td style={{ padding: '10px', fontFamily: 'var(--font-code)', color: '#64748b', fontSize: '12px' }}>{log.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
