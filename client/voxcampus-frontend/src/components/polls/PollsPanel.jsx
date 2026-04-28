// import { useState, useEffect } from 'react';
// import { format } from 'date-fns';
// import api from '../../utils/api';
// import { useAuth } from '../../context/AuthContext';

// function PollCard({ poll, onVote }) {
//   const isClosed = poll.isClosed || (poll.closesAt && new Date() > new Date(poll.closesAt));
//   const totalVotes = poll.options.reduce((s, o) => s + o.voteCount, 0);
//   const hasVoted = poll.options.some(o => o.userVoted);

//   return (
//     <div className="poll-card">
//       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
//         <span className={`poll-status ${isClosed ? 'closed' : 'open'}`}>{isClosed ? 'Closed' : 'Open'}</span>
//         {poll.closesAt && !isClosed && (
//           <span style={{ fontSize: 11, color: 'var(--text3)' }}>
//             Closes {format(new Date(poll.closesAt), 'MMM d, HH:mm')}
//           </span>
//         )}
//       </div>
//       <div className="poll-question">{poll.question}</div>

//       {poll.options.map((opt, i) => {
//         const pct = totalVotes ? Math.round((opt.voteCount / totalVotes) * 100) : 0;
//         return (
//           <div
//             key={i}
//             className={`poll-option ${opt.userVoted ? 'voted' : ''} ${isClosed ? 'closed' : ''}`}
//             onClick={() => !isClosed && onVote(poll._id, i)}
//           >
//             <div className="poll-option-bar" style={{ width: `${pct}%` }} />
//             <span className="poll-option-text">{opt.text}</span>
//             {(hasVoted || isClosed) && (
//               <span className="poll-option-pct">{pct}%</span>
//             )}
//             {opt.userVoted && (
//               <span style={{ fontSize: 11, color: 'var(--accent)' }}>✓</span>
//             )}
//           </div>
//         );
//       })}

//       <div className="poll-meta">
//         <span>{totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}</span>
//         {poll.closesAt && isClosed && (
//           <span>Closed {format(new Date(poll.closesAt), 'MMM d')}</span>
//         )}
//       </div>
//     </div>
//   );
// }

// export default function PollsPanel({ channel }) {
//   const { user }               = useAuth();
//   const [polls, setPolls]      = useState([]);
//   const [loading, setLoading]  = useState(true);
//   const [showForm, setShowForm] = useState(false);
//   const [question, setQuestion] = useState('');
//   const [options, setOptions]   = useState(['', '']);
//   const [closesAt, setClosesAt] = useState('');
//   const [submitting, setSubmitting] = useState(false);

//   const isTeacher = user?.role === 'teacher' || user?.role === 'admin';

//   useEffect(() => {
//     api.get(`/polls/${channel._id}`)
//       .then(r => setPolls(r.data))
//       .catch(() => {})
//       .finally(() => setLoading(false));
//   }, [channel._id]);

//   const handleVote = async (pollId, optionIndex) => {
//     await api.post(`/polls/${pollId}/vote`, { optionIndex });
//     const { data } = await api.get(`/polls/${channel._id}`);
//     setPolls(data);
//   };

//   const handleCreate = async () => {
//     const validOptions = options.filter(o => o.trim());
//     if (!question.trim() || validOptions.length < 2) return;
//     setSubmitting(true);
//     try {
//       const { data } = await api.post(`/polls/${channel._id}`, {
//         question: question.trim(),
//         options: validOptions,
//         closesAt: closesAt || undefined,
//       });
//       setPolls(prev => [data, ...prev]);
//       setShowForm(false);
//       setQuestion('');
//       setOptions(['', '']);
//       setClosesAt('');
//     } catch {}
//     setSubmitting(false);
//   };

