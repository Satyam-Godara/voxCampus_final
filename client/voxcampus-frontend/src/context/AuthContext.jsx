// import { createContext, useContext, useState, useEffect } from 'react';
// import api from '../utils/api';

// const AuthContext = createContext(null);

// export const AuthProvider = ({ children }) => {
//   const [user,               setUser]               = useState(null);
//   const [channels,           setChannels]           = useState([]);
//   const [subjectTeacherMap,  setSubjectTeacherMap]  = useState({});
//   const [loading,            setLoading]            = useState(true);

//   // ── Hydrate from localStorage, then refresh from server ───────────────
//   useEffect(() => {
//     const token = localStorage.getItem('vox_token');
//     if (!token) { setLoading(false); return; }

//     // Restore cached state immediately so the UI renders without flicker
//     const cachedUser = localStorage.getItem('vox_user');
//     const cachedCh   = localStorage.getItem('vox_channels');
//     const cachedStm  = localStorage.getItem('vox_stmap');
//     if (cachedUser) {
//       setUser(JSON.parse(cachedUser));
//       setChannels(cachedCh  ? JSON.parse(cachedCh)  : []);
//       setSubjectTeacherMap(cachedStm ? JSON.parse(cachedStm) : {});
//     }

//     // Then immediately fetch fresh data from server (fixes stale teacherAssignments)
//     api.get('/auth/me')
//       .then(({ data }) => {
//         _apply(data.user, data.channels, data.subjectTeacherMap || {});
//       })
//       .catch(() => {
//         // Token invalid / expired → clear everything
//         if (!cachedUser) _clear();
//       })
//       .finally(() => setLoading(false));
//   }, []);

//   // ── Internal helpers ───────────────────────────────────────────────────
//   const _apply = (u, ch, stm) => {
//     setUser(u);
//     setChannels(ch);
//     setSubjectTeacherMap(stm);
//     localStorage.setItem('vox_user',     JSON.stringify(u));
//     localStorage.setItem('vox_channels', JSON.stringify(ch));
//     localStorage.setItem('vox_stmap',    JSON.stringify(stm));
//   };

//   const _clear = () => {
//     setUser(null);
//     setChannels([]);
//     setSubjectTeacherMap({});
//     ['vox_token', 'vox_user', 'vox_channels', 'vox_stmap'].forEach(k =>
//       localStorage.removeItem(k)
//     );
//   };

//   // ── Public API ─────────────────────────────────────────────────────────
//   const login = async (rollNo, password) => {
//     const { data } = await api.post('/auth/login', { rollNo, password });
//     localStorage.setItem('vox_token', data.token);
//     _apply(data.user, data.channels, data.subjectTeacherMap || {});
//     console.log(data);
//     return data;
//   };

//   const register = async (payload) => {
//     const { data } = await api.post('/auth/register/verify', payload);
//     localStorage.setItem('vox_token', data.token);
//     _apply(data.user, data.channels, data.subjectTeacherMap || {});
//     return data;
//   };

//   const logout = _clear;

//   // Partial update to user in state + cache (e.g. after skill tag save)
//   const updateUser = (updates) => {
//     const updated = { ...user, ...updates };
//     setUser(updated);
//     localStorage.setItem('vox_user', JSON.stringify(updated));
//   };

//   return (
//     <AuthContext.Provider
//       value={{ user, channels, subjectTeacherMap, loading, login, register, logout, updateUser }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);


import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,               setUser]               = useState(null);
  const [channels,           setChannels]           = useState([]);
  const [subjectTeacherMap,  setSubjectTeacherMap]  = useState({});
  const [loading,            setLoading]            = useState(true);

  // ── Hydrate from localStorage, then refresh from server ───────────────
  useEffect(() => {
    const token = localStorage.getItem('vox_token');
    if (!token) { setLoading(false); return; }

    // Restore cached state immediately so the UI renders without flicker
    const cachedUser = localStorage.getItem('vox_user');
    const cachedCh   = localStorage.getItem('vox_channels');
    const cachedStm  = localStorage.getItem('vox_stmap');
    if (cachedUser) {
      setUser(JSON.parse(cachedUser));
      setChannels(cachedCh  ? JSON.parse(cachedCh)  : []);
      setSubjectTeacherMap(cachedStm ? JSON.parse(cachedStm) : {});
    }

    // Then immediately fetch fresh data from server (fixes stale teacherAssignments)
    api.get('/auth/me')
      .then(({ data }) => {
        _apply(data.user, data.channels, data.subjectTeacherMap || {});
      })
      .catch(() => {
        // Token invalid / expired → clear everything
        if (!cachedUser) _clear();
      })
      .finally(() => setLoading(false));
  }, []);

  // ── Internal helpers ───────────────────────────────────────────────────
  const _apply = (u, ch, stm) => {
    setUser(u);
    setChannels(ch);
    setSubjectTeacherMap(stm);
    localStorage.setItem('vox_user',     JSON.stringify(u));
    localStorage.setItem('vox_channels', JSON.stringify(ch));
    localStorage.setItem('vox_stmap',    JSON.stringify(stm));
  };

  const _clear = () => {
    setUser(null);
    setChannels([]);
    setSubjectTeacherMap({});
    ['vox_token', 'vox_user', 'vox_channels', 'vox_stmap'].forEach(k =>
      localStorage.removeItem(k)
    );
  };

  // ── Public API ─────────────────────────────────────────────────────────
  const login = async (rollNo, password) => {
    const { data } = await api.post('/auth/login', { rollNo, password });
    localStorage.setItem('vox_token', data.token);
    _apply(data.user, data.channels, data.subjectTeacherMap || {});
    return data;
  };

  const register = async (payload) => {
    const { data } = await api.post('/auth/register/verify', payload);
    localStorage.setItem('vox_token', data.token);
    _apply(data.user, data.channels, data.subjectTeacherMap || {});
    return data;
  };

  const logout = _clear;

  // Partial update to user in state + cache (e.g. after skill tag save)
  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('vox_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{ user, channels, subjectTeacherMap, loading, login, register, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);