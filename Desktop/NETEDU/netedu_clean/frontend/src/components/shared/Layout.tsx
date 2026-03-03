// src/components/shared/Layout.tsx
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LayoutDashboard, Wifi, BookOpen, LogOut, ChevronRight, Activity, Trophy, Sparkles, CloudOff } from 'lucide-react';
import NetworkAlerts from './NetworkAlerts';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../../context/ThemeContext';

const NAV_ITEMS = [
  { to:'/dashboard',       icon:LayoutDashboard, label:'Dashboard',    desc:'Overview & insights' },
  { to:'/network',         icon:Wifi,            label:'Network',      desc:'Speed tests & quality' },
  { to:'/learning',        icon:BookOpen,        label:'Learning',     desc:'Courses & progress' },
  { to:'/leaderboard',     icon:Trophy,          label:'Leaderboard',  desc:'Top students' },
  { to:'/recommendations', icon:Sparkles,        label:'AI Picks',     desc:'Smart recommendations' },
  { to:'/offline',         icon:CloudOff,        label:'Offline Mode', desc:'Download & read offline' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = () => { logout(); navigate('/login'); };
  const initials = `${user?.first_name?.[0]??''}${user?.last_name?.[0]??''}`.toUpperCase();
  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>
      <aside style={{ width:248, background:'var(--gray-900)', display:'flex', flexDirection:'column', position:'fixed', height:'100vh', left:0, top:0, borderRight:`1px solid ${isDark?'rgba(255,255,255,.06)':'rgba(0,0,0,.08)'}`, zIndex:50 }}>
        <div style={{ padding:'1.25rem 1.25rem 1rem', borderBottom:`1px solid ${isDark?'rgba(255,255,255,.06)':'rgba(0,0,0,.08)'}` }}>
          <div style={{ display:'flex', alignItems:'center', gap:'.75rem' }}>
            <div style={{ width:34,height:34,background:'linear-gradient(135deg,#6366f1,#8b5cf6)',borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 2px 8px rgba(99,102,241,.5)' }}>
              <Activity size={18} color="white" strokeWidth={2.5}/>
            </div>
            <div>
              <div style={{ color:'white',fontWeight:800,fontSize:'1rem' }}>NetEdu</div>
              <div style={{ color:'rgba(255,255,255,.3)',fontSize:'.68rem' }}>Network-Aware Learning</div>
            </div>
          </div>
        </div>
        <nav style={{ flex:1, padding:'1rem .75rem', overflowY:'auto' }}>
          <div style={{ fontSize:'.65rem',fontWeight:700,color:'rgba(255,255,255,.22)',textTransform:'uppercase',letterSpacing:'.1em',padding:'0 .5rem',marginBottom:'.5rem' }}>Menu</div>
          {NAV_ITEMS.map(({ to, icon:Icon, label, desc }) => {
            const active = location.pathname.startsWith(to);
            return (
              <NavLink key={to} to={to} style={{ display:'flex',alignItems:'center',gap:'.75rem',padding:'.65rem .75rem',borderRadius:9,marginBottom:'.2rem',textDecoration:'none',background:active?'rgba(99,102,241,.18)':'transparent',border:active?'1px solid rgba(99,102,241,.3)':'1px solid transparent',transition:'all .15s' }}>
                <div style={{ width:30,height:30,background:active?'rgba(99,102,241,.3)':'rgba(255,255,255,.06)',borderRadius:7,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                  <Icon size={15} color={active?'#a5b4fc':'rgba(255,255,255,.5)'}/>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:'.875rem',fontWeight:600,color:active?'#c7d2fe':'rgba(255,255,255,.7)' }}>{label}</div>
                  <div style={{ fontSize:'.7rem',color:'rgba(255,255,255,.25)' }}>{desc}</div>
                </div>
                {active&&<ChevronRight size={12} color="rgba(165,180,252,.5)"/>}
              </NavLink>
            );
          })}
        </nav>
        <div style={{ padding:'1rem .75rem', borderTop:`1px solid ${isDark?'rgba(255,255,255,.06)':'rgba(0,0,0,.08)'}` }}>
          <div style={{ display:'flex',alignItems:'center',gap:'.7rem',padding:'.6rem .75rem',borderRadius:9,background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.06)',marginBottom:'.5rem' }}>
            <div style={{ width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.78rem',fontWeight:800,color:'white',flexShrink:0 }}>{initials}</div>
            <div style={{ flex:1,minWidth:0 }}>
              <div style={{ fontSize:'.825rem',fontWeight:600,color:'rgba(255,255,255,.85)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{user?.full_name}</div>
              <div style={{ fontSize:'.7rem',color:'rgba(255,255,255,.35)',textTransform:'capitalize' }}>{user?.role}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{ display:'flex',alignItems:'center',gap:'.6rem',width:'100%',padding:'.55rem .75rem',borderRadius:8,background:'none',border:'none',cursor:'pointer',color:'rgba(255,255,255,.4)',fontSize:'.825rem',fontWeight:500 }}>
            <LogOut size={14}/> Sign out
          </button>
        </div>
      </aside>
      <main style={{ marginLeft:248, flex:1, minHeight:'100vh', background:'var(--bg)' }}>
        <div style={{ position:'sticky',top:0,zIndex:40,display:'flex',alignItems:'center',justifyContent:'flex-end',gap:'.75rem',padding:'.75rem 1.5rem',background:isDark?'rgba(15,15,20,0.85)':'rgba(244,244,248,0.85)',backdropFilter:'blur(12px)',borderBottom:`1px solid ${isDark?'rgba(255,255,255,.05)':'rgba(0,0,0,.06)'}` }}>
          <ThemeToggle/>
          <NetworkAlerts/>
        </div>
        <Outlet/>
      </main>
    </div>
  );
}
