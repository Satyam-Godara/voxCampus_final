// import { useState, useEffect, useRef, useCallback } from 'react';
// import { format, isToday, isYesterday } from 'date-fns';
// import api from '../../utils/api';
// import { useAuth } from '../../context/AuthContext';
// import PollsPanel from '../polls/PollsPanel';

// function dateLabel(date) {
//   const d = new Date(date);
//   if (isToday(d)) return 'Today';
//   if (isYesterday(d)) return 'Yesterday';
//   return format(d, 'MMM d, yyyy');
// }

// function groupByDate(messages) {
//   const groups = {};
//   messages.forEach(m => {
//     const key = dateLabel(m.createdAt);
//     if (!groups[key]) groups[key] = [];
//     groups[key].push(m);
//   });
//   return groups;
// }

// function MessageRow({ msg, currentUserId, isAdmin, onDelete }) {
//   const isTeacher = msg.anonAlias?.startsWith('Teacher');
//   const isSelf    = msg._authorId === currentUserId; // only populated for own messages via local echo
//   const aliasClass = isTeacher ? 'teacher' : isSelf ? 'self' : '';

//   const initial = msg.anonAlias?.[0]?.toUpperCase() || '?';

//   return (
//     <div className={`message-row ${msg.type === 'announcement' ? 'announcement' : ''}`}>
//       <div className={`message-avatar ${aliasClass}`}>{initial}</div>
//       <div className="message-body">
//         {msg.type === 'announcement' && (
//           <div className="announcement-badge">
//             ◈ {msg.announcementMeta?.category || 'Announcement'}
//             {msg.announcementMeta?.dueDate && (
//               <span style={{ marginLeft: 4, opacity: 0.8 }}>
//                 · Due {format(new Date(msg.announcementMeta.dueDate), 'MMM d')}
//               </span>
//             )}
//           </div>
//         )}
//         <div className="message-meta">
//           <span className={`message-alias ${aliasClass}`}>{msg.anonAlias}</span>
//           <span className="message-time">{format(new Date(msg.createdAt), 'HH:mm')}</span>
//         </div>
//         <div className="message-content">{msg.content}</div>
//       </div>
//       {(isSelf || isAdmin) && (
//         <button className="message-delete-btn" onClick={() => onDelete(msg._id)}>✕</button>
//       )}
//     </div>
//   );
// }

// export default function ChatView({ channel, socket }) {
//   const { user }        = useAuth();
//   const [messages, setMessages]     = useState([]);
//   const [input, setInput]           = useState('');
//   const [loading, setLoading]       = useState(true);
//   const [typing, setTyping]         = useState('');
//   const [sending, setSending]       = useState(false);
//   const [showPolls, setShowPolls]   = useState(false);
//   const [annType, setAnnType]       = useState('');
//   const [dueDate, setDueDate]       = useState('');
//   const [showAnnForm, setShowAnnForm] = useState(false);
//   const bottomRef = useRef(null);
//   const typingTimer = useRef(null);

//   const isTeacher = user?.role === 'teacher' || user?.role === 'admin';

//   // Load message history
//   useEffect(() => {
//     if (!channel?._id) return;
//     setLoading(true);
//     setMessages([]);
//     api.get(`/messages/${channel._id}`)
//       .then(r => setMessages(r.data))
//       .catch(() => {})
//       .finally(() => setLoading(false));
//   }, [channel?._id]);

//   // Socket.IO listeners
//   useEffect(() => {
//     if (!socket || !channel?._id) return;
//     socket.emit('join_channel', channel._id);

//     const handleNew = (msg) => {
//       setMessages(prev => [...prev, msg]);
//     };
//     const handleDeleted = ({ messageId }) => {
//       setMessages(prev => prev.filter(m => m._id !== messageId));
//     };
//     const handleTyping = ({ alias, channelId }) => {
//       if (channelId !== channel._id) return;
//       setTyping(`${alias} is typing...`);
//       clearTimeout(typingTimer.current);
//       typingTimer.current = setTimeout(() => setTyping(''), 2000);
//     };

