// src/components/shared/NetworkAlerts.tsx
import { useEffect, useState } from 'react';
import { useNetworkAlerts, NetworkAlert } from '../../hooks/useNetworkAlerts';
import { Wifi, WifiOff, AlertTriangle, CheckCircle, X, Bell, BellOff, ChevronDown } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

function AlertToast({ alert, onDismiss }: { alert: NetworkAlert; onDismiss: () => void }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    setTimeout(() => setVisible(true), 10);
    const t = setTimeout(() => { setVisible(false); setTimeout(onDismiss, 300); }, 6000);
    return () => clearTimeout(t);
  }, [onDismiss]);
  const colors = { critical:{bg:'#1a0a0a',border:'#ef4444',icon:'#ef4444',text:'#fca5a5'}, warning:{bg:'#1a1200',border:'#f59e0b',icon:'#f59e0b',text:'#fcd34d'}, recovery:{bg:'#0a1a0f',border:'#22c55e',icon:'#22c55e',text:'#86efac'}, info:{bg:'#0a0f1a',border:'#6366f1',icon:'#6366f1',text:'#a5b4fc'} }[alert.type];
  const Icon = { critical:WifiOff, warning:AlertTriangle, recovery:CheckCircle, info:Wifi }[alert.type];
  return (
    <div style={{ display:'flex',alignItems:'flex-start',gap:'.75rem',padding:'.875rem 1rem',background:colors.bg,border:`1px solid ${colors.border}`,borderRadius:12,boxShadow:'0 4px 24px rgba(0,0,0,.4)',opacity:visible?1:0,transform:visible?'translateX(0)':'translateX(100%)',transition:'all .3s cubic-bezier(.34,1.56,.64,1)',maxWidth:340,width:'100%' }}>
      <div style={{ width:32,height:32,borderRadius:8,background:`${colors.border}22`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}><Icon size={16} color={colors.icon} /></div>
      <div style={{ flex:1,minWidth:0 }}>
        <div style={{ fontSize:'.825rem',fontWeight:700,color:colors.text,marginBottom:2 }}>{alert.title}</div>
        <div style={{ fontSize:'.75rem',color:'rgba(255,255,255,.5)',lineHeight:1.4 }}>{alert.message}</div>
        <div style={{ fontSize:'.68rem',color:'rgba(255,255,255,.25)',marginTop:4 }}>{alert.timestamp.toLocaleTimeString()}</div>
      </div>
      <button onClick={() => { setVisible(false); setTimeout(onDismiss,300); }} style={{ background:'none',border:'none',cursor:'pointer',padding:2,color:'rgba(255,255,255,.3)',flexShrink:0 }}><X size={14} /></button>
    </div>
  );
}

export default function NetworkAlerts() {
  const { alerts, status, dismissAlert, dismissAll } = useNetworkAlerts();
  const { isDark } = useTheme();
  const [showPanel, setShowPanel] = useState(false);
  const config = { excellent:{color:'#22c55e',label:'Excellent',pulse:false}, good:{color:'#6366f1',label:'Good',pulse:false}, poor:{color:'#f59e0b',label:'Poor',pulse:true}, offline:{color:'#ef4444',label:'Offline',pulse:true} }[status.quality];
  return (
    <>
      <style>{`@keyframes pulse-ring{0%{transform:scale(1);opacity:.8}100%{transform:scale(2.5);opacity:0}}`}</style>
      <div style={{ position:'relative' }}>
        <button onClick={() => setShowPanel(p=>!p)} style={{ display:'flex',alignItems:'center',gap:'.5rem',padding:'.4rem .75rem',background:`${config.color}15`,border:`1px solid ${config.color}40`,borderRadius:20,cursor:'pointer' }}>
          <div style={{ position:'relative',width:8,height:8 }}>
            <div style={{ width:8,height:8,borderRadius:'50%',background:config.color }} />
            {config.pulse && <div style={{ position:'absolute',inset:0,borderRadius:'50%',background:config.color,animation:'pulse-ring 1.5s ease-out infinite' }} />}
          </div>
          <span style={{ fontSize:'.75rem',fontWeight:600,color:config.color }}>{config.label}</span>
          {status.latency !== null && <span style={{ fontSize:'.7rem',color:'rgba(255,255,255,.35)' }}>{status.latency}ms</span>}
          {alerts.length > 0 && <div style={{ minWidth:18,height:18,borderRadius:9,background:'#ef4444',color:'white',fontSize:'.65rem',fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center',padding:'0 4px' }}>{alerts.length}</div>}
          <ChevronDown size={11} color="rgba(255,255,255,.3)" />
        </button>
        {showPanel && (
          <div style={{ position:'absolute',top:'110%',right:0,width:320,maxHeight:400,background:isDark?'#0f0f13':'#ffffff',border:`1px solid ${isDark?'rgba(255,255,255,.08)':'rgba(0,0,0,.1)'}`,borderRadius:14,boxShadow:'0 20px 60px rgba(0,0,0,.5)',overflow:'hidden',zIndex:1000 }}>
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'.875rem 1rem',borderBottom:`1px solid ${isDark?'rgba(255,255,255,.06)':'rgba(0,0,0,.06)'}` }}>
              <div style={{ display:'flex',alignItems:'center',gap:'.5rem' }}><Bell size={14} color="#6366f1" /><span style={{ fontSize:'.825rem',fontWeight:700,color:'var(--text-primary)' }}>Network Alerts</span></div>
              {alerts.length > 0 && <button onClick={dismissAll} style={{ background:'none',border:'none',cursor:'pointer',fontSize:'.7rem',color:'var(--text-muted)' }}>Clear all</button>}
            </div>
            <div style={{ overflowY:'auto',maxHeight:340 }}>
              {alerts.length === 0 ? (
                <div style={{ display:'flex',flexDirection:'column',alignItems:'center',padding:'2rem 1rem',gap:'.75rem' }}><BellOff size={28} color="var(--text-muted)" /><span style={{ fontSize:'.8rem',color:'var(--text-muted)' }}>No alerts</span></div>
              ) : alerts.map(alert => (
                <div key={alert.id} style={{ display:'flex',alignItems:'flex-start',gap:'.75rem',padding:'.75rem 1rem',borderBottom:`1px solid ${isDark?'rgba(255,255,255,.04)':'rgba(0,0,0,.04)'}` }}>
                  <div style={{ flex:1,fontSize:'.75rem',fontWeight:600,color:{critical:'#fca5a5',warning:'#fcd34d',recovery:'#86efac',info:'#a5b4fc'}[alert.type] }}>
                    <div>{alert.title}</div>
                    <div style={{ fontWeight:400,color:'var(--text-secondary)',marginTop:2 }}>{alert.message}</div>
                    <div style={{ fontSize:'.68rem',color:'var(--text-muted)',marginTop:3 }}>{alert.timestamp.toLocaleTimeString()}</div>
                  </div>
                  <button onClick={() => dismissAlert(alert.id)} style={{ background:'none',border:'none',cursor:'pointer',color:'var(--text-muted)' }}><X size={12} /></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div style={{ position:'fixed',bottom:'1.5rem',right:'1.5rem',display:'flex',flexDirection:'column',gap:'.5rem',zIndex:9999,pointerEvents:'none' }}>
        {alerts.slice(0,3).map(alert => <div key={alert.id} style={{ pointerEvents:'auto' }}><AlertToast alert={alert} onDismiss={() => dismissAlert(alert.id)} /></div>)}
      </div>
      {showPanel && <div onClick={() => setShowPanel(false)} style={{ position:'fixed',inset:0,zIndex:999 }} />}
    </>
  );
}
