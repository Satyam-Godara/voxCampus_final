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


// import { useState, useCallback, useEffect } from 'react';
// import { Menu, X } from 'lucide-react';

// import { useAuth } from '../context/AuthContext';
// import { useSocket } from '../context/SocketContext';

// import Sidebar from '../components/shared/Sidebar';
// import ChatView from '../components/chat/ChatView';
// import FeedView from '../components/feed/FeedView';
// import AdminPanel from '../components/admin/AdminPanel';
// import TeacherProfile from '../components/shared/TeacherProfile';
// import DMView from '../components/dm/DMView';
// import NotificationBell from '../components/shared/NotificationBell';

// const FEED_TYPES = new Set(['general', 'feedback', 'complaints']);
// const SYNTHETIC = new Set(['admin', 'profile', 'dm']);

// export default function Dashboard() {
//   const { user, channels } = useAuth();
//   const { socket } = useSocket();

//   const [active, setActive] = useState(null);
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [isMobile, setIsMobile] = useState(window.innerWidth <= 111768);

//   // Default channel
//   const defaultChannel =
//     user?.role === 'teacher'
//       ? channels.find((c) => c.type === 'subject')
//       : channels.find((c) => c.type === 'general');

//   const current = active || defaultChannel;

//   // Handle resize
//   useEffect(() => {
//     const handleResize = () => {
//       const mobile = window.innerWidth <= 768;
//       setIsMobile(mobile);

//       if (!mobile) {
//         setSidebarOpen(false);
//       }
//     };

//     window.addEventListener('resize', handleResize);

//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   // Close sidebar when selecting channel on mobile
//   const handleChannelSelect = (channel) => {
//     setActive(channel);

//     if (isMobile) {
//       setSidebarOpen(false);
//     }
//   };

//   // Handle notification navigation
//   const handleNotifNavigate = useCallback(
//     (link, type) => {
//       if (
//         type === 'dm_request' ||
//         type === 'dm_accepted' ||
//         type === 'dm_message'
//       ) {
//         setActive({
//           _id: 'dm',
//           name: 'Messages',
//           type: 'dm',
//         });

//         if (isMobile) {
//           setSidebarOpen(false);
//         }

//         return;
//       }

//       if (link) {
//         const ch = channels.find(
//           (c) => c._id === link || String(c._id) === String(link)
//         );

//         if (ch) {
//           setActive(ch);

//           if (isMobile) {
//             setSidebarOpen(false);
//           }
//         }
//       }
//     },
//     [channels, isMobile]
//   );

//   const showHeader =
//     current &&
//     !SYNTHETIC.has(String(current._id)) &&
//     current.type !== 'admin' &&
//     current.type !== 'profile' &&
//     current.type !== 'dm';

//   const renderContent = () => {
//     if (!current) {
//       return (
//         <div className="empty-state" style={{ flex: 1 }}>
//           <div className="empty-state-icon">◈</div>
//           <div className="empty-state-text">
//             Select a channel to get started
//           </div>
//         </div>
//       );
//     }

//     if (
//       current.type === 'admin' ||
//       String(current._id) === 'admin'
//     ) {
//       return <AdminPanel />;
//     }

//     if (
//       current.type === 'profile' ||
//       String(current._id) === 'profile'
//     ) {
//       return <TeacherProfile />;
//     }

//     if (
//       current.type === 'dm' ||
//       String(current._id) === 'dm'
//     ) {
//       return <DMView socket={socket} />;
//     }

//     if (FEED_TYPES.has(current.type)) {
//       return <FeedView channel={current} />;
//     }

//     return <ChatView channel={current} socket={socket} />;
//   };

//   return (
//     <div className="app-layout">
//       {/* Mobile Overlay */}
//       {sidebarOpen && isMobile && (
//         <div
//           className="mobile-sidebar-overlay"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}

//       {/* Sidebar */}
// <div
//   className={`dashboard-sidebar-wrapper ${
//     sidebarOpen ? 'open' : ''
//   }`}
// >
//   <div className="mobile-sidebar-inner">
//     <Sidebar
//       activeChannel={current}
//       onSelect={handleChannelSelect}
//     />
//   </div>
// </div>

//       {/* Main Content */}
//       <div className="main-content">
//         {/* MOBILE TOPBAR */}
//         {isMobile && (
//           <div className="mobile-topbar">
//             <button
//               className="mobile-menu-btn"
//               onClick={() => setSidebarOpen((prev) => !prev)}
//             >
//               {sidebarOpen ? (
//                 <X size={20} />
//               ) : (
//                 <Menu size={20} />
//               )}
//             </button>

//             <div className="mobile-topbar-title">
//               {current?.subjectRef
//                 ? current.subjectRef.code
//                 : current?.name || 'Dashboard'}
//             </div>

//             <NotificationBell
//               onNavigate={handleNotifNavigate}
//             />
//           </div>
//         )}

