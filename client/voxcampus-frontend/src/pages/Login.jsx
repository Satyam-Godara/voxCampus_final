// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import api from '../utils/api';

// const inp = {
//   width: '100%', background: 'var(--bg3)', border: '1px solid var(--border2)',
//   borderRadius: 10, padding: '10px 14px', color: 'var(--text)', fontSize: 14,
//   fontFamily: 'var(--font)', outline: 'none',
// };
// const lbl = { display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text2)', marginBottom: 6 };
// const grp = { marginBottom: 14 };

// function RegisterStep1({ classes, onOtpSent }) {
//   const [form, setForm]   = useState({ rollNo: '', name: '', email: '', classId: '' });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

//   const submit = async (e) => {
//     e.preventDefault(); setError(''); setLoading(true);
//     try {
//       await api.post('/auth/register/send-otp', form);
//       onOtpSent(form);
//     } catch (err) { setError(err.response?.data?.error || 'Failed to send OTP'); }
//     finally { setLoading(false); }
//   };

//   return (
//     <form onSubmit={submit}>
//       {error && <div className="login-error">{error}</div>}
//       <div style={grp}><label style={lbl}>Roll Number</label>
//         <input style={{ ...inp, fontFamily: 'var(--mono)' }} placeholder="e.g. 2410991517" value={form.rollNo} onChange={set('rollNo')} required />
//       </div>
//       <div style={grp}><label style={lbl}>Full Name</label>
//         <input style={inp} placeholder="Satyam Godara" value={form.name} onChange={set('name')} required />
//       </div>
//       <div style={grp}><label style={lbl}>College Email</label>
//         <input style={inp} type="email" placeholder="rollno.course@chitkara.edu.in" value={form.email} onChange={set('email')} required />
//       </div>
//       <div style={grp}><label style={lbl}>Class</label>
//         <select style={{ ...inp, appearance: 'none', cursor: 'pointer' }} value={form.classId} onChange={set('classId')} required>
//           <option value="">Select your class</option>
//           {classes.map(c => <option key={c._id} value={c.classId}>{c.displayName}</option>)}
//         </select>
//       </div>
//       <button className="btn-login" type="submit" disabled={loading}>
//         {loading ? 'Sending OTP…' : 'Send OTP to Email →'}
//       </button>
//     </form>
//   );
// }

// function RegisterStep2({ formData, onSuccess }) {
//   const [otp, setOtp]         = useState('');
//   const [password, setPassword] = useState('');
//   const [confirm, setConfirm] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [resending, setResending] = useState(false);
//   const [error, setError]     = useState('');
//   const { register } = useAuth();

//   const submit = async (e) => {
//     e.preventDefault();
//     if (password !== confirm) { setError('Passwords do not match'); return; }
//     if (password.length < 6)  { setError('Password must be at least 6 characters'); return; }
//     setError(''); setLoading(true);
//     try { await register({ rollNo: formData.rollNo, otp, password }); onSuccess(); }
//     catch (err) { setError(err.response?.data?.error || 'Verification failed'); }
//     finally { setLoading(false); }
//   };

//   const resend = async () => {
//     setResending(true);
//     try { await api.post('/auth/register/send-otp', formData); setError(''); }
//     catch (err) { setError(err.response?.data?.error || 'Resend failed'); }
//     finally { setResending(false); }
//   };

//   return (
//     <form onSubmit={submit}>
//       <div style={{ background: 'var(--green-bg)', border: '1px solid rgba(62,207,142,0.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: 'var(--green)' }}>
//         OTP sent to <strong>{formData.email}</strong>. Valid for 10 minutes.
//       </div>
//       {error && <div className="login-error">{error}</div>}
//       <div style={grp}><label style={lbl}>6-digit OTP</label>
//         <input style={{ ...inp, fontFamily: 'var(--mono)', letterSpacing: 8, fontSize: 20, textAlign: 'center' }}
//           placeholder="······" maxLength={6} value={otp}
//           onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} required />
//       </div>
//       <div style={grp}><label style={lbl}>Set Password</label>
//         <input style={inp} type="password" placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} required />
//       </div>
//       <div style={grp}><label style={lbl}>Confirm Password</label>
//         <input style={inp} type="password" placeholder="Repeat password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
//       </div>
//       <button className="btn-login" type="submit" disabled={loading}>
//         {loading ? 'Verifying…' : 'Complete Registration →'}
//       </button>
//       <div style={{ textAlign: 'center', marginTop: 12, fontSize: 12, color: 'var(--text3)' }}>
//         Didn't get it?{' '}
//         <span style={{ color: 'var(--accent)', cursor: 'pointer', opacity: resending ? 0.5 : 1 }} onClick={resend}>
//           {resending ? 'Sending…' : 'Resend OTP'}
//         </span>
//       </div>
//     </form>
//   );
// }

