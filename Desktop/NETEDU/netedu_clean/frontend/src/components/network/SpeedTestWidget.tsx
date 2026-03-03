// src/components/network/SpeedTestWidget.tsx
// Beautiful animated speed test â€” the centrepiece of the Network page

import { useSpeedTest, TestPhase, SpeedTestResult } from '../../hooks/useSpeedTest';
import { networkApi } from '../../services/api';
import { Wifi, RotateCcw, CheckCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface Props {
  onTestSaved?: () => void;
}

const PHASE_LABELS: Record<TestPhase, string> = {
  idle:     '',
  latency:  'Measuring Latency',
  download: 'Testing Download',
  upload:   'Testing Upload',
  complete: 'Test Complete',
  error:    'Test Failed',
};

const PHASE_COLORS: Record<TestPhase, string> = {
  idle:     'var(--brand-500)',
  latency:  'var(--warning)',
  download: 'var(--brand-500)',
  upload:   '#8b5cf6',
  complete: 'var(--success)',
  error:    'var(--danger)',
};

function QualityLabel({ score }: { score: number }) {
  if (score >= 90) return <span className="badge badge-green">Excellent</span>;
  if (score >= 75) return <span className="badge badge-blue">Good</span>;
  if (score >= 50) return <span className="badge badge-yellow">Fair</span>;
  return <span className="badge badge-red">Poor</span>;
}

function ResultRow({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'.75rem 0', borderBottom:'1px solid var(--border-2)' }}>
      <span style={{ fontSize:'.875rem', color:'var(--text-muted)', fontWeight:500 }}>{label}</span>
      <span style={{ fontSize:'.95rem', fontWeight:700, color:'var(--text)' }}>
        {value} <span style={{ fontSize:'.78rem', fontWeight:400, color:'var(--text-muted)' }}>{unit}</span>
      </span>
    </div>
  );
}

