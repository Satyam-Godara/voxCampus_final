import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import ChatView from '../chat/ChatView';

// ── Student side: pick teacher → request DM ────────────────────────────────
function StudentDMList({ socket }) {
  const [teachers,setTeachers]   = useState([]);
  const [dms,setDms]             = useState([]);
  const [activeDM,setActiveDM]   = useState(null);
  const [requesting,setRequesting] = useState('');
  const [loading,setLoading]     = useState(true);
  const [tab,setTab]             = useState('active'); // 'active' | 'new'

  useEffect(()=>{
    Promise.all([api.get('/auth/teachers'), api.get('/dm')])
      .then(([t,d])=>{ setTeachers(t.data); setDms(d.data); })
      .catch(()=>{})
      .finally(()=>setLoading(false));
  },[]);

  const requestDM = async (teacherId) => {
    setRequesting(teacherId);
    try {
      const {data}=await api.post('/dm/request',{teacherId});
      setDms(prev=>{
        const exists=prev.find(d=>d._id===data.dm._id);
        return exists?prev.map(d=>d._id===data.dm._id?data.dm:d):[data.dm,...prev];
      });
      if(data.dm.status==='accepted') setActiveDM(data.dm);
      else setTab('active');
    }catch(err){ alert(err.response?.data?.error||'Failed to send request'); }
    setRequesting('');
  };

  if(activeDM?.channelRef) return (
    <div style={{display:'flex',flexDirection:'column',height:'100%'}}>
      <div style={{padding:'12px 16px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',gap:10,background:'var(--bg2)',flexShrink:0}}>
        <button onClick={()=>setActiveDM(null)} style={{color:'var(--text3)',fontSize:14,padding:'4px 8px',borderRadius:6,background:'var(--bg3)',border:'1px solid var(--border)',cursor:'pointer'}}>←</button>
        <span style={{fontSize:13,fontWeight:500}}>Chat with {activeDM.teacher?.realName||'Teacher'}</span>
        <span style={{fontSize:11,color:'var(--green)',marginLeft:'auto'}}>● Active</span>
      </div>
      <ChatView channel={{_id:activeDM.channelRef._id||activeDM.channelRef,name:'Private Chat',type:'dm',dmId:activeDM._id}} socket={socket} isDM/>
    </div>
  );

  return (
    <div style={{flex:1,overflowY:'auto',padding:20}}>
      <div style={{fontSize:16,fontWeight:600,marginBottom:16}}>Private Messages</div>

      {/* Tabs */}
      <div style={{display:'flex',background:'var(--bg3)',borderRadius:10,padding:3,marginBottom:16,gap:3}}>
        {[['active','My Chats'],['new','New Chat']].map(([t,l])=>(
          <button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:'7px 0',borderRadius:8,fontSize:13,fontWeight:tab===t?500:400,background:tab===t?'var(--bg2)':'transparent',color:tab===t?'var(--text)':'var(--text3)',border:tab===t?'1px solid var(--border2)':'1px solid transparent',cursor:'pointer',transition:'all 150ms'}}>{l}</button>
        ))}
      </div>

      {loading&&<div style={{display:'flex',justifyContent:'center',padding:40}}><div className="spinner"/></div>}

      {/* Active DMs */}
      {!loading&&tab==='active'&&(
        <>
          {dms.length===0&&<div style={{fontSize:13,color:'var(--text3)',textAlign:'center',padding:'24px 0'}}>No active chats yet. Start a new chat with a teacher.</div>}
          {dms.map(dm=>(
            <div key={dm._id} style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:12,padding:14,marginBottom:10,display:'flex',alignItems:'center',gap:12}}>
              <div style={{width:40,height:40,borderRadius:10,background:'var(--purple-bg)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,fontWeight:600,color:'var(--purple)',flexShrink:0}}>
                {dm.teacher?.realName?.[0]||'T'}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:500}}>{dm.teacher?.realName||'Teacher'}</div>
                <div style={{fontSize:11,color:'var(--text3)',marginTop:2}}>
                  {dm.status==='pending'?'Awaiting acceptance…':dm.status==='declined'?'Request declined':dm.status==='accepted'?'Active chat':''}
                </div>
              </div>
              {dm.status==='accepted'&&dm.channelRef&&(
                <button onClick={()=>setActiveDM(dm)} style={{padding:'6px 14px',borderRadius:8,background:'var(--accent)',color:'#fff',border:'none',fontSize:12,fontWeight:500,cursor:'pointer'}}>Open</button>
              )}
              {dm.status==='declined'&&(
                <button onClick={()=>requestDM(dm.teacher._id||dm.teacher)} style={{padding:'6px 14px',borderRadius:8,background:'var(--bg3)',border:'1px solid var(--border)',color:'var(--text2)',fontSize:12,cursor:'pointer'}}>Re-request</button>
              )}
            </div>
          ))}
        </>
      )}

      {/* New chat: pick a teacher */}
      {!loading&&tab==='new'&&(
        <>
          <div style={{fontSize:12,color:'var(--text3)',marginBottom:12}}>Choose a teacher to start a private chat. Your identity stays anonymous unless you reveal it.</div>
          {teachers.length===0&&<div style={{fontSize:13,color:'var(--text3)',textAlign:'center',padding:'24px 0'}}>No teachers assigned to your class yet.</div>}
          {teachers.map(t=>{
            const existing=dms.find(d=>(d.teacher._id||d.teacher)===t._id||(d.teacher?._id||d.teacher)===t._id);
            return (
              <div key={t._id} style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:12,padding:14,marginBottom:10,display:'flex',alignItems:'center',gap:12}}>
                <div style={{width:40,height:40,borderRadius:10,background:'var(--purple-bg)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,fontWeight:600,color:'var(--purple)',flexShrink:0}}>
                  {t.realName?.[0]||'T'}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:500}}>{t.realName}</div>
                  <div style={{display:'flex',flexWrap:'wrap',gap:4,marginTop:4}}>
                    {(t.skillTags||[]).map(s=>(
                      <span key={s} style={{fontSize:10,padding:'2px 7px',borderRadius:10,background:'var(--accent-bg)',color:'var(--accent)'}}>{s}</span>
                    ))}
                  </div>
                </div>
                {!existing?(
                  <button onClick={()=>requestDM(t._id)} disabled={requesting===t._id} style={{padding:'6px 14px',borderRadius:8,background:'var(--accent)',color:'#fff',border:'none',fontSize:12,fontWeight:500,cursor:requesting===t._id?'not-allowed':'pointer',opacity:requesting===t._id?0.6:1}}>
                    {requesting===t._id?'Sending…':'Request Chat'}
                  </button>
                ):(
                  <span style={{fontSize:11,padding:'4px 10px',borderRadius:8,background:existing.status==='accepted'?'var(--green-bg)':existing.status==='declined'?'var(--red-bg)':'var(--amber-bg)',color:existing.status==='accepted'?'var(--green)':existing.status==='declined'?'var(--red)':'var(--amber)'}}>
                    {existing.status}
                  </span>
                )}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

// ── Teacher side: see requests + accepted chats ────────────────────────────
function TeacherDMList({ socket }) {
  const [dms,setDms]           = useState([]);
  const [activeDM,setActiveDM] = useState(null);
  const [loading,setLoading]   = useState(true);
  const [tab,setTab]           = useState('pending');

  useEffect(()=>{
    api.get('/dm').then(r=>setDms(r.data)).catch(()=>{}).finally(()=>setLoading(false));
  },[]);

  const respond = async (dmId, action) => {
    try{
      const {data}=await api.patch(`/dm/${dmId}/respond`,{action});
      setDms(prev=>prev.map(d=>d._id===dmId?data.dm:d));
      if(action==='accept') setActiveDM(data.dm);
    }catch(err){ alert(err.response?.data?.error||'Failed'); }
  };

  if(activeDM?.channelRef) return (
    <div style={{display:'flex',flexDirection:'column',height:'100%'}}>
      <div style={{padding:'12px 16px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',gap:10,background:'var(--bg2)',flexShrink:0}}>
        <button onClick={()=>setActiveDM(null)} style={{color:'var(--text3)',fontSize:14,padding:'4px 8px',borderRadius:6,background:'var(--bg3)',border:'1px solid var(--border)',cursor:'pointer'}}>←</button>
        <span style={{fontSize:13,fontWeight:500}}>
          {activeDM.studentRevealed&&activeDM.student?.realName?activeDM.student.realName:activeDM.student?.anonAlias||'Anonymous Student'}
        </span>
        {activeDM.studentRevealed&&<span style={{fontSize:11,padding:'2px 7px',borderRadius:10,background:'var(--green-bg)',color:'var(--green)'}}>Identity revealed</span>}
      </div>
      <ChatView channel={{_id:activeDM.channelRef._id||activeDM.channelRef,name:'Private Chat',type:'dm',dmId:activeDM._id}} socket={socket} isDM/>
    </div>
  );

  const pending  = dms.filter(d=>d.status==='pending');
  const accepted = dms.filter(d=>d.status==='accepted');

  return (
    <div style={{flex:1,overflowY:'auto',padding:20}}>
      <div style={{fontSize:16,fontWeight:600,marginBottom:16}}>Private Messages</div>

      <div style={{display:'flex',background:'var(--bg3)',borderRadius:10,padding:3,marginBottom:16,gap:3}}>
        {[['pending',`Requests ${pending.length?`(${pending.length})`:''}`,],['accepted','Active Chats']].map(([t,l])=>(
          <button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:'7px 0',borderRadius:8,fontSize:13,fontWeight:tab===t?500:400,background:tab===t?'var(--bg2)':'transparent',color:tab===t?'var(--text)':'var(--text3)',border:tab===t?'1px solid var(--border2)':'1px solid transparent',cursor:'pointer',transition:'all 150ms'}}>{l}</button>
        ))}
      </div>

      {loading&&<div style={{display:'flex',justifyContent:'center',padding:40}}><div className="spinner"/></div>}

      {!loading&&tab==='pending'&&(
        <>
          {pending.length===0&&<div style={{fontSize:13,color:'var(--text3)',textAlign:'center',padding:'24px 0'}}>No pending requests</div>}
          {pending.map(dm=>(
            <div key={dm._id} style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:12,padding:14,marginBottom:10}}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                <div style={{width:36,height:36,borderRadius:9,background:'var(--bg3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:600,color:'var(--text2)',flexShrink:0}}>
                  {(dm.student?.anonAlias||'A')?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div style={{fontSize:13,fontWeight:500}}>{dm.student?.anonAlias||'Anonymous Student'}</div>
                  <div style={{fontSize:11,color:'var(--text3)'}}>Wants to chat privately</div>
                </div>
              </div>
              <div style={{display:'flex',gap:8}}>
                <button onClick={()=>respond(dm._id,'accept')} style={{flex:1,padding:'8px 0',borderRadius:8,background:'var(--accent)',color:'#fff',border:'none',fontSize:12,fontWeight:500,cursor:'pointer'}}>Accept</button>
                <button onClick={()=>respond(dm._id,'decline')} style={{flex:1,padding:'8px 0',borderRadius:8,background:'var(--bg3)',border:'1px solid var(--border)',color:'var(--text2)',fontSize:12,cursor:'pointer'}}>Decline</button>
              </div>
            </div>
          ))}
        </>
      )}

      {!loading&&tab==='accepted'&&(
        <>
          {accepted.length===0&&<div style={{fontSize:13,color:'var(--text3)',textAlign:'center',padding:'24px 0'}}>No active chats</div>}
          {accepted.map(dm=>(
            <div key={dm._id} style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:12,padding:14,marginBottom:10,display:'flex',alignItems:'center',gap:12,cursor:'pointer'}} onClick={()=>setActiveDM(dm)}
              onMouseEnter={e=>(e.currentTarget.style.borderColor='var(--border2)')}
              onMouseLeave={e=>(e.currentTarget.style.borderColor='var(--border)')}
            >
              <div style={{width:40,height:40,borderRadius:10,background:'var(--bg3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:600,color:'var(--text2)',flexShrink:0}}>
                {(dm.student?.anonAlias||'A')?.[0]?.toUpperCase()}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:500}}>
                  {dm.studentRevealed&&dm.student?.realName?dm.student.realName:dm.student?.anonAlias||'Anonymous'}
                </div>
                {dm.studentRevealed&&<div style={{fontSize:11,color:'var(--green)'}}>Identity revealed</div>}
              </div>
              <span style={{fontSize:12,color:'var(--text3)'}}>Open →</span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default function DMView({ socket }) {
  const { user } = useAuth();
  if (user?.role === 'student') return <StudentDMList socket={socket} />;
  if (user?.role === 'teacher') return <TeacherDMList socket={socket} />;
  return <div style={{padding:20,color:'var(--text3)',fontSize:13}}>DMs not available for admins</div>;
}