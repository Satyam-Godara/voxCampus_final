// import { useState, useEffect } from 'react';
// import { formatDistanceToNow } from 'date-fns';
// import api from '../../utils/api';
// import { useAuth } from '../../context/AuthContext';

// function PostCard({ post, currentUserId, isAdmin, onVote, onComment, onDelete }) {
//   const [showComments, setShowComments] = useState(false);
//   const [commentText, setCommentText]   = useState('');
//   const [submitting, setSubmitting]     = useState(false);

//   const handleComment = async () => {
//     if (!commentText.trim()) return;
//     setSubmitting(true);
//     await onComment(post._id, commentText.trim());
//     setCommentText('');
//     setSubmitting(false);
//   };

//   const initial = post.anonAlias?.[0]?.toUpperCase() || '?';
//   const isOwnPost = post._ownerId === currentUserId; // won't match, but kept for structure

//   return (
//     <div className="post-card">
//       <div className="post-header">
//         <div className="post-avatar">{initial}</div>
//         <div>
//           <div className="post-alias">{post.anonAlias}</div>
//           <div style={{ fontSize: 11, color: 'var(--text3)' }}>
//             {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
//           </div>
//         </div>
//         <div className="post-time" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
//           {post.voteScore > 5 && (
//             <span style={{ fontSize: 10, background: 'var(--green-bg)', color: 'var(--green)', padding: '2px 7px', borderRadius: 10, fontWeight: 600 }}>
//               Trending
//             </span>
//           )}
//         </div>
//       </div>

//       <div className="post-content">{post.content}</div>
//       {post.imageUrl && (
//         <img src={post.imageUrl} alt="" style={{ width: '100%', borderRadius: 8, marginBottom: 10 }} />
//       )}

//       <div className="post-actions">
//         <button
//           className={`vote-btn up ${post.userVote === 'up' ? 'active' : ''}`}
//           onClick={() => onVote(post._id, post.userVote === 'up' ? null : 'up')}
//         >
//           ▲ {post.upvoteCount}
//         </button>
//         <button
//           className={`vote-btn down ${post.userVote === 'down' ? 'active' : ''}`}
//           onClick={() => onVote(post._id, post.userVote === 'down' ? null : 'down')}
//         >
//           ▼ {post.downvoteCount}
//         </button>
//         <button className="comment-btn" onClick={() => setShowComments(v => !v)}>
//           ◈ {post.comments?.length || 0}
//         </button>
//         {isAdmin && (
//           <button className="delete-post-btn" onClick={() => onDelete(post._id)}>✕ Remove</button>
//         )}
//       </div>