// function LoginForm() {
//   const [rollNo, setRollNo]     = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError]       = useState('');
//   const [loading, setLoading]   = useState(false);
//   const { login } = useAuth();
//   const navigate  = useNavigate();

//   const submit = async (e) => {
//     e.preventDefault(); setError(''); setLoading(true);
//     try {
//       const data = await login(rollNo.trim(), password.trim());
//       navigate(data.user.role === 'admin' ? '/admin' : '/');
//     } catch (err) { setError(err.response?.data?.error || 'Login failed'); }
//     finally { setLoading(false); }
//   };

//   const fill = (r, p) => { setRollNo(r); setPassword(p); };

//   return (
//     <form onSubmit={submit}>
//       {error && <div className="login-error">{error}</div>}
//       <div style={grp}><label style={lbl}>Roll Number</label>
//         <input style={{ ...inp, fontFamily: 'var(--mono)' }} placeholder="e.g. 2410991517"
//           value={rollNo} onChange={e => setRollNo(e.target.value)} autoFocus required />
//       </div>
//       <div style={grp}><label style={lbl}>Password</label>
//         <input style={inp} type="password" placeholder="Your password"
//           value={password} onChange={e => setPassword(e.target.value)} required />
//       </div>
//       <button className="btn-login" type="submit" disabled={loading}>
//         {loading ? 'Signing in…' : 'Sign in →'}
//       </button>
//       <div className="login-hint">
//         Demo &nbsp;·&nbsp;
//         <span style={{ cursor: 'pointer', color: 'var(--accent)' }} onClick={() => fill('2410991517', '2410991517')}>Student</span>
//         &nbsp;·&nbsp;
//         <span style={{ cursor: 'pointer', color: 'var(--purple)' }} onClick={() => fill('TCH001', 'teacher@123')}>Teacher</span>
//         &nbsp;·&nbsp;
//         <span style={{ cursor: 'pointer', color: 'var(--amber)' }} onClick={() => fill('ADMIN001', 'admin@voxcampus')}>Admin</span>
//       </div>
//     </form>
//   );
// }

// export default function Login() {
//   const [tab, setTab]       = useState('login');
//   const [regStep, setRegStep] = useState(1);
//   const [regData, setRegData] = useState(null);
//   const [classes, setClasses] = useState([]);
//   const [clsLoaded, setClsLoaded] = useState(false);
//   const navigate = useNavigate();

//   const toRegister = async () => {
//     if (!clsLoaded) {
//       try { const { data } = await api.get('/auth/classes'); setClasses(data); setClsLoaded(true); }
//       catch {}
//     }
//     setTab('register'); setRegStep(1);
//   };

//   const titles = {
//     login: 'Chitkara University · Anonymous Campus Platform',
//     register1: 'Create your account',
//     register2: 'Verify your email',
//   };
//   const subtitle = tab === 'login' ? titles.login : regStep === 1 ? titles.register1 : titles.register2;

//   return (
//     <div className="login-page">
//       <div className="login-bg-grid" />
//       <div className="login-card">
//         <div className="login-logo">
//           <div className="login-logo-mark">
//             <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
//               <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="#6c8fff" strokeWidth="1.5" strokeLinejoin="round" />
//               <path d="M12 2v20M3 7l9 5 9-5" stroke="#6c8fff" strokeWidth="1.5" strokeLinejoin="round" />
//             </svg>
//           </div>
//           <div className="login-title">VoxCampus</div>
//           <div className="login-sub">{subtitle}</div>
//         </div>

