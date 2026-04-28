// import { useState, useEffect } from 'react';
// import api from '../../utils/api';

// function StatCards({ stats }) {
//   return (
//     <div className="stat-grid">
//       {[
//         { label: 'Students', value: stats.students, cls: 'blue'   },
//         { label: 'Teachers', value: stats.teachers, cls: 'purple' },
//         { label: 'Classes',  value: stats.classes,  cls: 'green'  },
//         { label: 'Subjects', value: stats.subjects, cls: 'amber'  },
//       ].map(s => (
//         <div className="stat-card" key={s.label}>
//           <div className="stat-label">{s.label}</div>
//           <div className={`stat-value ${s.cls}`}>{s.value ?? '—'}</div>
//         </div>
//       ))}
//     </div>
//   );
// }

// // ── Teacher assignment modal ───────────────────────────────────────────────
// function AssignModal({ teacher, classes, onSave, onClose }) {
//   // Build initial state from teacher.teacherAssignments
//   const [assignments, setAssignments] = useState(() =>
//     (teacher.teacherAssignments || []).map(a => ({
//       classId:      a.classRef?.classId || '',
//       subjectCodes: (a.subjectRefs || []).map(s => s.code),
//     }))
//   );
//   const [subjectsByClass, setSubjectsByClass] = useState({});
//   const [saving, setSaving] = useState(false);

//   // Load subjects for each selected class
//   const loadSubjects = async (classId) => {
//     if (!classId || subjectsByClass[classId]) return;
//     const { data } = await api.get(`/admin/classes/${classId}/subjects`);
//     setSubjectsByClass(prev => ({ ...prev, [classId]: data }));
//   };

//   useEffect(() => {
//     assignments.forEach(a => { if (a.classId) loadSubjects(a.classId); });
//   }, []);

//   const addRow = () => setAssignments(prev => [...prev, { classId: '', subjectCodes: [] }]);
//   const removeRow = (i) => setAssignments(prev => prev.filter((_, j) => j !== i));

//   const setRowClass = async (i, classId) => {
//     setAssignments(prev => prev.map((a, j) => j === i ? { classId, subjectCodes: [] } : a));
//     await loadSubjects(classId);
//   };

//   const toggleSubject = (i, code) => {
//     setAssignments(prev => prev.map((a, j) => {
//       if (j !== i) return a;
//       const has = a.subjectCodes.includes(code);
//       return { ...a, subjectCodes: has ? a.subjectCodes.filter(c => c !== code) : [...a.subjectCodes, code] };
//     }));
//   };

//   const handleSave = async () => {
//     setSaving(true);
//     const payload = assignments.filter(a => a.classId).map(a => ({
//       classId:      a.classId,
//       subjectCodes: a.subjectCodes,
//     }));
//     await onSave(payload);
//     setSaving(false);
//   };

//   return (
//     <div style={{
//       position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
//       display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
//     }}>
//       <div style={{
//         background: 'var(--bg2)', border: '1px solid var(--border2)',
//         borderRadius: 16, padding: 24, width: 560, maxHeight: '80vh', overflowY: 'auto',
//       }}>
//         <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
//           Assign Classes — {teacher.realName}
//         </div>
//         <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 16 }}>
//           Select which subjects in which classes this teacher handles.
//         </div>

//         {assignments.map((row, i) => (
//           <div key={i} style={{
//             background: 'var(--bg3)', borderRadius: 10, padding: 14, marginBottom: 10,
//             border: '1px solid var(--border)',
//           }}>
//             <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
//               <select
//                 value={row.classId}
//                 onChange={e => setRowClass(i, e.target.value)}
//                 style={{
//                   flex: 1, background: 'var(--bg2)', border: '1px solid var(--border2)',
//                   borderRadius: 8, padding: '7px 10px', color: 'var(--text)', fontSize: 13,
//                 }}
//               >
//                 <option value="">Select class</option>
//                 {classes.map(c => (
//                   <option key={c._id} value={c.classId}
//                     disabled={assignments.some((a, j) => j !== i && a.classId === c.classId)}>
//                     {c.displayName}
//                   </option>
//                 ))}
//               </select>
//               <button onClick={() => removeRow(i)} style={{
//                 color: 'var(--red)', fontSize: 16, padding: '4px 8px', borderRadius: 6,
//                 background: 'var(--red-bg)', border: 'none', cursor: 'pointer',
//               }}>✕</button>
//             </div>

//             {row.classId && (
//               <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
//                 {(subjectsByClass[row.classId] || []).map(s => {
//                   const active = row.subjectCodes.includes(s.code);
//                   return (
//                     <button key={s._id} onClick={() => toggleSubject(i, s.code)} style={{
//                       fontSize: 11, padding: '4px 10px', borderRadius: 6, cursor: 'pointer',
//                       background: active ? 'var(--accent-bg)' : 'var(--bg2)',
//                       color:      active ? 'var(--accent)' : 'var(--text2)',
//                       border:     active ? '1px solid rgba(108,143,255,0.3)' : '1px solid var(--border)',
//                       fontWeight: active ? 500 : 400,
//                     }}>
//                       {s.code} · {s.name}
//                     </button>
//                   );
//                 })}
//                 {!subjectsByClass[row.classId] && (
//                   <span style={{ fontSize: 11, color: 'var(--text3)' }}>Loading subjects...</span>
//                 )}
//               </div>
//             )}
//           </div>
//         ))}

//         <button onClick={addRow} style={{
//           fontSize: 12, color: 'var(--accent)', padding: '6px 14px',
//           border: '1px dashed rgba(108,143,255,0.3)', borderRadius: 8,
//           background: 'none', cursor: 'pointer', marginBottom: 16,
//         }}>+ Add another class</button>

//         <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
//           <button onClick={onClose} style={{
//             padding: '8px 16px', borderRadius: 8,
//             border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--text2)',
//             fontSize: 13, cursor: 'pointer',
//           }}>Cancel</button>
//           <button onClick={handleSave} disabled={saving} className="btn-primary">
//             {saving ? 'Saving...' : 'Save Assignments'}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ── Edit student modal ─────────────────────────────────────────────────────
// function EditStudentModal({ student, classes, onSave, onClose }) {
//   const [classId, setClassId] = useState(student.classRef?.classId || '');
//   const [saving, setSaving]   = useState(false);

//   const handleSave = async () => {
//     setSaving(true);
//     await onSave(classId);
//     setSaving(false);
//   };

