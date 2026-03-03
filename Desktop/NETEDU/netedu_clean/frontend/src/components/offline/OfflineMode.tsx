// src/components/offline/OfflineMode.tsx
import { useState } from 'react';
import { WifiOff, Download, Trash2, BookOpen, Clock, CheckCircle, CloudOff, Wifi } from 'lucide-react';
import { useOfflineMode } from '../../hooks/useOfflineMode';
import { useTheme } from '../../context/ThemeContext';

const SAMPLE_LESSONS = [
  { id:'l1', title:'Introduction to React Hooks', courseTitle:'Frontend Development', content:'React Hooks allow you to use state and other React features in functional components. The most common hooks are useState, useEffect, useContext, useRef, and useCallback. They make it possible to write cleaner, more reusable code without class components.' },
  { id:'l2', title:'Python List Comprehensions',  courseTitle:'Python Programming',   content:'List comprehensions provide a concise way to create lists in Python. The syntax is: [expression for item in iterable if condition]. They are faster than for loops and make your code more Pythonic and readable.' },
  { id:'l3', title:'SQL JOIN Operations',         courseTitle:'Database Fundamentals', content:'SQL JOINs combine rows from two or more tables based on a related column. Types include INNER JOIN, LEFT JOIN, RIGHT JOIN, and FULL OUTER JOIN. Understanding JOINs is essential for working with relational databases.' },
  { id:'l4', title:'Git Branching Strategies',    courseTitle:'DevOps Basics',         content:'Git branching allows teams to work on features independently. Common strategies include Git Flow, GitHub Flow, and trunk-based development. Choose a strategy based on your team size and release cadence.' },
];

