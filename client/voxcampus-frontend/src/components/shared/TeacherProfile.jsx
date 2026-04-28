// import { useState, useEffect } from 'react';
// import api from '../../utils/api';
// import { useAuth } from '../../context/AuthContext';

// export default function TeacherProfile() {
//   const { user, updateUser } = useAuth();

//   const [assignments,    setAssignments]    = useState([]);
//   const [skillInput,     setSkillInput]     = useState('');
//   const [skills,         setSkills]         = useState([]);
//   const [saving,         setSaving]         = useState(false);
//   const [savedMsg,       setSavedMsg]       = useState('');
//   const [expandedClass,  setExpandedClass]  = useState(null); // classId string
//   const [studentMap,     setStudentMap]     = useState({});   // { classId: [] }
//   const [loadingClass,   setLoadingClass]   = useState('');
//   const [fetchError,     setFetchError]     = useState('');

//   // ── On mount: fetch fresh profile from server ─────────────────────────
//   useEffect(() => {
//     api.get('/auth/me')
//       .then(({ data }) => {
//         const ta = data.user?.teacherAssignments || [];
//         setAssignments(ta);
//         setSkills(data.user?.skillTags || []);
//         // Sync back to AuthContext cache
//         updateUser({
//           teacherAssignments: ta,
//           skillTags: data.user?.skillTags || [],
//         });
//       })
//       .catch(() => {
//         // Fallback to whatever is in AuthContext
//         setAssignments(user?.teacherAssignments || []);
//         setSkills(user?.skillTags || []);
//         setFetchError('Could not refresh profile. Showing cached data.');
//       });
//   }, []);

//   // ── Skill tag helpers ─────────────────────────────────────────────────
//   const addSkill = () => {
//     const s = skillInput.trim();
//     if (!s || skills.includes(s)) return;
//     setSkills(prev => [...prev, s]);
//     setSkillInput('');
//   };

//   const removeSkill = (tag) => setSkills(prev => prev.filter(x => x !== tag));

//   const saveSkills = async () => {
//     setSaving(true);
//     setSavedMsg('');
//     try {
//       await api.patch('/auth/teacher/skills', { skillTags: skills });
//       updateUser({ skillTags: skills });
//       setSavedMsg('Saved!');
//       setTimeout(() => setSavedMsg(''), 2500);
//     } catch {
//       setSavedMsg('Error saving');
//     }
//     setSaving(false);
//   };

//   // ── Student list helpers ──────────────────────────────────────────────
//   /**
//    * Extract the classId string from an assignment's classRef.
//    * After populate, classRef is an object { classId, displayName, ... }.
//    * After JSON parse from localStorage, it may be the same object or a raw string.
//    */
//   const getClassId = (assign) => {
//     const ref = assign?.classRef;
//     if (!ref) return null;
//     if (typeof ref === 'object') return ref.classId || null;
//     return null; // raw ObjectId string — can't get classId from it, need fresh data
//   };

//   const getClassName = (assign) => {
//     const ref = assign?.classRef;
//     if (!ref) return 'Unknown class';
//     if (typeof ref === 'object') return ref.displayName || ref.classId || '—';
//     return String(ref);
//   };

//   const toggleClass = async (classId) => {
//     if (!classId) return;
//     if (expandedClass === classId) { setExpandedClass(null); return; }
//     setExpandedClass(classId);
//     if (studentMap[classId]) return; // already loaded

//     setLoadingClass(classId);
//     setFetchError('');
//     try {
//       const { data } = await api.get(`/auth/class/${classId}/students`);
//       setStudentMap(prev => ({ ...prev, [classId]: data }));
//     } catch (err) {
//       const msg = err.response?.data?.error || err.message || 'Unknown error';
//       setFetchError(`Failed to load students for ${classId}: ${msg}`);
//       setStudentMap(prev => ({ ...prev, [classId]: null })); // null = error state
//     }
//     setLoadingClass('');
//   };

//   const retryLoad = (classId) => {
//     setStudentMap(prev => { const n = { ...prev }; delete n[classId]; return n; });
//     setFetchError('');
//     toggleClass(classId);
//   };

//   const initials = (name) =>
//     name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??';

//   return (
//     <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
//       <div style={{ maxWidth: 740 }}>
//         <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>My Profile</div>

//         {fetchError && (
//           <div style={{
//             background: 'var(--red-bg)', border: '1px solid rgba(248,113,113,0.2)',
//             borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--red)',
//             marginBottom: 14,
//           }}>{fetchError}</div>
//         )}

//         {/* ── Identity ──────────────────────────────────────────────── */}
//         <div style={{
//           background: 'var(--bg2)', border: '1px solid var(--border)',
//           borderRadius: 14, padding: 20, marginBottom: 14,
//           display: 'flex', alignItems: 'center', gap: 16,
//         }}>
//           <div style={{
//             width: 52, height: 52, borderRadius: 14, flexShrink: 0,
//             background: 'var(--purple-bg)', border: '1px solid rgba(167,139,250,0.25)',
//             display: 'flex', alignItems: 'center', justifyContent: 'center',
//             fontSize: 18, fontWeight: 700, color: 'var(--purple)',
//           }}>{initials(user?.realName)}</div>
//           <div>
//             <div style={{ fontSize: 15, fontWeight: 600 }}>{user?.realName}</div>
//             <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{user?.email}</div>
//             <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
//               <span style={{
//                 fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
//                 textTransform: 'uppercase', letterSpacing: '0.06em',
//                 background: 'var(--purple-bg)', color: 'var(--purple)',
//               }}>Teacher</span>
//               <span style={{
//                 fontSize: 10, fontFamily: 'var(--mono)', padding: '2px 8px', borderRadius: 10,
//                 background: 'var(--bg3)', color: 'var(--text3)', border: '1px solid var(--border)',
//               }}>{user?.rollNo}</span>
//             </div>
//           </div>
//         </div>

//         {/* ── Skill tags ────────────────────────────────────────────── */}
//         <div style={{
//           background: 'var(--bg2)', border: '1px solid var(--border)',
//           borderRadius: 14, padding: 20, marginBottom: 14,
//         }}>
//           <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Skill Tags</div>
//           <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 12 }}>
//             Admin uses these to assign you to relevant subjects.
//           </div>

//           {/* Tag chips */}
//           <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12, minHeight: 28 }}>
//             {skills.length === 0 && (
//               <span style={{ fontSize: 12, color: 'var(--text3)' }}>No skills added yet</span>
//             )}
//             {skills.map(tag => (
//               <span key={tag} style={{
//                 display: 'inline-flex', alignItems: 'center', gap: 5,
//                 background: 'var(--accent-bg)', color: 'var(--accent)',
//                 border: '1px solid rgba(108,143,255,0.2)',
//                 fontSize: 12, fontWeight: 500, padding: '4px 10px', borderRadius: 20,
//               }}>
//                 {tag}
//                 <button
//                   onClick={() => removeSkill(tag)}
//                   style={{ color: 'var(--accent)', opacity: 0.6, fontSize: 13, lineHeight: 1, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
//                 >✕</button>
//               </span>
//             ))}
//           </div>

//           {/* Input row */}
//           <div style={{ display: 'flex', gap: 8 }}>
//             <input
//               style={{
//                 flex: 1, background: 'var(--bg3)', border: '1px solid var(--border2)',
//                 borderRadius: 8, padding: '8px 12px', color: 'var(--text)',
//                 fontSize: 13, outline: 'none', fontFamily: 'var(--font)',
//               }}
//               placeholder="Add skill and press Enter — e.g. Node.js, DSA, Linux"
//               value={skillInput}
//               onChange={e => setSkillInput(e.target.value)}
//               onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
//             />
//             <button onClick={addSkill} style={{
//               padding: '8px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 12,
//               background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--text2)',
//             }}>+ Add</button>
//             <button onClick={saveSkills} disabled={saving} style={{
//               padding: '8px 16px', borderRadius: 8, border: 'none',
//               fontSize: 12, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer',
//               background: savedMsg === 'Saved!' ? 'var(--green-bg)' : saving ? 'var(--bg4)' : 'var(--accent)',
//               color:      savedMsg === 'Saved!' ? 'var(--green)' : saving ? 'var(--text3)' : '#fff',
//               transition: 'all 200ms',
//             }}>
//               {saving ? '...' : savedMsg || 'Save'}
//             </button>
//           </div>
//         </div>

