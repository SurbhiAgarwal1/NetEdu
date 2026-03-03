// src/components/ai/AIRecommendations.tsx
import { useState, useEffect } from 'react';
import { Sparkles, Wifi, WifiOff, BookOpen, Video, FileText, Headphones, ChevronRight, Zap } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface Recommendation { id:string; type:'video'|'article'|'audio'|'interactive'; title:string; course:string; duration:string; quality:string; reason:string; difficulty:'beginner'|'intermediate'|'advanced'; }
type NetworkQuality = 'excellent'|'good'|'poor'|'offline';

const RECOMMENDATIONS: Record<NetworkQuality, Recommendation[]> = {
  excellent: [
    { id:'e1', type:'video',       title:'Advanced Machine Learning with TensorFlow', course:'AI & ML Fundamentals',  duration:'45 min', quality:'4K',    reason:'Your excellent connection supports HD streaming', difficulty:'advanced' },
    { id:'e2', type:'interactive', title:'Live Coding: Build a REST API',             course:'Backend Development',   duration:'60 min', quality:'Live',   reason:'Real-time collaboration available on your network', difficulty:'intermediate' },
    { id:'e3', type:'video',       title:'System Design Masterclass',                 course:'Software Architecture', duration:'90 min', quality:'1080p',  reason:'High-quality video fits your bandwidth', difficulty:'advanced' },
  ],
  good: [
    { id:'g1', type:'video',   title:'React Hooks Deep Dive',           course:'Frontend Development', duration:'35 min', quality:'720p', reason:'Good connection — smooth HD playback', difficulty:'intermediate' },
    { id:'g2', type:'article', title:'Understanding Database Indexing', course:'Databases',             duration:'20 min', quality:'Text', reason:'Lightweight content for reliable loading', difficulty:'intermediate' },
    { id:'g3', type:'video',   title:'Python for Data Science: Pandas', course:'Data Science',          duration:'40 min', quality:'720p', reason:'Optimized for your current speed', difficulty:'beginner' },
  ],
  poor: [
    { id:'p1', type:'audio',   title:'Web Development Concepts Podcast',     course:'Web Development', duration:'25 min', quality:'Audio', reason:'Audio uses minimal bandwidth', difficulty:'beginner' },
    { id:'p2', type:'article', title:'Git & Version Control Cheat Sheet',    course:'DevOps Basics',   duration:'10 min', quality:'Text',  reason:'Text content works great on poor connections', difficulty:'beginner' },
    { id:'p3', type:'article', title:'JavaScript ES6 Quick Reference Guide', course:'JavaScript',      duration:'15 min', quality:'Text',  reason:'Lightweight reading for low bandwidth', difficulty:'intermediate' },
  ],
  offline: [
    { id:'o1', type:'article', title:'Algorithms & Data Structures Notes',  course:'Computer Science', duration:'30 min', quality:'Cached', reason:'Available offline', difficulty:'intermediate' },
    { id:'o2', type:'audio',   title:'Clean Code Principles — Cached Audio',course:'Best Practices',   duration:'20 min', quality:'Cached', reason:'Saved for offline listening', difficulty:'beginner' },
    { id:'o3', type:'article', title:'SQL Query Optimization Tips',         course:'Databases',        duration:'12 min', quality:'Cached', reason:'Downloaded content ready to read', difficulty:'advanced' },
  ],
};

const TYPE_ICONS = { video:Video, article:FileText, audio:Headphones, interactive:BookOpen };
const TYPE_COLORS = { video:'#6366f1', article:'#22c55e', audio:'#f59e0b', interactive:'#ec4899' };
const QUALITY_CONFIG: Record<NetworkQuality,{label:string;color:string;bg:string;desc:string}> = {
  excellent: { label:'Excellent', color:'#22c55e', bg:'rgba(34,197,94,0.1)',  desc:'Full HD videos & live sessions available' },
  good:      { label:'Good',      color:'#6366f1', bg:'rgba(99,102,241,0.1)', desc:'HD videos & interactive content available' },
  poor:      { label:'Poor',      color:'#f59e0b', bg:'rgba(245,158,11,0.1)', desc:'Lightweight content recommended' },
  offline:   { label:'Offline',   color:'#ef4444', bg:'rgba(239,68,68,0.1)',  desc:'Showing cached content only' },
};