//     socket.on('new_message', handleNew);
//     socket.on('message_deleted', handleDeleted);
//     socket.on('user_typing', handleTyping);

//     return () => {
//       socket.emit('leave_channel', channel._id);
//       socket.off('new_message', handleNew);
//       socket.off('message_deleted', handleDeleted);
//       socket.off('user_typing', handleTyping);
//     };
//   }, [socket, channel?._id]);

//   // Auto-scroll
//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);

//   const handleInput = (e) => {
//     setInput(e.target.value);
//     if (socket && channel?._id) socket.emit('typing', { channelId: channel._id });
//   };

//   const handleKeyDown = (e) => {
//     if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
//   };

//   const sendMessage = useCallback(async () => {
//     if (!input.trim() || sending) return;
//     setSending(true);
//     const content = input.trim();
//     setInput('');

//     const payload = {
//       channelId: channel._id,
//       content,
//       type: showAnnForm ? 'announcement' : 'chat',
//       announcementMeta: showAnnForm ? { category: annType || 'general', dueDate: dueDate || undefined } : undefined,
//     };

//     if (socket) {
//       socket.emit('send_message', payload);
//     } else {
//       // REST fallback
//       try {
//         const { data } = await api.post(`/messages/${channel._id}`, payload);
//         setMessages(prev => [...prev, data]);
//       } catch {}
//     }

//     setShowAnnForm(false);
//     setAnnType('');
//     setDueDate('');
//     setSending(false);
//   }, [input, sending, socket, channel, showAnnForm, annType, dueDate]);

//   const handleDelete = async (messageId) => {
//     if (socket) socket.emit('delete_message', { messageId });
//     else {
//       await api.delete(`/messages/${messageId}`);
//       setMessages(prev => prev.filter(m => m._id !== messageId));
//     }
//   };

//   const announcements = messages.filter(m => m.type === 'announcement');
//   const grouped = groupByDate(messages);

//   return (
//     <>
//       {/* Announcements banner */}
//       <div className={`ann-banner ${announcements.length ? 'has-items' : ''}`}>
//         <div className="ann-banner-inner">
//           {announcements.map(a => (
//             <div className="ann-chip" key={a._id}>
//               <span className="ann-chip-icon">
//                 {a.announcementMeta?.category === 'exam' ? '📝' : a.announcementMeta?.category === 'assignment' ? '📋' : '📌'}
//               </span>
//               {a.content.slice(0, 60)}{a.content.length > 60 ? '…' : ''}
//               {a.announcementMeta?.dueDate && (
//                 <span style={{ color: 'var(--amber)', marginLeft: 4 }}>
//                   · {format(new Date(a.announcementMeta.dueDate), 'MMM d')}
//                 </span>
//               )}
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Tab bar for chat / polls */}
//       <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', background: 'var(--bg2)', flexShrink: 0 }}>
//         {['Chat', channel.type === 'subject' ? 'Polls' : null].filter(Boolean).map(tab => (
//           <button
//             key={tab}
//             onClick={() => setShowPolls(tab === 'Polls')}
//             style={{
//               padding: '10px 20px',
//               fontSize: 13, fontWeight: 500,
//               color: (showPolls ? tab === 'Polls' : tab === 'Chat') ? 'var(--accent)' : 'var(--text3)',
//               borderBottom: (showPolls ? tab === 'Polls' : tab === 'Chat') ? '2px solid var(--accent)' : '2px solid transparent',
//               background: 'none', border: 'none', cursor: 'pointer',
//               transition: 'color 150ms',
//             }}
//           >
//             {tab}
//           </button>
//         ))}
//       </div>