//   return (
//     <div style={{
//       position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
//       display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
//     }}>
//       <div style={{
//         background: 'var(--bg2)', border: '1px solid var(--border2)',
//         borderRadius: 16, padding: 24, width: 380,
//       }}>
//         <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>
//           Edit Student — {student.realName}
//         </div>
//         <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>
//           Assign to class
//         </label>
//         <select value={classId} onChange={e => setClassId(e.target.value)} style={{
//           width: '100%', background: 'var(--bg3)', border: '1px solid var(--border2)',
//           borderRadius: 8, padding: '9px 12px', color: 'var(--text)', fontSize: 13, marginBottom: 16,
//         }}>
//           <option value="">Select class</option>
//           {classes.map(c => <option key={c._id} value={c.classId}>{c.displayName}</option>)}
//         </select>
//         <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
//           <button onClick={onClose} style={{
//             padding: '8px 16px', borderRadius: 8,
//             border: '1px solid var(--border)', color: 'var(--text2)', cursor: 'pointer', fontSize: 13,
//           }}>Cancel</button>
//           <button className="btn-primary" onClick={handleSave} disabled={saving}>
//             {saving ? '...' : 'Save'}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ── Main AdminPanel ────────────────────────────────────────────────────────
// export default function AdminPanel() {
//   const [section, setSection]         = useState('overview');
//   const [stats, setStats]             = useState({});
//   const [students, setStudents]       = useState([]);
//   const [teachers, setTeachers]       = useState([]);
//   const [classes, setClasses]         = useState([]);
//   const [loading, setLoading]         = useState(false);
//   const [editStudent, setEditStudent] = useState(null);
//   const [assignTeacher, setAssignTeacher] = useState(null);

//   useEffect(() => {
//     api.get('/admin/stats').then(r => setStats(r.data)).catch(() => {});
//     api.get('/admin/classes').then(r => setClasses(r.data)).catch(() => {});
//   }, []);

//   useEffect(() => {
//     if (section === 'students' && !students.length) {
//       setLoading(true);
//       api.get('/admin/students').then(r => setStudents(r.data)).finally(() => setLoading(false));
//     }
//     if (section === 'teachers' && !teachers.length) {
//       setLoading(true);
//       api.get('/admin/teachers').then(r => setTeachers(r.data)).finally(() => setLoading(false));
//     }
//   }, [section]);

//   const handleDeleteStudent = async (id) => {
//     if (!confirm('Delete this student?')) return;
//     await api.delete(`/admin/students/${id}`);
//     setStudents(prev => prev.filter(s => s._id !== id));
//     setStats(s => ({ ...s, students: (s.students || 1) - 1 }));
//   };

//   const handleSaveStudent = async (classId) => {
//     const { data } = await api.put(`/admin/students/${editStudent._id}`, { classId });
//     setStudents(prev => prev.map(s => s._id === data._id ? data : s));
//     setEditStudent(null);
//   };

//   const handleSaveTeacherAssign = async (payload) => {
//     const { data } = await api.put(`/admin/teachers/${assignTeacher._id}/assignments`, { assignments: payload });
//     setTeachers(prev => prev.map(t => t._id === data._id ? data : t));
//     setAssignTeacher(null);
//   };

//   const handleDeleteTeacher = async (id) => {
//     if (!confirm('Delete this teacher?')) return;
//     await api.delete(`/admin/teachers/${id}`);
//     setTeachers(prev => prev.filter(t => t._id !== id));
//     setStats(s => ({ ...s, teachers: (s.teachers || 1) - 1 }));
//   };

//   const navItems = [
//     { id: 'overview', label: 'Overview', icon: '◎' },
//     { id: 'students', label: 'Students', icon: '◈' },
//     { id: 'teachers', label: 'Teachers', icon: '◉' },
//   ];

//   return (
//     <>
//       <div className="admin-layout">
//         <div className="admin-nav">
//           <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text3)', padding: '4px 12px 10px' }}>
//             Admin Panel
//           </div>
//           {navItems.map(item => (
//             <div key={item.id} className={`admin-nav-item ${section === item.id ? 'active' : ''}`}
//               onClick={() => setSection(item.id)}>
//               <span style={{ fontSize: 14 }}>{item.icon}</span> {item.label}
//             </div>
//           ))}
//         </div>

//         <div className="admin-content">
//           {/* OVERVIEW */}
//           {section === 'overview' && (
//             <>
//               <div className="admin-section-title">Overview</div>
//               <StatCards stats={stats} />
//               <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, padding: 20 }}>
//                 <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Platform info</div>
//                 <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.9 }}>
//                   <div>Institution: <span style={{ color: 'var(--text)' }}>Chitkara University</span></div>
//                   <div>Anonymity: <span style={{ color: 'var(--green)' }}>Active</span> — real names hidden in all student/teacher views</div>
//                   <div>Admin account: <span style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>ADMIN001</span></div>
//                   <div>Only admin can see real identities and unlink posts to students.</div>
//                 </div>
//               </div>
//             </>
//           )}

//           {/* STUDENTS */}
//           {section === 'students' && (
//             <>
//               <div className="admin-section-title">
//                 Students
//                 <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text3)', marginLeft: 8 }}>
//                   {students.length} enrolled
//                 </span>
//               </div>
//               {loading ? (
//                 <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
//               ) : (
//                 <div style={{ overflowX: 'auto' }}>
//                   <table className="data-table">
//                     <thead>
//                       <tr>
//                         <th>Roll No</th><th>Name</th><th>Email</th><th>Class</th><th>Sem</th><th>Actions</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {students.map(s => (
//                         <tr key={s._id}>
//                           <td style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{s.rollNo}</td>
//                           <td style={{ color: 'var(--text)', fontWeight: 500 }}>{s.realName}</td>
//                           <td style={{ fontSize: 12 }}>{s.email}</td>
//                           <td><span className="badge student">{s.classRef?.displayName || '—'}</span></td>
//                           <td>{s.classRef?.semester || '—'}</td>
//                           <td>
//                             <div style={{ display: 'flex', gap: 6 }}>
//                               <button className="btn-sm" onClick={() => setEditStudent(s)}>Edit</button>
//                               <button className="btn-sm danger" onClick={() => handleDeleteStudent(s._id)}>Delete</button>
//                             </div>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               )}
//             </>
//           )}