//       {showComments && (
//         <div className="comments-section">
//           {post.comments?.length === 0 && (
//             <div style={{ fontSize: 12, color: 'var(--text3)', paddingBottom: 8 }}>No comments yet</div>
//           )}
//           {post.comments?.map((c, i) => (
//             <div className="comment-item" key={i}>
//               <div className="comment-avatar">{c.anonAlias?.[0]?.toUpperCase()}</div>
//               <div>
//                 <span className="comment-alias">{c.anonAlias}</span>
//                 <span className="comment-content">{c.content}</span>
//               </div>
//             </div>
//           ))}
//           <div className="comment-input-row">
//             <input
//               className="comment-input"
//               placeholder="Add a comment..."
//               value={commentText}
//               onChange={e => setCommentText(e.target.value)}
//               onKeyDown={e => e.key === 'Enter' && handleComment()}
//             />
//             <button className="comment-submit" onClick={handleComment} disabled={submitting}>
//               Reply
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default function FeedView({ channel }) {
//   const { user }             = useAuth();
//   const [posts, setPosts]    = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [content, setContent] = useState('');
//   const [sort, setSort]       = useState('votes');
//   const [posting, setPosting] = useState(false);

//   useEffect(() => {
//     if (!channel?._id) return;
//     setLoading(true);
//     api.get(`/posts/${channel._id}?sort=${sort}`)
//       .then(r => setPosts(r.data))
//       .catch(() => {})
//       .finally(() => setLoading(false));
//   }, [channel?._id, sort]);

//   const handlePost = async () => {
//     if (!content.trim()) return;
//     setPosting(true);
//     try {
//       const { data } = await api.post(`/posts/${channel._id}`, { content });
//       setPosts(prev => [data, ...prev]);
//       setContent('');
//     } catch {}
//     setPosting(false);
//   };

//   const handleVote = async (postId, vote) => {
//     const { data } = await api.post(`/posts/${postId}/vote`, { vote });
//     setPosts(prev => prev.map(p => p._id === postId ? data : p));
//     if (sort === 'votes') {
//       setPosts(prev => [...prev].sort((a, b) => b.voteScore - a.voteScore || new Date(b.createdAt) - new Date(a.createdAt)));
//     }
//   };

//   const handleComment = async (postId, commentText) => {
//     const { data } = await api.post(`/posts/${postId}/comment`, { content: commentText });
//     setPosts(prev => prev.map(p => p._id === postId ? data : p));
//   };

//   const handleDelete = async (postId) => {
//     await api.delete(`/posts/${postId}`);
//     setPosts(prev => prev.filter(p => p._id !== postId));
//   };

//   return (
//     <div className="feed-area">
//       {/* Composer */}
//       <div className="post-composer">
//         <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
//           <div className="post-avatar" style={{ marginTop: 4, flexShrink: 0 }}>
//             {user?.anonAlias?.[0]?.toUpperCase()}
//           </div>
//           <textarea
//             placeholder={
//               channel.type === 'feedback' ? "Share feedback anonymously — most voted stays on top..." :
//               channel.type === 'complaints' ? "File a complaint anonymously..." :
//               "What's on your mind?"
//             }
//             value={content}
//             onChange={e => setContent(e.target.value)}
//             onKeyDown={e => e.key === 'Enter' && e.ctrlKey && handlePost()}
//           />
//         </div>
//         <div className="post-composer-footer">
//           <div style={{ fontSize: 11, color: 'var(--text3)', marginRight: 'auto' }}>
//             Posting as <span style={{ color: 'var(--accent)' }}>{user?.anonAlias}</span>
//           </div>
//           <button className="btn-primary" onClick={handlePost} disabled={!content.trim() || posting}>
//             {posting ? '...' : 'Post'}
//           </button>
//         </div>
//       </div>

//       {/* Sort bar */}
//       <div className="sort-bar">
//         <span style={{ fontSize: 11, color: 'var(--text3)' }}>Sort by</span>
//         {['votes', 'recent'].map(s => (
//           <button key={s} className={`sort-btn ${sort === s ? 'active' : ''}`} onClick={() => setSort(s)}>
//             {s === 'votes' ? '▲ Top' : '◷ Recent'}
//           </button>
//         ))}
//         <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text3)' }}>
//           {posts.length} posts
//         </span>
//       </div>

//       {/* Posts */}
//       {loading ? (
//         <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner" /></div>
//       ) : posts.length === 0 ? (
//         <div className="empty-state">
//           <div className="empty-state-icon">◎</div>
//           <div className="empty-state-text">No posts yet. Be the first to share something.</div>
//         </div>
//       ) : (
//         posts.map(post => (
//           <PostCard
//             key={post._id}
//             post={post}
//             currentUserId={user?._id}
//             isAdmin={user?.role === 'admin'}
//             onVote={handleVote}
//             onComment={handleComment}
//             onDelete={handleDelete}
//           />
//         ))
//       )}
//     </div>
//   );
// }



import { useState, useEffect, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

function PostCard({ post, isAdmin, onVote, onComment, onDelete }) {
  const [showComments,setShowComments] = useState(false);
  const [commentText,setCommentText]   = useState('');
  const [submitting,setSubmitting]     = useState(false);

  const submit = async () => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    await onComment(post._id, commentText.trim());
    setCommentText(''); setSubmitting(false);
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="post-avatar">{post.anonAlias?.[0]?.toUpperCase()||'?'}</div>
        <div>
          <div className="post-alias">{post.anonAlias}</div>
          <div style={{fontSize:11,color:'var(--text3)'}}>{formatDistanceToNow(new Date(post.createdAt),{addSuffix:true})}</div>
        </div>
        {post.voteScore>5&&(
          <span style={{fontSize:10,background:'var(--green-bg)',color:'var(--green)',padding:'2px 7px',borderRadius:10,fontWeight:600,marginLeft:'auto'}}>Trending</span>
        )}
      </div>

      {post.content&&<div className="post-content">{post.content}</div>}

      {post.imageUrl&&(
        <a href={post.imageUrl} target="_blank" rel="noreferrer">
          <img src={post.imageUrl} alt="" style={{width:'100%',borderRadius:10,marginBottom:10,maxHeight:400,objectFit:'cover',cursor:'pointer',display:'block'}}/>
        </a>
      )}

      <div className="post-actions">
        <button className={`vote-btn up ${post.userVote==='up'?'active':''}`} onClick={()=>onVote(post._id,post.userVote==='up'?null:'up')}>▲ {post.upvoteCount}</button>
        <button className={`vote-btn down ${post.userVote==='down'?'active':''}`} onClick={()=>onVote(post._id,post.userVote==='down'?null:'down')}>▼ {post.downvoteCount}</button>
        <button className="comment-btn" onClick={()=>setShowComments(v=>!v)}>◈ {post.comments?.length||0}</button>
        {isAdmin&&<button className="delete-post-btn" onClick={()=>onDelete(post._id)}>✕ Remove</button>}
      </div>

      {showComments&&(
        <div className="comments-section">
          {post.comments?.length===0&&<div style={{fontSize:12,color:'var(--text3)',paddingBottom:8}}>No comments yet</div>}
          {post.comments?.map((c,i)=>(
            <div className="comment-item" key={i}>
              <div className="comment-avatar">{c.anonAlias?.[0]?.toUpperCase()}</div>
              <div><span className="comment-alias">{c.anonAlias}</span><span className="comment-content">{c.content}</span></div>
            </div>
          ))}
          <div className="comment-input-row">
            <input className="comment-input" placeholder="Add a comment…" value={commentText}
              onChange={e=>setCommentText(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submit()}/>
            <button className="comment-submit" onClick={submit} disabled={submitting}>Reply</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FeedView({ channel }) {
  const { user }   = useAuth();
  const [posts,setPosts]         = useState([]);
  const [loading,setLoading]     = useState(true);
  const [content,setContent]     = useState('');
  const [sort,setSort]           = useState('votes');
  const [posting,setPosting]     = useState(false);
  const [imageUrl,setImageUrl]   = useState(null);
  const [imageName,setImageName] = useState('');
  const [uploading,setUploading] = useState(false);
  const fileRef = useRef(null);

  useEffect(()=>{
    if(!channel?._id)return;
    setLoading(true);
    api.get(`/posts/${channel._id}?sort=${sort}`).then(r=>setPosts(r.data)).catch(()=>{}).finally(()=>setLoading(false));
  },[channel?._id,sort]);

  const handleImageChange = async (e) => {
    const file=e.target.files?.[0]; if(!file)return;
    setUploading(true);
    try{
      const fd=new FormData(); fd.append('image',file);
      const {data}=await api.post('/upload/post-image',fd,{headers:{'Content-Type':'multipart/form-data'}});
      setImageUrl(data.url); setImageName(data.filename);
    }catch(err){ alert(err.response?.data?.error||'Upload failed'); }
    setUploading(false); e.target.value='';
  };

  const handlePost = async () => {
    if (!content.trim()&&!imageUrl) return;
    setPosting(true);
    try{
      const {data}=await api.post(`/posts/${channel._id}`,{content,imageUrl});
      setPosts(p=>[data,...p]); setContent(''); setImageUrl(null); setImageName('');
    }catch{}
    setPosting(false);
  };

  const handleVote=async(postId,vote)=>{
    const {data}=await api.post(`/posts/${postId}/vote`,{vote});
    setPosts(p=>p.map(x=>x._id===postId?data:x));
    if(sort==='votes') setPosts(p=>[...p].sort((a,b)=>b.voteScore-a.voteScore||(new Date(b.createdAt)-new Date(a.createdAt))));
  };

  const handleComment=async(postId,text)=>{
    const {data}=await api.post(`/posts/${postId}/comment`,{content:text});
    setPosts(p=>p.map(x=>x._id===postId?data:x));
  };

  const handleDelete=async(postId)=>{
    await api.delete(`/posts/${postId}`); setPosts(p=>p.filter(x=>x._id!==postId));
  };

  return (
    <div className="feed-area">
      {/* Composer */}
      <div className="post-composer">
        <div style={{display:'flex',gap:10,alignItems:'flex-start'}}>
          <div className="post-avatar" style={{marginTop:4,flexShrink:0}}>{user?.anonAlias?.[0]?.toUpperCase()}</div>
          <textarea
            placeholder={channel.type==='feedback'?'Share feedback anonymously — most voted stays on top…':channel.type==='complaints'?'File a complaint anonymously…':"What's on your mind?"}
            value={content} onChange={e=>setContent(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&e.ctrlKey&&handlePost()}
          />
        </div>

        {/* Image preview */}
        {imageUrl&&(
          <div style={{display:'flex',alignItems:'center',gap:10,marginTop:10,background:'var(--bg3)',borderRadius:8,padding:'8px 12px'}}>
            <img src={imageUrl} alt="" style={{width:40,height:40,objectFit:'cover',borderRadius:6}}/>
            <span style={{fontSize:12,color:'var(--text2)',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{imageName}</span>
            <button onClick={()=>{setImageUrl(null);setImageName('');}} style={{color:'var(--red)',fontSize:14,padding:'2px 6px',borderRadius:4,background:'var(--red-bg)',border:'none',cursor:'pointer'}}>✕</button>
          </div>
        )}

        <div className="post-composer-footer">
          <div style={{fontSize:11,color:'var(--text3)',marginRight:'auto',display:'flex',alignItems:'center',gap:10}}>
            Posting as <span style={{color:'var(--accent)'}}>{user?.anonAlias}</span>
            <button onClick={()=>fileRef.current?.click()} style={{fontSize:12,color:imageUrl?'var(--accent)':'var(--text3)',background:'none',border:'1px solid var(--border)',borderRadius:6,padding:'3px 8px',cursor:'pointer'}}>
              {uploading?'Uploading…':'📷 Image'}
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleImageChange}/>
          </div>
          <button className="btn-primary" onClick={handlePost} disabled={(!content.trim()&&!imageUrl)||posting}>
            {posting?'…':'Post'}
          </button>
        </div>
      </div>

      {/* Sort bar */}
      <div className="sort-bar">
        <span style={{fontSize:11,color:'var(--text3)'}}>Sort by</span>
        {['votes','recent'].map(s=>(
          <button key={s} className={`sort-btn ${sort===s?'active':''}`} onClick={()=>setSort(s)}>
            {s==='votes'?'▲ Top':'◷ Recent'}
          </button>
        ))}
        <span style={{marginLeft:'auto',fontSize:11,color:'var(--text3)'}}>{posts.length} posts</span>
      </div>

      {loading?<div style={{display:'flex',justifyContent:'center',padding:40}}><div className="spinner"/></div>
        :posts.length===0?<div className="empty-state"><div className="empty-state-icon">◎</div><div className="empty-state-text">No posts yet. Be the first!</div></div>
        :posts.map(p=><PostCard key={p._id} post={p} isAdmin={user?.role==='admin'} onVote={handleVote} onComment={handleComment} onDelete={handleDelete}/>)
      }
    </div>
  );
}