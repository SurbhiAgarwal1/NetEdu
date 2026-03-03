// src/components/leaderboard/Leaderboard.tsx
import { useEffect, useMemo, useState } from 'react';
import { Trophy, Medal, Star, TrendingUp, Users, RefreshCw, Search } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { analyticsApi } from '../../services/api';
import { LeaderboardEntry, LeaderboardMyRank } from '../../types';

type LeaderboardFilter = 'points' | 'courses' | 'streak';

const RANK_COLORS = ['#f59e0b', '#94a3b8', '#cd7c32'];

function sortEntries(entries: LeaderboardEntry[], filter: LeaderboardFilter): LeaderboardEntry[] {
  const sorted = [...entries].sort((a, b) => {
    if (filter === 'courses') return b.courses_completed - a.courses_completed;
    if (filter === 'streak') return b.streak - a.streak;
    return b.points - a.points;
  });
  return sorted.map((e, i) => ({ ...e, rank: i + 1 }));
}

export default function Leaderboard() {
  useTheme();
  const [filter, setFilter] = useState<LeaderboardFilter>('points');
  const [rawEntries, setRawEntries] = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState<LeaderboardMyRank | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async (initialLoad = false) => {
    setRefreshing(true);
    if (initialLoad) setLoading(true);
    setError(null);

    try {
      const [leadersRes, myRankRes] = await Promise.all([
        analyticsApi.getLeaderboard(50),
        analyticsApi.getMyRank(2),
      ]);
      setRawEntries(leadersRes.data?.leaders ?? []);
      setMyRank(myRankRes.data ?? null);
    } catch {
      setError('Could not load leaderboard.');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(true);
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const timer = setInterval(() => loadData(false), 30000);
    return () => clearInterval(timer);
  }, [autoRefresh]);

  const entries = useMemo(() => {
    const sorted = sortEntries(rawEntries, filter);
    if (!searchTerm.trim()) return sorted;
    const q = searchTerm.trim().toLowerCase();
    return sorted.filter((e) => e.name.toLowerCase().includes(q));
  }, [rawEntries, filter, searchTerm]);

  const card = {
    background:'var(--bg-card)',
    border:'1px solid var(--border)',
    borderRadius:16,
    padding:'1.5rem',
    boxShadow:'var(--shadow)',
  };

  const RankIcon = ({ rank }: { rank: number }) => {
    if (rank === 1) return <Trophy size={16} color="#f59e0b"/>;
    if (rank === 2) return <Medal size={16} color="#94a3b8"/>;
    if (rank === 3) return <Star size={16} color="#cd7c32"/>;
    return <span style={{ fontSize:'.875rem', fontWeight:800, color:'var(--text-muted)' }}>#{rank}</span>;
  };

  const topThree = [entries[1], entries[0], entries[2]];

  return (
    <div style={{ maxWidth:800, margin:'0 auto', padding:'1.5rem' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.5rem' }}>
        <div>
          <h2 style={{ fontSize:'1.5rem', fontWeight:800, color:'var(--text-primary)', margin:0, display:'flex', alignItems:'center', gap:'.5rem' }}>
            <Trophy size={24} color="#f59e0b"/> Leaderboard
          </h2>
          <p style={{ color:'var(--text-secondary)', fontSize:'.85rem', margin:'4px 0 0' }}>Top students from real platform activity</p>
        </div>
        <div style={{ display:'flex', gap:'.5rem', alignItems:'center', flexWrap:'wrap', justifyContent:'flex-end' }}>
          <button
            onClick={() => loadData(false)}
            disabled={refreshing}
            style={{
              padding:'.35rem .65rem',
              borderRadius:20,
              cursor:refreshing ? 'default' : 'pointer',
              fontSize:'.75rem',
              fontWeight:700,
              background:'var(--bg-secondary)',
              color:'var(--text-secondary)',
              border:'1px solid var(--border)',
              display:'flex',
              alignItems:'center',
              gap:'.35rem',
              opacity:refreshing ? 0.7 : 1,
            }}
          >
            <RefreshCw size={12}/> {refreshing ? 'Refreshing' : 'Refresh'}
          </button>
          <label style={{ display:'flex', alignItems:'center', gap:'.35rem', fontSize:'.75rem', color:'var(--text-secondary)', border:'1px solid var(--border)', background:'var(--bg-secondary)', borderRadius:20, padding:'.35rem .55rem' }}>
            <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />
            Auto 30s
          </label>
          {(['points', 'courses', 'streak'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding:'.35rem .75rem',
                borderRadius:20,
                cursor:'pointer',
                fontSize:'.75rem',
                fontWeight:600,
                background:filter===f?'#6366f1':'var(--bg-secondary)',
                color:filter===f?'white':'var(--text-secondary)',
                border:filter===f?'1px solid #6366f1':'1px solid var(--border)',
                textTransform:'capitalize'
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      <div style={{ ...card, marginBottom:'1rem', padding:'1rem', display:'flex', alignItems:'center', gap:'.65rem' }}>
        <Search size={16} color="var(--text-muted)"/>
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by student name"
          style={{
            width:'100%',
            background:'transparent',
            border:'none',
            outline:'none',
            color:'var(--text-primary)',
            fontSize:'.9rem',
          }}
        />
      </div>

      {loading ? (
        <div style={card}>Loading leaderboard...</div>
      ) : error ? (
        <div style={{ ...card, color:'#ef4444' }}>{error}</div>
      ) : entries.length === 0 ? (
        <div style={card}>No leaderboard data yet. Complete lessons to appear here.</div>
      ) : (
        <>
          {myRank?.found && myRank.entry && (
            <div style={{ ...card, marginBottom:'1rem', border:'1px solid rgba(34,197,94,0.35)', background:'linear-gradient(135deg, rgba(34,197,94,0.07), rgba(99,102,241,0.05))' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'1rem', flexWrap:'wrap' }}>
                <div>
                  <div style={{ fontSize:'.75rem', color:'var(--text-secondary)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.04em' }}>Your Standing</div>
                  <div style={{ fontSize:'1.2rem', fontWeight:800, color:'var(--text-primary)' }}>
                    #{myRank.rank} of {myRank.total_users}
                  </div>
                  <div style={{ fontSize:'.8rem', color:'#22c55e', fontWeight:700 }}>
                    Better than {myRank.percentile}% of users
                  </div>
                </div>
                <div style={{ display:'flex', gap:'1rem' }}>
                  <div style={{ textAlign:'center' }}>
                    <div style={{ fontSize:'.75rem', color:'var(--text-secondary)' }}>Points</div>
                    <div style={{ fontSize:'1rem', fontWeight:800, color:'var(--text-primary)' }}>{myRank.entry.points}</div>
                  </div>
                  <div style={{ textAlign:'center' }}>
                    <div style={{ fontSize:'.75rem', color:'var(--text-secondary)' }}>Courses</div>
                    <div style={{ fontSize:'1rem', fontWeight:800, color:'var(--text-primary)' }}>{myRank.entry.courses_completed}</div>
                  </div>
                  <div style={{ textAlign:'center' }}>
                    <div style={{ fontSize:'.75rem', color:'var(--text-secondary)' }}>Streak</div>
                    <div style={{ fontSize:'1rem', fontWeight:800, color:'var(--text-primary)' }}>{myRank.entry.streak}d</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'1rem', marginBottom:'1.5rem' }}>
            {topThree.map((entry, i) => {
              if (!entry) return null;
              const isFirst = i === 1;
              const color = RANK_COLORS[entry.rank - 1] || '#6366f1';
              return (
                <div key={entry.user_id} style={{ ...card, textAlign:'center', padding:'1.5rem 1rem', border:entry.is_current_user?'2px solid #6366f1':'1px solid var(--border)', transform:isFirst?'translateY(-8px)':'none', position:'relative', overflow:'hidden' }}>
                  {isFirst && <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:'linear-gradient(90deg,#6366f1,#8b5cf6)' }}/>}
                  <div style={{ width:48, height:48, borderRadius:'50%', background:`linear-gradient(135deg,${color}40,${color}20)`, border:`2px solid ${color}`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto .75rem', fontSize:'.9rem', fontWeight:800, color }}>{entry.avatar}</div>
                  <div style={{ fontWeight:700, color:'var(--text-primary)', fontSize:'.9rem', marginBottom:4 }}>
                    {entry.name}{entry.is_current_user ? ' (You)' : ''}
                  </div>
                  <div style={{ fontSize:'1.25rem', fontWeight:800, color }}>
                    {filter==='points' ? entry.points : filter==='courses' ? entry.courses_completed : entry.streak}
                  </div>
                  <div style={{ fontSize:'.7rem', color:'var(--text-muted)' }}>{filter==='streak'?'day streak':filter}</div>
                </div>
              );
            })}
          </div>

          <div style={card}>
            <div style={{ display:'flex', alignItems:'center', gap:'.5rem', marginBottom:'1rem' }}>
              <Users size={16} color="#6366f1"/>
              <span style={{ fontWeight:700, color:'var(--text-primary)', fontSize:'.875rem' }}>All Students</span>
            </div>

            {entries.map(entry => (
              <div key={entry.user_id} style={{ display:'flex', alignItems:'center', gap:'1rem', padding:'.75rem', borderRadius:10, background:entry.is_current_user?'rgba(99,102,241,0.1)':'transparent', border:entry.is_current_user?'1px solid rgba(99,102,241,0.25)':'1px solid transparent', marginBottom:'.35rem' }}>
                <div style={{ width:28, textAlign:'center' }}><RankIcon rank={entry.rank}/></div>
                <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.75rem', fontWeight:800, color:'white', flexShrink:0 }}>{entry.avatar}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, color:'var(--text-primary)', fontSize:'.875rem' }}>
                    {entry.name}{entry.is_current_user && <span style={{ fontSize:'.7rem', color:'#6366f1', fontWeight:700 }}> (You)</span>}
                  </div>
                  <div style={{ fontSize:'.72rem', color:'var(--text-secondary)' }}>
                    {entry.courses_completed} courses | {entry.lessons_completed} lessons | {entry.streak}d streak
                  </div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontWeight:800, color:'var(--text-primary)', fontSize:'.9rem' }}>
                    {filter==='points' ? entry.points : filter==='courses' ? entry.courses_completed : entry.streak}
                  </div>
                  <div style={{ fontSize:'.68rem', color:'var(--text-muted)' }}>{filter==='streak'?'days':filter}</div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:3, color:'#22c55e' }}>
                  <TrendingUp size={12}/>
                  <span style={{ fontSize:'.72rem', fontWeight:600 }}>{entry.avg_score}%</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