//   return (
//     <div className="polls-panel">
//       {isTeacher && (
//         <div>
//           {!showForm ? (
//             <button
//               className="btn-primary"
//               style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}
//               onClick={() => setShowForm(true)}
//             >
//               + Create Poll
//             </button>
//           ) : (
//             <div className="poll-creator">
//               <h3>New Poll</h3>
//               <input
//                 className="poll-input"
//                 placeholder="Poll question..."
//                 value={question}
//                 onChange={e => setQuestion(e.target.value)}
//               />
//               {options.map((opt, i) => (
//                 <div className="poll-option-input-row" key={i}>
//                   <input
//                     className="poll-input"
//                     style={{ marginBottom: 0, flex: 1 }}
//                     placeholder={`Option ${i + 1}`}
//                     value={opt}
//                     onChange={e => {
//                       const next = [...options];
//                       next[i] = e.target.value;
//                       setOptions(next);
//                     }}
//                   />
//                   {options.length > 2 && (
//                     <button
//                       className="btn-remove"
//                       onClick={() => setOptions(options.filter((_, j) => j !== i))}
//                     >✕</button>
//                   )}
//                 </div>
//               ))}
//               {options.length < 6 && (
//                 <button className="btn-add-option" onClick={() => setOptions([...options, ''])}>
//                   + Add option
//                 </button>
//               )}
//               <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
//                 <label style={{ fontSize: 12, color: 'var(--text2)' }}>Close at:</label>
//                 <input
//                   type="datetime-local"
//                   value={closesAt}
//                   onChange={e => setClosesAt(e.target.value)}
//                   style={{
//                     background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 7,
//                     padding: '5px 10px', color: 'var(--text)', fontSize: 12,
//                   }}
//                 />
//               </div>
//               <div style={{ display: 'flex', gap: 8 }}>
//                 <button className="btn-primary" onClick={handleCreate} disabled={submitting}>
//                   {submitting ? '...' : 'Publish Poll'}
//                 </button>
//                 <button
//                   style={{ fontSize: 12, color: 'var(--text3)', padding: '7px 14px' }}
//                   onClick={() => setShowForm(false)}
//                 >Cancel</button>
//               </div>
//             </div>
//           )}
//         </div>
//       )}

//       {loading ? (
//         <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner" /></div>
//       ) : polls.length === 0 ? (
//         <div className="empty-state">
//           <div className="empty-state-icon">◈</div>
//           <div className="empty-state-text">No polls yet.</div>
//         </div>
//       ) : (
//         polls.map(poll => <PollCard key={poll._id} poll={poll} onVote={handleVote} />)
//       )}
//     </div>
//   );
// }


// import { useState, useEffect } from 'react';
// import { format } from 'date-fns';
// import api from '../../utils/api';
// import { useAuth } from '../../context/AuthContext';

// function PollCard({ poll, onVote }) {
//   const isClosed = poll.isClosed || (poll.closesAt && new Date() > new Date(poll.closesAt));
//   const totalVotes = poll.options.reduce((s, o) => s + o.voteCount, 0);
//   const hasVoted = poll.options.some(o => o.userVoted);

//   return (
//     <div className="poll-card">
//       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
//         <span className={`poll-status ${isClosed ? 'closed' : 'open'}`}>{isClosed ? 'Closed' : 'Open'}</span>
//         {poll.closesAt && !isClosed && (
//           <span style={{ fontSize: 11, color: 'var(--text3)' }}>
//             Closes {format(new Date(poll.closesAt), 'MMM d, HH:mm')}
//           </span>
//         )}
//       </div>
//       <div className="poll-question">{poll.question}</div>

//       {poll.options.map((opt, i) => {
//         const pct = totalVotes ? Math.round((opt.voteCount / totalVotes) * 100) : 0;
//         return (
//           <div
//             key={i}
//             className={`poll-option ${opt.userVoted ? 'voted' : ''} ${isClosed ? 'closed' : ''}`}
//             onClick={() => !isClosed && onVote(poll._id, i)}
//           >
//             <div className="poll-option-bar" style={{ width: `${pct}%` }} />
//             <span className="poll-option-text">{opt.text}</span>
//             {(hasVoted || isClosed) && (
//               <span className="poll-option-pct">{pct}%</span>
//             )}
//             {opt.userVoted && (
//               <span style={{ fontSize: 11, color: 'var(--accent)' }}>✓</span>
//             )}
//           </div>
//         );
//       })}