//           {/* TEACHERS */}
//           {section === 'teachers' && (
//             <>
//               <div className="admin-section-title">Teachers</div>
//               {loading ? (
//                 <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
//               ) : (
//                 <div style={{ overflowX: 'auto' }}>
//                   <table className="data-table">
//                     <thead>
//                       <tr>
//                         <th>ID</th><th>Name</th><th>Skill Tags</th><th>Assigned (Class → Subjects)</th><th>Actions</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {teachers.map(t => (
//                         <tr key={t._id}>
//                           <td style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{t.rollNo}</td>
//                           <td style={{ color: 'var(--text)', fontWeight: 500 }}>
//                             <div>{t.realName}</div>
//                             <div style={{ fontSize: 11, color: 'var(--text3)' }}>{t.email}</div>
//                           </td>
//                           <td>
//                             <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
//                               {(t.skillTags || []).map(sk => (
//                                 <span key={sk} style={{
//                                   fontSize: 10, padding: '2px 7px', borderRadius: 10,
//                                   background: 'var(--accent-bg)', color: 'var(--accent)',
//                                 }}>{sk}</span>
//                               ))}
//                               {!t.skillTags?.length && <span style={{ fontSize: 11, color: 'var(--text3)' }}>—</span>}
//                             </div>
//                           </td>
//                           <td style={{ maxWidth: 220 }}>
//                             {(t.teacherAssignments || []).map((a, i) => (
//                               <div key={i} style={{ marginBottom: 4 }}>
//                                 <span className="badge teacher" style={{ marginRight: 4 }}>
//                                   {a.classRef?.classId || '?'}
//                                 </span>
//                                 {(a.subjectRefs || []).map(s => (
//                                   <span key={s._id} style={{
//                                     fontSize: 10, marginRight: 3, color: 'var(--text2)',
//                                   }}>{s.code}</span>
//                                 ))}
//                               </div>
//                             ))}
//                             {!t.teacherAssignments?.length && <span style={{ fontSize: 11, color: 'var(--text3)' }}>None</span>}
//                           </td>
//                           <td>
//                             <div style={{ display: 'flex', gap: 6 }}>
//                               <button className="btn-sm" onClick={() => setAssignTeacher(t)}>Assign</button>
//                               <button className="btn-sm danger" onClick={() => handleDeleteTeacher(t._id)}>Delete</button>
//                             </div>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               )}
//             </>
//           )}
//         </div>
//       </div>

//       {editStudent && (
//         <EditStudentModal
//           student={editStudent}
//           classes={classes}
//           onSave={handleSaveStudent}
//           onClose={() => setEditStudent(null)}
//         />
//       )}

//       {assignTeacher && (
//         <AssignModal
//           teacher={assignTeacher}
//           classes={classes}
//           onSave={handleSaveTeacherAssign}
//           onClose={() => setAssignTeacher(null)}
//         />
//       )}
//     </>
//   );
// }




// import { useState, useEffect } from 'react';
// import api from '../../utils/api';

// function StatCards({ stats }) {
//   return (
//     <div className="stat-grid">
//       {[
//         { label:'Students', value:stats.students, cls:'blue'   },
//         { label:'Teachers', value:stats.teachers, cls:'purple' },
//         { label:'Pending',  value:stats.pending,  cls:'amber'  },
//         { label:'Classes',  value:stats.classes,  cls:'green'  },
//         { label:'Subjects', value:stats.subjects, cls:'blue'   },
//       ].map(s=>(
//         <div className="stat-card" key={s.label}>
//           <div className="stat-label">{s.label}</div>
//           <div className={`stat-value ${s.cls}`}>{s.value??'—'}</div>
//         </div>
//       ))}
//     </div>
//   );
// }

// function AssignModal({ teacher, classes, onSave, onClose }) {
//   const [assignments,setAssignments]       = useState(()=>(teacher.teacherAssignments||[]).map(a=>({classId:a.classRef?.classId||'',subjectCodes:(a.subjectRefs||[]).map(s=>s.code)})));
//   const [subjectsByClass,setSubjectsByClass] = useState({});
//   const [saving,setSaving]                  = useState(false);

//   const loadSubjects = async (classId) => {
//     if(!classId||subjectsByClass[classId])return;
//     const {data}=await api.get(`/admin/classes/${classId}/subjects`);
//     setSubjectsByClass(p=>({...p,[classId]:data}));
//   };

//   useEffect(()=>{ assignments.forEach(a=>{ if(a.classId) loadSubjects(a.classId); }); },[]);

//   const setRowClass = async (i,classId) => {
//     setAssignments(p=>p.map((a,j)=>j===i?{classId,subjectCodes:[]}:a));
//     await loadSubjects(classId);
//   };

//   const toggleSubject = (i,code) => setAssignments(p=>p.map((a,j)=>{
//     if(j!==i)return a;
//     return{...a,subjectCodes:a.subjectCodes.includes(code)?a.subjectCodes.filter(c=>c!==code):[...a.subjectCodes,code]};
//   }));

//   const handleSave = async () => {
//     setSaving(true);
//     await onSave(assignments.filter(a=>a.classId).map(a=>({classId:a.classId,subjectCodes:a.subjectCodes})));
//     setSaving(false);
//   };

//   return (
//     <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:200}}>
//       <div style={{background:'var(--bg2)',border:'1px solid var(--border2)',borderRadius:16,padding:24,width:560,maxHeight:'80vh',overflowY:'auto'}}>
//         <div style={{fontSize:15,fontWeight:600,marginBottom:4}}>Assign Classes — {teacher.realName}</div>
//         <div style={{fontSize:12,color:'var(--text3)',marginBottom:16}}>Select which subjects in which classes this teacher handles.</div>
//         {assignments.map((row,i)=>(
//           <div key={i} style={{background:'var(--bg3)',borderRadius:10,padding:14,marginBottom:10,border:'1px solid var(--border)'}}>
//             <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:10}}>
//               <select value={row.classId} onChange={e=>setRowClass(i,e.target.value)} style={{flex:1,background:'var(--bg2)',border:'1px solid var(--border2)',borderRadius:8,padding:'7px 10px',color:'var(--text)',fontSize:13}}>
//                 <option value="">Select class</option>
//                 {classes.map(c=><option key={c._id} value={c.classId} disabled={assignments.some((a,j)=>j!==i&&a.classId===c.classId)}>{c.displayName}</option>)}
//               </select>
//               <button onClick={()=>setAssignments(p=>p.filter((_,j)=>j!==i))} style={{color:'var(--red)',fontSize:16,padding:'4px 8px',borderRadius:6,background:'var(--red-bg)',border:'none',cursor:'pointer'}}>✕</button>
//             </div>
//             {row.classId&&(
//               <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
//                 {(subjectsByClass[row.classId]||[]).map(s=>{
//                   const active=row.subjectCodes.includes(s.code);
//                   return <button key={s._id} onClick={()=>toggleSubject(i,s.code)} style={{fontSize:11,padding:'4px 10px',borderRadius:6,cursor:'pointer',background:active?'var(--accent-bg)':'var(--bg2)',color:active?'var(--accent)':'var(--text2)',border:active?'1px solid rgba(108,143,255,0.3)':'1px solid var(--border)',fontWeight:active?500:400}}>{s.code} · {s.name}</button>;
//                 })}
//                 {!subjectsByClass[row.classId]&&<span style={{fontSize:11,color:'var(--text3)'}}>Loading…</span>}
//               </div>
//             )}
//           </div>
//         ))}
//         <button onClick={()=>setAssignments(p=>[...p,{classId:'',subjectCodes:[]}])} style={{fontSize:12,color:'var(--accent)',padding:'6px 14px',border:'1px dashed rgba(108,143,255,0.3)',borderRadius:8,background:'none',cursor:'pointer',marginBottom:16}}>+ Add another class</button>
//         <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
//           <button onClick={onClose} style={{padding:'8px 16px',borderRadius:8,border:'1px solid var(--border)',background:'var(--bg3)',color:'var(--text2)',fontSize:13,cursor:'pointer'}}>Cancel</button>
//           <button onClick={handleSave} disabled={saving} className="btn-primary">{saving?'Saving…':'Save Assignments'}</button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function AdminPanel() {
//   const [section,setSection]           = useState('overview');
//   const [stats,setStats]               = useState({});
//   const [students,setStudents]         = useState([]);
//   const [teachers,setTeachers]         = useState([]);
//   const [pending,setPending]           = useState([]);
//   const [classes,setClasses]           = useState([]);
//   const [loading,setLoading]           = useState(false);
//   const [editStudent,setEditStudent]   = useState(null);
//   const [editClass,setEditClass]       = useState('');
//   const [assignTeacher,setAssignTeacher] = useState(null);