//       {showPolls ? (
//         <PollsPanel channel={channel} />
//       ) : (
//         <>
//           <div className="chat-area">
//             {loading && (
//               <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
//                 <div className="spinner" />
//               </div>
//             )}
//             {!loading && messages.length === 0 && (
//               <div className="empty-state">
//                 <div className="empty-state-icon">◈</div>
//                 <div className="empty-state-text">No messages yet. Say something!</div>
//               </div>
//             )}
//             {Object.entries(grouped).map(([date, msgs]) => (
//               <div key={date}>
//                 <div className="chat-date-divider">{date}</div>
//                 {msgs.map(msg => (
//                   <MessageRow
//                     key={msg._id}
//                     msg={msg}
//                     currentUserId={user?._id}
//                     isAdmin={user?.role === 'admin'}
//                     onDelete={handleDelete}
//                   />
//                 ))}
//               </div>
//             ))}
//             <div ref={bottomRef} />
//           </div>

//           <div className="chat-input-area">
//             <div className="typing-indicator">{typing}</div>

//             {/* Announcement options (teacher only) */}
//             {isTeacher && showAnnForm && (
//               <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
//                 <select
//                   value={annType}
//                   onChange={e => setAnnType(e.target.value)}
//                   style={{
//                     background: 'var(--bg3)', border: '1px solid var(--border2)',
//                     borderRadius: 8, padding: '6px 10px', color: 'var(--text)', fontSize: 12,
//                   }}
//                 >
//                   <option value="">Category</option>
//                   <option value="assignment">Assignment</option>
//                   <option value="deadline">Deadline</option>
//                   <option value="exam">Exam</option>
//                   <option value="general">General</option>
//                 </select>
//                 <input
//                   type="date"
//                   value={dueDate}
//                   onChange={e => setDueDate(e.target.value)}
//                   style={{
//                     background: 'var(--bg3)', border: '1px solid var(--border2)',
//                     borderRadius: 8, padding: '6px 10px', color: 'var(--text)', fontSize: 12,
//                   }}
//                 />
//                 <button
//                   style={{ fontSize: 11, color: 'var(--text3)', padding: '4px 8px' }}
//                   onClick={() => setShowAnnForm(false)}
//                 >Cancel</button>
//               </div>
//             )}

//             <div className="chat-input-row">
//               {isTeacher && (
//                 <button
//                   style={{
//                     fontSize: 16, color: showAnnForm ? 'var(--amber)' : 'var(--text3)',
//                     padding: '2px 6px', borderRadius: 6, transition: 'color 150ms',
//                   }}
//                   title="Post announcement"
//                   onClick={() => setShowAnnForm(v => !v)}
//                 >
//                   ◈
//                 </button>
//               )}
//               <textarea
//                 className="chat-input"
//                 rows={1}
//                 placeholder={showAnnForm ? 'Write an announcement...' : `Message ${channel.name}...`}
//                 value={input}
//                 onChange={handleInput}
//                 onKeyDown={handleKeyDown}
//               />
//               <button className="send-btn" onClick={sendMessage} disabled={!input.trim() || sending}>
//                 ↑
//               </button>
//             </div>
//           </div>
//         </>
//       )}
//     </>
//   );
// }
import { useState, useEffect, useRef, useCallback } from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import PollsPanel from '../polls/PollsPanel';
import { ScreenShareViewer } from '../shared/TeacherProfile';

// ── Helpers ───────────────────────────────────────────────────────────────
function dateLabel(d) {
  const dt = new Date(d);
  if (isToday(dt))     return 'Today';
  if (isYesterday(dt)) return 'Yesterday';
  return format(dt, 'MMM d, yyyy');
}
function groupByDate(msgs) {
  const g = {};
  msgs.forEach(m => { const k = dateLabel(m.createdAt); if (!g[k]) g[k] = []; g[k].push(m); });
  return g;
}

const FILE_ICON = { pdf: '📄', doc: '📝', ppt: '📊', image: '🖼', other: '📎' };

