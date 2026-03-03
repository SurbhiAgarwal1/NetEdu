// src/pages/LoginPage.tsx
import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Activity, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      if (!err?.response) setError('Cannot reach server. Please check connection and try again.');
      else setError('Invalid email or password. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <>
      <style>{`
        @keyframes gradientShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes floatBlob1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%  { transform: translate(30px, -20px) scale(1.1); }
          66%  { transform: translate(-20px, 30px) scale(0.95); }
        }
        @keyframes floatBlob2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%  { transform: translate(-25px, 20px) scale(1.05); }
          66%  { transform: translate(20px, -30px) scale(0.9); }
        }
        .login-left-panel {
          background: linear-gradient(160deg, #0f172a, #1e1b4b, #312e81, #1e1b4b, #0f172a, #1a1040, #312e81);
          background-size: 400% 400%;
          animation: gradientShift 8s ease infinite;
        }
      `}</style>
      <div style={{ minHeight:'100vh', display:'flex' }}>
        <div className="login-left-panel" style={{ flex:'0 0 420px', display:'flex', flexDirection:'column', justifyContent:'space-between', padding:'2.5rem', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:-80, right:-80, width:320, height:320, background:'rgba(99,102,241,.18)', borderRadius:'50%', filter:'blur(60px)', animation:'floatBlob1 7s ease-in-out infinite' }} />
          <div style={{ position:'absolute', bottom:-60, left:-60, width:240, height:240, background:'rgba(139,92,246,.15)', borderRadius:'50%', filter:'blur(50px)', animation:'floatBlob2 9s ease-in-out infinite' }} />
          <div style={{ position:'absolute', top:'40%', left:'30%', width:180, height:180, background:'rgba(79,70,229,.1)', borderRadius:'50%', filter:'blur(40px)', animation:'floatBlob1 11s ease-in-out infinite reverse' }} />
          <div style={{ display:'flex', alignItems:'center', gap:'.75rem', zIndex:1 }}>
            <div style={{ width:36,height:36,background:'linear-gradient(135deg,#6366f1,#8b5cf6)',borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center' }}>
              <Activity size={20} color="white"/>
            </div>
            <span style={{ color:'white',fontWeight:800,fontSize:'1.1rem' }}>NetEdu</span>
          </div>
          <div style={{ zIndex:1 }}>
            <h1 style={{ color:'white',fontSize:'2rem',fontWeight:800,lineHeight:1.2,marginBottom:'1rem',letterSpacing:'-.02em' }}>
              Understand how your network affects your learning.
            </h1>
            <p style={{ color:'rgba(255,255,255,.5)',fontSize:'.9rem',lineHeight:1.6 }}>
              Track internet quality, monitor learning progress, and discover the connection between your connectivity and your education.
            </p>
            <div style={{ marginTop:'2.5rem',display:'flex',flexDirection:'column',gap:'.75rem' }}>
              {['Real speed tests - not simulated','Pandas-powered analytics dashboard','Network-learning correlation insights'].map(f => (
                <div key={f} style={{ display:'flex',alignItems:'center',gap:'.6rem',color:'rgba(255,255,255,.65)',fontSize:'.85rem' }}>
                  <div style={{ width:5,height:5,borderRadius:'50%',background:'#6366f1',flexShrink:0 }}/>
                  {f}
                </div>
              ))}
            </div>
          </div>
          <p style={{ color:'rgba(255,255,255,.2)',fontSize:'.75rem',zIndex:1 }}>Built with Django - React - PostgreSQL - Docker</p>
        </div>
        <div style={{ flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:'2rem',background:'var(--bg)' }}>
          <div style={{ width:'100%',maxWidth:400 }}>
            <div style={{ marginBottom:'2rem' }}>
              <h2 style={{ fontSize:'1.5rem',fontWeight:800,letterSpacing:'-.02em',marginBottom:'.4rem' }}>Welcome back</h2>
              <p style={{ color:'var(--text-muted)',fontSize:'.9rem' }}>Sign in to your NetEdu account</p>
            </div>
            {error && <div className="alert alert-error" style={{ marginBottom:'1.25rem' }}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email address</label>
                <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required autoFocus/>
              </div>
              <div className="form-group" style={{ marginBottom:'1.5rem' }}>
                <label className="form-label">Password</label>
                <div style={{ position:'relative',width:'100%' }}>
                  <input className="form-input" type={showPassword?'text':'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" required style={{ paddingRight:'2.5rem',width:'100%' }}/>
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position:'absolute',right:'0.75rem',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'var(--text-muted)',padding:'0.25rem',display:'flex',alignItems:'center',zIndex:10 }}>
                    {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                  </button>
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
            <p style={{ textAlign:'center',marginTop:'1.5rem',fontSize:'.875rem',color:'var(--text-muted)' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color:'var(--brand-600)',fontWeight:700,textDecoration:'none' }}>Create one free</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
