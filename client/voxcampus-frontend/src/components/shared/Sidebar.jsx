// import { useAuth } from '../../context/AuthContext';

// const TYPE_ICON = {
//   general:    '◎',
//   feedback:   '▲',
//   complaints: '⚑',
//   subject:    '◈',
//   dm:         '◉',
// };

// const TYPE_COLOR = {
//   general:    'var(--accent)',
//   feedback:   'var(--green)',
//   complaints: 'var(--red)',
//   subject:    'var(--text2)',
//   dm:         'var(--purple)',
// };

// // Stable string ID for any channel (real MongoDB _id or synthetic 'admin'/'profile')
// const chanId = (ch) => (ch?._id ? String(ch._id) : null);

// export default function Sidebar({ activeChannel, onSelect }) {
//   const { user, channels, subjectTeacherMap, logout } = useAuth();

//   const isTeacher = user?.role === 'teacher';
//   const isAdmin   = user?.role === 'admin';

//   // Teachers never see general / feedback / complaints
//   const globalChannels  = isTeacher
//     ? []
//     : channels.filter(c => c.isGlobal);

//   const subjectChannels = channels.filter(c => c.type === 'subject');

//   // Group subject channels by class displayName
//   const byClass = {};
//   subjectChannels.forEach(ch => {
//     const label = ch.classRef?.displayName || ch.classRef?.classId || 'My Class';
//     if (!byClass[label]) byClass[label] = [];
//     byClass[label].push(ch);
//   });

//   const isActive = (ch) => chanId(activeChannel) === chanId(ch);

//   const initials = (name) =>
//     name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??';

//   /**
//    * Look up the teacher name for a subject channel.
//    * subjectTeacherMap keys are subjectRef _id strings.
//    * ch.subjectRef._id comes from JSON (already a string after parse).
//    */
//   const getTeacherName = (ch) => {
//     const sid = ch.subjectRef?._id ? String(ch.subjectRef._id) : null;
//     if (!sid) return null;
//     return subjectTeacherMap[sid] || null;
//   };

//   return (
//     <div className="sidebar">
//       {/* ── Header ──────────────────────────────────────────────────── */}
//       <div className="sidebar-header">
//         <div className="sidebar-logo">
//           <span className="sidebar-logo-dot" />
//           VoxCampus
//         </div>
//         <div className="sidebar-user">
//           <div className="sidebar-avatar">
//             {isTeacher || isAdmin
//               ? initials(user?.realName)
//               : initials(user?.anonAlias)}
//           </div>
//           <div className="sidebar-user-info">
//             <div className="sidebar-user-alias truncate">
//               {isTeacher || isAdmin ? user?.realName : (user?.anonAlias || 'Anonymous')}
//             </div>
//             <div className="sidebar-user-role">{user?.role}</div>
//           </div>
//         </div>
//       </div>

//       {/* ── Channels ────────────────────────────────────────────────── */}
//       <div className="sidebar-scroll">

//         {/* Global: General / Feedback / Complaints (students + admin only) */}
//         {globalChannels.length > 0 && (
//           <>
//             <div className="sidebar-section-label">Campus</div>
//             {globalChannels.map(ch => (
//               <div
//                 key={ch._id}
//                 className={`channel-item ${isActive(ch) ? 'active' : ''}`}
//                 onClick={() => onSelect(ch)}
//               >
//                 <span className="channel-icon" style={{ color: TYPE_COLOR[ch.type] }}>
//                   {TYPE_ICON[ch.type]}
//                 </span>
//                 <span className="channel-name">{ch.name}</span>
//               </div>
//             ))}
//           </>
//         )}

//         {/* Subject channels, grouped by class */}
//         {Object.keys(byClass).map(classLabel => (
//           <div key={classLabel}>
//             <div className="sidebar-section-label">{classLabel}</div>
//             {byClass[classLabel].map(ch => {
//               const teacherName = getTeacherName(ch);
//               const label = ch.subjectRef
//                 ? `${ch.subjectRef.code} · ${ch.subjectRef.name}`
//                 : ch.name;