// ── File attachment renderer ───────────────────────────────────────────────
function FileAttachment({ msg }) {
  if (!msg.fileUrl) return null;
  if (msg.fileType === 'image') return (
    <a href={msg.fileUrl} target="_blank" rel="noreferrer">
      <img src={msg.fileUrl} alt={msg.fileName || 'image'}
        style={{ maxWidth: 280, maxHeight: 200, borderRadius: 8, marginTop: 6, display: 'block', objectFit: 'cover', cursor: 'pointer' }} />
    </a>
  );
  return (
    <a href={msg.fileUrl} target="_blank" rel="noreferrer" download={msg.fileName}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 6, background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 8, padding: '8px 12px', color: 'var(--text2)', fontSize: 12, textDecoration: 'none', transition: 'all 150ms' }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg4)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg3)')}
    >
      <span>{FILE_ICON[msg.fileType] || '📎'}</span>
      <span style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.fileName || 'Download file'}</span>
      <span style={{ color: 'var(--accent)', fontSize: 11 }}>↓</span>
    </a>
  );
}

// ── Single message row ─────────────────────────────────────────────────────
function MessageRow({ msg, isAdmin, onDelete }) {
  const isTeacher = msg.anonAlias && !msg.anonAlias.startsWith('Student');
  const aliasClass = isTeacher ? 'teacher' : '';
  return (
    <div className={`message-row ${msg.type === 'announcement' ? 'announcement' : ''}`}>
      <div className={`message-avatar ${aliasClass}`}>{msg.anonAlias?.[0]?.toUpperCase() || '?'}</div>
      <div className="message-body">
        {msg.type === 'announcement' && (
          <div className="announcement-badge">
            ◈ {msg.announcementMeta?.category || 'Announcement'}
            {msg.announcementMeta?.dueDate && (
              <span style={{ marginLeft: 4, opacity: 0.8 }}>· Due {format(new Date(msg.announcementMeta.dueDate), 'MMM d')}</span>
            )}
          </div>
        )}
        <div className="message-meta">
          <span className={`message-alias ${aliasClass}`}>{msg.anonAlias}</span>
          <span className="message-time">{format(new Date(msg.createdAt), 'HH:mm')}</span>
        </div>
        {msg.content && <div className="message-content">{msg.content}</div>}
        <FileAttachment msg={msg} />
      </div>
      {isAdmin && <button className="message-delete-btn" onClick={() => onDelete(msg._id)}>✕</button>}
    </div>
  );
}

