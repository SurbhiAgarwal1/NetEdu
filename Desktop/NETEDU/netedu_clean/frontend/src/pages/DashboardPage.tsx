// src/pages/DashboardPage.tsx
import { useEffect, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, PieChart, Pie, Cell, ZAxis
} from 'recharts';
import { Wifi, BookOpen, TrendingUp, Award, RefreshCw, Zap } from 'lucide-react';
import { analyticsApi, correlationApi } from '../services/api';
import { DashboardData } from '../types';
import { useAuth } from '../hooks/useAuth';

const PIE_COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6'];

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [correlation, setCorrelation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const [dashRes, corrRes] = await Promise.all([
        analyticsApi.getDashboard(),
        correlationApi.getCorrelation().catch(() => ({ data: { has_enough_data: false, reason: 'Collecting data...' } })),
      ]);
      setData(dashRes.data);
      setCorrelation(corrRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      if (isRefresh) setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const net   = data?.network;
  const learn = data?.learning;

  const StatCard = ({ label, value, unit, accent, icon: Icon }: any) => (
    <div className={`stat-card ${accent??''}`}>
      {Icon && <Icon size={28} style={{ position:'absolute', top:'1.1rem', right:'1.1rem', opacity:.1 }} />}
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value ?? '-'}</div>
      {unit && <div className="stat-unit">{unit}</div>}
    </div>
  );

  return (
    <div className="page">
      <div className="page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <h1>Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.first_name}</h1>
          <p>Here's your network quality and learning progress.</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => fetchAll(true)} disabled={refreshing}>
          <RefreshCw size={14} className={refreshing ? 'pulse' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {loading ? (
        <div className="loading-screen" style={{ height:'60vh' }}>
          <div className="spinner" />
          <span>Loading your dashboard...</span>
        </div>
      ) : (
        <div className="fade-in">

          {/* ── Stats row ─────────────────────────────────────────────── */}
          <div className="stat-grid" style={{ marginBottom:'2rem' }}>
            <StatCard label="Avg Download"     value={net?.summary?.avg_download}    unit="Mbps"    icon={Wifi}      />
            <StatCard label="Avg Latency"      value={net?.summary?.avg_latency}     unit="ms"      accent="accent-yellow" icon={TrendingUp} />
            <StatCard label="Network Quality"  value={net?.summary?.avg_quality}     unit="/ 100"   accent="accent-green"  icon={Zap}       />
            <StatCard label="Tests Run"        value={net?.summary?.total_tests}     unit="total"   icon={Wifi}      />
            <StatCard label="Courses Enrolled" value={learn?.summary?.total_enrolled} unit="courses" accent="accent-blue" icon={BookOpen} />
            <StatCard label="Lessons Done"     value={learn?.summary?.total_lessons_done} unit="completed" accent="accent-green" icon={Award} />
          </div>

          {/* ── Correlation insight banner ─────────────────────────────── */}
          {correlation?.has_enough_data && (
            <div className="correlation-insight" style={{ marginBottom:'2rem' }}>
              <div className="insight-label">Network-Learning Correlation - r = {correlation.correlation_coefficient}</div>
              <div className="insight-text">{correlation.insight}</div>
              {correlation.comparison && (
                <div style={{ marginTop:'.75rem', display:'flex', gap:'2rem' }}>
                  <div>
                    <span style={{ fontSize:'.72rem', color:'var(--brand-500)', fontWeight:700 }}>Good network days</span>
                    <span style={{ display:'block', fontSize:'1.1rem', fontWeight:800, color:'var(--text)' }}>
                      {correlation.comparison.avg_lessons_on_good_network} lessons/day
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize:'.72rem', color:'var(--gray-500)', fontWeight:700 }}>Poor network days</span>
                    <span style={{ display:'block', fontSize:'1.1rem', fontWeight:800, color:'var(--text)' }}>
                      {correlation.comparison.avg_lessons_on_bad_network} lessons/day
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Charts row 1 ──────────────────────────────────────────── */}
          <div className="grid-2" style={{ marginBottom:'1.5rem' }}>
            <div className="chart-card">
              <div className="chart-title">Network Speed Over Time</div>
              <div className="chart-subtitle">Download & upload trends</div>
              {net?.empty ? (
                <div className="empty-state" style={{ padding:'2rem' }}>
                  <div className="empty-icon"><Wifi size={20} /></div>
                  <p>Run a speed test to see trends here.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={net?.trend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-2)" />
                    <XAxis dataKey="date" tick={{ fontSize:11 }} />
                    <YAxis tick={{ fontSize:11 }} />
                    <Tooltip contentStyle={{ background:'var(--gray-900)', border:'none', borderRadius:8, color:'white', fontSize:12 }} />
                    <Legend iconSize={10} />
                    <Line type="monotone" dataKey="avg_download" stroke="#6366f1" name="Download" dot={false} strokeWidth={2.5} />
                    <Line type="monotone" dataKey="avg_upload"   stroke="#10b981" name="Upload"   dot={false} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="chart-card">
              <div className="chart-title">Learning Activity</div>
              <div className="chart-subtitle">Lessons completed per day</div>
              {learn?.empty ? (
                <div className="empty-state" style={{ padding:'2rem' }}>
                  <div className="empty-icon"><BookOpen size={20} /></div>
                  <p>Enroll in a course to see activity here.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={learn?.activity_timeline}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-2)" />
                    <XAxis dataKey="date" tick={{ fontSize:11 }} />
                    <YAxis tick={{ fontSize:11 }} />
                    <Tooltip contentStyle={{ background:'var(--gray-900)', border:'none', borderRadius:8, color:'white', fontSize:12 }} />
                    <Bar dataKey="lessons_done" fill="#6366f1" name="Lessons" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* ── Charts row 2 ──────────────────────────────────────────── */}
          <div className="grid-2" style={{ marginBottom:'1.5rem' }}>
            {/* Correlation scatter chart */}
            <div className="chart-card">
              <div className="chart-title">Network Quality vs Learning Output</div>
              <div className="chart-subtitle">Each point = one day of data</div>
              {!correlation?.has_enough_data ? (
                <div className="empty-state" style={{ padding:'2rem' }}>
                  <div className="empty-icon"><Zap size={20} /></div>
                  <h3>Not enough data yet</h3>
                  <p>{correlation?.reason ?? 'Run tests and complete lessons on the same days.'}</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-2)" />
                    <XAxis dataKey="avg_quality" name="Network Quality" unit="/100" tick={{ fontSize:11 }} label={{ value:'Network Quality', position:'insideBottom', offset:-5, fontSize:11 }} />
                    <YAxis dataKey="lessons_done" name="Lessons" tick={{ fontSize:11 }} label={{ value:'Lessons', angle:-90, position:'insideLeft', fontSize:11 }} />
                    <ZAxis range={[40, 100]} />
                    <Tooltip cursor={{ strokeDasharray:'3 3' }} content={({ payload }) => {
                      if (!payload?.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div style={{ background:'var(--gray-900)', color:'white', padding:'.6rem .875rem', borderRadius:8, fontSize:.8+'rem' }}>
                          <div>{d.date}</div>
                          <div>Quality: {d.avg_quality}/100</div>
                          <div>Lessons: {d.lessons_done}</div>
                        </div>
                      );
                    }} />
                    <Scatter data={correlation.scatter_data} fill="#6366f1" fillOpacity={0.7} />
                  </ScatterChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Course progress */}
            <div className="chart-card">
              <div className="chart-title">Course Progress</div>
              <div className="chart-subtitle">Your active enrollments</div>
              {!learn?.course_progress?.length ? (
                <div className="empty-state" style={{ padding:'2rem' }}>
                  <div className="empty-icon"><BookOpen size={20} /></div>
                  <p>No courses enrolled yet.</p>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:'.875rem', marginTop:'.5rem' }}>
                  {learn.course_progress.map((c: any, i: number) => (
                    <div key={i}>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:'.85rem', marginBottom:'.35rem' }}>
                        <span style={{ fontWeight:600, flex:1, marginRight:'1rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.course}</span>
                        <span style={{ color:'var(--text-muted)', flexShrink:0, fontWeight:600 }}>{c.progress}%</span>
                      </div>
                      <div className="progress-bar">
                        <div className={`progress-fill ${c.is_completed ? 'green' : ''}`} style={{ width:`${c.progress}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quality distribution */}
          {net?.quality_distribution?.length ? (
            <div className="chart-card">
              <div className="chart-title">Network Quality Distribution</div>
              <div className="chart-subtitle">All-time breakdown of your connection quality scores</div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={net.quality_distribution} dataKey="count" nameKey="band" cx="50%" cy="50%" outerRadius={80} label={({ band, percent }) => `${band} (${(percent*100).toFixed(0)}%)`} labelLine={false}>
                    {net.quality_distribution.map((_: any, idx: number) => (
                      <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background:'var(--gray-900)', border:'none', borderRadius:8, color:'white', fontSize:12 }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : null}

        </div>
      )}
    </div>
  );
}