//         <div style={{ display: 'flex', background: 'var(--bg3)', borderRadius: 10, padding: 3, marginBottom: 22 }}>
//           {[['login', 'Sign in'], ['register', 'Register']].map(([t, label]) => (
//             <button key={t} onClick={() => t === 'register' ? toRegister() : setTab('login')}
//               style={{
//                 flex: 1, padding: '7px 0', borderRadius: 8, fontSize: 13, fontWeight: 500,
//                 background: tab === t ? 'var(--bg2)' : 'transparent',
//                 color: tab === t ? 'var(--text)' : 'var(--text3)',
//                 border: tab === t ? '1px solid var(--border2)' : '1px solid transparent',
//                 transition: 'all 150ms', cursor: 'pointer',
//               }}>{label}</button>
//           ))}
//         </div>

//         {tab === 'login' && <LoginForm />}
//         {tab === 'register' && regStep === 1 && (
//           <RegisterStep1 classes={classes} onOtpSent={d => { setRegData(d); setRegStep(2); }} />
//         )}
//         {tab === 'register' && regStep === 2 && (
//           <>
//             <RegisterStep2 formData={regData} onSuccess={() => navigate('/')} />
//             <div style={{ textAlign: 'center', marginTop: 10 }}>
//               <span style={{ fontSize: 12, color: 'var(--text3)', cursor: 'pointer' }} onClick={() => setRegStep(1)}>← Back</span>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const inp = { width:'100%', background:'var(--bg3)', border:'1px solid var(--border2)', borderRadius:10, padding:'10px 14px', color:'var(--text)', fontSize:14, fontFamily:'var(--font)', outline:'none' };
const lbl = { display:'block', fontSize:12, fontWeight:500, color:'var(--text2)', marginBottom:6 };
const grp = { marginBottom:14 };

// ── Student register ─────────────────────────────────────────────────────
function StudentRegister({ classes, onBack }) {
  const { register } = useAuth();
  const navigate     = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ rollNo:'', name:'', email:'', classId:'' });
  const [otp, setOtp]   = useState('');
  const [pwd, setPwd]   = useState('');
  const [pwd2,setPwd2]  = useState('');
  const [err, setErr]   = useState('');
  const [loading, setLoading] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const sendOtp = async e => {
    e.preventDefault(); setErr(''); setLoading(true);
    try { await api.post('/auth/register/send-otp', form); setStep(2); }
    catch (e) { setErr(e.response?.data?.error || 'Failed to send OTP'); }
    finally { setLoading(false); }
  };

  const verify = async e => {
    e.preventDefault(); setErr('');
    if (pwd !== pwd2) return setErr('Passwords do not match');
    if (pwd.length < 6) return setErr('Minimum 6 characters');
    setLoading(true);
    try { await register({ rollNo: form.rollNo, otp, password: pwd }); navigate('/'); }
    catch (e) { setErr(e.response?.data?.error || 'Verification failed'); }
    finally { setLoading(false); }
  };

  return step === 1 ? (
    <form onSubmit={sendOtp}>
      {err && <div className="login-error">{err}</div>}
      <div style={grp}><label style={lbl}>Roll Number</label><input style={{...inp,fontFamily:'var(--mono)'}} placeholder="e.g. 2410991517" value={form.rollNo} onChange={set('rollNo')} required/></div>
      <div style={grp}><label style={lbl}>Full Name</label><input style={inp} placeholder="Your full name" value={form.name} onChange={set('name')} required/></div>
      <div style={grp}><label style={lbl}>College Email</label><input style={inp} type="email" placeholder="roll@chitkara.edu.in" value={form.email} onChange={set('email')} required/></div>
      <div style={grp}><label style={lbl}>Class</label>
        <select style={{...inp,cursor:'pointer'}} value={form.classId} onChange={set('classId')} required>
          <option value="">Select your class</option>
          {classes.map(c => <option key={c._id} value={c.classId}>{c.displayName}</option>)}
        </select>
      </div>
      <button className="btn-login" type="submit" disabled={loading}>{loading?'Sending OTP…':'Send OTP →'}</button>
      <div className="login-hint"><span style={{color:'var(--accent)',cursor:'pointer'}} onClick={onBack}>← Back to sign in</span></div>
    </form>
  ) : (
    <form onSubmit={verify}>
      {err && <div className="login-error">{err}</div>}
      <div style={{background:'var(--bg3)',borderRadius:8,padding:'10px 14px',marginBottom:14,fontSize:13,color:'var(--text2)'}}>
        OTP sent to <strong style={{color:'var(--accent)'}}>{form.email}</strong>
      </div>
      <div style={grp}><label style={lbl}>OTP</label><input style={{...inp,fontFamily:'var(--mono)',letterSpacing:4}} placeholder="6-digit code" maxLength={6} value={otp} onChange={e=>setOtp(e.target.value)} autoFocus required/></div>
      <div style={grp}><label style={lbl}>Password</label><input style={inp} type="password" placeholder="At least 6 characters" value={pwd} onChange={e=>setPwd(e.target.value)} required/></div>
      <div style={grp}><label style={lbl}>Confirm Password</label><input style={inp} type="password" value={pwd2} onChange={e=>setPwd2(e.target.value)} required/></div>
      <button className="btn-login" type="submit" disabled={loading}>{loading?'Verifying…':'Complete Registration →'}</button>
      <div className="login-hint"><span style={{color:'var(--text3)',cursor:'pointer'}} onClick={()=>setStep(1)}>← Change details / Resend OTP</span></div>
    </form>
  );
}