//               return (
//                 <div
//                   key={ch._id}
//                   className={`channel-item ${isActive(ch) ? 'active' : ''}`}
//                   onClick={() => onSelect(ch)}
//                   style={{
//                     flexDirection:  'column',
//                     alignItems:     'flex-start',
//                     gap:            0,
//                     padding:        '7px 10px',
//                   }}
//                 >
//                   {/* Subject name row */}
//                   <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
//                     <span className="channel-icon" style={{ color: TYPE_COLOR.subject }}>
//                       {TYPE_ICON.subject}
//                     </span>
//                     <span className="channel-name" title={label}>{label}</span>
//                   </div>

//                   {/* Teacher name — visible to students only */}
//                   {teacherName && !isTeacher && !isAdmin && (
//                     <div style={{
//                       fontSize:   11,
//                       color:      'var(--purple)',
//                       paddingLeft: 26,
//                       marginTop:  2,
//                       opacity:    0.85,
//                     }}>
//                       {teacherName}
//                     </div>
//                   )}
//                 </div>
//               );
//             })}
//           </div>
//         ))}

//         {/* Admin: panel link + all subject channels already shown above */}
//         {isAdmin && (
//           <>
//             <div className="sidebar-section-label">Admin</div>
//             <div
//               className={`channel-item ${chanId(activeChannel) === 'admin' ? 'active' : ''}`}
//               onClick={() => onSelect({ _id: 'admin', name: 'Admin Panel', type: 'admin' })}
//             >
//               <span className="channel-icon" style={{ color: 'var(--amber)' }}>◆</span>
//               <span className="channel-name">Admin Panel</span>
//             </div>
//           </>
//         )}

//         {/* Teacher: profile / skill management link */}
//         {isTeacher && (
//           <>
//             <div className="sidebar-section-label">Account</div>
//             <div
//               className={`channel-item ${chanId(activeChannel) === 'profile' ? 'active' : ''}`}
//               onClick={() => onSelect({ _id: 'profile', name: 'My Profile', type: 'profile' })}
//             >
//               <span className="channel-icon" style={{ color: 'var(--accent)' }}>◉</span>
//               <span className="channel-name">My Profile</span>
//             </div>
//           </>
//         )}
//       </div>

//       {/* ── Logout ──────────────────────────────────────────────────── */}
//       <div className="sidebar-logout">
//         <button className="btn-logout" onClick={logout}>
//           <span>↩</span> Sign out
//         </button>
//       </div>
//     </div>
//   );
// }
import { useAuth } from '../../context/AuthContext';

const TYPE_ICON = {
  general:    '◎',
  feedback:   '▲',
  complaints: '⚑',
  subject:    '◈',
  dm:         '◉',
};

const TYPE_COLOR = {
  general:    'var(--accent)',
  feedback:   'var(--green)',
  complaints: 'var(--red)',
  subject:    'var(--text2)',
  dm:         'var(--purple)',
};

const chanId = (ch) => (ch?._id ? String(ch._id) : null);