//         {/* ── Assigned classes + student lists ──────────────────────── */}
//         <div style={{
//           background: 'var(--bg2)', border: '1px solid var(--border)',
//           borderRadius: 14, padding: 20,
//         }}>
//           <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
//             My Classes &amp; Students
//           </div>
//           <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 14 }}>
//             Click a class row to expand the student list with real names.
//           </div>

//           {assignments.length === 0 && (
//             <div style={{ fontSize: 13, color: 'var(--text3)', padding: '8px 0' }}>
//               No classes assigned yet. Ask admin to assign you to a class.
//             </div>
//           )}

//           {assignments.map((assign, i) => {
//             const classId   = getClassId(assign);
//             const className = getClassName(assign);
//             const subjects  = assign.subjectRefs || [];
//             const isOpen    = expandedClass === classId;
//             const rows      = studentMap[classId];     // undefined | null | array
//             const isLoading = loadingClass === classId;

//             return (
//               <div key={i} style={{
//                 border: '1px solid var(--border)',
//                 borderRadius: 10, marginBottom: 10, overflow: 'hidden',
//               }}>
//                 {/* Accordion header */}
//                 <div
//                   onClick={() => classId && toggleClass(classId)}
//                   style={{
//                     display: 'flex', alignItems: 'center', gap: 10,
//                     padding: '12px 16px',
//                     background: isOpen ? 'var(--accent-bg)' : 'var(--bg3)',
//                     cursor: classId ? 'pointer' : 'default',
//                     transition: 'background 150ms',
//                     userSelect: 'none',
//                   }}
//                 >
//                   {/* Class badge */}
//                   <span style={{
//                     fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
//                     background: isOpen ? 'var(--accent)' : 'var(--bg4)',
//                     color:      isOpen ? '#fff' : 'var(--text2)',
//                     flexShrink: 0, transition: 'all 150ms',
//                   }}>{className}</span>

//                   {/* Subject chips */}
//                   <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', flex: 1 }}>
//                     {subjects.length === 0 && (
//                       <span style={{ fontSize: 11, color: 'var(--text3)' }}>No subjects assigned</span>
//                     )}
//                     {subjects.map(s => (
//                       <span key={s._id || String(s)} style={{
//                         fontSize: 11, padding: '2px 7px', borderRadius: 6,
//                         background: 'var(--bg2)', color: 'var(--text2)',
//                         border: '1px solid var(--border)',
//                       }}>
//                         {s.code ? `${s.code} · ${s.name}` : String(s)}
//                       </span>
//                     ))}
//                   </div>

//                   {/* Expand indicator */}
//                   <span style={{ fontSize: 12, color: 'var(--text3)', flexShrink: 0 }}>
//                     {isLoading ? '⟳' : isOpen ? '▲' : '▼'}
//                   </span>
//                 </div>

//                 {/* Accordion body */}
//                 {isOpen && (
//                   <div>
//                     {isLoading && (
//                       <div style={{ padding: 20, display: 'flex', justifyContent: 'center' }}>
//                         <div className="spinner" />
//                       </div>
//                     )}

//                     {!isLoading && rows === null && (
//                       <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
//                         <span style={{ fontSize: 12, color: 'var(--red)' }}>Failed to load students.</span>
//                         <button
//                           onClick={() => retryLoad(classId)}
//                           style={{
//                             fontSize: 11, color: 'var(--accent)', background: 'none',
//                             border: '1px solid rgba(108,143,255,0.3)', borderRadius: 6,
//                             padding: '3px 10px', cursor: 'pointer',
//                           }}
//                         >Retry</button>
//                       </div>
//                     )}

//                     {!isLoading && Array.isArray(rows) && rows.length === 0 && (
//                       <div style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text3)' }}>
//                         No students enrolled in this class yet.
//                       </div>
//                     )}

//                     {!isLoading && Array.isArray(rows) && rows.length > 0 && (
//                       <div style={{ overflowX: 'auto' }}>
//                         <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
//                           <thead>
//                             <tr>
//                               {['#', 'Roll No', 'Name', 'Email', 'Alias'].map(h => (
//                                 <th key={h} style={{
//                                   textAlign: 'left', padding: '8px 14px',
//                                   fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em',
//                                   color: 'var(--text3)', borderBottom: '1px solid var(--border)',
//                                   background: 'var(--bg3)', fontWeight: 600,
//                                 }}>{h}</th>
//                               ))}
//                             </tr>
//                           </thead>
//                           <tbody>
//                             {rows.map((s, idx) => (
//                               <tr
//                                 key={s._id}
//                                 style={{ transition: 'background 100ms' }}
//                                 onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg3)')}
//                                 onMouseLeave={e => (e.currentTarget.style.background = '')}
//                               >
//                                 <td style={{ padding: '8px 14px', color: 'var(--text3)',   borderBottom: '1px solid var(--border)' }}>{idx + 1}</td>
//                                 <td style={{ padding: '8px 14px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text)', borderBottom: '1px solid var(--border)' }}>{s.rollNo}</td>
//                                 <td style={{ padding: '8px 14px', fontWeight: 500, color: 'var(--text)', borderBottom: '1px solid var(--border)' }}>{s.realName}</td>
//                                 <td style={{ padding: '8px 14px', color: 'var(--text2)',   borderBottom: '1px solid var(--border)', fontSize: 11 }}>{s.email}</td>
//                                 <td style={{ padding: '8px 14px', color: 'var(--text3)',   borderBottom: '1px solid var(--border)', fontFamily: 'var(--mono)', fontSize: 11 }}>{s.anonAlias}</td>
//                               </tr>
//                             ))}
//                           </tbody>
//                         </table>
//                         <div style={{ padding: '8px 14px', fontSize: 11, color: 'var(--text3)' }}>
//                           {rows.length} student{rows.length !== 1 ? 's' : ''} enrolled
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// }




// import { useState, useEffect } from 'react';
// import api from '../../utils/api';
// import { useAuth } from '../../context/AuthContext';

// export default function TeacherProfile() {
//   const { user, updateUser } = useAuth();

//   const [assignments,    setAssignments]    = useState([]);
//   const [skillInput,     setSkillInput]     = useState('');
//   const [skills,         setSkills]         = useState([]);
//   const [saving,         setSaving]         = useState(false);
//   const [savedMsg,       setSavedMsg]       = useState('');
//   const [expandedClass,  setExpandedClass]  = useState(null); // classId string
//   const [studentMap,     setStudentMap]     = useState({});   // { classId: [] }
//   const [loadingClass,   setLoadingClass]   = useState('');
//   const [fetchError,     setFetchError]     = useState('');

//   // ── On mount: fetch fresh profile from server ─────────────────────────
//   useEffect(() => {
//     api.get('/auth/me')
//       .then(({ data }) => {
//         const ta = data.user?.teacherAssignments || [];
//         setAssignments(ta);
//         setSkills(data.user?.skillTags || []);
//         // Sync back to AuthContext cache
//         updateUser({
//           teacherAssignments: ta,
//           skillTags: data.user?.skillTags || [],
//         });
//       })
//       .catch(() => {
//         // Fallback to whatever is in AuthContext
//         setAssignments(user?.teacherAssignments || []);
//         setSkills(user?.skillTags || []);
//         setFetchError('Could not refresh profile. Showing cached data.');
//       });
//   }, []);