// ── Teacher register ─────────────────────────────────────────────────────
function TeacherRegister({ onBack }) {
  const [step, setStep]   = useState(1); // 1=details, 2=otp, 3=success
  const [form, setForm]   = useState({ name:'', email:'', department:'', skillInput:'', skills:[] });
  const [otp, setOtp]     = useState('');
  const [pwd, setPwd]     = useState('');
  const [pwd2, setPwd2]   = useState('');
  const [assignedId, setAssignedId] = useState('');
  const [err, setErr]     = useState('');
  const [loading, setLoading] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const addSkill = () => {
    const s = form.skillInput.trim();
    if (!s || form.skills.includes(s)) return;
    setForm(f => ({ ...f, skills:[...f.skills, s], skillInput:'' }));
  };

  const sendOtp = async e => {
    e.preventDefault(); setErr(''); setLoading(true);
    try {
      await api.post('/auth/teacher/register/send-otp', { name:form.name, email:form.email, department:form.department, skillTags:form.skills });
      setStep(2);
    } catch (e) { setErr(e.response?.data?.error || 'Failed to send OTP'); }
    finally { setLoading(false); }
  };

  const verify = async e => {
    e.preventDefault(); setErr('');
    if (pwd !== pwd2) return setErr('Passwords do not match');
    if (pwd.length < 6) return setErr('Minimum 6 characters');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/teacher/register/verify', { email:form.email, otp, password:pwd });
      setAssignedId(data.teacherId);
      setStep(3);
    } catch (e) { setErr(e.response?.data?.error || 'Verification failed'); }
    finally { setLoading(false); }
  };

  if (step === 3) return (
    <div style={{textAlign:'center',padding:'10px 0'}}>
      <div style={{fontSize:40,marginBottom:12}}>🎉</div>
      <div style={{fontSize:15,fontWeight:600,color:'var(--green)',marginBottom:8}}>Registration Submitted!</div>
      <div style={{fontSize:13,color:'var(--text2)',lineHeight:1.8,marginBottom:20}}>
        Your Teacher ID has been assigned:
      </div>
      <div style={{background:'var(--accent-bg)',border:'1px solid rgba(108,143,255,0.3)',borderRadius:12,padding:'16px 20px',marginBottom:20}}>
        <div style={{fontSize:11,color:'var(--text3)',marginBottom:6,textTransform:'uppercase',letterSpacing:'0.08em'}}>Your Teacher ID</div>
        <div style={{fontFamily:'var(--mono)',fontSize:24,fontWeight:700,color:'var(--accent)',letterSpacing:2}}>{assignedId}</div>
        <div style={{fontSize:11,color:'var(--text3)',marginTop:6}}>Save this — you'll use it to log in</div>
      </div>
      <div style={{background:'var(--amber-bg)',border:'1px solid rgba(245,158,11,0.2)',borderRadius:8,padding:'10px 14px',fontSize:12,color:'var(--amber)',marginBottom:20,textAlign:'left'}}>
        ⚠ Your account is <strong>pending admin approval</strong>. You'll receive an email once approved. Only then can you log in.
      </div>
      <button className="btn-login" onClick={onBack}>Back to Sign in</button>
    </div>
  );

  return step === 1 ? (
    <form onSubmit={sendOtp}>
      {err && <div className="login-error">{err}</div>}
      <div style={{background:'var(--amber-bg)',border:'1px solid rgba(245,158,11,0.2)',borderRadius:8,padding:'10px 14px',marginBottom:14,fontSize:12,color:'var(--amber)'}}>
        Teacher ID is <strong>auto-assigned</strong> after verification. No need to create one.
      </div>
      <div style={grp}><label style={lbl}>Full Name</label><input style={inp} placeholder="Dr. Firstname Lastname" value={form.name} onChange={set('name')} required/></div>
      <div style={grp}><label style={lbl}>College Email</label><input style={inp} type="email" placeholder="name@chitkara.edu.in" value={form.email} onChange={set('email')} required/></div>
      <div style={grp}><label style={lbl}>Department <span style={{color:'var(--text3)',fontWeight:400}}>(optional)</span></label>
        <input style={inp} placeholder="e.g. Computer Science" value={form.department} onChange={set('department')}/>
      </div>
      <div style={grp}>
        <label style={lbl}>Skill Tags <span style={{color:'var(--text3)',fontWeight:400}}>(admin uses these to assign subjects)</span></label>
        <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:8}}>
          {form.skills.map(s=>(
            <span key={s} style={{display:'inline-flex',alignItems:'center',gap:4,background:'var(--accent-bg)',color:'var(--accent)',border:'1px solid rgba(108,143,255,0.2)',fontSize:12,padding:'3px 9px',borderRadius:20}}>
              {s}<button type="button" onClick={()=>setForm(f=>({...f,skills:f.skills.filter(x=>x!==s)}))} style={{color:'var(--accent)',opacity:0.6,background:'none',border:'none',cursor:'pointer',fontSize:13,lineHeight:1}}>✕</button>
            </span>
          ))}
        </div>
        <div style={{display:'flex',gap:8}}>
          <input style={{...inp,flex:1}} placeholder="Add skill (e.g. Linux, Node.js, DSA)…" value={form.skillInput} onChange={set('skillInput')} onKeyDown={e=>e.key==='Enter'&&(e.preventDefault(),addSkill())}/>
          <button type="button" onClick={addSkill} style={{padding:'10px 14px',borderRadius:10,background:'var(--bg4)',border:'1px solid var(--border2)',color:'var(--text2)',cursor:'pointer',fontSize:12}}>+ Add</button>
        </div>
      </div>
      <button className="btn-login" type="submit" disabled={loading}>{loading?'Sending OTP…':'Send OTP →'}</button>
      <div className="login-hint"><span style={{color:'var(--accent)',cursor:'pointer'}} onClick={onBack}>← Back to sign in</span></div>
    </form>
  ) : (
    <form onSubmit={verify}>
      {err && <div className="login-error">{err}</div>}
      <div style={{background:'var(--bg3)',borderRadius:8,padding:'10px 14px',marginBottom:14,fontSize:13,color:'var(--text2)'}}>
        OTP sent to <strong style={{color:'var(--accent)'}}>{form.email}</strong>
      </div>
      <div style={grp}><label style={lbl}>OTP</label><input style={{...inp,fontFamily:'var(--mono)',letterSpacing:4}} placeholder="6-digit code" maxLength={6} value={otp} onChange={e=>setOtp(e.target.value)} autoFocus required/></div>
      <div style={grp}><label style={lbl}>Password</label><input style={inp} type="password" placeholder="At least 6 characters" value={pwd} onChange={e=>setPwd(e.target.value)} required/></div>
      <div style={grp}><label style={lbl}>Confirm Password</label><input style={inp} type="password" value={pwd2} onChange={e=>setPwd2(e.target.value)} required/></div>
      <button className="btn-login" type="submit" disabled={loading}>{loading?'Verifying…':'Complete Registration →'}</button>
      <div className="login-hint"><span style={{color:'var(--text3)',cursor:'pointer'}} onClick={()=>setStep(1)}>← Back</span></div>
    </form>
  );
}