export default function Sidebar({ activeChannel, onSelect }) {
  const { user, channels, subjectTeacherMap, logout } = useAuth();

  const isTeacher = user?.role === 'teacher';
  const isAdmin   = user?.role === 'admin';
  const isStudent = user?.role === 'student';

  // Teachers never see general/feedback/complaints
  const globalChannels  = isTeacher ? [] : channels.filter(c => c.isGlobal);
  const subjectChannels = channels.filter(c => c.type === 'subject');

  // Group subject channels by class displayName
  const byClass = {};
  subjectChannels.forEach(ch => {
    const label = ch.classRef?.displayName || ch.classRef?.classId || 'My Class';
    if (!byClass[label]) byClass[label] = [];
    byClass[label].push(ch);
  });

  const isActive = (ch) => chanId(activeChannel) === chanId(ch);

  const initials = (name) =>
    name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??';

  // Teacher name shown under subject for students
  const getTeacherName = (ch) => {
    const sid = ch.subjectRef?._id ? String(ch.subjectRef._id) : null;
    if (!sid) return null;
    return subjectTeacherMap[sid] || null;
  };

  return (
    <div className="sidebar">
      {/* ── Header ── */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="sidebar-logo-dot" />
          VoxCampus
        </div>
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {isTeacher || isAdmin ? initials(user?.realName) : initials(user?.anonAlias)}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-alias truncate">
              {isTeacher || isAdmin ? user?.realName : (user?.anonAlias || 'Anonymous')}
            </div>
            <div className="sidebar-user-role">{user?.role}</div>
          </div>
        </div>
      </div>

      <div className="sidebar-scroll">
        {/* Global channels (students + admin only) */}
        {globalChannels.length > 0 && (
          <>
            <div className="sidebar-section-label">Campus</div>
            {globalChannels.map(ch => (
              <div
                key={ch._id}
                className={`channel-item ${isActive(ch) ? 'active' : ''}`}
                onClick={() => onSelect(ch)}
              >
                <span className="channel-icon" style={{ color: TYPE_COLOR[ch.type] }}>
                  {TYPE_ICON[ch.type]}
                </span>
                <span className="channel-name">{ch.name}</span>
              </div>
            ))}
          </>
        )}

        {/* Subject channels grouped by class */}
        {Object.keys(byClass).map(classLabel => (
          <div key={classLabel}>
            <div className="sidebar-section-label">{classLabel}</div>
            {byClass[classLabel].map(ch => {
              const teacherName = getTeacherName(ch);
              const label = ch.subjectRef
                ? `${ch.subjectRef.code} · ${ch.subjectRef.name}`
                : ch.name;
              return (
                <div
                  key={ch._id}
                  className={`channel-item ${isActive(ch) ? 'active' : ''}`}
                  onClick={() => onSelect(ch)}
                  style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 0, padding: '7px 10px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                    <span className="channel-icon" style={{ color: TYPE_COLOR.subject }}>
                      {TYPE_ICON.subject}
                    </span>
                    <span className="channel-name" title={label}>{label}</span>
                  </div>
                  {teacherName && isStudent && (
                    <div style={{ fontSize: 11, color: 'var(--purple)', paddingLeft: 26, marginTop: 2, opacity: 0.85 }}>
                      {teacherName}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}

        {/* Messages (DM) — students and teachers */}
        {(isStudent || isTeacher) && (
          <>
            <div className="sidebar-section-label">Messages</div>
            <div
              className={`channel-item ${chanId(activeChannel) === 'dm' ? 'active' : ''}`}
              onClick={() => onSelect({ _id: 'dm', name: 'Messages', type: 'dm' })}
            >
              <span className="channel-icon" style={{ color: TYPE_COLOR.dm }}>◉</span>
              <span className="channel-name">Private Messages</span>
            </div>
          </>
        )}

        {/* Admin panel link */}
        {isAdmin && (
          <>
            <div className="sidebar-section-label">Admin</div>
            <div
              className={`channel-item ${chanId(activeChannel) === 'admin' ? 'active' : ''}`}
              onClick={() => onSelect({ _id: 'admin', name: 'Admin Panel', type: 'admin' })}
            >
              <span className="channel-icon" style={{ color: 'var(--amber)' }}>◆</span>
              <span className="channel-name">Admin Panel</span>
            </div>
          </>
        )}

        {/* Teacher profile / skill management */}
        {isTeacher && (
          <>
            <div className="sidebar-section-label">Account</div>
            <div
              className={`channel-item ${chanId(activeChannel) === 'profile' ? 'active' : ''}`}
              onClick={() => onSelect({ _id: 'profile', name: 'My Profile', type: 'profile' })}
            >
              <span className="channel-icon" style={{ color: 'var(--accent)' }}>◉</span>
              <span className="channel-name">My Profile</span>
            </div>
          </>
        )}
      </div>

      {/* ── Logout ── */}
      <div className="sidebar-logout">
        <button className="btn-logout" onClick={logout}>
          <span>↩</span> Sign out
        </button>
      </div>
    </div>
  );
}