//       <div className="poll-meta">
//         <span>{totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}</span>
//         {poll.closesAt && isClosed && (
//           <span>Closed {format(new Date(poll.closesAt), 'MMM d')}</span>
//         )}
//       </div>
//     </div>
//   );
// }

// export default function PollsPanel({ channel }) {
//   const { user }               = useAuth();
//   const [polls, setPolls]      = useState([]);
//   const [loading, setLoading]  = useState(true);
//   const [showForm, setShowForm] = useState(false);
//   const [question, setQuestion] = useState('');
//   const [options, setOptions]   = useState(['', '']);
//   const [closesAt, setClosesAt] = useState('');
//   const [submitting, setSubmitting] = useState(false);

//   const isTeacher = user?.role === 'teacher' || user?.role === 'admin';

//   useEffect(() => {
//     api.get(`/polls/${channel._id}`)
//       .then(r => setPolls(r.data))
//       .catch(() => {})
//       .finally(() => setLoading(false));
//   }, [channel._id]);

//   const handleVote = async (pollId, optionIndex) => {
//     await api.post(`/polls/${pollId}/vote`, { optionIndex });
//     const { data } = await api.get(`/polls/${channel._id}`);
//     setPolls(data);
//   };

//   const handleCreate = async () => {
//     const validOptions = options.filter(o => o.trim());
//     if (!question.trim() || validOptions.length < 2) return;
//     setSubmitting(true);
//     try {
//       const { data } = await api.post(`/polls/${channel._id}`, {
//         question: question.trim(),
//         options: validOptions,
//         closesAt: closesAt || undefined,
//       });
//       setPolls(prev => [data, ...prev]);
//       setShowForm(false);
//       setQuestion('');
//       setOptions(['', '']);
//       setClosesAt('');
//     } catch {}
//     setSubmitting(false);
//   };

//   return (
//     <div className="polls-panel">
//       {isTeacher && (
//         <div>
//           {!showForm ? (
//             <button
//               className="btn-primary"
//               style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}
//               onClick={() => setShowForm(true)}
//             >
//               + Create Poll
//             </button>
//           ) : (
//             <div className="poll-creator">
//               <h3>New Poll</h3>
//               <input
//                 className="poll-input"
//                 placeholder="Poll question..."
//                 value={question}
//                 onChange={e => setQuestion(e.target.value)}
//               />
//               {options.map((opt, i) => (
//                 <div className="poll-option-input-row" key={i}>
//                   <input
//                     className="poll-input"
//                     style={{ marginBottom: 0, flex: 1 }}
//                     placeholder={`Option ${i + 1}`}
//                     value={opt}
//                     onChange={e => {
//                       const next = [...options];
//                       next[i] = e.target.value;
//                       setOptions(next);
//                     }}
//                   />
//                   {options.length > 2 && (
//                     <button
//                       className="btn-remove"
//                       onClick={() => setOptions(options.filter((_, j) => j !== i))}
//                     >✕</button>
//                   )}
//                 </div>
//               ))}
//               {options.length < 6 && (
//                 <button className="btn-add-option" onClick={() => setOptions([...options, ''])}>
//                   + Add option
//                 </button>
//               )}
//               <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
//                 <label style={{ fontSize: 12, color: 'var(--text2)' }}>Close at:</label>
//                 <input
//                   type="datetime-local"
//                   value={closesAt}
//                   onChange={e => setClosesAt(e.target.value)}
//                   style={{
//                     background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 7,
//                     padding: '5px 10px', color: 'var(--text)', fontSize: 12,
//                   }}
//                 />
//               </div>
//               <div style={{ display: 'flex', gap: 8 }}>
//                 <button className="btn-primary" onClick={handleCreate} disabled={submitting}>
//                   {submitting ? '...' : 'Publish Poll'}
//                 </button>
//                 <button
//                   style={{ fontSize: 12, color: 'var(--text3)', padding: '7px 14px' }}
//                   onClick={() => setShowForm(false)}
//                 >Cancel</button>
//               </div>
//             </div>
//           )}
//         </div>
//       )}