// ── Login ────────────────────────────────────────────────────────────────
function LoginForm() {
  const [rollNo, setRollNo] = useState('');
  const [pwd, setPwd]       = useState('');
  const [err, setErr]       = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const submit = async e => {
    e.preventDefault(); setErr(''); setLoading(true);
    try { const d = await login(rollNo.trim(), pwd.trim()); navigate(d.user.role==='admin'?'/admin':'/'); }
    catch (e) { setErr(e.response?.data?.error || 'Login failed'); }
    finally { setLoading(false); }
  };
  const fill = (r,p) => { setRollNo(r); setPwd(p); };

  return (
    <form onSubmit={submit}>
      {err && <div className="login-error">{err}</div>}
      <div style={grp}><label style={lbl}>Roll Number / Teacher ID</label>
        <input style={{...inp,fontFamily:'var(--mono)'}} placeholder="e.g. 2410991517 or TCH25001" value={rollNo} onChange={e=>setRollNo(e.target.value)} autoFocus required/>
      </div>
      <div style={grp}><label style={lbl}>Password</label>
        <input style={inp} type="password" placeholder="Your password" value={pwd} onChange={e=>setPwd(e.target.value)} required/>
      </div>
      <button className="btn-login" type="submit" disabled={loading}>{loading?'Signing in…':'Sign in →'}</button>
      <div className="login-hint">
        Demo &nbsp;·&nbsp;
        <span style={{cursor:'pointer',color:'var(--accent)'}} onClick={()=>fill('2410991517','2410991517')}>Student</span>&nbsp;·&nbsp;
        <span style={{cursor:'pointer',color:'var(--purple)'}} onClick={()=>fill('TCH001','teacher@123')}>Teacher</span>&nbsp;·&nbsp;
        <span style={{cursor:'pointer',color:'var(--amber)'}} onClick={()=>fill('ADMIN001','admin@voxcampus')}>Admin</span>
      </div>
    </form>
  );
}