export default function OfflineMode() {
  useTheme();
  const { isOnline, cachedLessons, cacheLesson, removeCached, clearCache } = useOfflineMode();
  const [selectedLesson, setSelectedLesson] = useState<typeof SAMPLE_LESSONS[0]|null>(null);
  const [downloading, setDownloading] = useState<string|null>(null);

  const isCached = (id:string) => cachedLessons.some(l => l.id === id);

  const handleCache = async (lesson: typeof SAMPLE_LESSONS[0]) => {
    setDownloading(lesson.id);
    await new Promise(r => setTimeout(r, 1200));
    cacheLesson(lesson);
    setDownloading(null);
  };

  const card = { background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16, padding:'1.5rem', boxShadow:'var(--shadow)' };

  return (
    <div style={{ maxWidth:800, margin:'0 auto', padding:'1.5rem' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.5rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'.75rem' }}>
          <div style={{ width:40, height:40, borderRadius:12, background:isOnline?'rgba(99,102,241,0.2)':'rgba(239,68,68,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            {isOnline ? <Wifi size={20} color="#6366f1"/> : <WifiOff size={20} color="#ef4444"/>}
          </div>
          <div>
            <h2 style={{ fontSize:'1.25rem', fontWeight:800, color:'var(--text-primary)', margin:0 }}>Offline Mode</h2>
            <p style={{ color:isOnline?'#22c55e':'#ef4444', fontSize:'.8rem', margin:0, fontWeight:600 }}>
              {isOnline ? 'Online - download lessons for offline use' : 'Offline - showing cached lessons only'}
            </p>
          </div>
        </div>

        {cachedLessons.length > 0 && (
          <button
            onClick={clearCache}
            style={{ display:'flex', alignItems:'center', gap:'.4rem', padding:'.4rem .8rem', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:8, cursor:'pointer', color:'#ef4444', fontSize:'.78rem', fontWeight:600 }}
          >
            <Trash2 size={13}/>Clear Cache
          </button>
        )}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem', marginBottom:'1.5rem' }}>
        {[
          { label:'Cached Lessons', value:cachedLessons.length, icon:BookOpen, color:'#6366f1' },
          { label:'Storage Used', value:`${(cachedLessons.length*0.12).toFixed(1)} MB`, icon:CloudOff, color:'#22c55e' },
          { label:'Available', value:`${4-cachedLessons.length} lessons`, icon:Download, color:'#f59e0b' }
        ].map(stat => (
          <div key={stat.label} style={{ ...card, textAlign:'center' }}>
            <stat.icon size={22} color={stat.color} style={{ marginBottom:'.5rem' }}/>
            <div style={{ fontSize:'1.25rem', fontWeight:800, color:'var(--text-primary)' }}>{stat.value}</div>
            <div style={{ fontSize:'.75rem', color:'var(--text-secondary)' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:selectedLesson?'1fr 1fr':'1fr', gap:'1rem' }}>
        <div style={card}>
          <div style={{ display:'flex', alignItems:'center', gap:'.5rem', marginBottom:'1rem' }}>
            <Download size={16} color="#6366f1"/>
            <span style={{ fontWeight:700, color:'var(--text-primary)', fontSize:'.875rem' }}>
              {isOnline ? 'Download for Offline' : 'Cached Lessons'}
            </span>
          </div>

          {(isOnline ? SAMPLE_LESSONS : cachedLessons.map(l => ({ id:l.id, title:l.title, courseTitle:l.courseTitle, content:l.content }))).map(lesson => {
            const cached = isCached(lesson.id);
            const isDownloading = downloading === lesson.id;
            return (
              <div
                key={lesson.id}
                onClick={() => setSelectedLesson(lesson as any)}
                style={{ display:'flex', alignItems:'center', gap:'1rem', padding:'.75rem', borderRadius:10, cursor:'pointer', marginBottom:'.35rem', background:selectedLesson?.id===lesson.id?'rgba(99,102,241,0.1)':'transparent', border:selectedLesson?.id===lesson.id?'1px solid rgba(99,102,241,0.3)':'1px solid transparent' }}
              >
                <div style={{ width:36, height:36, borderRadius:9, background:'rgba(99,102,241,0.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <BookOpen size={16} color="#6366f1"/>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:600, color:'var(--text-primary)', fontSize:'.875rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{lesson.title}</div>
                  <div style={{ fontSize:'.72rem', color:'var(--text-secondary)' }}>{lesson.courseTitle}</div>
                </div>

                {isOnline && (
                  <button
                    onClick={e => { e.stopPropagation(); cached ? removeCached(lesson.id) : handleCache(lesson as any); }}
                    disabled={isDownloading}
                    style={{ display:'flex', alignItems:'center', gap:4, padding:'.3rem .6rem', borderRadius:7, cursor:'pointer', fontSize:'.7rem', fontWeight:700, background:cached?'rgba(34,197,94,0.1)':'rgba(99,102,241,0.1)', border:cached?'1px solid rgba(34,197,94,0.3)':'1px solid rgba(99,102,241,0.3)', color:cached?'#22c55e':'#6366f1', flexShrink:0 }}
                  >
                    {isDownloading ? <><Clock size={11}/>Saving...</> : cached ? <><CheckCircle size={11}/>Cached</> : <><Download size={11}/>Save</>}
                  </button>
                )}
              </div>
            );
          })}

          {!isOnline && cachedLessons.length===0 && (
            <div style={{ textAlign:'center', padding:'2rem', color:'var(--text-muted)' }}>
              <CloudOff size={32} style={{ marginBottom:'.75rem', opacity:.4 }}/>
              <div style={{ fontSize:'.85rem' }}>No cached lessons.</div>
            </div>
          )}
        </div>

        {selectedLesson && (
          <div style={card}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'.5rem' }}>
                <BookOpen size={16} color="#6366f1"/>
                <span style={{ fontWeight:700, color:'var(--text-primary)', fontSize:'.875rem' }}>Reader</span>
              </div>
              <button onClick={() => setSelectedLesson(null)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', fontSize:'1.2rem' }}>x</button>
            </div>
            <h3 style={{ fontWeight:800, color:'var(--text-primary)', fontSize:'1rem', marginBottom:'.25rem' }}>{selectedLesson.title}</h3>
            <div style={{ fontSize:'.75rem', color:'#6366f1', fontWeight:600, marginBottom:'1rem' }}>{selectedLesson.courseTitle}</div>
            <p style={{ color:'var(--text-secondary)', fontSize:'.875rem', lineHeight:1.7, margin:0 }}>{selectedLesson.content}</p>
          </div>
        )}
      </div>
    </div>
  );
}