//       {loading ? (
//         <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner" /></div>
//       ) : polls.length === 0 ? (
//         <div className="empty-state">
//           <div className="empty-state-icon">◈</div>
//           <div className="empty-state-text">No polls yet.</div>
//         </div>
//       ) : (
//         polls.map(poll => <PollCard key={poll._id} poll={poll} onVote={handleVote} />)
//       )}
//     </div>
//   );
// }



import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

// ── Pure-CSS bar chart ────────────────────────────────────────────────────
const COLORS = ['#6c8fff','#3ecf8e','#f59e0b','#f87171','#a78bfa','#34d399','#fb923c','#60a5fa'];

function BarChart({ options, totalVotes }) {
  const max = Math.max(...options.map(o => o.voteCount), 1);
  return (
    <div style={{ marginTop: 10 }}>
      {options.map((opt, i) => (
        <div key={i} style={{ marginBottom: 8 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3, fontSize:11 }}>
            <span style={{ color:'var(--text2)', maxWidth:'65%', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{opt.text}</span>
            <span style={{ color:'var(--text3)', fontFamily:'var(--mono)', fontSize:11 }}>{opt.voteCount} · {opt.percentage}%</span>
          </div>
          <div style={{ height:8, background:'var(--bg4)', borderRadius:4, overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${(opt.voteCount/max)*100}%`, background:COLORS[i%COLORS.length], borderRadius:4, transition:'width 0.5s ease', minWidth: opt.voteCount>0?4:0 }}/>
          </div>
        </div>
      ))}
      <div style={{ fontSize:11, color:'var(--text3)', marginTop:6 }}>{totalVotes} total vote{totalVotes!==1?'s':''}</div>
    </div>
  );
}

// ── Pure-SVG donut chart ──────────────────────────────────────────────────
function DonutChart({ options, totalVotes, size=90 }) {
  const r = 32; const cx = size/2; const cy = size/2;
  const circ = 2*Math.PI*r;
  if (totalVotes === 0) return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg4)" strokeWidth={10}/>
      <text x={cx} y={cy+4} textAnchor="middle" fill="var(--text3)" fontSize={9} fontFamily="sans-serif">0 votes</text>
    </svg>
  );
  let offset = 0;
  const segs = options.map((opt, i) => {
    const dash = (opt.voteCount/totalVotes)*circ;
    const s = { offset, dash, color:COLORS[i%COLORS.length] };
    offset += dash;
    return s;
  });
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform:'rotate(-90deg)' }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg4)" strokeWidth={10}/>
        {segs.map((seg,i)=>(
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={seg.color} strokeWidth={10}
            strokeDasharray={`${seg.dash} ${circ-seg.dash}`}
            strokeDashoffset={-seg.offset}
          />
        ))}
      </svg>
      {/* Legend */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:5, justifyContent:'center' }}>
        {options.map((opt,i)=>(
          <div key={i} style={{ display:'flex', alignItems:'center', gap:3, fontSize:10, color:'var(--text3)' }}>
            <div style={{ width:7, height:7, borderRadius:2, background:COLORS[i%COLORS.length], flexShrink:0 }}/>
            {opt.text.slice(0,14)}{opt.text.length>14?'…':''}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Poll card ─────────────────────────────────────────────────────────────
function PollCard({ poll, isTeacher, onVote, onClose }) {
  const [showCharts, setShowCharts] = useState(false);
  const isClosed = poll.isClosed || (poll.closesAt && new Date() > new Date(poll.closesAt));
  const totalVotes = poll.totalVotes ?? poll.options.reduce((s,o)=>s+(o.voteCount||0),0);
  const hasVoted  = poll.options.some(o=>o.userVoted);

  return (
    <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:14, padding:16, marginBottom:12 }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
        <span style={{
          fontSize:10, fontWeight:600, padding:'2px 8px', borderRadius:10, textTransform:'uppercase', letterSpacing:'0.06em',
          background: isClosed?'var(--bg4)':'var(--green-bg)', color: isClosed?'var(--text3)':'var(--green)',
        }}>{isClosed?'Closed':'Open'}</span>
        {poll.closesAt&&!isClosed&&(
          <span style={{ fontSize:11, color:'var(--text3)' }}>Closes {format(new Date(poll.closesAt),'MMM d, HH:mm')}</span>
        )}
        {isTeacher && !isClosed && (
          <button onClick={()=>onClose(poll._id)} style={{ fontSize:11, color:'var(--red)', background:'var(--red-bg)', border:'none', borderRadius:6, padding:'3px 9px', cursor:'pointer' }}>Close poll</button>
        )}
      </div>

      <div style={{ fontSize:15, fontWeight:500, marginBottom:14, color:'var(--text)' }}>{poll.question}</div>

      {/* Options */}
      {poll.options.map((opt,i)=>{
        const pct = totalVotes ? Math.round((opt.voteCount/totalVotes)*100) : 0;
        return (
          <div key={i}
            className={`poll-option ${opt.userVoted?'voted':''} ${isClosed?'closed':''}`}
            onClick={()=>!isClosed&&!hasVoted&&onVote(poll._id,i)}
          >
            <div className="poll-option-bar" style={{ width:`${pct}%`, background: opt.userVoted?COLORS[i%COLORS.length]:undefined }}/>
            <span className="poll-option-text">{opt.text}</span>
            {(hasVoted||isClosed||isTeacher)&&(
              <span className="poll-option-pct" style={{ color:COLORS[i%COLORS.length] }}>{pct}%</span>
            )}
            {opt.userVoted&&<span style={{ fontSize:11, color:COLORS[i%COLORS.length], marginLeft:4 }}>✓</span>}
          </div>
        );
      })}

      {/* Teacher analytics toggle */}
      {isTeacher && (
        <button onClick={()=>setShowCharts(v=>!v)} style={{
          marginTop:10, fontSize:11, color:showCharts?'var(--accent)':'var(--text3)',
          background:showCharts?'var(--accent-bg)':'var(--bg3)',
          border:'1px solid'+(showCharts?'rgba(108,143,255,0.3)':'var(--border)'),
          borderRadius:6, padding:'4px 10px', cursor:'pointer', transition:'all 150ms',
          display:'flex', alignItems:'center', gap:5,
        }}>
          📊 {showCharts?'Hide':'View'} charts
        </button>
      )}

      {/* Charts (teacher only) */}
      {isTeacher && showCharts && (
        <div style={{ marginTop:14, borderTop:'1px solid var(--border)', paddingTop:14 }}>
          <div style={{ display:'flex', gap:20, alignItems:'flex-start', flexWrap:'wrap' }}>
            <div style={{ flex:1, minWidth:180 }}>
              <div style={{ fontSize:11, fontWeight:600, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Response Breakdown</div>
              <BarChart options={poll.options} totalVotes={totalVotes}/>
            </div>
            <div>
              <div style={{ fontSize:11, fontWeight:600, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8, textAlign:'center' }}>Distribution</div>
              <DonutChart options={poll.options} totalVotes={totalVotes} size={100}/>
            </div>
          </div>
          <div style={{ marginTop:10, display:'flex', gap:8, flexWrap:'wrap' }}>
            <div style={{ background:'var(--bg3)', borderRadius:8, padding:'8px 12px', fontSize:12 }}>
              <span style={{ color:'var(--text3)' }}>Total responses: </span>
              <span style={{ color:'var(--text)', fontWeight:600, fontFamily:'var(--mono)' }}>{totalVotes}</span>
            </div>
            {poll.options.map((opt,i)=>(
              <div key={i} style={{ background:'var(--bg3)', borderRadius:8, padding:'8px 12px', fontSize:12, display:'flex', alignItems:'center', gap:6 }}>
                <div style={{ width:8, height:8, borderRadius:2, background:COLORS[i%COLORS.length], flexShrink:0 }}/>
                <span style={{ color:'var(--text2)' }}>{opt.text.slice(0,16)}{opt.text.length>16?'…':''}: </span>
                <span style={{ color:COLORS[i%COLORS.length], fontWeight:600, fontFamily:'var(--mono)' }}>{opt.voteCount}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Student vote count (always shown) */}
      <div className="poll-meta" style={{ marginTop:10 }}>
        <span>{totalVotes} vote{totalVotes!==1?'s':''}</span>
        {poll.closesAt&&isClosed&&<span>Closed {format(new Date(poll.closesAt),'MMM d')}</span>}
      </div>
    </div>
  );
}

// ── Main PollsPanel ───────────────────────────────────────────────────────
export default function PollsPanel({ channel }) {
  const { user }               = useAuth();
  const [polls, setPolls]      = useState([]);
  const [loading, setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [question, setQuestion] = useState('');
  const [options, setOptions]   = useState(['', '']);
  const [closesAt, setClosesAt] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';

  useEffect(() => {
    api.get(`/polls/${channel._id}`)
      .then(r => setPolls(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [channel._id]);

  const handleVote = async (pollId, optionIndex) => {
    await api.post(`/polls/${pollId}/vote`, { optionIndex });
    const { data } = await api.get(`/polls/${channel._id}`);
    setPolls(data);
  };

  const handleClose = async (pollId) => {
    await api.patch(`/polls/${pollId}/close`);
    setPolls(p => p.map(x => x._id === pollId ? { ...x, isClosed:true } : x));
  };

  const handleCreate = async () => {
    const validOpts = options.filter(o => o.trim());
    if (!question.trim() || validOpts.length < 2) return;
    setSubmitting(true);
    try {
      const { data } = await api.post(`/polls/${channel._id}`, { question:question.trim(), options:validOpts, closesAt:closesAt||undefined });
      setPolls(p => [data, ...p]);
      setShowForm(false); setQuestion(''); setOptions(['','']); setClosesAt('');
    } catch {}
    setSubmitting(false);
  };

  return (
    <div className="polls-panel">
      {/* Create form (teacher) */}
      {isTeacher && (
        <div>
          {!showForm ? (
            <button className="btn-primary" style={{ marginBottom:16, display:'flex', alignItems:'center', gap:6 }} onClick={()=>setShowForm(true)}>
              + Create Poll
            </button>
          ) : (
            <div className="poll-creator" style={{ marginBottom:16 }}>
              <h3 style={{ fontSize:13, fontWeight:600, marginBottom:12, color:'var(--text2)' }}>New Poll</h3>
              <input className="poll-input" placeholder="Poll question…" value={question} onChange={e=>setQuestion(e.target.value)}/>
              {options.map((opt,i)=>(
                <div className="poll-option-input-row" key={i}>
                  <input className="poll-input" style={{ marginBottom:0, flex:1 }} placeholder={`Option ${i+1}`} value={opt}
                    onChange={e=>{ const n=[...options]; n[i]=e.target.value; setOptions(n); }}/>
                  {options.length>2&&<button className="btn-remove" onClick={()=>setOptions(options.filter((_,j)=>j!==i))}>✕</button>}
                </div>
              ))}
              {options.length<6&&<button className="btn-add-option" onClick={()=>setOptions([...options,''])}>+ Add option</button>}
              <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:10 }}>
                <label style={{ fontSize:12, color:'var(--text2)' }}>Close at:</label>
                <input type="datetime-local" value={closesAt} onChange={e=>setClosesAt(e.target.value)}
                  style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:7, padding:'5px 10px', color:'var(--text)', fontSize:12 }}/>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button className="btn-primary" onClick={handleCreate} disabled={submitting}>{submitting?'…':'Publish Poll'}</button>
                <button style={{ fontSize:12, color:'var(--text3)', padding:'7px 14px' }} onClick={()=>setShowForm(false)}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}

      {loading && <div style={{ display:'flex', justifyContent:'center', padding:40 }}><div className="spinner"/></div>}
      {!loading && polls.length===0 && (
        <div className="empty-state"><div className="empty-state-icon">◈</div><div className="empty-state-text">No polls yet.</div></div>
      )}
      {!loading && polls.map(poll=>(
        <PollCard key={poll._id} poll={poll} isTeacher={isTeacher} onVote={handleVote} onClose={handleClose}/>
      ))}
    </div>
  );
}