export default function Login() {
  const [tab, setTab]         = useState('login');
  const [classes, setClasses] = useState([]);
  const [clsLoaded, setClsLoaded] = useState(false);

  const goStudentReg = async () => {
    if (!clsLoaded) {
      try { const { data } = await api.get('/auth/classes'); setClasses(data); setClsLoaded(true); } catch {}
    }
    setTab('student');
  };

  const subtitles = { login:'Anonymous Campus Platform', student:'Create student account', teacher:'Teacher registration' };

  return (
    <div className="login-page">
      <div className="login-bg-grid"/>
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-mark">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="#6c8fff" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M12 2v20M3 7l9 5 9-5" stroke="#6c8fff" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="login-title">VoxCampus</div>
          <div className="login-sub">Chitkara University · {subtitles[tab]}</div>
        </div>

        {tab === 'login' && (
          <div style={{display:'flex',background:'var(--bg3)',borderRadius:10,padding:3,marginBottom:22,gap:3}}>
            {[['login','Sign In'],['student','Student Register'],['teacher','Teacher Register']].map(([t,l])=>(
              <button key={t} onClick={t==='student'?goStudentReg:()=>setTab(t)} style={{flex:1,padding:'7px 0',borderRadius:8,fontSize:12,fontWeight:tab===t?500:400,background:tab===t?'var(--bg2)':'transparent',color:tab===t?'var(--text)':'var(--text3)',border:tab===t?'1px solid var(--border2)':'1px solid transparent',cursor:'pointer',transition:'all 150ms'}}>{l}</button>
            ))}
          </div>
        )}

        {tab === 'login'   && <LoginForm/>}
        {tab === 'student' && <StudentRegister classes={classes} onBack={()=>setTab('login')}/>}
        {tab === 'teacher' && <TeacherRegister onBack={()=>setTab('login')}/>}
      </div>
    </div>
  );
}