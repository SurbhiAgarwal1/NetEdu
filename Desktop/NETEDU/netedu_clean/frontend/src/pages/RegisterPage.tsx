// src/pages/RegisterPage.tsx
import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Activity, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const [form, setForm] = useState({ first_name:'', last_name:'', email:'', password:'', confirm_password:'', role:'student' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const update = (f: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(p => ({...p, [f]: e.target.value}));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) { setError('Password must be at least 8 characters long.'); return; }
    if (form.password !== form.confirm_password) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err: any) {
      const d = err.response?.data;
      if (!err?.response) setError('Cannot reach server. Please check connection and try again.');
      else if (d?.email) setError(d.email[0] || 'This email is already registered.');
      else if (d?.password) setError(d.password[0] || 'Password is too weak.');
      else if (d?.detail) setError(d.detail);
      else setError('Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  const inputStyle = { paddingRight:'2.5rem', width:'100%', boxSizing:'border-box' as const };
  const eyeBtn = { position:'absolute' as const, right:'0.75rem', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', padding:'0.25rem', display:'flex', alignItems:'center', zIndex:10 };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', padding:'2rem' }}>
      <div style={{ width:'100%', maxWidth:480 }}>
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <div style={{ width:44,height:44,background:'linear-gradient(135deg,#6366f1,#8b5cf6)',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto .875rem',boxShadow:'0 4px 12px rgba(99,102,241,.35)' }}>
            <Activity size={22} color="white"/>
          </div>
          <h1 style={{ fontSize:'1.5rem',fontWeight:800,letterSpacing:'-.02em',marginBottom:'.3rem' }}>Create your account</h1>
          <p style={{ color:'var(--text-muted)',fontSize:'.875rem' }}>Join NetEdu and start tracking your learning journey</p>
        </div>
        <div className="card">
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
              <div className="form-group">
                <label className="form-label">First name</label>
                <input className="form-input" value={form.first_name} onChange={update('first_name')} placeholder="Surbhi" required style={{ width:'100%', boxSizing:'border-box' as const }}/>
              </div>
              <div className="form-group">
                <label className="form-label">Last name</label>
                <input className="form-input" value={form.last_name} onChange={update('last_name')} placeholder="Agarwal" required style={{ width:'100%', boxSizing:'border-box' as const }}/>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input className="form-input" type="email" value={form.email} onChange={update('email')} placeholder="you@example.com" required style={{ width:'100%', boxSizing:'border-box' as const }}/>
            </div>
            <div className="form-group">
              <label className="form-label">I am a</label>
              <select className="form-input" value={form.role} onChange={update('role')} style={{ width:'100%', boxSizing:'border-box' as const }}>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position:'relative', width:'100%' }}>
                  <input className="form-input" type={showPassword?'text':'password'} value={form.password} onChange={update('password')} placeholder="8+ characters" required style={inputStyle}/>
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={eyeBtn}>
                    {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Confirm password</label>
                <div style={{ position:'relative', width:'100%' }}>
                  <input className="form-input" type={showConfirmPassword?'text':'password'} value={form.confirm_password} onChange={update('confirm_password')} placeholder="Repeat password" required style={inputStyle}/>
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={eyeBtn}>
                    {showConfirmPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                  </button>
                </div>
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading} style={{ marginTop:'.5rem' }}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
          <p style={{ textAlign:'center',marginTop:'1.25rem',fontSize:'.875rem',color:'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color:'var(--brand-600)',fontWeight:700,textDecoration:'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
