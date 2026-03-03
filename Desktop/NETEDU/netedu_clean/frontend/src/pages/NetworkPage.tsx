// src/pages/NetworkPage.tsx
import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Wifi, Globe } from 'lucide-react';
import { networkApi } from '../services/api';
import { NetworkMeasurement } from '../types';
import SpeedTestWidget from '../components/network/SpeedTestWidget';

function QualityDot({ score }: { score: number }) {
  const color = score >= 90 ? '#10b981' : score >= 75 ? '#6366f1' : score >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:'.35rem', background:`${color}18`, color, padding:'.2rem .6rem', borderRadius:999, fontSize:'.75rem', fontWeight:700 }}>
      <span style={{ width:6, height:6, borderRadius:'50%', background:color }} />
      {score}
    </span>
  );
}

export default function NetworkPage() {
  const [measurements, setMeasurements] = useState<NetworkMeasurement[]>([]);
  const [trend, setTrend] = useState<any[]>([]);
  const [publicStats, setPublicStats] = useState<any[]>([]);
  const [tab, setTab] = useState<'test' | 'history' | 'public'>('test');

  const load = () => {
    networkApi.getMeasurements().then(r => setMeasurements(r.data.results ?? r.data));
    networkApi.getTrend().then(r => setTrend(r.data));
    networkApi.getPublicStats().then(r => setPublicStats(r.data?.cities ?? []));
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="page">
      <div className="page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <h1>Network Quality</h1>
          <p>Measure, track and analyse your internet quality over time - NDT7-inspired methodology.</p>
        </div>
        <div style={{ display:'flex', gap:'.5rem' }}>
          <span className="badge badge-purple">NDT7-inspired</span>
          <span className="badge badge-gray">{measurements.length} tests</span>
        </div>
      </div>

      {/* Stat summary */}
      {measurements.length > 0 && (() => {
        const avg = (arr: number[]) => arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : 0;
        const downs = measurements.map(m => m.download_speed);
        const lats  = measurements.map(m => m.latency);
        const quals = measurements.map(m => m.quality_score);
        return (
          <div className="stat-grid" style={{ marginBottom:'2rem' }}>
            <div className="stat-card"><div className="stat-label">Avg Download</div><div className="stat-value">{avg(downs).toFixed(1)}</div><div className="stat-unit">Mbps</div></div>
            <div className="stat-card accent-yellow"><div className="stat-label">Avg Latency</div><div className="stat-value">{avg(lats).toFixed(0)}</div><div className="stat-unit">ms</div></div>
            <div className="stat-card accent-green"><div className="stat-label">Avg Quality</div><div className="stat-value">{avg(quals).toFixed(0)}</div><div className="stat-unit">/ 100</div></div>
            <div className="stat-card accent-blue"><div className="stat-label">Best Download</div><div className="stat-value">{Math.max(...downs).toFixed(1)}</div><div className="stat-unit">Mbps</div></div>
          </div>
        );
      })()}

      {/* Tabs */}
      <div className="tab-nav">
        <button className={`tab-btn ${tab==='test'?'active':''}`} onClick={() => setTab('test')}>Speed Test</button>
        <button className={`tab-btn ${tab==='history'?'active':''}`} onClick={() => setTab('history')}>History & Trends</button>
        <button className={`tab-btn ${tab==='public'?'active':''}`} onClick={() => setTab('public')}>Public Data</button>
      </div>

      {/* Speed Test tab */}
      {tab === 'test' && (
        <div style={{ maxWidth:560, margin:'0 auto' }}>
          <SpeedTestWidget onTestSaved={load} />
        </div>
      )}

      {/* History tab */}
      {tab === 'history' && (
        <>
          {trend.length > 0 && (
            <div className="chart-card" style={{ marginBottom:'1.5rem' }}>
              <div className="chart-title">Speed Trend</div>
              <div className="chart-subtitle">Your last 30 measurements</div>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-2)" />
                  <XAxis dataKey="created_at" tickFormatter={v => new Date(v).toLocaleDateString('en-IN', {day:'2-digit', month:'short'})} tick={{ fontSize:11 }} />
                  <YAxis tick={{ fontSize:11 }} />
                  <Tooltip labelFormatter={v => new Date(v).toLocaleString()} contentStyle={{ background:'var(--gray-900)', border:'none', borderRadius:8, color:'white', fontSize:12 }} />
                  <Legend />
                  <Line type="monotone" dataKey="download_speed" stroke="#6366f1" name="Download (Mbps)" dot={false} strokeWidth={2.5} />
                  <Line type="monotone" dataKey="upload_speed"   stroke="#10b981" name="Upload (Mbps)"   dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="latency"        stroke="#f59e0b" name="Latency (ms)"   dot={false} strokeWidth={1.5} strokeDasharray="4 4" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="card" style={{ overflowX:'auto' }}>
            <h3 style={{ fontSize:'.9rem', fontWeight:700, marginBottom:'1rem' }}>All Measurements</h3>
            {measurements.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"><Wifi size={22} /></div>
                <h3>No tests yet</h3>
                <p>Run your first speed test to start tracking.</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Download</th>
                    <th>Upload</th>
                    <th>Latency</th>
                    <th>Jitter</th>
                    <th>Type</th>
                    <th>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {measurements.map(m => (
                    <tr key={m.id}>
                      <td style={{ color:'var(--text-muted)' }}>{new Date(m.created_at).toLocaleDateString('en-IN')}</td>
                      <td style={{ fontWeight:700 }}>{m.download_speed} <span style={{ fontSize:'.75rem', fontWeight:400, color:'var(--text-muted)' }}>Mbps</span></td>
                      <td>{m.upload_speed} <span style={{ fontSize:'.75rem', color:'var(--text-muted)' }}>Mbps</span></td>
                      <td>{m.latency} <span style={{ fontSize:'.75rem', color:'var(--text-muted)' }}>ms</span></td>
                      <td>{m.jitter} <span style={{ fontSize:'.75rem', color:'var(--text-muted)' }}>ms</span></td>
                      <td><span className="badge badge-gray">{m.connection_type}</span></td>
                      <td><QualityDot score={m.quality_score} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* Public data tab */}
      {tab === 'public' && (
        <div className="card">
          <div style={{ display:'flex', alignItems:'center', gap:'.6rem', marginBottom:'1rem' }}>
            <Globe size={18} color="var(--brand-500)" />
            <h3 style={{ fontSize:'.9rem', fontWeight:700 }}>Network Quality by City</h3>
            <span className="badge badge-green" style={{ marginLeft:'auto' }}>Open Data</span>
          </div>
          <p style={{ fontSize:'.825rem', color:'var(--text-muted)', marginBottom:'1.25rem' }}>
            Aggregated, anonymised network quality data - no authentication required. Modelled after M-Lab's open data principles.
          </p>
          {publicStats.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><Globe size={20} /></div>
              <h3>No public data yet</h3>
              <p>Submit tests with a city to appear here.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>City</th><th>Country</th><th>Avg Download</th><th>Avg Latency</th><th>Avg Quality</th><th>Tests</th></tr>
              </thead>
              <tbody>
                {publicStats.map((s: any, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight:600 }}>{s.city}</td>
                    <td style={{ color:'var(--text-muted)' }}>{s.country}</td>
                    <td>{s.avg_download?.toFixed(1)} Mbps</td>
                    <td>{s.avg_latency?.toFixed(0)} ms</td>
                    <td><QualityDot score={Math.round(s.avg_quality ?? 0)} /></td>
                    <td style={{ color:'var(--text-muted)' }}>{s.test_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