//   useEffect(()=>{
//     api.get('/admin/stats').then(r=>setStats(r.data)).catch(()=>{});
//     api.get('/admin/classes').then(r=>setClasses(r.data)).catch(()=>{});
//   },[]);

//   useEffect(()=>{
//     if(section==='students'&&!students.length){ setLoading(true); api.get('/admin/students').then(r=>setStudents(r.data)).finally(()=>setLoading(false)); }
//     if(section==='teachers'&&!teachers.length){
//       setLoading(true);
//       Promise.all([api.get('/admin/teachers'),api.get('/admin/teachers/pending')])
//         .then(([t,p])=>{ setTeachers(t.data); setPending(p.data); })
//         .finally(()=>setLoading(false));
//     }
//   },[section]);

//   const approveTeacher = async (id) => {
//     await api.patch(`/admin/teachers/${id}/approve`);
//     const t=pending.find(p=>p._id===id);
//     setPending(p=>p.filter(x=>x._id!==id));
//     if(t){ setTeachers(prev=>[{...t,isPendingApproval:false},...prev]); setStats(s=>({...s,teachers:(s.teachers||0)+1,pending:Math.max(0,(s.pending||1)-1)})); }
//   };

//   const rejectTeacher = async (id) => {
//     if(!confirm('Reject and delete this teacher registration?'))return;
//     await api.delete(`/admin/teachers/${id}/reject`);
//     setPending(p=>p.filter(x=>x._id!==id));
//     setStats(s=>({...s,pending:Math.max(0,(s.pending||1)-1)}));
//   };

//   const deleteStudent = async (id) => {
//     if(!confirm('Delete this student?'))return;
//     await api.delete(`/admin/students/${id}`);
//     setStudents(p=>p.filter(s=>s._id!==id));
//     setStats(s=>({...s,students:Math.max(0,(s.students||1)-1)}));
//   };

//   const saveStudent = async () => {
//     const {data}=await api.put(`/admin/students/${editStudent._id}`,{classId:editClass});
//     setStudents(p=>p.map(s=>s._id===data._id?data:s));
//     setEditStudent(null); setEditClass('');
//   };

//   const saveTeacherAssign = async (payload) => {
//     const {data}=await api.put(`/admin/teachers/${assignTeacher._id}/assignments`,{assignments:payload});
//     setTeachers(p=>p.map(t=>t._id===data._id?data:t));
//     setAssignTeacher(null);
//   };

//   const navItems=[
//     {id:'overview',label:'Overview',icon:'◎'},
//     {id:'students',label:'Students',icon:'◈'},
//     {id:'teachers',label:'Teachers',icon:'◉'},
//   ];

//   return (
//     <>
//       <div className="admin-layout">
//         <div className="admin-nav">
//           <div style={{fontSize:11,fontWeight:600,letterSpacing:'0.07em',textTransform:'uppercase',color:'var(--text3)',padding:'4px 12px 10px'}}>Admin Panel</div>
//           {navItems.map(item=>(
//             <div key={item.id} className={`admin-nav-item ${section===item.id?'active':''}`} onClick={()=>setSection(item.id)}>
//               <span style={{fontSize:14}}>{item.icon}</span> {item.label}
//               {item.id==='teachers'&&(stats.pending||0)>0&&<span style={{marginLeft:'auto',fontSize:10,padding:'2px 6px',borderRadius:10,background:'var(--amber-bg)',color:'var(--amber)',fontWeight:600}}>{stats.pending}</span>}
//             </div>
//           ))}
//         </div>

//         <div className="admin-content">
//           {section==='overview'&&(
//             <>
//               <div className="admin-section-title">Overview</div>
//               <StatCards stats={stats}/>
//               <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:14,padding:20}}>
//                 <div style={{fontSize:13,fontWeight:600,marginBottom:10}}>Platform info</div>
//                 <div style={{fontSize:13,color:'var(--text2)',lineHeight:1.9}}>
//                   <div>Institution: <span style={{color:'var(--text)'}}>Chitkara University</span></div>
//                   <div>Anonymity: <span style={{color:'var(--green)'}}>Active</span></div>
//                   <div>Teacher registration: <span style={{color:'var(--amber)'}}>Requires approval</span></div>
//                   <div>Admin: <span style={{fontFamily:'var(--mono)',fontSize:12}}>ADMIN001</span></div>
//                 </div>
//               </div>
//             </>
//           )}

//           {section==='students'&&(
//             <>
//               <div className="admin-section-title">Students <span style={{fontSize:13,fontWeight:400,color:'var(--text3)',marginLeft:8}}>{students.length} enrolled</span></div>
//               {loading?<div style={{display:'flex',justifyContent:'center',padding:60}}><div className="spinner"/></div>:(
//                 <div style={{overflowX:'auto'}}>
//                   <table className="data-table">
//                     <thead><tr><th>Roll No</th><th>Name</th><th>Email</th><th>Class</th><th>Sem</th><th>Actions</th></tr></thead>
//                     <tbody>
//                       {students.map(s=>(
//                         <tr key={s._id}>
//                           <td style={{fontFamily:'var(--mono)',fontSize:12}}>{s.rollNo}</td>
//                           <td style={{color:'var(--text)',fontWeight:500}}>{s.realName}</td>
//                           <td style={{fontSize:12}}>{s.email}</td>
//                           <td><span className="badge student">{s.classRef?.displayName||'—'}</span></td>
//                           <td>{s.classRef?.semester||'—'}</td>
//                           <td><div style={{display:'flex',gap:6}}>
//                             <button className="btn-sm" onClick={()=>{setEditStudent(s);setEditClass(s.classRef?.classId||'');}}>Edit</button>
//                             <button className="btn-sm danger" onClick={()=>deleteStudent(s._id)}>Delete</button>
//                           </div></td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               )}
//             </>
//           )}