// ── Main ChatView ──────────────────────────────────────────────────────────
export default function ChatView({ channel, socket, isDM = false }) {
  const { user } = useAuth();
  const [messages, setMessages]           = useState([]);
  const [input, setInput]                 = useState('');
  const [loading, setLoading]             = useState(true);
  const [typing, setTyping]               = useState('');
  const [sending, setSending]             = useState(false);
  const [showAnnForm, setShowAnnForm]     = useState(false);
  const [annType, setAnnType]             = useState('');
  const [dueDate, setDueDate]             = useState('');
  const [uploading, setUploading]         = useState(false);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [showPolls, setShowPolls]         = useState(false);
  const bottomRef   = useRef(null);
  const typingTimer = useRef(null);
  const fileRef     = useRef(null);

  const isTeacher  = user?.role === 'teacher' || user?.role === 'admin';
  const isStudent  = user?.role === 'student';
  const channelId  = channel._id;
  const isSubject  = channel.type === 'subject';

  // Load message history
  useEffect(() => {
    if (!channelId) return;
    setLoading(true);
    setMessages([]);
    const url = isDM ? `/dm/${channel.dmId}/messages` : `/messages/${channelId}`;
    api.get(url)
      .then(r => setMessages(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [channelId]);

  // Socket listeners
  useEffect(() => {
    if (!socket || !channelId) return;
    socket.emit('join_channel', channelId);

    const onMsg  = (msg) => setMessages(p => [...p, msg]);
    const onDel  = ({ messageId }) => setMessages(p => p.filter(m => m._id !== messageId));
    const onType = ({ alias, channelId: cid }) => {
      if (cid !== channelId) return;
      setTyping(`${alias} is typing…`);
      clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => setTyping(''), 2000);
    };

    socket.on('new_message',   onMsg);
    socket.on('message_deleted', onDel);
    socket.on('user_typing',   onType);

    return () => {
      socket.emit('leave_channel', channelId);
      socket.off('new_message',   onMsg);
      socket.off('message_deleted', onDel);
      socket.off('user_typing',   onType);
    };
  }, [socket, channelId]);

  // Auto-scroll
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // File upload
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append(isTeacher ? 'file' : 'image', file);
      const { data } = await api.post(
        isTeacher ? '/upload/teacher-file' : '/upload/post-image',
        fd, { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setUploadPreview({ url: data.url, name: data.filename, fileType: data.fileType || 'image' });
    } catch (err) {
      alert(err.response?.data?.error || 'Upload failed');
    }
    setUploading(false);
    e.target.value = '';
  };

  // Send message
  const sendMessage = useCallback(async () => {
    if ((!input.trim() && !uploadPreview) || sending) return;
    setSending(true);
    const payload = {
      channelId,
      content:  input.trim(),
      type:     showAnnForm ? 'announcement' : uploadPreview ? 'file' : 'chat',
      announcementMeta: showAnnForm
        ? { category: annType || 'general', dueDate: dueDate || undefined }
        : undefined,
      fileUrl:  uploadPreview?.url  || null,
      fileName: uploadPreview?.name || null,
      fileType: uploadPreview?.fileType || null,
    };

    if (socket) {
      socket.emit('send_message', payload);
    } else {
      try {
        const { data } = await api.post(`/messages/${channelId}`, payload);
        setMessages(p => [...p, data]);
      } catch {}
    }

    setInput('');
    setUploadPreview(null);
    setShowAnnForm(false);
    setAnnType('');
    setDueDate('');
    setSending(false);
  }, [input, uploadPreview, sending, socket, channelId, showAnnForm, annType, dueDate]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleDelete = async (messageId) => {
    if (socket) socket.emit('delete_message', { messageId });
    else {
      await api.delete(`/messages/${messageId}`);
      setMessages(p => p.filter(m => m._id !== messageId));
    }
  };

  const announcements = messages.filter(m => m.type === 'announcement');
  const grouped = groupByDate(messages);

  return (
    <>
      {/* Pinned announcements bar */}
      {announcements.length > 0 && !isDM && (
        <div className="ann-banner has-items">
          <div className="ann-banner-inner">
            {announcements.map(a => (
              <div className="ann-chip" key={a._id}>
                <span className="ann-chip-icon">
                  {a.announcementMeta?.category === 'exam' ? '📝'
                   : a.announcementMeta?.category === 'assignment' ? '📋' : '📌'}
                </span>
                {a.content.slice(0, 60)}{a.content.length > 60 ? '…' : ''}
                {a.announcementMeta?.dueDate && (
                  <span style={{ color: 'var(--amber)', marginLeft: 4 }}>
                    · {format(new Date(a.announcementMeta.dueDate), 'MMM d')}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chat / Polls tab bar — subject channels only */}
      {!isDM && isSubject && (
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--bg2)', flexShrink: 0 }}>
          {['Chat', 'Polls'].map(tab => {
            const active = showPolls ? tab === 'Polls' : tab === 'Chat';
            return (
              <button key={tab} onClick={() => setShowPolls(tab === 'Polls')}
                style={{ padding: '10px 20px', fontSize: 13, fontWeight: 500, color: active ? 'var(--accent)' : 'var(--text3)', borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 150ms' }}>
                {tab}
              </button>
            );
          })}
        </div>
      )}

      {showPolls && !isDM ? (
        <PollsPanel channel={channel} />
      ) : (
        <>
          {/* ── Screen share viewer (students only, subject channels) ── */}
          {isStudent && isSubject && socket && (
            <div style={{ padding: '0 20px', paddingTop: 10, flexShrink: 0,}}>
              <ScreenShareViewer channelId={channelId} socket={socket} />
            </div>
          )}

          {/* Messages list */}
          <div className="chat-area">
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                <div className="spinner" />
              </div>
            )}
            {!loading && messages.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon">◈</div>
                <div className="empty-state-text">
                  {isDM ? 'Start the conversation' : 'No messages yet. Say something!'}
                </div>
              </div>
            )}
            {Object.entries(grouped).map(([date, msgs]) => (
              <div key={date}>
                <div className="chat-date-divider">{date}</div>
                {msgs.map(msg => (
                  <MessageRow key={msg._id} msg={msg}
                    isAdmin={user?.role === 'admin'}
                    onDelete={handleDelete} />
                ))}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          <div className="chat-input-area">
            <div className="typing-indicator">{typing}</div>

            {/* Announcement type controls (teacher, non-DM) */}
            {isTeacher && showAnnForm && !isDM && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <select value={annType} onChange={e => setAnnType(e.target.value)}
                  style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 8, padding: '6px 10px', color: 'var(--text)', fontSize: 12 }}>
                  <option value="">Category</option>
                  <option value="assignment">Assignment</option>
                  <option value="deadline">Deadline</option>
                  <option value="exam">Exam</option>
                  <option value="general">General</option>
                </select>
                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                  style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 8, padding: '6px 10px', color: 'var(--text)', fontSize: 12 }} />
                <button style={{ fontSize: 11, color: 'var(--text3)' }} onClick={() => setShowAnnForm(false)}>Cancel</button>
              </div>
            )}

            {/* Upload preview */}
            {uploadPreview && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 8, padding: '8px 12px', marginBottom: 8 }}>
                {uploadPreview.fileType === 'image'
                  ? <img src={uploadPreview.url} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }} />
                  : <span style={{ fontSize: 20 }}>{FILE_ICON[uploadPreview.fileType] || '📎'}</span>
                }
                <span style={{ fontSize: 12, color: 'var(--text2)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{uploadPreview.name}</span>
                <button onClick={() => setUploadPreview(null)}
                  style={{ color: 'var(--red)', fontSize: 14, padding: '2px 6px', borderRadius: 4, background: 'var(--red-bg)', border: 'none', cursor: 'pointer' }}>✕</button>
              </div>
            )}

            <div className="chat-input-row">
              {/* Announcement pin — teacher, non-DM */}
              {isTeacher && !isDM && (
                <button title="Post announcement" onClick={() => setShowAnnForm(v => !v)}
                  style={{ fontSize: 16, color: showAnnForm ? 'var(--amber)' : 'var(--text3)', padding: '2px 6px', borderRadius: 6, transition: 'color 150ms' }}>
                  ◈
                </button>
              )}

              {/* File / image attach */}
              <button title={isTeacher ? 'Share file' : 'Attach image'}
                onClick={() => fileRef.current?.click()}
                style={{ fontSize: 15, color: uploadPreview ? 'var(--accent)' : 'var(--text3)', padding: '2px 6px', borderRadius: 6, transition: 'color 150ms' }}>
                {uploading ? '⟳' : '📎'}
              </button>
              <input ref={fileRef} type="file" style={{ display: 'none' }}
                accept={isTeacher ? '*/*' : 'image/*'}
                onChange={handleFileChange} />

              <textarea className="chat-input" rows={1}
                placeholder={
                  showAnnForm ? 'Write an announcement…'
                  : isDM ? 'Write a message…'
                  : `Message ${channel.subjectRef?.name || channel.name}…`
                }
                value={input}
                onChange={e => {
                  setInput(e.target.value);
                  if (socket) socket.emit('typing', { channelId });
                }}
                onKeyDown={handleKeyDown}
              />

              <button className="send-btn"
                onClick={sendMessage}
                disabled={(!input.trim() && !uploadPreview) || sending}>
                ↑
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}