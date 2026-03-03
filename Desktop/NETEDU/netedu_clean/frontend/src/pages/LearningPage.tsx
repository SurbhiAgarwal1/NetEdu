// src/pages/LearningPage.tsx
import { useEffect, useState } from 'react';
import { BookOpen, CheckCircle, Users, Lock, PlusCircle, Globe } from 'lucide-react';
import { learningApi } from '../services/api';
import { Course, Enrollment } from '../types';
import { useAuth } from '../hooks/useAuth';

const DIFFICULTY_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  beginner:     { color:'#065f46', bg:'#d1fae5', label:'Beginner' },
  intermediate: { color:'#92400e', bg:'#fef3c7', label:'Intermediate' },
  advanced:     { color:'#991b1b', bg:'#fee2e2', label:'Advanced' },
};

export default function LearningPage() {
  const { user } = useAuth();
  const isInstructor = user?.role === 'teacher' || user?.role === 'admin';

  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [tab, setTab] = useState<'enrolled' | 'browse'>('enrolled');
  const [enrolling, setEnrolling] = useState<number | null>(null);
  const [successId, setSuccessId] = useState<number | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState('');
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    difficulty: 'beginner',
    tags: '',
    is_published: false,
  });

  const load = () => {
    learningApi.getCourses().then(r => setCourses(r.data.results ?? r.data)).catch(() => {});
    learningApi.getEnrollments().then(r => setEnrollments(r.data.results ?? r.data)).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const enrolledIds = new Set(enrollments.map(e => e.course));

  const handleEnroll = async (courseId: number) => {
    setEnrolling(courseId);
    try {
      await learningApi.enroll(courseId);
      setSuccessId(courseId);
      setTimeout(() => setSuccessId(null), 3000);
      load();
    } finally {
      setEnrolling(null);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!courseForm.title.trim() || !courseForm.description.trim()) {
      setFormError('Title and description are required.');
      return;
    }

    setCreating(true);
    try {
      await learningApi.createCourse({
        title: courseForm.title.trim(),
        description: courseForm.description.trim(),
        difficulty: courseForm.difficulty,
        is_published: courseForm.is_published,
        tags: courseForm.tags
          .split(',')
          .map(t => t.trim())
          .filter(Boolean),
      });
      setCourseForm({ title: '', description: '', difficulty: 'beginner', tags: '', is_published: false });
      setCreateOpen(false);
      load();
    } catch (err: any) {
      const d = err?.response?.data;
      if (d && typeof d === 'object') {
        const first = Object.values(d)[0] as any;
        setFormError(Array.isArray(first) ? String(first[0]) : 'Could not create course.');
      } else {
        setFormError('Could not create course.');
      }
    } finally {
      setCreating(false);
    }
  };

  const togglePublish = async (course: Course) => {
    try {
      await learningApi.updateCourse(course.id, { is_published: !course.is_published });
      load();
    } catch {
      // no-op
    }
  };

  const diff = (d: string) => DIFFICULTY_CONFIG[d] ?? { color:'#334155', bg:'#f1f5f9', label: d };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Learning</h1>
        <p>Track your progress across all enrolled courses.</p>
      </div>

      {isInstructor && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.9rem' }}>
            <h3 style={{ fontSize: '.95rem', fontWeight: 700 }}>Instructor Tools</h3>
            <button className="btn btn-primary btn-sm" onClick={() => setCreateOpen(v => !v)}>
              <PlusCircle size={14} /> {createOpen ? 'Close' : 'Create Course'}
            </button>
          </div>

          {createOpen && (
            <form onSubmit={handleCreateCourse}>
              {formError && <div className="alert alert-error">{formError}</div>}
              <div className="form-group">
                <label className="form-label">Title</label>
                <input className="form-input" value={courseForm.title} onChange={e => setCourseForm({ ...courseForm, title: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows={3} value={courseForm.description} onChange={e => setCourseForm({ ...courseForm, description: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Difficulty</label>
                  <select className="form-input" value={courseForm.difficulty} onChange={e => setCourseForm({ ...courseForm, difficulty: e.target.value })}>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Tags (comma-separated)</label>
                  <input className="form-input" value={courseForm.tags} onChange={e => setCourseForm({ ...courseForm, tags: e.target.value })} placeholder="python, networking" />
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.9rem', fontSize: '.86rem' }}>
                <input type="checkbox" checked={courseForm.is_published} onChange={e => setCourseForm({ ...courseForm, is_published: e.target.checked })} />
                Publish immediately
              </label>
              <button className="btn btn-primary" disabled={creating}>{creating ? 'Creating...' : 'Create Course'}</button>
            </form>
          )}

          {courses.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <div style={{ fontSize: '.8rem', color: 'var(--text-muted)', marginBottom: '.45rem' }}>Your courses</div>
              <div style={{ display: 'grid', gap: '.5rem' }}>
                {courses.map(c => (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '.6rem .75rem', border: '1px solid var(--border)', borderRadius: 8 }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{c.title}</div>
                      <div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>{c.total_lessons} lessons</div>
                    </div>
                    <button className={`btn btn-sm ${c.is_published ? 'btn-secondary' : 'btn-primary'}`} onClick={() => togglePublish(c)}>
                      <Globe size={13} /> {c.is_published ? 'Published' : 'Publish'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {enrollments.length > 0 && (
        <div className="stat-grid" style={{ marginBottom:'2rem' }}>
          <div className="stat-card accent-blue">
            <div className="stat-label">Enrolled</div>
            <div className="stat-value">{enrollments.length}</div>
            <div className="stat-unit">courses</div>
          </div>
          <div className="stat-card accent-green">
            <div className="stat-label">Completed</div>
            <div className="stat-value">{enrollments.filter(e => e.is_completed).length}</div>
            <div className="stat-unit">courses</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Avg Progress</div>
            <div className="stat-value">
              {enrollments.length > 0
                ? Math.round(enrollments.reduce((a, e) => a + e.progress_percentage, 0) / enrollments.length)
                : 0}
            </div>
            <div className="stat-unit">%</div>
          </div>
        </div>
      )}

      <div className="tab-nav">
        <button className={`tab-btn ${tab === 'enrolled' ? 'active' : ''}`} onClick={() => setTab('enrolled')}>
          My Courses {enrollments.length > 0 && <span style={{ background:'var(--brand-100)', color:'var(--brand-700)', fontSize:'.72rem', fontWeight:700, padding:'.1rem .45rem', borderRadius:999, marginLeft:'.4rem' }}>{enrollments.length}</span>}
        </button>
        <button className={`tab-btn ${tab === 'browse' ? 'active' : ''}`} onClick={() => setTab('browse')}>Browse Courses</button>
      </div>

      {tab === 'enrolled' && (
        <>
          {enrollments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><BookOpen size={24} /></div>
              <h3>No courses yet</h3>
              <p>Browse available courses and enroll to get started.</p>
              <button className="btn btn-primary" style={{ marginTop:'1rem' }} onClick={() => setTab('browse')}>Browse courses</button>
            </div>
          ) : (
            <div className="grid-auto">
              {enrollments.map(e => (
                <div key={e.id} className="card" style={{ display:'flex', flexDirection:'column' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'.875rem' }}>
                    <div style={{ width:40, height:40, background:'var(--brand-50)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <BookOpen size={18} color="var(--brand-500)" />
                    </div>
                    {e.is_completed && (
                      <div style={{ display:'flex', alignItems:'center', gap:'.3rem', background:'var(--success-bg)', color:'#065f46', fontSize:'.72rem', fontWeight:700, padding:'.2rem .6rem', borderRadius:999 }}>
                        <CheckCircle size={12} />Completed
                      </div>
                    )}
                  </div>

                  <h3 style={{ fontSize:'.925rem', fontWeight:700, marginBottom:'.75rem', flex:1 }}>{e.course_title}</h3>

                  <div style={{ marginBottom:'.5rem', display:'flex', justifyContent:'space-between', fontSize:'.8rem' }}>
                    <span style={{ color:'var(--text-muted)' }}>Progress</span>
                    <span style={{ fontWeight:700, color: e.is_completed ? 'var(--success)' : 'var(--text)' }}>
                      {e.progress_percentage}%
                    </span>
                  </div>
                  <div className="progress-bar" style={{ marginBottom:'.875rem' }}>
                    <div className={`progress-fill ${e.is_completed ? 'green' : ''}`} style={{ width:`${e.progress_percentage}%` }} />
                  </div>

                  <p style={{ fontSize:'.75rem', color:'var(--text-muted)' }}>
                    Enrolled {new Date(e.enrolled_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'browse' && (
        <>
          {successId && (
            <div className="alert alert-success" style={{ maxWidth:500 }}>
              <CheckCircle size={16} /> Enrolled successfully! Check "My Courses" to track progress.
            </div>
          )}

          {courses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><Lock size={22} /></div>
              <h3>No courses available</h3>
              <p>Teachers haven't published any courses yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid-auto">
              {courses.map(c => {
                const d = diff(c.difficulty);
                const enrolled = enrolledIds.has(c.id);
                return (
                  <div key={c.id} className="card" style={{ display:'flex', flexDirection:'column' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
                      <div style={{ width:40, height:40, background:'var(--brand-50)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <BookOpen size={18} color="var(--brand-500)" />
                      </div>
                      <span style={{ background:d.bg, color:d.color, fontSize:'.7rem', fontWeight:700, padding:'.2rem .6rem', borderRadius:999, textTransform:'capitalize' }}>
                        {d.label}
                      </span>
                    </div>

                    <h3 style={{ fontSize:'.95rem', fontWeight:700, marginBottom:'.5rem' }}>{c.title}</h3>
                    <p style={{ fontSize:'.825rem', color:'var(--text-muted)', lineHeight:1.5, flex:1, marginBottom:'1rem' }}>
                      {c.description.slice(0,120)}{c.description.length > 120 ? '...' : ''}
                    </p>

                    {c.tags?.length > 0 && (
                      <div style={{ display:'flex', gap:'.35rem', flexWrap:'wrap', marginBottom:'1rem' }}>
                        {c.tags.map((t:string) => (
                          <span key={t} style={{ background:'var(--brand-50)', color:'var(--brand-600)', fontSize:'.7rem', fontWeight:600, padding:'.15rem .5rem', borderRadius:999 }}>{t}</span>
                        ))}
                      </div>
                    )}

                    <div style={{ display:'flex', gap:'1.25rem', fontSize:'.78rem', color:'var(--text-muted)', marginBottom:'1.25rem' }}>
                      <span style={{ display:'flex', alignItems:'center', gap:'.3rem' }}><BookOpen size={12} />{c.total_lessons} lessons</span>
                      <span style={{ display:'flex', alignItems:'center', gap:'.3rem' }}><Users size={12} />{c.enrolled_count} enrolled</span>
                    </div>

                    <button
                      className={`btn btn-sm btn-full ${enrolled ? 'btn-secondary' : 'btn-primary'}`}
                      disabled={enrolled || enrolling === c.id}
                      onClick={() => handleEnroll(c.id)}
                    >
                      {enrolled ? <><CheckCircle size={13} /> Enrolled</> : enrolling === c.id ? 'Enrolling...' : 'Enroll Free'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
