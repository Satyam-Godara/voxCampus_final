import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { faEye } from '@fortawesome/free-solid-svg-icons';

const inp = { width:'100%', background:'var(--bg3)', border:'1px solid var(--border2)', borderRadius:10, padding:'10px 14px', color:'var(--text)', fontSize:14, fontFamily:'var(--font)', outline:'none' };
const lbl = { display:'block', fontSize:12, fontWeight:500, color:'var(--text2)', marginBottom:6 };
const grp = { marginBottom:14 };

// ── Password Visibility Input Wrapper ───────────────────────────────────
function PasswordInput({ placeholder, value, onChange, required }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <input
        style={{ ...inp, paddingRight: '40px' }}
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        style={{
          position: 'absolute',
          right: '12px',
          background: 'none',
          border: 'none',
          color: 'var(--text3)',
          cursor: 'pointer',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          userSelect: 'none'
        }}
      >
        {show ? <FontAwesomeIcon icon={faEye} style={{color: "rgb(255, 255, 255)",}}/> : <FontAwesomeIcon icon={faEyeSlash} style={{color: "rgb(255, 255, 255)",}} />}
      </button>
    </div>
  );
}

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

    if (!form.email.endsWith('@chitkara.edu.in')) {
      setErr('Enter university email only');
      setLoading(false);
      return;
    }
    try { await api.post('/auth/register/send-otp', form); setStep(2);}
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
      <div style={grp}><label style={lbl}>Roll Number</label><input style={{...inp,fontFamily:'var(--mono)'}} placeholder="e.g. University Roll No." value={form.rollNo} onChange={set('rollNo')} required/></div>
      <div style={grp}><label style={lbl}>Full Name</label><input style={inp} placeholder="Your full name" value={form.name} onChange={set('name')} required/></div>
      <div style={grp}><label style={lbl}>College Email</label><input style={inp} type="email" placeholder="University email" value={form.email} onChange={set('email')} required/></div>
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
      <div style={grp}><label style={lbl}>Password</label><PasswordInput placeholder="At least 6 characters" value={pwd} onChange={e=>setPwd(e.target.value)} required/></div>
      <div style={grp}><label style={lbl}>Confirm Password</label><PasswordInput placeholder="Confirm password" value={pwd2} onChange={e=>setPwd2(e.target.value)} required/></div>
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
    <div style={{ textAlign:'center', padding:'1px 0'}}>
      {/* <div style={{fontSize:50, marginBottom:16, filter: 'drop-shadow(0 4px 12px rgba(74,222,128,0.2))'}}>🎉</div> */}
      <div style={{fontSize:18, fontWeight:700, color:'var(--green)', marginBottom:8, letterSpacing: '-0.02em'}}>Registration Successful!</div>
      <div style={{fontSize:13, color:'var(--text2)', lineHeight:1.6, marginBottom:24, padding: '0 10px'}}>
        Your application has been created successfully. Your account is now <strong>pending admin review</strong>.
      </div>
      
      {/* Teacher ID Display Box */}
      <div style={{background:'var(--bg2)', border:'1px solid var(--border2)', borderRadius:12, padding:'18px 20px', marginBottom:20}}>
        <div style={{fontSize:10, color:'var(--text3)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.1em', fontWeight: 600}}>Your Assigned Teacher ID</div>
        <div style={{fontFamily:'var(--mono)', fontSize:26, fontWeight:700, color:'var(--accent)', letterSpacing:2}}>{assignedId}</div>
        <div style={{fontSize:11, color:'var(--text3)', marginTop:6}}>Keep this safe — you will use it to log in.</div>
      </div>

      {/* Acceptance Status Info Box */}
      <div style={{background:'rgba(74,222,128,0.06)', border:'1px solid var(--green-bg)', borderRadius:10, padding:'12px 16px', fontSize:12, color:'var(--text2)', marginBottom:24, textAlign:'left', lineHeight: 1.5}}>
        <span style={{color: 'var(--green)', fontWeight: 600}}>What happens next?</span> An acceptance confirmation mail will be automatically dispatched to your university inbox once the system administrator authorizes your portal request.
      </div>
      
      <button className="btn-login" onClick={onBack}>Return to Sign In</button>
    </div>
  );

  return step === 1 ? (
    <form onSubmit={sendOtp}>
      {err && <div className="login-error">{err}</div>}
      <div style={grp}><label style={lbl}>Full Name</label><input style={inp} placeholder="Firstname Lastname" value={form.name} onChange={set('name')} required/></div>
      <div style={grp}><label style={lbl}>College Email</label><input style={inp} type="email" placeholder="name@chitkara.edu.in" value={form.email} onChange={set('email')} required/></div>
      <div style={grp}><label style={lbl}>Department <span style={{color:'var(--text3)',fontWeight:400}}>(optional)</span></label>
        <input style={inp} placeholder="e.g. Computer Science" value={form.department} onChange={set('department')}/>
      </div>
      <div style={grp}>
        <label style={lbl}>Skill Tags <span style={{color:'var(--text3)',fontWeight:400}}>(admin uses these to assign subjects)</span></label>
        <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:8}}>
          {form.skills.map(s=>(
            <span key={s} style={{display:'inline-flex',alignItems:'center',gap:4,background:'var(--bg4)',color:'var(--text2)',border:'1px solid var(--border2)',fontSize:12,padding:'3px 9px',borderRadius:20}}>
              {s}<button type="button" onClick={()=>setForm(f=>({...f,skills:f.skills.filter(x=>x!==s)}))} style={{color:'var(--red)',opacity:0.8,background:'none',border:'none',cursor:'pointer',fontSize:13,lineHeight:1}}>✕</button>
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
      <div style={grp}><label style={lbl}>Password</label><PasswordInput placeholder="At least 6 characters" value={pwd} onChange={e=>setPwd(e.target.value)} required/></div>
      <div style={grp}><label style={lbl}>Confirm Password</label><PasswordInput placeholder="Confirm password" value={pwd2} onChange={e=>setPwd2(e.target.value)} required/></div>
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

  return (
    <form onSubmit={submit}>
      {err && <div className="login-error">{err}</div>}
      <div style={grp}><label style={lbl}>Roll Number / Teacher ID</label>
        <input style={{...inp,fontFamily:'var(--mono)'}} placeholder="e.g. 2410990000 or TCH25001" value={rollNo} onChange={e=>setRollNo(e.target.value)} autoFocus required/>
      </div>
      <div style={grp}><label style={lbl}>Password</label>
        <PasswordInput placeholder="Your password" value={pwd} onChange={e=>setPwd(e.target.value)} required/>
      </div>
      <button className="btn-login" type="submit" disabled={loading}>{loading?'Signing in…':'Sign in →'}</button>
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
        {/* <div className="login-bg-grid"/> */}
        <div className="login-card">
          <div className="login-logo">
            <div className="login-logo-mark">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="#c0d05c" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M12 2v20M3 7l9 5 9-5" stroke="#c0d05c" strokeWidth="1.5" strokeLinejoin="round"/>
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