//   // ── Skill tag helpers ─────────────────────────────────────────────────
//   const addSkill = () => {
//     const s = skillInput.trim();
//     if (!s || skills.includes(s)) return;
//     setSkills(prev => [...prev, s]);
//     setSkillInput('');
//   };

//   const removeSkill = (tag) => setSkills(prev => prev.filter(x => x !== tag));

//   const saveSkills = async () => {
//     setSaving(true);
//     setSavedMsg('');
//     try {
//       await api.patch('/auth/teacher/skills', { skillTags: skills });
//       updateUser({ skillTags: skills });
//       setSavedMsg('Saved!');
//       setTimeout(() => setSavedMsg(''), 2500);
//     } catch {
//       setSavedMsg('Error saving');
//     }
//     setSaving(false);
//   };

//   // ── Student list helpers ──────────────────────────────────────────────
//   /**
//    * Extract the classId string from an assignment's classRef.
//    * After populate, classRef is an object { classId, displayName, ... }.
//    * After JSON parse from localStorage, it may be the same object or a raw string.
//    */
//   const getClassId = (assign) => {
//     const ref = assign?.classRef;
//     if (!ref) return null;
//     if (typeof ref === 'object') return ref.classId || null;
//     return null; // raw ObjectId string — can't get classId from it, need fresh data
//   };

//   const getClassName = (assign) => {
//     const ref = assign?.classRef;
//     if (!ref) return 'Unknown class';
//     if (typeof ref === 'object') return ref.displayName || ref.classId || '—';
//     return String(ref);
//   };

//   const toggleClass = async (classId) => {
//     if (!classId) return;
//     if (expandedClass === classId) { setExpandedClass(null); return; }
//     setExpandedClass(classId);
//     if (studentMap[classId]) return; // already loaded

//     setLoadingClass(classId);
//     setFetchError('');
//     try {
//       const { data } = await api.get(`/auth/class/${classId}/students`);
//       setStudentMap(prev => ({ ...prev, [classId]: data }));
//     } catch (err) {
//       const msg = err.response?.data?.error || err.message || 'Unknown error';
//       setFetchError(`Failed to load students for ${classId}: ${msg}`);
//       setStudentMap(prev => ({ ...prev, [classId]: null })); // null = error state
//     }
//     setLoadingClass('');
//   };

//   const retryLoad = (classId) => {
//     setStudentMap(prev => { const n = { ...prev }; delete n[classId]; return n; });
//     setFetchError('');
//     toggleClass(classId);
//   };

//   const initials = (name) =>
//     name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??';

//   return (
//     <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
//       <div style={{ maxWidth: 740 }}>
//         <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>My Profile</div>

//         {fetchError && (
//           <div style={{
//             background: 'var(--red-bg)', border: '1px solid rgba(248,113,113,0.2)',
//             borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--red)',
//             marginBottom: 14,
//           }}>{fetchError}</div>
//         )}

//         {/* ── Identity ──────────────────────────────────────────────── */}
//         <div style={{
//           background: 'var(--bg2)', border: '1px solid var(--border)',
//           borderRadius: 14, padding: 20, marginBottom: 14,
//           display: 'flex', alignItems: 'center', gap: 16,
//         }}>
//           <div style={{
//             width: 52, height: 52, borderRadius: 14, flexShrink: 0,
//             background: 'var(--purple-bg)', border: '1px solid rgba(167,139,250,0.25)',
//             display: 'flex', alignItems: 'center', justifyContent: 'center',
//             fontSize: 18, fontWeight: 700, color: 'var(--purple)',
//           }}>{initials(user?.realName)}</div>
//           <div>
//             <div style={{ fontSize: 15, fontWeight: 600 }}>{user?.realName}</div>
//             <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{user?.email}</div>
//             <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
//               <span style={{
//                 fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
//                 textTransform: 'uppercase', letterSpacing: '0.06em',
//                 background: 'var(--purple-bg)', color: 'var(--purple)',
//               }}>Teacher</span>
//               <span style={{
//                 fontSize: 10, fontFamily: 'var(--mono)', padding: '2px 8px', borderRadius: 10,
//                 background: 'var(--bg3)', color: 'var(--text3)', border: '1px solid var(--border)',
//               }}>{user?.rollNo}</span>
//             </div>
//           </div>
//         </div>

//         {/* ── Skill tags ────────────────────────────────────────────── */}
//         <div style={{
//           background: 'var(--bg2)', border: '1px solid var(--border)',
//           borderRadius: 14, padding: 20, marginBottom: 14,
//         }}>
//           <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Skill Tags</div>
//           <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 12 }}>
//             Admin uses these to assign you to relevant subjects.
//           </div>

//           {/* Tag chips */}
//           <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12, minHeight: 28 }}>
//             {skills.length === 0 && (
//               <span style={{ fontSize: 12, color: 'var(--text3)' }}>No skills added yet</span>
//             )}
//             {skills.map(tag => (
//               <span key={tag} style={{
//                 display: 'inline-flex', alignItems: 'center', gap: 5,
//                 background: 'var(--accent-bg)', color: 'var(--accent)',
//                 border: '1px solid rgba(108,143,255,0.2)',
//                 fontSize: 12, fontWeight: 500, padding: '4px 10px', borderRadius: 20,
//               }}>
//                 {tag}
//                 <button
//                   onClick={() => removeSkill(tag)}
//                   style={{ color: 'var(--accent)', opacity: 0.6, fontSize: 13, lineHeight: 1, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
//                 >✕</button>
//               </span>
//             ))}
//           </div>

//           {/* Input row */}
//           <div style={{ display: 'flex', gap: 8 }}>
//             <input
//               style={{
//                 flex: 1, background: 'var(--bg3)', border: '1px solid var(--border2)',
//                 borderRadius: 8, padding: '8px 12px', color: 'var(--text)',
//                 fontSize: 13, outline: 'none', fontFamily: 'var(--font)',
//               }}
//               placeholder="Add skill and press Enter — e.g. Node.js, DSA, Linux"
//               value={skillInput}
//               onChange={e => setSkillInput(e.target.value)}
//               onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
//             />
//             <button onClick={addSkill} style={{
//               padding: '8px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 12,
//               background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--text2)',
//             }}>+ Add</button>
//             <button onClick={saveSkills} disabled={saving} style={{
//               padding: '8px 16px', borderRadius: 8, border: 'none',
//               fontSize: 12, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer',
//               background: savedMsg === 'Saved!' ? 'var(--green-bg)' : saving ? 'var(--bg4)' : 'var(--accent)',
//               color:      savedMsg === 'Saved!' ? 'var(--green)' : saving ? 'var(--text3)' : '#fff',
//               transition: 'all 200ms',
//             }}>
//               {saving ? '...' : savedMsg || 'Save'}
//             </button>
//           </div>
//         </div>

//         {/* ── Assigned classes + student lists ──────────────────────── */}
//         <div style={{
//           background: 'var(--bg2)', border: '1px solid var(--border)',
//           borderRadius: 14, padding: 20,
//         }}>
//           <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
//             My Classes &amp; Students
//           </div>
//           <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 14 }}>
//             Click a class row to expand the student list with real names.
//           </div>

//           {assignments.length === 0 && (
//             <div style={{ fontSize: 13, color: 'var(--text3)', padding: '8px 0' }}>
//               No classes assigned yet. Ask admin to assign you to a class.
//             </div>
//           )}

//           {assignments.map((assign, i) => {
//             const classId   = getClassId(assign);
//             const className = getClassName(assign);
//             const subjects  = assign.subjectRefs || [];
//             const isOpen    = expandedClass === classId;
//             const rows      = studentMap[classId];     // undefined | null | array
//             const isLoading = loadingClass === classId;