export default function SpeedTestWidget({ onTestSaved }: Props) {
  const { phase, progress, currentSpeed, result, error, runTest, reset } = useSpeedTest();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [city, setCity] = useState('');
  const [isp, setIsp] = useState('');

  const handleSave = async () => {
    if (!result) return;
    setSaving(true);
    try {
      await networkApi.submitMeasurement({ ...result, city, isp });
      setSaved(true);
      onTestSaved?.();
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => { reset(); setSaved(false); };

  const color = PHASE_COLORS[phase];
  const isRunning = !['idle', 'complete', 'error'].includes(phase);

  // â”€â”€ Idle state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (phase === 'idle') {
    return (
      <div className="card" style={{ textAlign:'center', padding:'2.5rem 2rem' }}>
        <div style={{ width:80, height:80, borderRadius:'50%', background:'var(--brand-50)', border:'2px solid var(--brand-100)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.5rem' }}>
          <Wifi size={36} color="var(--brand-500)" />
        </div>
        <h2 style={{ fontSize:'1.25rem', fontWeight:800, marginBottom:'.5rem' }}>Run Speed Test</h2>
        <p style={{ color:'var(--text-muted)', fontSize:'.9rem', maxWidth:340, margin:'0 auto 2rem', lineHeight:1.6 }}>
          Measure your actual download speed, upload speed, and latency using multi-stream measurement - the same methodology used by M-Lab NDT7.
        </p>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', maxWidth:400, margin:'0 auto 1.5rem', textAlign:'left' }}>
          <div className="form-group" style={{ marginBottom:0 }}>
            <label className="form-label">City (optional)</label>
            <input className="form-input" value={city} onChange={e => setCity(e.target.value)} placeholder="Bengaluru" />
          </div>
          <div className="form-group" style={{ marginBottom:0 }}>
            <label className="form-label">ISP (optional)</label>
            <input className="form-input" value={isp} onChange={e => setIsp(e.target.value)} placeholder="Jio, Airtel..." />
          </div>
        </div>

        <button className="btn btn-primary btn-lg" onClick={runTest} style={{ minWidth:200 }}>
          <Wifi size={18} />
          Start Test
        </button>

        <div style={{ display:'flex', justifyContent:'center', gap:'2rem', marginTop:'2rem' }}>
          {[
            { label: 'Streams', value: '4 parallel' },
            { label: 'Duration', value: '~20 seconds' },
            { label: 'Method', value: 'NDT7-inspired' },
          ].map(({ label, value }) => (
            <div key={label} style={{ textAlign:'center' }}>
              <div style={{ fontSize:'.8rem', fontWeight:700, color:'var(--text)' }}>{value}</div>
              <div style={{ fontSize:'.7rem', color:'var(--text-muted)' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // â”€â”€ Running state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (isRunning) {
    return (
      <div className="card" style={{ textAlign:'center', padding:'2.5rem 2rem' }}>
        {/* Animated ring */}
        <div style={{ position:'relative', width:160, height:160, margin:'0 auto 1.5rem' }}>
          <svg width="160" height="160" style={{ transform:'rotate(-90deg)' }}>
            <circle cx="80" cy="80" r="70" fill="none" stroke="var(--border)" strokeWidth="6" />
            <circle
              cx="80" cy="80" r="70"
              fill="none"
              stroke={color}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 70}`}
              strokeDashoffset={`${2 * Math.PI * 70 * (1 - progress / 100)}`}
              style={{ transition:'stroke-dashoffset .3s ease' }}
            />
          </svg>
          <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
            <div className="speedtest-number" style={{ fontSize:'2.5rem', color }}>{progress}%</div>
          </div>
        </div>

        <div style={{ fontSize:'.72rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.1em', color, marginBottom:'.75rem' }}>
          {PHASE_LABELS[phase]}
        </div>

        {currentSpeed > 0 && (
          <div style={{ marginBottom:'1rem' }}>
            <div className="speedtest-number" style={{ color }}>{currentSpeed}</div>
            <div className="speedtest-unit">Mbps</div>
          </div>
        )}

        <div style={{ maxWidth:320, margin:'0 auto' }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:'.75rem', color:'var(--text-muted)', marginBottom:'.4rem' }}>
            <span>Latency</span>
            <span>Download</span>
            <span>Upload</span>
          </div>
          <div style={{ display:'flex', height:4, borderRadius:999, overflow:'hidden', gap:2 }}>
            {[
              { key:'latency',  done: ['download','upload','complete'].includes(phase) },
              { key:'download', done: ['upload','complete'].includes(phase) },
              { key:'upload',   done: phase === 'complete' },
            ].map(({ key, done }) => (
              <div key={key} style={{ flex:1, background: done ? 'var(--success)' : key === phase ? color : 'var(--border)', borderRadius:999, transition:'background .3s' }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // â”€â”€ Error state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (phase === 'error') {
    return (
      <div className="card" style={{ textAlign:'center', padding:'2.5rem 2rem' }}>
        <AlertCircle size={48} color="var(--danger)" style={{ margin:'0 auto 1rem' }} />
        <h3 style={{ fontWeight:700, marginBottom:'.5rem' }}>Test Failed</h3>
        <p style={{ color:'var(--text-muted)', marginBottom:'1.5rem' }}>{error}</p>
        <button className="btn btn-ghost" onClick={handleReset}>
          <RotateCcw size={15} /> Try Again
        </button>
      </div>
    );
  }

  // â”€â”€ Complete state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const r = result as SpeedTestResult;
  const qualityScore = Math.round(
    Math.max(0, 100
      - (r.download_speed < 1 ? 50 : r.download_speed < 5 ? 30 : r.download_speed < 25 ? 10 : 0)
      - (r.latency > 200 ? 30 : r.latency > 100 ? 15 : r.latency > 50 ? 5 : 0)
      - Math.min(r.packet_loss * 5, 30)
    )
  );

  return (
    <div className="card fade-in" style={{ padding:'2rem' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.5rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'.75rem' }}>
          <CheckCircle size={22} color="var(--success)" />
          <h3 style={{ fontWeight:800, fontSize:'1.1rem' }}>Test Complete</h3>
        </div>
        <div style={{ display:'flex', gap:'.5rem', alignItems:'center' }}>
          <QualityLabel score={qualityScore} />
          <button className="btn btn-ghost btn-sm" onClick={handleReset}>
            <RotateCcw size={14} /> Retest
          </button>
        </div>
      </div>

      {/* Big numbers */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'1rem', marginBottom:'1.5rem' }}>
        {[
          { label:'Download', value:r.download_speed, unit:'Mbps', color:'var(--brand-500)' },
          { label:'Upload',   value:r.upload_speed,   unit:'Mbps', color:'#8b5cf6' },
          { label:'Latency',  value:r.latency,         unit:'ms',   color:'var(--warning)' },
        ].map(({ label, value, unit, color: c }) => (
          <div key={label} style={{ textAlign:'center', padding:'1rem', background:'var(--gray-50)', borderRadius:'var(--radius)', border:'1px solid var(--border-2)' }}>
            <div style={{ fontSize:'.72rem', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:'.4rem' }}>{label}</div>
            <div style={{ fontSize:'1.75rem', fontWeight:800, color: c, letterSpacing:'-.02em' }}>{value}</div>
            <div style={{ fontSize:'.78rem', color:'var(--text-muted)' }}>{unit}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom:'1.5rem' }}>
        <ResultRow label="Jitter"       value={r.jitter}       unit="ms" />
        <ResultRow label="Packet Loss"  value={r.packet_loss}  unit="%" />
        <ResultRow label="Quality Score" value={qualityScore}  unit="/ 100" />
      </div>

      {!saved ? (
        <div>
          <p style={{ fontSize:'.825rem', color:'var(--text-muted)', marginBottom:'1rem' }}>Save this result to track your history and see trends.</p>
          <button
            className="btn btn-success-filled btn-full"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Result'}
          </button>
        </div>
      ) : (
        <div className="alert alert-success">
          <CheckCircle size={16} />
          Result saved! View your history and trends below.
        </div>
      )}
    </div>
  );
}