export default function AIRecommendations({ networkQuality='good', latency }: { networkQuality?:NetworkQuality; latency?:number|null }) {
  const { isDark } = useTheme();
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => { setRecs(RECOMMENDATIONS[networkQuality]||RECOMMENDATIONS.good); setLoading(false); }, 800);
    return () => clearTimeout(t);
  }, [networkQuality]);
  const qConfig = QUALITY_CONFIG[networkQuality];
  const diffColor = { beginner:'#22c55e', intermediate:'#6366f1', advanced:'#f59e0b' };
  const card = { background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16, padding:'1.5rem', boxShadow:'var(--shadow)' };
  return (
    <div style={{ maxWidth:800,margin:'0 auto',padding:'1.5rem' }}>
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
      <div style={{ display:'flex',alignItems:'center',gap:'.75rem',marginBottom:'1rem' }}>
        <div style={{ width:40,height:40,borderRadius:12,background:'linear-gradient(135deg,#6366f1,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center' }}><Sparkles size={20} color="white"/></div>
        <div>
          <h2 style={{ fontSize:'1.25rem',fontWeight:800,color:'var(--text-primary)',margin:0 }}>AI Recommendations</h2>
          <p style={{ color:'var(--text-secondary)',fontSize:'.8rem',margin:0 }}>Content matched to your network speed</p>
        </div>
      </div>
      <div style={{ display:'flex',alignItems:'center',gap:'.75rem',padding:'.875rem 1.25rem',background:qConfig.bg,border:`1px solid ${qConfig.color}30`,borderRadius:12,marginBottom:'1.5rem' }}>
        {networkQuality==='offline'?<WifiOff size={18} color={qConfig.color}/>:<Wifi size={18} color={qConfig.color}/>}
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:700,color:qConfig.color,fontSize:'.875rem' }}>{qConfig.label} Connection{latency?` · ${latency}ms`:''}</div>
          <div style={{ color:'var(--text-secondary)',fontSize:'.78rem' }}>{qConfig.desc}</div>
        </div>
        <div style={{ display:'flex',alignItems:'center',gap:4,color:qConfig.color,fontSize:'.75rem',fontWeight:600 }}><Zap size={13}/>AI-Optimized</div>
      </div>
      {loading ? (
        <div style={{ display:'flex',flexDirection:'column',gap:'1rem' }}>
          {[1,2,3].map(i=><div key={i} style={{ ...card,height:100,background:isDark?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.03)',animation:'pulse 1.5s ease-in-out infinite' }}/>)}
        </div>
      ) : (
        <div style={{ display:'flex',flexDirection:'column',gap:'1rem' }}>
          {recs.map((rec,idx)=>{
            const Icon = TYPE_ICONS[rec.type];
            const color = TYPE_COLORS[rec.type];
            return (
              <div key={rec.id} style={{ ...card,display:'flex',alignItems:'center',gap:'1rem',cursor:'pointer',animation:`slideIn .3s ease ${idx*0.1}s both` }}>
                <div style={{ width:48,height:48,borderRadius:12,background:`${color}20`,border:`1px solid ${color}30`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}><Icon size={22} color={color}/></div>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ display:'flex',alignItems:'center',gap:'.5rem',marginBottom:3 }}>
                    <span style={{ fontWeight:700,color:'var(--text-primary)',fontSize:'.9rem' }}>{rec.title}</span>
                    <span style={{ fontSize:'.65rem',fontWeight:700,color:diffColor[rec.difficulty],background:`${diffColor[rec.difficulty]}15`,padding:'2px 6px',borderRadius:6,textTransform:'capitalize',flexShrink:0 }}>{rec.difficulty}</span>
                  </div>
                  <div style={{ fontSize:'.78rem',color:'var(--text-secondary)',marginBottom:3 }}>{rec.course} · {rec.duration}</div>
                  <div style={{ fontSize:'.72rem',color:qConfig.color,display:'flex',alignItems:'center',gap:4 }}><Sparkles size={10}/>{rec.reason}</div>
                </div>
                <div style={{ display:'flex',flexDirection:'column',alignItems:'flex-end',gap:'.4rem',flexShrink:0 }}>
                  <span style={{ fontSize:'.7rem',fontWeight:700,color,background:`${color}15`,padding:'3px 8px',borderRadius:6 }}>{rec.quality}</span>
                  <ChevronRight size={16} color="var(--text-muted)"/>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