//             return (
//               <div key={i} style={{
//                 border: '1px solid var(--border)',
//                 borderRadius: 10, marginBottom: 10, overflow: 'hidden',
//               }}>
//                 {/* Accordion header */}
//                 <div
//                   onClick={() => classId && toggleClass(classId)}
//                   style={{
//                     display: 'flex', alignItems: 'center', gap: 10,
//                     padding: '12px 16px',
//                     background: isOpen ? 'var(--accent-bg)' : 'var(--bg3)',
//                     cursor: classId ? 'pointer' : 'default',
//                     transition: 'background 150ms',
//                     userSelect: 'none',
//                   }}
//                 >
//                   {/* Class badge */}
//                   <span style={{
//                     fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
//                     background: isOpen ? 'var(--accent)' : 'var(--bg4)',
//                     color:      isOpen ? '#fff' : 'var(--text2)',
//                     flexShrink: 0, transition: 'all 150ms',
//                   }}>{className}</span>

//                   {/* Subject chips */}
//                   <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', flex: 1 }}>
//                     {subjects.length === 0 && (
//                       <span style={{ fontSize: 11, color: 'var(--text3)' }}>No subjects assigned</span>
//                     )}
//                     {subjects.map(s => (
//                       <span key={s._id || String(s)} style={{
//                         fontSize: 11, padding: '2px 7px', borderRadius: 6,
//                         background: 'var(--bg2)', color: 'var(--text2)',
//                         border: '1px solid var(--border)',
//                       }}>
//                         {s.code ? `${s.code} · ${s.name}` : String(s)}
//                       </span>
//                     ))}
//                   </div>

//                   {/* Expand indicator */}
//                   <span style={{ fontSize: 12, color: 'var(--text3)', flexShrink: 0 }}>
//                     {isLoading ? '⟳' : isOpen ? '▲' : '▼'}
//                   </span>
//                 </div>

//                 {/* Accordion body */}
//                 {isOpen && (
//                   <div>
//                     {isLoading && (
//                       <div style={{ padding: 20, display: 'flex', justifyContent: 'center' }}>
//                         <div className="spinner" />
//                       </div>
//                     )}

//                     {!isLoading && rows === null && (
//                       <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
//                         <span style={{ fontSize: 12, color: 'var(--red)' }}>Failed to load students.</span>
//                         <button
//                           onClick={() => retryLoad(classId)}
//                           style={{
//                             fontSize: 11, color: 'var(--accent)', background: 'none',
//                             border: '1px solid rgba(108,143,255,0.3)', borderRadius: 6,
//                             padding: '3px 10px', cursor: 'pointer',
//                           }}
//                         >Retry</button>
//                       </div>
//                     )}

//                     {!isLoading && Array.isArray(rows) && rows.length === 0 && (
//                       <div style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text3)' }}>
//                         No students enrolled in this class yet.
//                       </div>
//                     )}

//                     {!isLoading && Array.isArray(rows) && rows.length > 0 && (
//                       <div style={{ overflowX: 'auto' }}>
//                         <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
//                           <thead>
//                             <tr>
//                               {['#', 'Roll No', 'Name', 'Email', 'Alias'].map(h => (
//                                 <th key={h} style={{
//                                   textAlign: 'left', padding: '8px 14px',
//                                   fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em',
//                                   color: 'var(--text3)', borderBottom: '1px solid var(--border)',
//                                   background: 'var(--bg3)', fontWeight: 600,
//                                 }}>{h}</th>
//                               ))}
//                             </tr>
//                           </thead>
//                           <tbody>
//                             {rows.map((s, idx) => (
//                               <tr
//                                 key={s._id}
//                                 style={{ transition: 'background 100ms' }}
//                                 onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg3)')}
//                                 onMouseLeave={e => (e.currentTarget.style.background = '')}
//                               >
//                                 <td style={{ padding: '8px 14px', color: 'var(--text3)',   borderBottom: '1px solid var(--border)' }}>{idx + 1}</td>
//                                 <td style={{ padding: '8px 14px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text)', borderBottom: '1px solid var(--border)' }}>{s.rollNo}</td>
//                                 <td style={{ padding: '8px 14px', fontWeight: 500, color: 'var(--text)', borderBottom: '1px solid var(--border)' }}>{s.realName}</td>
//                                 <td style={{ padding: '8px 14px', color: 'var(--text2)',   borderBottom: '1px solid var(--border)', fontSize: 11 }}>{s.email}</td>
//                                 <td style={{ padding: '8px 14px', color: 'var(--text3)',   borderBottom: '1px solid var(--border)', fontFamily: 'var(--mono)', fontSize: 11 }}>{s.anonAlias}</td>
//                               </tr>
//                             ))}
//                           </tbody>
//                         </table>
//                         <div style={{ padding: '8px 14px', fontSize: 11, color: 'var(--text3)' }}>
//                           {rows.length} student{rows.length !== 1 ? 's' : ''} enrolled
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// }



import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

// ────────────────────────────────────────────────────────────────────
// Pure SVG / CSS chart helpers (no external libs)
// ────────────────────────────────────────────────────────────────────
const COLORS = ['#6c8fff','#3ecf8e','#f59e0b','#f87171','#a78bfa','#34d399','#fb923c','#60a5fa'];