//           {section==='teachers'&&(
//             <>
//               {/* Pending approvals */}
//               {pending.length>0&&(
//                 <div style={{background:'var(--amber-bg)',border:'1px solid rgba(245,158,11,0.2)',borderRadius:14,padding:16,marginBottom:20}}>
//                   <div style={{fontSize:13,fontWeight:600,color:'var(--amber)',marginBottom:12}}>⚠ Pending Approvals ({pending.length})</div>
//                   {pending.map(t=>(
//                     <div key={t._id} style={{background:'var(--bg2)',borderRadius:10,padding:12,marginBottom:8,display:'flex',alignItems:'center',gap:12}}>
//                       <div style={{flex:1}}>
//                         <div style={{fontSize:13,fontWeight:500}}>{t.realName} <span style={{fontFamily:'var(--mono)',fontSize:11,color:'var(--text3)',marginLeft:6}}>{t.rollNo}</span></div>
//                         <div style={{fontSize:11,color:'var(--text3)',marginTop:2}}>{t.email}</div>
//                         {t.skillTags?.length>0&&<div style={{display:'flex',gap:4,flexWrap:'wrap',marginTop:4}}>{t.skillTags.map(s=><span key={s} style={{fontSize:10,padding:'2px 7px',borderRadius:10,background:'var(--accent-bg)',color:'var(--accent)'}}>{s}</span>)}</div>}
//                       </div>
//                       <button onClick={()=>approveTeacher(t._id)} style={{padding:'6px 14px',borderRadius:8,background:'var(--green-bg)',color:'var(--green)',border:'1px solid rgba(62,207,142,0.25)',fontSize:12,fontWeight:500,cursor:'pointer'}}>Approve</button>
//                       <button onClick={()=>rejectTeacher(t._id)} style={{padding:'6px 14px',borderRadius:8,background:'var(--red-bg)',color:'var(--red)',border:'1px solid rgba(248,113,113,0.2)',fontSize:12,cursor:'pointer'}}>Reject</button>
//                     </div>
//                   ))}
//                 </div>
//               )}

//               <div className="admin-section-title">Active Teachers</div>
//               {loading?<div style={{display:'flex',justifyContent:'center',padding:60}}><div className="spinner"/></div>:(
//                 <div style={{overflowX:'auto'}}>
//                   <table className="data-table">
//                     <thead><tr><th>ID</th><th>Name</th><th>Skills</th><th>Assigned</th><th>Actions</th></tr></thead>
//                     <tbody>
//                       {teachers.map(t=>(
//                         <tr key={t._id}>
//                           <td style={{fontFamily:'var(--mono)',fontSize:12}}>{t.rollNo}</td>
//                           <td><div style={{fontWeight:500,color:'var(--text)'}}>{t.realName}</div><div style={{fontSize:11,color:'var(--text3)'}}>{t.email}</div></td>
//                           <td><div style={{display:'flex',flexWrap:'wrap',gap:4}}>{(t.skillTags||[]).map(s=><span key={s} style={{fontSize:10,padding:'2px 7px',borderRadius:10,background:'var(--accent-bg)',color:'var(--accent)'}}>{s}</span>)}{!t.skillTags?.length&&<span style={{fontSize:11,color:'var(--text3)'}}>—</span>}</div></td>
//                           <td style={{maxWidth:200}}>
//                             {(t.teacherAssignments||[]).map((a,i)=>(
//                               <div key={i} style={{marginBottom:4}}>
//                                 <span className="badge teacher" style={{marginRight:4}}>{a.classRef?.classId||'?'}</span>
//                                 {(a.subjectRefs||[]).map(s=><span key={s._id} style={{fontSize:10,marginRight:3,color:'var(--text2)'}}>{s.code}</span>)}
//                               </div>
//                             ))}
//                             {!t.teacherAssignments?.length&&<span style={{fontSize:11,color:'var(--text3)'}}>None</span>}
//                           </td>
//                           <td><div style={{display:'flex',gap:6}}>
//                             <button className="btn-sm" onClick={()=>setAssignTeacher(t)}>Assign</button>
//                             <button className="btn-sm danger" onClick={async()=>{ if(!confirm('Delete?'))return; await api.delete(`/admin/teachers/${t._id}`); setTeachers(p=>p.filter(x=>x._id!==t._id)); }}>Delete</button>
//                           </div></td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               )}
//             </>
//           )}
//         </div>
//       </div>

//       {editStudent&&(
//         <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:200}}>
//           <div style={{background:'var(--bg2)',border:'1px solid var(--border2)',borderRadius:16,padding:24,width:380}}>
//             <div style={{fontSize:15,fontWeight:600,marginBottom:16}}>Edit — {editStudent.realName}</div>
//             <select value={editClass} onChange={e=>setEditClass(e.target.value)} style={{width:'100%',background:'var(--bg3)',border:'1px solid var(--border2)',borderRadius:8,padding:'9px 12px',color:'var(--text)',fontSize:13,marginBottom:16}}>
//               <option value="">Select class</option>
//               {classes.map(c=><option key={c._id} value={c.classId}>{c.displayName}</option>)}
//             </select>
//             <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
//               <button onClick={()=>setEditStudent(null)} style={{padding:'8px 16px',borderRadius:8,border:'1px solid var(--border)',color:'var(--text2)',cursor:'pointer',fontSize:13}}>Cancel</button>
//               <button className="btn-primary" onClick={saveStudent}>Save</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {assignTeacher&&<AssignModal teacher={assignTeacher} classes={classes} onSave={saveTeacherAssign} onClose={()=>setAssignTeacher(null)}/>}
//     </>
//   );
// }
import { useState, useEffect } from 'react';
import api from '../../utils/api';

// ── Stat cards ───────────────────────────────────────────────────────────
function StatCards({ stats }) {
  return (
    <div className="stat-grid">
      {[
        { label:'Students', value:stats.students, cls:'blue'   },
        { label:'Teachers', value:stats.teachers, cls:'purple' },
        { label:'Pending',  value:stats.pending,  cls:'amber'  },
        { label:'Classes',  value:stats.classes,  cls:'green'  },
        { label:'Subjects', value:stats.subjects, cls:'blue'   },
      ].map(s => (
        <div className="stat-card" key={s.label}>
          <div className="stat-label">{s.label}</div>
          <div className={`stat-value ${s.cls}`}>{s.value ?? '—'}</div>
        </div>
      ))}
    </div>
  );
}