//         {/* DESKTOP HEADER */}
//         {!isMobile && showHeader && (
//           <div className="channel-header">
//             <span className="channel-header-icon">
//               {current.type === 'general'
//                 ? '◎'
//                 : current.type === 'feedback'
//                 ? '▲'
//                 : current.type === 'complaints'
//                 ? '⚑'
//                 : '◈'}
//             </span>

//             <span className="channel-header-name">
//               {current.subjectRef
//                 ? `${current.subjectRef.code} · ${current.subjectRef.name}`
//                 : current.name}
//             </span>

//             <span className="channel-header-desc">
//               {current.description}
//             </span>

//             <div style={{ marginLeft: 'auto' }}>
//               <NotificationBell
//                 onNavigate={handleNotifNavigate}
//               />
//             </div>
//           </div>
//         )}

//         {/* NON-CHANNEL HEADER */}
//         {!isMobile &&
//           !showHeader &&
//           current &&
//           !SYNTHETIC.has(String(current._id)) && (
//             <div className="channel-header">
//               <span className="channel-header-name">
//                 {current.name}
//               </span>

//               <div style={{ marginLeft: 'auto' }}>
//                 <NotificationBell
//                   onNavigate={handleNotifNavigate}
//                 />
//               </div>
//             </div>
//           )}

//         {/* SYNTHETIC HEADER */}
//         {!isMobile &&
//           current &&
//           SYNTHETIC.has(String(current._id)) && (
//             <div
//               style={{
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'flex-end',
//                 padding: '10px 18px',
//                 borderBottom: '1px solid var(--border)',
//                 background:
//                   'linear-gradient(180deg, rgba(18,18,23,0.96), rgba(18,18,23,0.88))',
//                 backdropFilter: 'blur(14px)',
//                 WebkitBackdropFilter: 'blur(14px)',
//                 flexShrink: 0,
//               }}
//             >
//               <NotificationBell
//                 onNavigate={handleNotifNavigate}
//               />
//             </div>
//           )}

//         {renderContent()}
//       </div>

//       {/* MOBILE RESPONSIVE STYLES */}
//       <style jsx>{`
//         .dashboard-sidebar-wrapper {
//           display: flex;
//           height: 100%;
//           z-index: 1200;
//         }

//         .mobile-sidebar-overlay {
//           position: fixed;
//           inset: 0;
//           background: rgba(0, 0, 0, 0.72);
//           backdrop-filter: blur(4px);
//           -webkit-backdrop-filter: blur(4px);
//           z-index: 1100;
//           animation: fadeIn 0.25s ease;
//         }

//         .mobile-topbar {
//           height: 64px;
//           min-height: 64px;

//           display: flex;
//           align-items: center;
//           justify-content: space-between;

//           padding: 0 14px;

//           border-bottom: 1px solid var(--border);

//           background:
//             linear-gradient(
//               180deg,
//               rgba(18, 18, 23, 0.96),
//               rgba(18, 18, 23, 0.88)
//             );

//           backdrop-filter: blur(18px);
//           -webkit-backdrop-filter: blur(18px);

//           flex-shrink: 0;

//           position: sticky;
//           top: 0;
//           z-index: 1000;
//         }

//         .mobile-menu-btn {
//           width: 42px;
//           height: 42px;

//           border-radius: 12px;

//           display: flex;
//           align-items: center;
//           justify-content: center;

//           background: rgba(255, 255, 255, 0.04);

//           border: 1px solid rgba(255, 255, 255, 0.08);

//           color: var(--text);

//           transition: all 0.2s ease;
//         }

//         .mobile-menu-btn:hover {
//           background: rgba(212, 168, 79, 0.14);
//           border-color: rgba(212, 168, 79, 0.22);
//           color: var(--accent);
//         }

//         .mobile-topbar-title {
//           flex: 1;

//           margin: 0 12px;

//           font-size: 15px;
//           font-weight: 700;

//           color: var(--text);

//           white-space: nowrap;
//           overflow: hidden;
//           text-overflow: ellipsis;
//         }

//         @media (max-width: 768px) {
//           .dashboard-sidebar-wrapper {
//             position: fixed;
//             top: 0;
//             left: 0;
//             bottom: 0;

//             width: 290px;
//             max-width: 82vw;

//             transform: translateX(-100%);
//             transition: transform 0.28s ease;

//             box-shadow:
//               0 0 40px rgba(0, 0, 0, 0.5),
//               0 0 0 1px rgba(255, 255, 255, 0.04);

//             z-index: 1200;
//           }

//           .dashboard-sidebar-wrapper.open {
//             transform: translateX(0);
//           }

//           .main-content {
//             width: 100%;
//             min-width: 100%;
//           }
//         }

//         @keyframes fadeIn {
//           from {
//             opacity: 0;
//           }

//           to {
//             opacity: 1;
//           }
//         }
//       `}</style>
//     </div>
//   );
// }