function BarChart({ options, totalVotes }) {
  const max = Math.max(...options.map(o => o.voteCount), 1);
  return (
    <div style={{ marginTop: 10 }}>
      {options.map((opt, i) => (
        <div key={i} style={{ marginBottom: 8 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3, fontSize:11 }}>
            <span style={{ color:'var(--text2)', maxWidth:'65%', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{opt.text}</span>
            <span style={{ color:'var(--text3)', fontFamily:'var(--mono)' }}>{opt.voteCount} · {opt.percentage}%</span>
          </div>
          <div style={{ height:8, background:'var(--bg4)', borderRadius:4, overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${(opt.voteCount/max)*100}%`, background:COLORS[i%COLORS.length], borderRadius:4, transition:'width 0.6s ease', minWidth: opt.voteCount>0?4:0 }}/>
          </div>
        </div>
      ))}
      <div style={{ fontSize:11, color:'var(--text3)', marginTop:6 }}>{totalVotes} total vote{totalVotes!==1?'s':''}</div>
    </div>
  );
}

function DonutChart({ options, totalVotes, size=90 }) {
  const r = 32; const cx = size/2; const cy = size/2;
  const circ = 2*Math.PI*r;
  if (totalVotes === 0) return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg4)" strokeWidth={10}/>
      <text x={cx} y={cy+4} textAnchor="middle" fill="var(--text3)" fontSize={9} fontFamily="sans-serif">No votes</text>
    </svg>
  );
  let offset = 0;
  const segs = options.map((opt, i) => {
    const dash = (opt.voteCount / totalVotes) * circ;
    const s = { offset, dash, color: COLORS[i % COLORS.length] };
    offset += dash;
    return s;
  });
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform:'rotate(-90deg)' }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg4)" strokeWidth={10}/>
        {segs.map((seg, i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={seg.color} strokeWidth={10}
            strokeDasharray={`${seg.dash} ${circ - seg.dash}`}
            strokeDashoffset={-seg.offset}
            style={{ transition:'stroke-dasharray 0.5s ease' }}
          />
        ))}
      </svg>
      <div style={{ display:'flex', flexWrap:'wrap', gap:5, justifyContent:'center' }}>
        {options.map((opt, i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:3, fontSize:10, color:'var(--text3)' }}>
            <div style={{ width:7, height:7, borderRadius:2, background:COLORS[i%COLORS.length], flexShrink:0 }}/>
            {opt.text.slice(0,14)}{opt.text.length>14?'…':''}
          </div>
        ))}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// Screen Share — teacher broadcaster
// KEY FIX: channelId is now the real Channel._id passed from parent,
// not subjectRef._id. Teacher's channels are loaded from AuthContext.
// ────────────────────────────────────────────────────────────────────
function ScreenShare({ channelId, channelName, socket }) {
  const [sharing, setSharing] = useState(false);
  const [error,   setError]   = useState('');
  const [viewers, setViewers] = useState(0);
  const streamRef   = useRef(null);
  const peersRef    = useRef({});      // { viewerSocketId: RTCPeerConnection }
  const videoRef    = useRef(null);

  const ICE = { iceServers:[{ urls:'stun:stun.l.google.com:19302' },{ urls:'stun:stun1.l.google.com:19302' }] };

  const startSharing = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video:{ displaySurface: "monitor", cursor:'always' }, audio:false });
      // const ss = await navigator.mediaDevices.getDisplayMedia({video:true});
      // console.log("STREAM :",ss);
      // console.log("TRACk :",ss.getVideoTracks()[0]);
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play().catch(()=>{}); }

      // If user clicks browser native "Stop sharing"
      stream.getVideoTracks()[0].addEventListener('ended', stopSharing);

      setSharing(true);
      socket.emit('screenshare_start', { channelId });

      // Student joined — create peer connection and send offer
      socket.on('screenshare_request_offer', async ({ viewerSocketId }) => {
        if (!streamRef.current) return;
        const pc = new RTCPeerConnection(ICE);
        peersRef.current[viewerSocketId] = pc;
        streamRef.current.getTracks().forEach(t => pc.addTrack(t, streamRef.current));
        pc.onicecandidate = ({ candidate }) => {
          if (candidate) socket.emit('screenshare_ice', { targetSocketId: viewerSocketId, candidate });
        };
        pc.onconnectionstatechange = () => {
          if (pc.connectionState === 'connected') setViewers(v => v + 1);
          if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
            setViewers(v => Math.max(0, v - 1));
            delete peersRef.current[viewerSocketId];
          }
        };
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('screenshare_offer', { channelId, viewerSocketId, sdp: pc.localDescription });
      });

      // Student answered
      socket.on('screenshare_answer', async ({ viewerSocketId, sdp }) => {
        const pc = peersRef.current[viewerSocketId];
        if (pc && pc.signalingState !== 'stable') await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      });

      // ICE from student
      socket.on('screenshare_ice', async ({ senderSocketId, candidate }) => {
        const pc = peersRef.current[senderSocketId];
        if (pc) try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); } catch {}
      });

    } catch (err) {
      if (err.name !== 'NotAllowedError') setError('Could not start screen share: ' + err.message);
    }
  };

  const stopSharing = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    Object.values(peersRef.current).forEach(pc => pc.close());
    peersRef.current = {};
    if (videoRef.current) videoRef.current.srcObject = null;
    setSharing(false);
    setViewers(0);
    socket.emit('screenshare_end', { channelId });
    socket.off('screenshare_request_offer');
    socket.off('screenshare_answer');
    socket.off('screenshare_ice');
  }, [socket, channelId]);

  // Cleanup on unmount
  useEffect(() => () => { if (streamRef.current) stopSharing(); }, []);

  return (
    <div style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:12, padding:16, marginBottom:10 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom: sharing ? 12 : 0 }}>
        <div style={{ fontSize:16 }}>🖥</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13, fontWeight:500 }}>Screen Share</div>
          <div style={{ fontSize:11, color:'var(--text3)' }}>
            {sharing
              ? <>Broadcasting to <strong style={{color:'var(--accent)'}}>{channelName}</strong> — {viewers} viewer{viewers!==1?'s':''} watching</>
              : `Share your screen with students in ${channelName}`}
          </div>
        </div>
        {!sharing ? (
          <button onClick={startSharing} style={{ padding:'8px 16px', borderRadius:8, border:'none', cursor:'pointer', background:'var(--accent)', color:'#fff', fontSize:12, fontWeight:600, display:'flex', alignItems:'center', gap:6 }}>
            ▶ Start Sharing
          </button>
        ) : (
          <button onClick={stopSharing} style={{ padding:'8px 16px', borderRadius:8, border:'1px solid rgba(248,113,113,0.3)', cursor:'pointer', background:'var(--red-bg)', color:'var(--red)', fontSize:12, fontWeight:600, display:'flex', alignItems:'center', gap:6 }}>
            ■ Stop Sharing
          </button>
        )}
      </div>
      {error && <div style={{ fontSize:12, color:'var(--red)', marginTop:8 }}>{error}</div>}
      {sharing && (
        <div style={{ position:'relative', borderRadius:8, overflow:'hidden', background:'#000', marginTop:4 }}>
          <video ref={videoRef} muted style={{ width:'100%', display:'block', maxHeight:200, objectFit:'contain' }}/>
          <div style={{ position:'absolute', top:8, left:8, background:'rgba(248,113,113,0.9)', color:'#fff', fontSize:11, fontWeight:600, padding:'3px 8px', borderRadius:6, display:'flex', alignItems:'center', gap:4 }}>
            <span style={{ width:6, height:6, borderRadius:3, background:'#fff', display:'inline-block', animation:'vox-pulse 1.5s infinite' }}/>
            LIVE
          </div>
        </div>
      )}
      <style>{`@keyframes vox-pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// ScreenShareViewer — student side (exported, used in ChatView)
// Uses the real channel._id from ChatView props — this was correct.
// ────────────────────────────────────────────────────────────────────
export function ScreenShareViewer({ channelId, socket }) {
  const [active,      setActive]      = useState(false);
  const [teacherName, setTeacherName] = useState('');
  const [watching,    setWatching]    = useState(false);
  const [error,       setError]       = useState('');
  const videoRef = useRef(null);
  const pcRef    = useRef(null);

  const ICE = { iceServers:[{ urls:'stun:stun.l.google.com:19302' },{ urls:'stun:stun1.l.google.com:19302' }] };

  useEffect(() => {
    if (!socket) return;

    const onActive = ({ channelId: cid, teacherName: tn }) => {
      if (String(cid) !== String(channelId)) return;
      setActive(true); setTeacherName(tn);
    };

    const onEnded = ({ channelId: cid }) => {
      if (String(cid) !== String(channelId)) return;
      setActive(false); setWatching(false); setTeacherName('');
      if (videoRef.current) videoRef.current.srcObject = null;
      pcRef.current?.close(); pcRef.current = null;
    };

    const onOffer = async ({ sdp, teacherSocketId }) => {
      // Create peer connection to receive the stream
      const pc = new RTCPeerConnection(ICE);
      pcRef.current = pc;

      pc.ontrack = ({ streams }) => {
        if (videoRef.current && streams[0]) {
          videoRef.current.srcObject = streams[0];
          videoRef.current.play().catch(() => {});
        }
      };
      pc.onicecandidate = ({ candidate }) => {
        if (candidate) socket.emit('screenshare_ice', { targetSocketId: teacherSocketId, candidate });
      };
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'failed') setError('Connection failed. Try refreshing.');
      };

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('screenshare_answer', { channelId, teacherSocketId, sdp: pc.localDescription });
        setWatching(true);
      } catch (err) {
        setError('Failed to connect: ' + err.message);
      }
    };

    const onIce = async ({ senderSocketId, candidate }) => {
      if (pcRef.current) try { await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate)); } catch {}
    };

    socket.on('screenshare_active', onActive);
    socket.on('screenshare_ended', onEnded);
    socket.on('screenshare_offer', onOffer);
    socket.on('screenshare_ice', onIce);

    return () => {
      socket.off('screenshare_active', onActive);
      socket.off('screenshare_ended', onEnded);
      socket.off('screenshare_offer', onOffer);
      socket.off('screenshare_ice', onIce);
    };
  }, [socket, channelId]);

  const joinShare = () => socket.emit('screenshare_join', { channelId });

  if (!active) return null;

  return (
    <div style={{ background:'var(--amber-bg)', border:'1px solid rgba(245,158,11,0.25)', borderRadius:12, padding:14, marginBottom:10 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <span style={{ fontSize:18 }}>🖥</span>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13, fontWeight:500 }}>{teacherName} is sharing their screen</div>
          <div style={{ fontSize:11, color:'var(--text3)' }}>{watching ? 'Connected — viewing live' : 'Click Watch to join'}</div>
        </div>
        {!watching && (
          <button onClick={joinShare} style={{ padding:'7px 14px', borderRadius:8, background:'var(--amber)', color:'#000', border:'none', fontSize:12, fontWeight:600, cursor:'pointer' }}>Watch</button>
        )}
      </div>
      {watching && (
        <div style={{ marginTop:10, borderRadius:8, overflow:'hidden', background:'#000' }}>
          <video ref={videoRef}  style={{ width:'100%', display:'block', maxHeight:400, objectFit:'contain' }} controls={false}/>
        </div>
      )}
      {error && <div style={{ fontSize:12, color:'var(--red)', marginTop:6 }}>{error}</div>}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// Poll analytics card
// ────────────────────────────────────────────────────────────────────
function PollAnalyticsCard({ poll }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:12, marginBottom:10, overflow:'hidden' }}>
      <div onClick={() => setExpanded(v => !v)}
        style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', cursor:'pointer', userSelect:'none' }}>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13, fontWeight:500, color:'var(--text)' }}>{poll.question}</div>
          <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>
            {poll.totalVotes} vote{poll.totalVotes!==1?'s':''} · {poll.isClosed ? 'Closed' : 'Active'}
          </div>
        </div>
        <div style={{ opacity:0.9 }}>
          <DonutChart options={poll.options} totalVotes={poll.totalVotes} size={44}/>
        </div>
        <span style={{ fontSize:11, color:'var(--text3)' }}>{expanded ? '▲' : '▼'}</span>
      </div>
      {expanded && (
        <div style={{ padding:'0 16px 16px', borderTop:'1px solid var(--border)' }}>
          <div style={{ display:'flex', gap:20, alignItems:'flex-start', flexWrap:'wrap', paddingTop:14 }}>
            <div style={{ flex:1, minWidth:180 }}>
              <div style={{ fontSize:10, fontWeight:600, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Response Breakdown</div>
              <BarChart options={poll.options} totalVotes={poll.totalVotes}/>
            </div>
            <div>
              <div style={{ fontSize:10, fontWeight:600, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8, textAlign:'center' }}>Distribution</div>
              <DonutChart options={poll.options} totalVotes={poll.totalVotes} size={100}/>
            </div>
          </div>
          <div style={{ marginTop:10, display:'flex', gap:8, flexWrap:'wrap' }}>
            <div style={{ background:'var(--bg2)', borderRadius:8, padding:'7px 12px', fontSize:12 }}>
              <span style={{ color:'var(--text3)' }}>Total: </span>
              <span style={{ color:'var(--text)', fontWeight:600, fontFamily:'var(--mono)' }}>{poll.totalVotes}</span>
            </div>
            {poll.options.map((opt, i) => (
              <div key={i} style={{ background:'var(--bg2)', borderRadius:8, padding:'7px 12px', fontSize:12, display:'flex', alignItems:'center', gap:6 }}>
                <div style={{ width:8, height:8, borderRadius:2, background:COLORS[i%COLORS.length], flexShrink:0 }}/>
                <span style={{ color:'var(--text2)' }}>{opt.text.slice(0,16)}{opt.text.length>16?'…':''}: </span>
                <span style={{ color:COLORS[i%COLORS.length], fontWeight:600, fontFamily:'var(--mono)' }}>{opt.voteCount}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// Main TeacherProfile
// ────────────────────────────────────────────────────────────────────
export default function TeacherProfile() {
  const { user, channels, updateUser }  = useAuth(); // KEY: channels has real _id
  const { socket }                      = useSocket();
  const [assignments, setAssignments]   = useState([]);
  const [skills, setSkills]             = useState([]);
  const [skillInput, setSkillInput]     = useState('');
  const [saving, setSaving]             = useState(false);
  const [savedMsg, setSavedMsg]         = useState('');
  const [expandedClass, setExpandedClass] = useState(null);
  const [studentMap, setStudentMap]     = useState({});
  const [loadingClass, setLoadingClass] = useState('');
  const [fetchError, setFetchError]     = useState('');
  const [tab, setTab]                   = useState('overview');
  const [pollStats, setPollStats]       = useState({});   // { channelId: Poll[] }
  const [loadingPolls, setLoadingPolls] = useState('');

  useEffect(() => {
    api.get('/auth/me')
      .then(({ data }) => {
        const ta = data.user?.teacherAssignments || [];
        setAssignments(ta);
        setSkills(data.user?.skillTags || []);
        updateUser({ teacherAssignments: ta, skillTags: data.user?.skillTags || [] });
      })
      .catch(() => {
        setAssignments(user?.teacherAssignments || []);
        setSkills(user?.skillTags || []);
        setFetchError('Could not refresh. Showing cached data.');
      });
  }, []);

  // Build a map: subjectRef._id (string) → Channel._id (string)
  // from the channels array in AuthContext (populated on login)
  const subjectToChannel = {};
  channels.forEach(ch => {
    if (ch.type === 'subject' && ch.subjectRef) {
      const sid = String(ch.subjectRef._id || ch.subjectRef);
      subjectToChannel[sid] = { channelId: String(ch._id), channelName: ch.name };
    }
  });

  // Skill helpers
  const addSkill = () => {
    const s = skillInput.trim();
    if (!s || skills.includes(s)) return;
    setSkills(p => [...p, s]); setSkillInput('');
  };
  const removeSkill = tag => setSkills(p => p.filter(x => x !== tag));
  const saveSkills = async () => {
    setSaving(true);
    try {
      await api.patch('/auth/teacher/skills', { skillTags: skills });
      updateUser({ skillTags: skills });
      setSavedMsg('Saved!'); setTimeout(() => setSavedMsg(''), 2500);
    } catch { setSavedMsg('Error'); }
    setSaving(false);
  };

  const getClassId   = a => a?.classRef?.classId   || null;
  const getClassName = a => a?.classRef?.displayName || a?.classRef?.classId || '—';

  const toggleClass = async classId => {
    if (!classId) return;
    if (expandedClass === classId) { setExpandedClass(null); return; }
    setExpandedClass(classId);
    if (studentMap[classId] !== undefined) return;
    setLoadingClass(classId); setFetchError('');
    try {
      const { data } = await api.get(`/auth/class/${classId}/students`);
      setStudentMap(p => ({ ...p, [classId]: data }));
    } catch (err) {
      setFetchError(`Failed to load: ${err.response?.data?.error || err.message}`);
      setStudentMap(p => ({ ...p, [classId]: null }));
    }
    setLoadingClass('');
  };

  // Load poll stats for a specific channel
  const loadPollStats = async channelId => {
    if (!channelId || pollStats[channelId]) return;
    setLoadingPolls(channelId);
    try {
      const { data } = await api.get(`/polls/${channelId}/stats`);
      setPollStats(p => ({ ...p, [channelId]: data }));
    } catch { setPollStats(p => ({ ...p, [channelId]: [] })); }
    setLoadingPolls('');
  };

  const loadAllPollStats = () => {
    Object.values(subjectToChannel).forEach(({ channelId }) => loadPollStats(channelId));
  };

  const initials = n => n?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '??';

  const TABS = [
    { id:'overview',    label:'Overview'        },
    { id:'students',    label:'My Students'     },
    { id:'analytics',   label:'📊 Analytics'    },
    { id:'screenshare', label:'🖥 Screen Share'  },
  ];

  return (
    <div style={{ flex:1, overflowY:'auto', padding:24 }}>
      <div style={{ maxWidth:780 }}>

        {/* Identity */}
        <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:20 }}>
          <div style={{ width:56, height:56, borderRadius:14, flexShrink:0, background:'var(--purple-bg)', border:'1px solid rgba(167,139,250,0.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, fontWeight:700, color:'var(--purple)' }}>
            {initials(user?.realName)}
          </div>
          <div>
            <div style={{ fontSize:17, fontWeight:700 }}>{user?.realName}</div>
            <div style={{ fontSize:12, color:'var(--text3)', marginTop:2 }}>{user?.email}</div>
            <div style={{ display:'flex', gap:6, marginTop:5 }}>
              <span style={{ fontSize:10, fontWeight:600, padding:'2px 8px', borderRadius:10, textTransform:'uppercase', letterSpacing:'0.06em', background:'var(--purple-bg)', color:'var(--purple)' }}>Teacher</span>
              <span style={{ fontSize:10, fontFamily:'var(--mono)', padding:'2px 8px', borderRadius:10, background:'var(--bg3)', color:'var(--text3)', border:'1px solid var(--border)' }}>{user?.rollNo}</span>
            </div>
          </div>
        </div>

        {fetchError && <div style={{ background:'var(--red-bg)', borderRadius:8, padding:'10px 14px', fontSize:12, color:'var(--red)', marginBottom:14 }}>{fetchError}</div>}

        {/* Tab bar */}
        <div style={{ display:'flex', gap:4, background:'var(--bg3)', borderRadius:12, padding:4, marginBottom:20 }}>
          {TABS.map(t => (
            <button key={t.id}
              onClick={() => { setTab(t.id); if (t.id === 'analytics') loadAllPollStats(); }}
              style={{ flex:1, padding:'8px 4px', borderRadius:9, fontSize:12, fontWeight:tab===t.id?600:400, background:tab===t.id?'var(--bg2)':'transparent', color:tab===t.id?'var(--text)':'var(--text3)', border:tab===t.id?'1px solid var(--border2)':'1px solid transparent', cursor:'pointer', transition:'all 150ms', whiteSpace:'nowrap' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ══ OVERVIEW ══ */}
        {tab === 'overview' && (
          <>
            <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:14, padding:20, marginBottom:14 }}>
              <div style={{ fontSize:13, fontWeight:600, marginBottom:4 }}>Skill Tags</div>
              <div style={{ fontSize:12, color:'var(--text3)', marginBottom:12 }}>Admin uses these to assign you to subjects.</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:12, minHeight:28 }}>
                {skills.length === 0 && <span style={{ fontSize:12, color:'var(--text3)' }}>No skills added yet</span>}
                {skills.map(tag => (
                  <span key={tag} style={{ display:'inline-flex', alignItems:'center', gap:5, background:'var(--accent-bg)', color:'var(--accent)', border:'1px solid rgba(108,143,255,0.2)', fontSize:12, fontWeight:500, padding:'4px 10px', borderRadius:20 }}>
                    {tag}
                    <button onClick={() => removeSkill(tag)} style={{ color:'var(--accent)', opacity:0.6, fontSize:13, lineHeight:1, background:'none', border:'none', cursor:'pointer', padding:0 }}>✕</button>
                  </span>
                ))}
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <input style={{ flex:1, background:'var(--bg3)', border:'1px solid var(--border2)', borderRadius:8, padding:'8px 12px', color:'var(--text)', fontSize:13, outline:'none', fontFamily:'var(--font)' }}
                  placeholder="Add skill and press Enter…" value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => { if (e.key==='Enter'){e.preventDefault();addSkill();} }}/>
                <button onClick={addSkill} style={{ padding:'8px 12px', borderRadius:8, cursor:'pointer', fontSize:12, background:'var(--bg3)', border:'1px solid var(--border2)', color:'var(--text2)' }}>+ Add</button>
                <button onClick={saveSkills} disabled={saving} style={{ padding:'8px 16px', borderRadius:8, border:'none', fontSize:12, fontWeight:600, cursor:saving?'not-allowed':'pointer', background:savedMsg==='Saved!'?'var(--green-bg)':saving?'var(--bg4)':'var(--accent)', color:savedMsg==='Saved!'?'var(--green)':saving?'var(--text3)':'#fff', transition:'all 200ms' }}>
                  {saving ? '…' : savedMsg || 'Save'}
                </button>
              </div>
            </div>

            <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:14, padding:20 }}>
              <div style={{ fontSize:13, fontWeight:600, marginBottom:12 }}>Assigned Classes</div>
              {assignments.length === 0 && <div style={{ fontSize:13, color:'var(--text3)' }}>No classes assigned yet. Contact admin.</div>}
              <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                {assignments.map((a, i) => (
                  <div key={i} style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:10, padding:'10px 14px' }}>
                    <div style={{ fontSize:12, fontWeight:600, color:'var(--accent)', marginBottom:6 }}>{getClassName(a)}</div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                      {(a.subjectRefs||[]).map(s=>(
                        <span key={s._id||s} style={{ fontSize:10, padding:'2px 7px', borderRadius:6, background:'var(--bg2)', color:'var(--text2)', border:'1px solid var(--border)' }}>{s.code||'—'} · {s.name||'—'}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ══ STUDENTS ══ */}
        {tab === 'students' && (
          <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:14, padding:20 }}>
            <div style={{ fontSize:13, fontWeight:600, marginBottom:14 }}>
              My Classes &amp; Students <span style={{ fontWeight:400, color:'var(--text3)', marginLeft:8, fontSize:12 }}>Click a class to expand</span>
            </div>
            {assignments.length === 0 && <div style={{ fontSize:13, color:'var(--text3)' }}>No classes assigned yet.</div>}
            {assignments.map((assign, i) => {
              const classId   = getClassId(assign);
              const className = getClassName(assign);
              const isOpen    = expandedClass === classId;
              const rows      = studentMap[classId];
              const isLoading = loadingClass === classId;
              return (
                <div key={i} style={{ border:'1px solid var(--border)', borderRadius:10, marginBottom:10, overflow:'hidden' }}>
                  <div onClick={() => classId && toggleClass(classId)}
                    style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', background:isOpen?'var(--accent-bg)':'var(--bg3)', cursor:classId?'pointer':'default', transition:'background 150ms', userSelect:'none' }}>
                    <span style={{ fontSize:12, fontWeight:600, padding:'3px 10px', borderRadius:20, background:isOpen?'var(--accent)':'var(--bg4)', color:isOpen?'#fff':'var(--text2)', flexShrink:0, transition:'all 150ms' }}>{className}</span>
                    <div style={{ display:'flex', gap:4, flexWrap:'wrap', flex:1 }}>
                      {(assign.subjectRefs||[]).map(s=>(
                        <span key={s._id||s} style={{ fontSize:11, padding:'2px 7px', borderRadius:6, background:'var(--bg2)', color:'var(--text2)', border:'1px solid var(--border)' }}>{s.code?`${s.code} · ${s.name}`:String(s)}</span>
                      ))}
                    </div>
                    <span style={{ fontSize:12, color:'var(--text3)', flexShrink:0 }}>{isLoading?'⟳':isOpen?'▲':'▼'}</span>
                  </div>
                  {isOpen && (
                    <div>
                      {isLoading && <div style={{ padding:20, display:'flex', justifyContent:'center' }}><div className="spinner"/></div>}
                      {!isLoading && rows === null && (
                        <div style={{ padding:'12px 16px', display:'flex', alignItems:'center', gap:10 }}>
                          <span style={{ fontSize:12, color:'var(--red)' }}>Failed to load.</span>
                          <button onClick={() => { setStudentMap(p => { const n={...p}; delete n[classId]; return n; }); toggleClass(classId); }}
                            style={{ fontSize:11, color:'var(--accent)', background:'none', border:'1px solid rgba(108,143,255,0.3)', borderRadius:6, padding:'3px 10px', cursor:'pointer' }}>Retry</button>
                        </div>
                      )}
                      {!isLoading && Array.isArray(rows) && rows.length === 0 && <div style={{ padding:'12px 16px', fontSize:12, color:'var(--text3)' }}>No students enrolled yet.</div>}
                      {!isLoading && Array.isArray(rows) && rows.length > 0 && (
                        <div style={{ overflowX:'auto' }}>
                          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                            <thead>
                              <tr>{['#','Roll No','Name','Email','Alias'].map(h=>(
                                <th key={h} style={{ textAlign:'left', padding:'8px 14px', fontSize:10, textTransform:'uppercase', letterSpacing:'0.05em', color:'var(--text3)', borderBottom:'1px solid var(--border)', background:'var(--bg3)', fontWeight:600 }}>{h}</th>
                              ))}</tr>
                            </thead>
                            <tbody>
                              {rows.map((s, idx) => (
                                <tr key={s._id} onMouseEnter={e=>(e.currentTarget.style.background='var(--bg3)')} onMouseLeave={e=>(e.currentTarget.style.background='')}>
                                  <td style={{ padding:'8px 14px', color:'var(--text3)', borderBottom:'1px solid var(--border)' }}>{idx+1}</td>
                                  <td style={{ padding:'8px 14px', fontFamily:'var(--mono)', fontSize:11, color:'var(--text)', borderBottom:'1px solid var(--border)' }}>{s.rollNo}</td>
                                  <td style={{ padding:'8px 14px', fontWeight:500, color:'var(--text)', borderBottom:'1px solid var(--border)' }}>{s.realName}</td>
                                  <td style={{ padding:'8px 14px', color:'var(--text2)', borderBottom:'1px solid var(--border)', fontSize:11 }}>{s.email}</td>
                                  <td style={{ padding:'8px 14px', color:'var(--text3)', borderBottom:'1px solid var(--border)', fontFamily:'var(--mono)', fontSize:11 }}>{s.anonAlias}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          <div style={{ padding:'8px 14px', fontSize:11, color:'var(--text3)' }}>{rows.length} student{rows.length!==1?'s':''} enrolled</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ══ ANALYTICS ══ */}
        {tab === 'analytics' && (
          <div>
            {assignments.length === 0 && <div style={{ fontSize:13, color:'var(--text3)' }}>No classes assigned.</div>}
            {assignments.map((assign, i) => {
              const className = getClassName(assign);
              const subjects  = assign.subjectRefs || [];
              return (
                <div key={i} style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:14, padding:20, marginBottom:14 }}>
                  <div style={{ fontSize:14, fontWeight:600, color:'var(--accent)', marginBottom:14 }}>{className}</div>
                  {subjects.length === 0 && <div style={{ fontSize:12, color:'var(--text3)' }}>No subjects.</div>}
                  {subjects.map(subj => {
                    const sid  = String(subj._id || subj);
                    const chInfo = subjectToChannel[sid];
                    const stats  = chInfo ? pollStats[chInfo.channelId] : null;
                    const isLoadingPoll = chInfo && loadingPolls === chInfo.channelId;
                    return (
                      <div key={sid} style={{ marginBottom:16 }}>
                        <div style={{ fontSize:13, fontWeight:500, marginBottom:10, display:'flex', alignItems:'center', gap:8 }}>
                          <span style={{ fontSize:10, padding:'2px 7px', borderRadius:6, background:'var(--bg3)', color:'var(--text2)', border:'1px solid var(--border)' }}>{subj.code}</span>
                          {subj.name}
                          {chInfo && (
                            <button onClick={() => loadPollStats(chInfo.channelId)}
                              style={{ fontSize:10, color:'var(--accent)', background:'none', border:'1px solid rgba(108,143,255,0.3)', borderRadius:6, padding:'2px 8px', cursor:'pointer', marginLeft:'auto' }}>
                              {isLoadingPoll ? '⟳ Loading…' : '↻ Refresh'}
                            </button>
                          )}
                        </div>
                        {!chInfo && <div style={{ fontSize:12, color:'var(--text3)', padding:'8px 0' }}>Log out and back in to load channel data.</div>}
                        {chInfo && isLoadingPoll && <div style={{ display:'flex', justifyContent:'center', padding:16 }}><div className="spinner"/></div>}
                        {chInfo && !isLoadingPoll && stats && stats.length === 0 && <div style={{ fontSize:12, color:'var(--text3)' }}>No polls created in this channel yet.</div>}
                        {chInfo && !isLoadingPoll && stats && stats.length > 0 && (
                          <div>
                            {/* Summary stats row */}
                            <div style={{ display:'flex', gap:8, marginBottom:12, flexWrap:'wrap' }}>
                              <div style={{ background:'var(--bg3)', borderRadius:8, padding:'8px 14px', fontSize:12 }}>
                                <span style={{ color:'var(--text3)' }}>Total polls: </span>
                                <span style={{ color:'var(--accent)', fontWeight:600, fontFamily:'var(--mono)' }}>{stats.length}</span>
                              </div>
                              <div style={{ background:'var(--bg3)', borderRadius:8, padding:'8px 14px', fontSize:12 }}>
                                <span style={{ color:'var(--text3)' }}>Total responses: </span>
                                <span style={{ color:'var(--green)', fontWeight:600, fontFamily:'var(--mono)' }}>{stats.reduce((s,p)=>s+p.totalVotes,0)}</span>
                              </div>
                              <div style={{ background:'var(--bg3)', borderRadius:8, padding:'8px 14px', fontSize:12 }}>
                                <span style={{ color:'var(--text3)' }}>Active: </span>
                                <span style={{ color:'var(--amber)', fontWeight:600, fontFamily:'var(--mono)' }}>{stats.filter(p=>!p.isClosed).length}</span>
                              </div>
                            </div>
                            {stats.map(poll => <PollAnalyticsCard key={poll._id} poll={poll}/>)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}

        {/* ══ SCREEN SHARE ══ */}
        {tab === 'screenshare' && (
          <div>
            <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:14, padding:20, marginBottom:14 }}>
              <div style={{ fontSize:13, fontWeight:600, marginBottom:4 }}>Screen Share</div>
              <div style={{ fontSize:12, color:'var(--text3)', marginBottom:16, lineHeight:1.7 }}>
                Share your screen with students in a subject channel. Students see a banner and can click to watch via WebRTC peer-to-peer. No plugins needed.
              </div>

              {!socket && <div style={{ background:'var(--red-bg)', borderRadius:8, padding:'10px 14px', fontSize:12, color:'var(--red)', marginBottom:12 }}>Socket not connected. Please refresh the page.</div>}

              {assignments.length === 0 && <div style={{ fontSize:13, color:'var(--text3)' }}>No classes assigned yet.</div>}

              {assignments.map((assign, i) => {
                const className = getClassName(assign);
                const subjects  = assign.subjectRefs || [];
                return (
                  <div key={i} style={{ marginBottom:16 }}>
                    <div style={{ fontSize:11, fontWeight:600, color:'var(--text3)', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.06em' }}>{className}</div>
                    {subjects.map(subj => {
                      const sid    = String(subj._id || subj);
                      const chInfo = subjectToChannel[sid]; // { channelId, channelName }
                      if (!chInfo) return (
                        <div key={sid} style={{ fontSize:12, color:'var(--text3)', marginBottom:8, padding:'8px 12px', background:'var(--bg3)', borderRadius:8 }}>
                          {subj.code} · {subj.name} — <em>channel not loaded, refresh page</em>
                        </div>
                      );
                      return (
                        <div key={sid} style={{ marginBottom:10 }}>
                          <div style={{ fontSize:12, marginBottom:6, color:'var(--text2)' }}>
                            <strong>{subj.code}</strong> · {subj.name}
                          </div>
                          {socket ? (
                            <ScreenShare
                              channelId={chInfo.channelId}
                              channelName={`${subj.code} · ${subj.name}`}
                              socket={socket}
                            />
                          ) : (
                            <div style={{ fontSize:12, color:'var(--text3)' }}>Socket not connected.</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              <div style={{ background:'var(--bg3)', borderRadius:8, padding:'10px 14px', fontSize:12, color:'var(--text3)', lineHeight:1.7, marginTop:8 }}>
                💡 <strong style={{ color:'var(--text2)' }}>Tip:</strong> Use Chrome or Edge for best screen share support. Safari has limited WebRTC screen capture. Students must have the subject channel open to receive the broadcast.
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}