// ── Teacher assignment modal ─────────────────────────────────────────────
function AssignModal({ teacher, classes, onSave, onClose }) {
  const [assignments, setAssignments] = useState(
    () => (teacher.teacherAssignments || []).map(a => ({
      classId: a.classRef?.classId || '',
      subjectCodes: (a.subjectRefs || []).map(s => s.code),
    }))
  );
  const [subjectsByClass, setSubjectsByClass] = useState({});
  const [saving, setSaving] = useState(false);

  const loadSubjects = async (classId) => {
    if (!classId || subjectsByClass[classId]) return;
    const { data } = await api.get(`/admin/classes/${classId}/subjects`);
    setSubjectsByClass(p => ({ ...p, [classId]: data }));
  };

  useEffect(() => { assignments.forEach(a => { if (a.classId) loadSubjects(a.classId); }); }, []);

  const setRowClass = async (i, classId) => {
    setAssignments(p => p.map((a, j) => j === i ? { classId, subjectCodes: [] } : a));
    await loadSubjects(classId);
  };

  const toggleSubject = (i, code) => setAssignments(p => p.map((a, j) => {
    if (j !== i) return a;
    return { ...a, subjectCodes: a.subjectCodes.includes(code) ? a.subjectCodes.filter(c => c !== code) : [...a.subjectCodes, code] };
  }));

  const handleSave = async () => {
    setSaving(true);
    await onSave(assignments.filter(a => a.classId).map(a => ({ classId: a.classId, subjectCodes: a.subjectCodes })));
    setSaving(false);
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200 }}>
      <div style={{ background:'var(--bg2)', border:'1px solid var(--border2)', borderRadius:16, padding:24, width:560, maxHeight:'80vh', overflowY:'auto' }}>
        <div style={{ fontSize:15, fontWeight:600, marginBottom:4 }}>Assign Classes — {teacher.realName}</div>
        <div style={{ fontSize:12, color:'var(--text3)', marginBottom:16 }}>Select which classes and subjects this teacher handles.</div>
        {assignments.map((row, i) => (
          <div key={i} style={{ background:'var(--bg3)', borderRadius:10, padding:14, marginBottom:10, border:'1px solid var(--border)' }}>
            <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:10 }}>
              <select value={row.classId} onChange={e => setRowClass(i, e.target.value)}
                style={{ flex:1, background:'var(--bg2)', border:'1px solid var(--border2)', borderRadius:8, padding:'7px 10px', color:'var(--text)', fontSize:13 }}>
                <option value="">Select class</option>
                {classes.map(c => (
                  <option key={c._id} value={c.classId} disabled={assignments.some((a, j) => j !== i && a.classId === c.classId)}>{c.displayName}</option>
                ))}
              </select>
              <button onClick={() => setAssignments(p => p.filter((_, j) => j !== i))}
                style={{ color:'var(--red)', fontSize:16, padding:'4px 8px', borderRadius:6, background:'var(--red-bg)', border:'none', cursor:'pointer' }}>✕</button>
            </div>
            {row.classId && (
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {(subjectsByClass[row.classId] || []).map(s => {
                  const active = row.subjectCodes.includes(s.code);
                  return (
                    <button key={s._id} onClick={() => toggleSubject(i, s.code)}
                      style={{ fontSize:11, padding:'4px 10px', borderRadius:6, cursor:'pointer', background:active?'var(--accent-bg)':'var(--bg2)', color:active?'var(--accent)':'var(--text2)', border:active?'1px solid rgba(108,143,255,0.3)':'1px solid var(--border)', fontWeight:active?500:400 }}>
                      {s.code} · {s.name}
                    </button>
                  );
                })}
                {!subjectsByClass[row.classId] && <span style={{ fontSize:11, color:'var(--text3)' }}>Loading…</span>}
              </div>
            )}
          </div>
        ))}
        <button onClick={() => setAssignments(p => [...p, { classId:'', subjectCodes:[] }])}
          style={{ fontSize:12, color:'var(--accent)', padding:'6px 14px', border:'1px dashed rgba(108,143,255,0.3)', borderRadius:8, background:'none', cursor:'pointer', marginBottom:16 }}>
          + Add another class
        </button>
        <div style={{ display:'flex', justifyContent:'flex-end', gap:8 }}>
          <button onClick={onClose} style={{ padding:'8px 16px', borderRadius:8, border:'1px solid var(--border)', background:'var(--bg3)', color:'var(--text2)', fontSize:13, cursor:'pointer' }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Save Assignments'}</button>
        </div>
      </div>
    </div>
  );
}

