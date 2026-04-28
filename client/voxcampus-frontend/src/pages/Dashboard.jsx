// import { useState } from 'react';
// import { useAuth } from '../context/AuthContext';
// import Sidebar from '../components/shared/Sidebar';
// import ChatView from '../components/chat/ChatView';
// import FeedView from '../components/feed/FeedView';
// import AdminPanel from '../components/admin/AdminPanel';
// import { useSocket } from '../context/SocketContext';
// import TeacherProfile from '../components/teacher/Teacherprofile';

// const FEED_TYPES = new Set(['general', 'feedback', 'complaints']);

// export default function Dashboard() {
//   const { channels }     = useAuth();
//   const { socket }       = useSocket();
//   const [active, setActive] = useState(null);

//   // Default to General on first load
//   const handleSelect = (ch) => setActive(ch);

//   const defaultChannel = channels.find(c => c.type === 'general');
//   const current = active || defaultChannel;

//   const renderContent = () => {
//     if (!current) {
//       return (
//         <div className="empty-state" style={{ flex: 1 }}>
//           <div className="empty-state-icon">◈</div>
//           <div className="empty-state-text">Select a channel to get started</div>
//         </div>
//       );
//     }

//     if (current.type === 'admin') return <AdminPanel />;
//     if (FEED_TYPES.has(current.type)) return <FeedView channel={current} />;
//     if(current.type === 'profile')return <TeacherProfile/>
//     return <ChatView channel={current} socket={socket} />;
//   };

//   return (
//     <div className="app-layout">
//       <Sidebar activeChannel={current} onSelect={handleSelect} />
//       <div className="main-content">
//         {current && current.type !== 'admin' && (
//           <div className="channel-header">
//             <span className="channel-header-icon">
//               {current.type === 'general' ? '◎' :
//                current.type === 'feedback' ? '▲' :
//                current.type === 'complaints' ? '⚑' : '◈'}
//             </span>
//             <span className="channel-header-name">{current.name}</span>
//             <span className="channel-header-desc">{current.description}</span>
//           </div>
//         )}
//         {renderContent()}
//       </div>
//     </div>
//   );
// }

import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Sidebar from '../components/shared/Sidebar';
import ChatView from '../components/chat/ChatView';
import FeedView from '../components/feed/FeedView';
import AdminPanel from '../components/admin/AdminPanel';
import TeacherProfile from '../components/shared/TeacherProfile';
import DMView from '../components/dm/DMView';
import NotificationBell from '../components/shared/NotificationBell';

const FEED_TYPES = new Set(['general', 'feedback', 'complaints']);
const SYNTHETIC  = new Set(['admin', 'profile', 'dm']);

export default function Dashboard() {
  const { user, channels } = useAuth();
  const { socket }         = useSocket();
  const [active, setActive] = useState(null);

  // Default channel: teachers → first subject, students/admin → general
  const defaultChannel = user?.role === 'teacher'
    ? channels.find(c => c.type === 'subject')
    : channels.find(c => c.type === 'general');

  const current = active || defaultChannel;

  // Handle notification click → navigate to relevant channel
  const handleNotifNavigate = useCallback((link, type) => {
    if (type === 'dm_request' || type === 'dm_accepted' || type === 'dm_message') {
      setActive({ _id: 'dm', name: 'Messages', type: 'dm' });
      return;
    }
    if (link) {
      const ch = channels.find(c => c._id === link || String(c._id) === String(link));
      if (ch) setActive(ch);
    }
  }, [channels]);

  const showHeader = current
    && !SYNTHETIC.has(String(current._id))
    && current.type !== 'admin'
    && current.type !== 'profile'
    && current.type !== 'dm';

  const renderContent = () => {
    if (!current) return (
      <div className="empty-state" style={{ flex: 1 }}>
        <div className="empty-state-icon">◈</div>
        <div className="empty-state-text">Select a channel to get started</div>
      </div>
    );
    if (current.type === 'admin'   || String(current._id) === 'admin')   return <AdminPanel />;
    if (current.type === 'profile' || String(current._id) === 'profile') return <TeacherProfile />;
    if (current.type === 'dm'      || String(current._id) === 'dm')      return <DMView socket={socket} />;
    if (FEED_TYPES.has(current.type)) return <FeedView channel={current} />;
    return <ChatView channel={current} socket={socket} />;
  };

  return (
    <div className="app-layout">
      <Sidebar activeChannel={current} onSelect={setActive} />

      <div className="main-content">
        {/* Channel header */}
        {showHeader && (
          <div className="channel-header">
            <span className="channel-header-icon">
              {current.type === 'general'    ? '◎'
               : current.type === 'feedback'   ? '▲'
               : current.type === 'complaints' ? '⚑'
               : '◈'}
            </span>
            <span className="channel-header-name">
              {current.subjectRef
                ? `${current.subjectRef.code} · ${current.subjectRef.name}`
                : current.name}
            </span>
            <span className="channel-header-desc">{current.description}</span>

            {/* Notification bell lives in the header */}
            <div style={{ marginLeft: 'auto' }}>
              <NotificationBell onNavigate={handleNotifNavigate} />
            </div>
          </div>
        )}

        {/* Header for synthetic pages (no channel selected) */}
        {!showHeader && current && !SYNTHETIC.has(String(current._id)) && (
          <div className="channel-header">
            <span className="channel-header-name">{current.name}</span>
            <div style={{ marginLeft: 'auto' }}>
              <NotificationBell onNavigate={handleNotifNavigate} />
            </div>
          </div>
        )}

        {/* For synthetic pages (admin/profile/dm) — still show bell in a slim bar */}
        {current && SYNTHETIC.has(String(current._id)) && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
            padding: '8px 16px', borderBottom: '1px solid var(--border)',
            background: 'var(--bg2)', flexShrink: 0,
          }}>
            <NotificationBell onNavigate={handleNotifNavigate} />
          </div>
        )}

        {renderContent()}
      </div>
    </div>
  );
}