// ── Class-wise students accordion ────────────────────────────────────────
function StudentsClassView({ classes }) {
  const [expanded, setExpanded]     = useState(null);
  const [studentMap, setStudentMap] = useState({});
  const [loading, setLoading]       = useState('');
  const [editStudent, setEditStudent] = useState(null);
  const [editClass, setEditClass]     = useState('');
  const [saving, setSaving]           = useState(false);

  const toggle = async (cls) => {
    if (expanded === cls.classId) { setExpanded(null); return; }
    setExpanded(cls.classId);
    if (studentMap[cls.classId] !== undefined) return;
    setLoading(cls.classId);
    try {
      const { data } = await api.get('/admin/students');
      // Group by classId once — then cache per class
      const grouped = {};
      data.forEach(s => {
        const cid = s.classRef?.classId || 'unassigned';
        if (!grouped[cid]) grouped[cid] = [];
        grouped[cid].push(s);
      });
      setStudentMap(grouped);
    } catch {}
    setLoading('');
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      const { data } = await api.put(`/admin/students/${editStudent._id}`, { classId: editClass });
      setStudentMap(prev => {
        const updated = { ...prev };
        // Remove from old class
        Object.keys(updated).forEach(cid => {
          updated[cid] = updated[cid]?.filter(s => s._id !== data._id);
        });
        // Add to new class
        const newCid = data.classRef?.classId || 'unassigned';
        if (!updated[newCid]) updated[newCid] = [];
        updated[newCid] = [data, ...updated[newCid]];
        return updated;
      });
    } catch {}
    setSaving(false);
    setEditStudent(null); setEditClass('');
  };

  const deleteStudent = async (id, classId) => {
    if (!confirm('Delete this student?')) return;
    await api.delete(`/admin/students/${id}`);
    setStudentMap(prev => ({
      ...prev,
      [classId]: prev[classId]?.filter(s => s._id !== id),
    }));
  };

  return (
    <div>
      {classes.map(cls => {
        const isOpen  = expanded === cls.classId;
        const students = studentMap[cls.classId] || [];
        const isLoading = loading === cls.classId;
        const count   = studentMap[cls.classId]?.length;

        return (
          <div key={cls._id} style={{ border:'1px solid var(--border)', borderRadius:12, marginBottom:10, overflow:'hidden' }}>
            {/* Accordion header */}
            <div
              onClick={() => toggle(cls)}
              style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 18px', background:isOpen?'var(--accent-bg)':'var(--bg2)', cursor:'pointer', transition:'background 150ms', userSelect:'none' }}
            >
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:600, color:isOpen?'var(--accent)':'var(--text)' }}>{cls.displayName}</div>
                <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>
                  {cls.course} · Semester {cls.semester} · Section {cls.section}
                </div>
              </div>
              {count !== undefined && (
                <span style={{ fontSize:11, padding:'3px 10px', borderRadius:20, background:isOpen?'var(--accent)':'var(--bg3)', color:isOpen?'#fff':'var(--text2)', fontWeight:500 }}>
                  {count} students
                </span>
              )}
              <span style={{ fontSize:12, color:'var(--text3)' }}>{isLoading ? '⟳' : isOpen ? '▲' : '▼'}</span>
            </div>

            {/* Student table */}
            {isOpen && (
              <div>
                {isLoading ? (
                  <div style={{ display:'flex', justifyContent:'center', padding:24 }}><div className="spinner"/></div>
                ) : students.length === 0 ? (
                  <div style={{ padding:'16px 18px', fontSize:13, color:'var(--text3)' }}>No students in this class yet.</div>
                ) : (
                  <div style={{ overflowX:'auto' }}>
                    <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                      <thead>
                        <tr>
                          {['#','Roll No','Name','Email','Alias','Actions'].map(h => (
                            <th key={h} style={{ textAlign:'left', padding:'9px 14px', fontSize:10, textTransform:'uppercase', letterSpacing:'0.05em', color:'var(--text3)', borderBottom:'1px solid var(--border)', background:'var(--bg3)', fontWeight:600 }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((s, idx) => (
                          <tr key={s._id}
                            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg3)')}
                            onMouseLeave={e => (e.currentTarget.style.background = '')}
                          >
                            <td style={{ padding:'9px 14px', color:'var(--text3)', borderBottom:'1px solid var(--border)' }}>{idx+1}</td>
                            <td style={{ padding:'9px 14px', fontFamily:'var(--mono)', fontSize:12, color:'var(--text)', borderBottom:'1px solid var(--border)' }}>{s.rollNo}</td>
                            <td style={{ padding:'9px 14px', fontWeight:500, color:'var(--text)', borderBottom:'1px solid var(--border)' }}>{s.realName}</td>
                            <td style={{ padding:'9px 14px', fontSize:12, color:'var(--text2)', borderBottom:'1px solid var(--border)' }}>{s.email}</td>
                            <td style={{ padding:'9px 14px', fontFamily:'var(--mono)', fontSize:11, color:'var(--text3)', borderBottom:'1px solid var(--border)' }}>{s.anonAlias}</td>
                            <td style={{ padding:'9px 14px', borderBottom:'1px solid var(--border)' }}>
                              <div style={{ display:'flex', gap:6 }}>
                                <button className="btn-sm" onClick={() => { setEditStudent(s); setEditClass(s.classRef?.classId||''); }}>Move</button>
                                <button className="btn-sm danger" onClick={() => deleteStudent(s._id, cls.classId)}>Delete</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div style={{ padding:'8px 14px', fontSize:11, color:'var(--text3)', borderTop:'1px solid var(--border)' }}>
                      {students.length} student{students.length !== 1 ? 's' : ''} enrolled in {cls.displayName}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Edit/move student modal */}
      {editStudent && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200 }}>
          <div style={{ background:'var(--bg2)', border:'1px solid var(--border2)', borderRadius:16, padding:24, width:380 }}>
            <div style={{ fontSize:15, fontWeight:600, marginBottom:4 }}>Move Student</div>
            <div style={{ fontSize:12, color:'var(--text3)', marginBottom:16 }}>{editStudent.realName} · {editStudent.rollNo}</div>
            <label style={{ fontSize:12, color:'var(--text2)', display:'block', marginBottom:6 }}>Assign to class</label>
            <select value={editClass} onChange={e => setEditClass(e.target.value)}
              style={{ width:'100%', background:'var(--bg3)', border:'1px solid var(--border2)', borderRadius:8, padding:'9px 12px', color:'var(--text)', fontSize:13, marginBottom:16 }}>
              <option value="">Select class</option>
              {classes.map(c => <option key={c._id} value={c.classId}>{c.displayName}</option>)}
            </select>
            <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
              <button onClick={() => setEditStudent(null)} style={{ padding:'8px 16px', borderRadius:8, border:'1px solid var(--border)', color:'var(--text2)', cursor:'pointer', fontSize:13 }}>Cancel</button>
              <button className="btn-primary" onClick={saveEdit} disabled={saving}>{saving?'…':'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main AdminPanel ──────────────────────────────────────────────────────
export default function AdminPanel() {
  const [section, setSection]           = useState('overview');
  const [stats, setStats]               = useState({});
  const [teachers, setTeachers]         = useState([]);
  const [pending, setPending]           = useState([]);
  const [classes, setClasses]           = useState([]);
  const [loading, setLoading]           = useState(false);
  const [assignTeacher, setAssignTeacher] = useState(null);

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data)).catch(() => {});
    api.get('/admin/classes').then(r => setClasses(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (section === 'teachers' && !teachers.length) {
      setLoading(true);
      Promise.all([api.get('/admin/teachers'), api.get('/admin/teachers/pending')])
        .then(([t, p]) => { setTeachers(t.data); setPending(p.data); })
        .finally(() => setLoading(false));
    }
  }, [section]);

  const approveTeacher = async (id) => {
    await api.patch(`/admin/teachers/${id}/approve`);
    const t = pending.find(p => p._id === id);
    setPending(p => p.filter(x => x._id !== id));
    if (t) {
      setTeachers(prev => [{ ...t, isPendingApproval:false }, ...prev]);
      setStats(s => ({ ...s, teachers:(s.teachers||0)+1, pending:Math.max(0,(s.pending||1)-1) }));
    }
  };

  const rejectTeacher = async (id) => {
    if (!confirm('Reject and delete this teacher registration?')) return;
    await api.delete(`/admin/teachers/${id}/reject`);
    setPending(p => p.filter(x => x._id !== id));
    setStats(s => ({ ...s, pending:Math.max(0,(s.pending||1)-1) }));
  };

  const saveTeacherAssign = async (payload) => {
    const { data } = await api.put(`/admin/teachers/${assignTeacher._id}/assignments`, { assignments:payload });
    setTeachers(p => p.map(t => t._id === data._id ? data : t));
    setAssignTeacher(null);
  };

  const deleteTeacher = async (id) => {
    if (!confirm('Delete this teacher?')) return;
    await api.delete(`/admin/teachers/${id}`);
    setTeachers(p => p.filter(t => t._id !== id));
    setStats(s => ({ ...s, teachers:Math.max(0,(s.teachers||1)-1) }));
  };

  const navItems = [
    { id:'overview', label:'Overview',  icon:'◎' },
    { id:'students', label:'Students',  icon:'◈' },
    { id:'teachers', label:'Teachers',  icon:'◉' },
  ];

  return (
    <>
      <div className="admin-layout">
        <div className="admin-nav">
          <div style={{ fontSize:11, fontWeight:600, letterSpacing:'0.07em', textTransform:'uppercase', color:'var(--text3)', padding:'4px 12px 10px' }}>Admin Panel</div>
          {navItems.map(item => (
            <div key={item.id} className={`admin-nav-item ${section===item.id?'active':''}`} onClick={() => setSection(item.id)}>
              <span style={{ fontSize:14 }}>{item.icon}</span> {item.label}
              {item.id==='teachers' && (stats.pending||0)>0 && (
                <span style={{ marginLeft:'auto', fontSize:10, padding:'2px 6px', borderRadius:10, background:'var(--amber-bg)', color:'var(--amber)', fontWeight:600 }}>{stats.pending}</span>
              )}
            </div>
          ))}
        </div>

        <div className="admin-content">
          {/* ── Overview ── */}
          {section === 'overview' && (
            <>
              <div className="admin-section-title">Overview</div>
              <StatCards stats={stats}/>
              <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:14, padding:20 }}>
                <div style={{ fontSize:13, fontWeight:600, marginBottom:10 }}>Platform info</div>
                <div style={{ fontSize:13, color:'var(--text2)', lineHeight:2 }}>
                  <div>Institution: <span style={{ color:'var(--text)' }}>Chitkara University</span></div>
                  <div>Anonymity: <span style={{ color:'var(--green)' }}>Active</span> — real names hidden from all non-admin views</div>
                  <div>Teacher registration: <span style={{ color:'var(--amber)' }}>Requires admin approval</span></div>
                  <div>Teacher IDs: <span style={{ color:'var(--text)' }}>Auto-assigned (TCH + year + sequence)</span></div>
                  <div>Admin ID: <span style={{ fontFamily:'var(--mono)', fontSize:12 }}>ADMIN001</span></div>
                </div>
              </div>
            </>
          )}

          {/* ── Students — class-wise ── */}
          {section === 'students' && (
            <>
              <div className="admin-section-title">
                Students by Class
                <span style={{ fontSize:13, fontWeight:400, color:'var(--text3)', marginLeft:8 }}>
                  Click a class to expand student list
                </span>
              </div>
              {classes.length === 0 ? (
                <div style={{ display:'flex', justifyContent:'center', padding:60 }}><div className="spinner"/></div>
              ) : (
                <StudentsClassView classes={classes}/>
              )}
            </>
          )}

          {/* ── Teachers ── */}
          {section === 'teachers' && (
            <>
              {/* Pending approvals */}
              {pending.length > 0 && (
                <div style={{ background:'var(--amber-bg)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:14, padding:16, marginBottom:20 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:'var(--amber)', marginBottom:12 }}>⚠ Pending Approvals ({pending.length})</div>
                  {pending.map(t => (
                    <div key={t._id} style={{ background:'var(--bg2)', borderRadius:10, padding:14, marginBottom:8, display:'flex', alignItems:'center', gap:12 }}>
                      <div style={{ width:40, height:40, borderRadius:10, background:'var(--purple-bg)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, fontWeight:700, color:'var(--purple)', flexShrink:0 }}>
                        {t.realName?.[0]?.toUpperCase()}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, fontWeight:500 }}>{t.realName}</div>
                        <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>{t.email}</div>
                        {t.skillTags?.length > 0 && (
                          <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginTop:4 }}>
                            {t.skillTags.map(s => (
                              <span key={s} style={{ fontSize:10, padding:'2px 7px', borderRadius:10, background:'var(--accent-bg)', color:'var(--accent)' }}>{s}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                        <button onClick={() => approveTeacher(t._id)} style={{ padding:'7px 14px', borderRadius:8, background:'var(--green-bg)', color:'var(--green)', border:'1px solid rgba(62,207,142,0.25)', fontSize:12, fontWeight:500, cursor:'pointer' }}>Approve</button>
                        <button onClick={() => rejectTeacher(t._id)} style={{ padding:'7px 14px', borderRadius:8, background:'var(--red-bg)', color:'var(--red)', border:'1px solid rgba(248,113,113,0.2)', fontSize:12, cursor:'pointer' }}>Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="admin-section-title">Active Teachers</div>
              {loading ? (
                <div style={{ display:'flex', justifyContent:'center', padding:60 }}><div className="spinner"/></div>
              ) : (
                <div style={{ overflowX:'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr><th>Teacher ID</th><th>Name</th><th>Skills</th><th>Assigned Classes</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {teachers.map(t => (
                        <tr key={t._id}>
                          <td style={{ fontFamily:'var(--mono)', fontSize:12 }}>{t.rollNo}</td>
                          <td>
                            <div style={{ fontWeight:500, color:'var(--text)' }}>{t.realName}</div>
                            <div style={{ fontSize:11, color:'var(--text3)' }}>{t.email}</div>
                          </td>
                          <td>
                            <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                              {(t.skillTags||[]).map(s => <span key={s} style={{ fontSize:10, padding:'2px 7px', borderRadius:10, background:'var(--accent-bg)', color:'var(--accent)' }}>{s}</span>)}
                              {!t.skillTags?.length && <span style={{ fontSize:11, color:'var(--text3)' }}>—</span>}
                            </div>
                          </td>
                          <td style={{ maxWidth:220 }}>
                            {(t.teacherAssignments||[]).map((a, i) => (
                              <div key={i} style={{ marginBottom:4 }}>
                                <span className="badge teacher" style={{ marginRight:4 }}>{a.classRef?.classId||'?'}</span>
                                {(a.subjectRefs||[]).map(s => <span key={s._id} style={{ fontSize:10, marginRight:3, color:'var(--text2)' }}>{s.code}</span>)}
                              </div>
                            ))}
                            {!t.teacherAssignments?.length && <span style={{ fontSize:11, color:'var(--text3)' }}>Not assigned</span>}
                          </td>
                          <td>
                            <div style={{ display:'flex', gap:6 }}>
                              <button className="btn-sm" onClick={() => setAssignTeacher(t)}>Assign</button>
                              <button className="btn-sm danger" onClick={() => deleteTeacher(t._id)}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {!teachers.length && (
                        <tr><td colSpan={5} style={{ padding:'24px 14px', textAlign:'center', color:'var(--text3)', fontSize:13 }}>No active teachers yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {assignTeacher && (
        <AssignModal teacher={assignTeacher} classes={classes} onSave={saveTeacherAssign} onClose={() => setAssignTeacher(null)}/>
      )}
    </>
  );
}