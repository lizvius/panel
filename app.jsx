const { useState, useEffect, useRef } = React;

    // --- GANTI URL INI DENGAN DEPLOYMENT URL APPS SCRIPT ANDA ---
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzDrmJ8WbMTy5RBKNdmBfMXIL0CKYT8xTteOqGolCPDoD8G5Ra65Yzh3N-sjLuKlRpg/exec';

    const DB = { payroll: [] };

    // HELPER: Format ke DD/MM/YYYY
    const formatToDDMMYYYY = (dateStr) => {
        if (!dateStr || dateStr === '-') return '-';
        try {
            const parts = dateStr.split('T')[0].split('-');
            if(parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr;
            return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
        } catch(e) { return dateStr; }
    };

    // KOMPONEN UI GLOBAL
    const Card = ({ children, className = '' }) => (
        <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-colors ${className}`}>{children}</div>
    );

    const Badge = ({ children, variant = 'default', className = '' }) => {
    const variants = {
        default: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
        success: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50',
        warning: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50',
        danger: 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800/50',
        indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800/50',
    };
    
    return (
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm transition-all ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};

const ProgressBar = ({ progress, label, color = 'bg-indigo-600' }) => (
    <div className="w-full">
        {/* Label & Persentase */}
        <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] sm:text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                {label}
            </span>
            <span className="text-[10px] sm:text-xs font-black text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md shadow-sm border border-gray-200 dark:border-gray-700">
                {progress}%
            </span>
        </div>
        
        {/* Track Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700/50 rounded-full h-3 overflow-hidden shadow-inner">
            {/* Inner Bar dengan Efek Shimmer */}
            <div 
                className={`h-full rounded-full ${color} transition-all duration-1000 ease-out relative overflow-hidden`} 
                style={{ width: `${progress}%` }}
            >
                {/* Efek Kilap/Shimmer */}
                <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
            </div>
        </div>

        {/* Pastikan Anda menambahkan animasi ini di CSS global atau style tag */}
        <style jsx>{`
            @keyframes shimmer {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(200%); }
            }
        `}</style>
    </div>
);



    const AuthLayout = ({ children, title, subtitle }) => (
        <div className="min-h-dvh flex items-center justify-center bg-[#F8FAFC] dark:bg-gray-900 p-4 transition-colors duration-300 relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
            <Card className="w-full max-w-md p-6 sm:p-8 relative z-10 shadow-2xl shadow-indigo-100 dark:shadow-none border-t-4 border-t-indigo-600">
                <div className="flex justify-center mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)] border-t border-indigo-400/50 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <svg className="w-8 h-8 text-white relative z-10 drop-shadow-lg group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L3 21H7.5L12 11L16.5 21H21L12 2Z" fill="currentColor"/><path d="M9.5 15H14.5L12 9.5L9.5 15Z" fill="currentColor" fillOpacity="0.4"/></svg>
                    </div>
                </div>
                <div className="text-center mb-8"><h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Recruit<span className="text-indigo-600">Ops</span></h1><p className="text-sm text-gray-500">{title}</p>{subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}</div>
                {children}
            </Card>
        </div>
    );

    const Login = ({ onLogin, onNavigateRegister }) => {
        const [showPassword, setShowPassword] = useState(false);
        const [isLoading, setIsLoading] = useState(false);
        const [errorMsg, setErrorMsg] = useState('');
        const [formData, setFormData] = useState({ username: '', password: '' });

        const handleSubmit = async (e) => {
            e.preventDefault(); setIsLoading(true); setErrorMsg('');
            try {
                const response = await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action: 'login', username: formData.username.trim(), password: formData.password }) });
                const result = await response.json();
                if (result.status === 'success') onLogin(result.user); else setErrorMsg(result.message || 'Username atau password salah.');
            } catch (error) { setErrorMsg('Terjadi kesalahan koneksi.'); } finally { setIsLoading(false); }
        };
        const inputClass = "w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium transition-all";
        return (
            <AuthLayout title="Masuk ke Platform Operasional">
                {errorMsg && <div className="mb-4 p-3 bg-rose-50 text-rose-600 rounded-xl text-xs flex items-center"><i className="ph-bold ph-warning-circle mr-2"></i><b>{errorMsg}</b></div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative"><i className="ph-bold ph-user absolute left-3 top-1/2 -translate-y-1/2 text-xl text-gray-400"></i><input type="text" placeholder="Username TG (contoh: @Oka)" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className={inputClass} disabled={isLoading} required /></div>
                    <div className="relative"><i className="ph-bold ph-lock-key absolute left-3 top-1/2 -translate-y-1/2 text-xl text-gray-400"></i><input type={showPassword ? "text" : "password"} placeholder="Password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className={inputClass} disabled={isLoading} required /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><i className={`ph-bold ${showPassword ? 'ph-eye-slash' : 'ph-eye'} text-xl`}></i></button></div>
                    <button type="submit" disabled={isLoading} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all flex items-center justify-center disabled:opacity-70">{isLoading ? <><i className="ph-bold ph-spinner ph-spin text-xl mr-2"></i> Memverifikasi...</> : "Masuk"}</button>
                </form>
                <div className="mt-6 text-center text-sm text-gray-500"><button onClick={onNavigateRegister} className="text-indigo-600 font-bold hover:underline">Daftar Akun Baru</button></div>
            </AuthLayout>
        );
    };

    const Register = ({ onRegister, onNavigateLogin }) => {
        const [isLoading, setIsLoading] = useState(false);
        const [errorMsg, setErrorMsg] = useState('');
        const [successMsg, setSuccessMsg] = useState('');
        const [formData, setFormData] = useState({ name: '', username: '', uid: '', password: '' });

        const handleSubmit = async (e) => {
            e.preventDefault(); setIsLoading(true); setErrorMsg(''); setSuccessMsg('');
            try {
                const response = await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action: 'register', name: formData.name.trim(), username: formData.username.trim(), uid: formData.uid.trim(), password: formData.password }) });
                const result = await response.json();
                if (result.status === 'success') { setSuccessMsg(result.message); setFormData({ name: '', username: '', uid: '', password: '' }); setTimeout(() => onNavigateLogin(), 3000); } else { setErrorMsg(result.message || 'Gagal mendaftar.'); }
            } catch (error) { setErrorMsg('Terjadi kesalahan koneksi.'); } finally { setIsLoading(false); }
        };
        const inputClass = "w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium transition-all";
        return (
            <AuthLayout title="Buat Akun Baru" subtitle="Pendaftaran Tim Operations">
                {errorMsg && <div className="mb-4 p-3 bg-rose-50 text-rose-600 rounded-xl text-xs flex items-center"><i className="ph-bold ph-warning-circle mr-2"></i><b>{errorMsg}</b></div>}
                {successMsg && <div className="mb-4 p-3 bg-emerald-50 text-emerald-600 rounded-xl text-xs flex items-center"><i className="ph-bold ph-check-circle mr-2"></i><b>{successMsg}</b></div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative"><i className="ph-bold ph-identification-card absolute left-3 top-1/2 -translate-y-1/2 text-xl text-gray-400"></i><input type="text" placeholder="Nama Lengkap" value={formData.name} required onChange={e => setFormData({...formData, name: e.target.value})} className={inputClass} disabled={isLoading || successMsg}/></div>
                    <div className="relative"><i className="ph-bold ph-user absolute left-3 top-1/2 -translate-y-1/2 text-xl text-gray-400"></i><input type="text" placeholder="Username TG (Tanpa Spasi)" value={formData.username} required onChange={e => setFormData({...formData, username: e.target.value})} className={inputClass} disabled={isLoading || successMsg}/></div>
                    <div className="relative"><i className="ph-bold ph-hash absolute left-3 top-1/2 -translate-y-1/2 text-xl text-gray-400"></i><input type="text" placeholder="UID Anda" value={formData.uid} required onChange={e => setFormData({...formData, uid: e.target.value})} className={inputClass} disabled={isLoading || successMsg}/></div>
                    <div className="relative"><i className="ph-bold ph-lock-key absolute left-3 top-1/2 -translate-y-1/2 text-xl text-gray-400"></i><input type="password" placeholder="Password" value={formData.password} required onChange={e => setFormData({...formData, password: e.target.value})} className={inputClass} disabled={isLoading || successMsg}/></div>
                    <button type="submit" disabled={isLoading || successMsg} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold transition-colors">{isLoading ? 'Memproses...' : 'Daftar Sekarang'}</button>
                </form>
                <div className="mt-6 text-center text-sm text-gray-500"><button onClick={onNavigateLogin} className="text-indigo-600 font-bold hover:underline">Sudah punya akun? Masuk</button></div>
            </AuthLayout>
        );
    };

    const ANNOUNCEMENT_CHANNELS = [
        { id: 'rules', name: 'Rules', icon: 'ph-push-pin', color: 'rose' },
        { id: 'announcement', name: 'Announcement', icon: 'ph-megaphone', color: 'indigo' },
        { id: 'bonus', name: 'Bonus & Reward', icon: 'ph-confetti', color: 'amber' },
        { id: 'event', name: 'Event', icon: 'ph-calendar-blank', color: 'emerald' },
        { id: 'general', name: 'General Discussion', icon: 'ph-chats', color: 'blue' }
    ];

    const AnnouncementCenter = ({ authUser }) => {
        const [activeChannel, setActiveChannel] = useState('announcement');
        const [posts, setPosts] = useState([]);
        const [newContent, setNewContent] = useState('');
        const [replyContent, setReplyContent] = useState({});
        const [isSidebarOpen, setIsSidebarOpen] = useState(false);
        const [editingPost, setEditingPost] = useState(null);
        const [editContent, setEditContent] = useState('');
        const chatEndRef = useRef(null);

        const canPost = (channelId) => channelId === 'general' || ['Superadmin', 'Admin'].includes(authUser.role);
        const canPin = () => ['Superadmin', 'Admin'].includes(authUser.role);
        const canEdit = (p) => authUser.role === 'Superadmin' || (authUser.role === 'Admin' && p.author === authUser.name) || (authUser.role === 'Staff' && p.author === authUser.name);
        const canDelete = (p) => authUser.role === 'Superadmin' || (authUser.role === 'Admin' && (p.author === authUser.name || p.role === 'Staff')) || (authUser.role === 'Staff' && p.author === authUser.name);

        const fetchPosts = async () => {
            try {
                const response = await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action: 'getAnnouncements' }) });
                const result = await response.json();
                if (result.status === 'success') {
                    setPosts(prevPosts => {
                        const pendingPosts = prevPosts.filter(p => p.isPending || p.isDeleting);
                        const safeData = Array.isArray(result.data) ? result.data : [];
                        const fetchedIds = new Set(safeData.map(p => String(p.id)));
                        const remainingPending = pendingPosts.filter(p => !fetchedIds.has(String(p.id)) && p.isPending);
                        const mergedPosts = safeData.map(serverPost => {
                            const localPost = prevPosts.find(p => String(p.id) === String(serverPost.id));
                            if (localPost && localPost.isDeleting) return { ...serverPost, isDeleting: true };
                            if (localPost && localPost.isEditing) return { ...serverPost, isEditing: true, content: localPost.content };
                            if (localPost && localPost.comments) {
                                const pendingComments = localPost.comments.filter(c => c.isPending);
                                const fetchedCommentIds = new Set(serverPost.comments.map(c => String(c.id)));
                                const remainingPendingComments = pendingComments.filter(c => !fetchedCommentIds.has(String(c.id)));
                                return { ...serverPost, comments: [...serverPost.comments, ...remainingPendingComments] };
                            }
                            return serverPost;
                        });
                        const finalPosts = [...remainingPending, ...mergedPosts];
                        localStorage.setItem('recruitOps_announcements', JSON.stringify(finalPosts.filter(p => !p.isPending && !p.isDeleting)));
                        return finalPosts;
                    });
                }
            } catch (error) { const saved = localStorage.getItem('recruitOps_announcements'); if (saved) setPosts(JSON.parse(saved)); }
        };

        useEffect(() => { fetchPosts(); const interval = setInterval(fetchPosts, 5000); return () => clearInterval(interval); }, []);
        useEffect(() => { if (activeChannel === 'general' && chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' }); }, [posts, activeChannel]);

        const handlePost = async (e) => {
            e.preventDefault(); if (!newContent.trim()) return;
            const tempId = Date.now();
            const newPost = { id: tempId, channelId: activeChannel, author: authUser.name, role: authUser.role, content: newContent, timestamp: new Date().toISOString(), likes: [], comments: [], pinned: false, isPending: true };
            setPosts(prev => [newPost, ...prev]); setNewContent('');
            try { await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action: 'addAnnouncement', ...newPost }) }); setPosts(prev => prev.map(p => p.id === tempId ? { ...p, isPending: false } : p)); } catch(err) {}
        };

        const handleToggleLike = async (postId) => {
            const post = posts.find(p => p.id === postId); if (!post) return;
            const newLikes = post.likes.includes(authUser.name) ? post.likes.filter(n => n !== authUser.name) : [...post.likes, authUser.name];
            setPosts(posts.map(p => p.id === postId ? { ...p, likes: newLikes } : p));
            try { await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action: 'updateAnnouncement', id: postId, likes: newLikes }) }); } catch(err) {}
        };

        const handleTogglePin = async (postId) => {
            const post = posts.find(p => p.id === postId); if (!post) return;
            const newPinned = !post.pinned; setPosts(posts.map(p => p.id === postId ? { ...p, pinned: newPinned } : p));
            try { await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action: 'updateAnnouncement', id: postId, pinned: newPinned }) }); } catch(err) {}
        };

        const handleDelete = async (postId) => {
            if (!window.confirm("Yakin hapus pesan ini?")) return;
            setPosts(prev => prev.map(p => p.id === postId ? { ...p, isDeleting: true } : p));
            try { await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action: 'deleteAnnouncement', id: postId }) }); setPosts(prev => prev.filter(p => p.id !== postId)); } catch(err) { setPosts(prev => prev.map(p => p.id === postId ? { ...p, isDeleting: false } : p)); }
        };

        const handleEditSubmit = async (e) => {
            e.preventDefault(); if (!editContent.trim()) return;
            const postId = editingPost.id;
            setPosts(prev => prev.map(p => p.id === postId ? { ...p, content: editContent, isEditing: true } : p)); setEditingPost(null); setEditContent('');
            try { await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action: 'updateAnnouncement', id: postId, content: editContent }) }); setPosts(prev => prev.map(p => p.id === postId ? { ...p, isEditing: false } : p)); } catch(err) { setPosts(prev => prev.map(p => p.id === postId ? { ...p, isEditing: false } : p)); }
        };

        const handleComment = async (e, postId) => {
            e.preventDefault(); const text = replyContent[postId]; if (!text || !text.trim()) return;
            const post = posts.find(p => p.id === postId); if (!post) return;
            const tempCommentId = Date.now();
            const newComment = { id: tempCommentId, author: authUser.name, content: text, timestamp: new Date().toISOString(), isPending: true };
            const newComments = [...post.comments, newComment];
            setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: newComments } : p)); setReplyContent({ ...replyContent, [postId]: '' });
            try {
                const payloadComments = newComments.map(c => { const { isPending, ...rest } = c; return rest; });
                await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action: 'updateAnnouncement', id: postId, comments: payloadComments }) });
                setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: p.comments.map(c => c.id === tempCommentId ? { ...c, isPending: false } : c) } : p));
            } catch(err) {}
        };

        const formatTime = (isoString) => {
            if (!isoString) return '-'; const d = new Date(isoString); if (isNaN(d.getTime())) return '-';
            return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' - ' + formatToDDMMYYYY(isoString);
        };

        const currentPosts = posts.filter(p => p.channelId === activeChannel).sort((a, b) => {
            if(activeChannel === 'general') return new Date(a.timestamp) - new Date(b.timestamp); 
            if (a.pinned !== b.pinned) return b.pinned ? 1 : -1;
            return new Date(b.timestamp) - new Date(a.timestamp); 
        });

        const renderFeedPost = (p) => (
            <div key={p.id} className={`p-4 mb-4 rounded-xl border ${p.pinned ? 'bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'} shadow-sm relative group transition-all duration-300 ${p.isPending || p.isDeleting || p.isEditing ? 'opacity-60 grayscale-[30%]' : ''}`}>
                {p.pinned && <div className="absolute -top-3 -right-2 text-indigo-500 bg-indigo-100 dark:bg-indigo-900 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center shadow-sm"><i className="ph-fill ph-push-pin mr-1"></i> Pinned</div>}
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-lg shadow-inner">{p.author ? p.author.charAt(0).toUpperCase() : '?'}</div>
                        <div>
                            <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">{p.author || 'Unknown'} <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider ${p.role === 'Superadmin' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' : p.role === 'Admin' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>{p.role}</span></div>
                            <div className="text-xs text-gray-500 flex items-center">{formatTime(p.timestamp)}{p.isPending && <span className="italic ml-2 flex items-center text-indigo-500 font-medium"><i className="ph-bold ph-spinner ph-spin mr-1"></i> Mengirim...</span>}{p.isDeleting && <span className="italic ml-2 flex items-center text-rose-500 font-medium"><i className="ph-bold ph-spinner ph-spin mr-1"></i> Menghapus...</span>}{p.isEditing && <span className="italic ml-2 flex items-center text-blue-500 font-medium"><i className="ph-bold ph-spinner ph-spin mr-1"></i> Menyimpan...</span>}</div>
                        </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {canPin() && !p.isPending && !p.isDeleting && !p.isEditing && <button onClick={() => handleTogglePin(p.id)} className={`p-1.5 rounded ${p.pinned ? 'text-indigo-500' : 'text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30'}`}><i className="ph-bold ph-push-pin text-lg"></i></button>}
                        {canEdit(p) && !p.isPending && !p.isDeleting && !p.isEditing && <button onClick={() => { setEditingPost(p); setEditContent(p.content); }} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"><i className="ph-bold ph-pencil-simple text-lg"></i></button>}
                        {canDelete(p) && !p.isPending && !p.isEditing && <button disabled={p.isDeleting} onClick={() => handleDelete(p.id)} className={`p-1.5 rounded ${p.isDeleting ? 'text-gray-300' : 'text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30'}`}><i className="ph-bold ph-trash text-lg"></i></button>}
                    </div>
                </div>
                {editingPost?.id === p.id ? (
                    <form onSubmit={handleEditSubmit} className="mt-2 mb-4 ml-13 pl-13"><textarea className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-sm" rows="3" value={editContent} onChange={(e) => setEditContent(e.target.value)} autoFocus /><div className="flex gap-2 mt-2 justify-end"><button type="button" onClick={() => setEditingPost(null)} className="px-4 py-1.5 text-sm font-bold text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 rounded-lg transition-colors">Batal</button><button type="submit" className="px-4 py-1.5 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-sm">Simpan</button></div></form>
                ) : <div className="text-gray-800 dark:text-gray-200 text-sm whitespace-pre-wrap mb-4 ml-13 pl-13">{p.content}</div>}
                <div className="flex items-center gap-4 pt-3 border-t border-gray-100 dark:border-gray-700"><button disabled={p.isPending || p.isDeleting || p.isEditing} onClick={() => handleToggleLike(p.id)} className={`flex items-center gap-1.5 text-sm font-bold transition-colors ${p.likes.includes(authUser.name) ? 'text-rose-500' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'} disabled:opacity-50`}><i className={`${p.likes.includes(authUser.name) ? 'ph-fill' : 'ph-bold'} ph-heart text-lg`}></i> {p.likes.length > 0 && p.likes.length} Like</button><span className="text-sm text-gray-500 font-bold flex items-center gap-1.5"><i className="ph-bold ph-chat-circle text-lg"></i> {p.comments.length} Komentar</span></div>
                {p.comments.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-700/50 space-y-3">
                        {p.comments.map(c => (
                            <div key={c.id} className={`flex gap-3 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg ${c.isPending ? 'opacity-60 grayscale-[30%]' : ''}`}><div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center font-bold text-xs shrink-0">{c.author ? c.author.charAt(0).toUpperCase() : '?'}</div><div className="flex-1"><div className="flex justify-between items-baseline"><span className="font-bold text-xs">{c.author || 'Unknown'}</span><span className="text-[10px] text-gray-500 flex items-center">{c.isPending && <span className="italic mr-2 flex items-center text-indigo-500"><i className="ph-bold ph-spinner ph-spin mr-1"></i> Mengirim...</span>}{formatTime(c.timestamp)}</span></div><div className="text-sm mt-0.5 text-gray-700 dark:text-gray-300">{c.content}</div></div></div>
                        ))}
                    </div>
                )}
                <form onSubmit={(e) => handleComment(e, p.id)} className="mt-3 flex gap-2 relative"><input type="text" disabled={p.isPending || p.isDeleting || p.isEditing} placeholder={p.isPending || p.isDeleting || p.isEditing ? "Harap tunggu..." : "Tulis komentar..."} value={replyContent[p.id] || ''} onChange={e => setReplyContent({...replyContent, [p.id]: e.target.value})} className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full px-4 py-2 text-sm outline-none focus:border-indigo-500 transition-colors disabled:opacity-50" /><button type="submit" disabled={!replyContent[p.id] || p.isPending || p.isDeleting || p.isEditing} className="p-2 bg-indigo-600 text-white rounded-full disabled:opacity-50 hover:bg-indigo-700 transition-colors"><i className="ph-bold ph-paper-plane-right"></i></button></form>
            </div>
        );

        const renderChatMessage = (p) => {
            const isMe = p.author === authUser.name;
            return (
                <div key={p.id} className={`flex gap-3 mb-4 ${isMe ? 'flex-row-reverse' : ''} group transition-all duration-300 ${p.isPending || p.isDeleting || p.isEditing ? 'opacity-60 grayscale-[30%]' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 text-white ${isMe ? 'bg-indigo-500' : 'bg-gray-400 dark:bg-gray-600'}`}>{p.author ? p.author.charAt(0).toUpperCase() : '?'}</div>
                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                        <div className="flex items-baseline gap-2 mb-1"><span className="font-bold text-xs text-gray-600 dark:text-gray-400">{p.author || 'Unknown'}</span><span className="text-[10px] text-gray-400 flex items-center">{p.isPending && <span className="italic mr-1 flex items-center text-indigo-400"><i className="ph-bold ph-spinner ph-spin mr-1"></i> Mengirim...</span>}{p.isDeleting && <span className="italic mr-1 flex items-center text-rose-400"><i className="ph-bold ph-spinner ph-spin mr-1"></i> Menghapus...</span>}{p.isEditing && <span className="italic mr-1 flex items-center text-blue-400"><i className="ph-bold ph-spinner ph-spin mr-1"></i> Menyimpan...</span>}{formatTime(p.timestamp)}</span></div>
                        <div className={`px-4 py-2.5 rounded-2xl text-sm ${isMe ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-tl-sm shadow-sm'}`}>
                            {editingPost?.id === p.id ? (
                                <form onSubmit={handleEditSubmit} className="min-w-[200px]"><textarea className={`w-full p-2 border rounded text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-xs ${isMe ? 'bg-indigo-500 border-indigo-400 text-white placeholder-indigo-300' : 'bg-gray-50 border-gray-300 dark:bg-gray-700 dark:border-gray-600'}`} rows="2" value={editContent} onChange={(e) => setEditContent(e.target.value)} autoFocus /><div className="flex gap-2 mt-2 justify-end"><button type="button" onClick={() => setEditingPost(null)} className={`px-2 py-1 text-xs font-bold rounded ${isMe ? 'text-indigo-200 hover:bg-indigo-700' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>Batal</button><button type="submit" className={`px-2 py-1 text-xs font-bold rounded ${isMe ? 'bg-white text-indigo-600 hover:bg-gray-100' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>Simpan</button></div></form>
                            ) : p.content}
                        </div>
                        <div className="flex gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity"><button disabled={p.isPending || p.isDeleting || p.isEditing} onClick={() => handleToggleLike(p.id)} className={`text-[10px] font-bold flex items-center gap-1 ${p.likes.includes(authUser.name) ? 'text-rose-500' : 'text-gray-400 hover:text-gray-600'} disabled:opacity-50`}><i className={`${p.likes.includes(authUser.name) ? 'ph-fill' : 'ph-bold'} ph-heart text-xs`}></i> {p.likes.length > 0 && p.likes.length}</button>{canEdit(p) && !p.isPending && !p.isDeleting && !p.isEditing && <button onClick={() => { setEditingPost(p); setEditContent(p.content); }} className="text-[10px] font-bold text-blue-400 hover:text-blue-600"><i className="ph-bold ph-pencil-simple"></i></button>}{canDelete(p) && !p.isPending && !p.isEditing && <button disabled={p.isDeleting} onClick={() => handleDelete(p.id)} className={`text-[10px] font-bold ${p.isDeleting ? 'text-gray-300' : 'text-rose-400 hover:text-rose-600'}`}><i className="ph-bold ph-trash"></i></button>}</div>
                    </div>
                </div>
            );
        };

        const activeChannelInfo = ANNOUNCEMENT_CHANNELS.find(c => c.id === activeChannel);

        return (
            <div className="h-[calc(100vh-8rem)] md:h-[calc(100vh-10rem)] flex bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden relative">
                <div className={`absolute md:relative z-20 w-64 h-full bg-gray-50 dark:bg-gray-800/80 backdrop-blur-md border-r border-gray-200 dark:border-gray-700 flex flex-col transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center"><h2 className="font-black text-sm uppercase tracking-widest text-gray-500 flex items-center"><i className="ph-bold ph-hash mr-2"></i> Channels</h2><button className="md:hidden text-gray-500" onClick={()=>setIsSidebarOpen(false)}><i className="ph-bold ph-x text-lg"></i></button></div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
                        {ANNOUNCEMENT_CHANNELS.map(c => {
                            const unreadCount = posts.filter(p => p.channelId === c.id && new Date(p.timestamp) > new Date(Date.now() - 86400000)).length; 
                            return (
                            <button key={c.id} onClick={() => { setActiveChannel(c.id); setIsSidebarOpen(false); }} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-bold transition-all ${activeChannel === c.id ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-700 dark:hover:text-gray-300'}`}><div className="flex items-center"><i className={`ph-bold ${c.icon} mr-3 text-lg text-${c.color}-500`}></i> {c.name}</div>{unreadCount > 0 && <span className="bg-indigo-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{unreadCount}</span>}</button>
                        )})}
                    </div>
                </div>
                <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC] dark:bg-gray-900">
                    <div className="h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 shrink-0 shadow-sm z-10"><button className="md:hidden mr-3 text-gray-500" onClick={()=>setIsSidebarOpen(true)}><i className="ph-bold ph-list text-xl"></i></button><i className={`ph-bold ${activeChannelInfo.icon} text-xl text-${activeChannelInfo.color}-500 mr-2`}></i><h3 className="font-bold text-gray-900 dark:text-white">{activeChannelInfo.name}</h3>{activeChannel === 'rules' && <span className="ml-3 text-xs bg-rose-100 text-rose-600 px-2 py-0.5 rounded font-bold">Harap Dibaca</span>}</div>
                    <div className={`flex-1 overflow-y-auto p-4 custom-scrollbar ${activeChannel === 'general' ? 'bg-[url("https://www.transparenttextures.com/patterns/cubes.png")] dark:bg-none' : ''}`}>
                        {currentPosts.length === 0 ? <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50"><i className={`ph-bold ${activeChannelInfo.icon} text-6xl mb-3`}></i><p>Belum ada postingan di channel ini.</p></div> : activeChannel === 'general' ? currentPosts.map(renderChatMessage) : currentPosts.map(renderFeedPost)}
                        <div ref={chatEndRef} />
                    </div>
                    {canPost(activeChannel) ? (
                        <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shrink-0">
                            <form onSubmit={handlePost} className="relative">
                                {activeChannel === 'general' ? (
                                    <div className="flex items-end gap-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-2 focus-within:border-indigo-500 transition-colors"><input type="text" placeholder="Ketik pesan..." value={newContent} onChange={e => setNewContent(e.target.value)} className="flex-1 bg-transparent border-none outline-none px-3 py-2 text-sm" /><button type="submit" disabled={!newContent.trim()} className="p-2.5 bg-indigo-600 text-white rounded-lg disabled:opacity-50 transition-colors"><i className="ph-bold ph-paper-plane-right"></i></button></div>
                                ) : (
                                    <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 focus-within:border-indigo-500 transition-colors shadow-sm"><textarea rows="3" placeholder={`Buat postingan baru di #${activeChannelInfo.name}...`} value={newContent} onChange={e => setNewContent(e.target.value)} className="w-full bg-transparent border-none outline-none resize-none text-sm custom-scrollbar"></textarea><div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200 dark:border-gray-700"><div className="text-xs text-gray-400 font-medium"><i className="ph-bold ph-info mr-1"></i> Posting sebagai <span className="font-bold text-indigo-500">{authUser.role}</span></div><button type="submit" disabled={!newContent.trim()} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold flex items-center disabled:opacity-50"><i className="ph-bold ph-paper-plane-right mr-2"></i> Posting</button></div></div>
                                )}
                            </form>
                        </div>
                    ) : <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 text-center text-xs text-gray-500 font-bold shrink-0"><i className="ph-bold ph-lock-key mr-1"></i> Hanya Admin & Superadmin yang dapat membuat postingan di channel ini.</div>}
                </div>
            </div>
        );
    };



const ExecutiveDashboard = ({ authUser }) => {
    const [stats, setStats] = useState({ total: 0, pending: 0, active: 0, failed: 0, recruiters: 0, thisWeek: 0 });
    const [alerts, setAlerts] = useState({ highRisk: 0, mediumRisk: 0 });
    const [isLoading, setIsLoading] = useState(true);

    const isPrivileged = authUser && ['Superadmin', 'Admin'].includes(authUser.role);

    const getMondayStr = (dateInput) => { if (!dateInput) return ""; const d = new Date(dateInput); if (isNaN(d.getTime())) return ""; const localDay = d.getDay() || 7; const target = new Date(d.getTime()); target.setDate(d.getDate() - localDay + 1); return `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}-${String(target.getDate()).padStart(2, '0')}`; };
    const getOffsetMondayStr = (offsetWeeks = 0) => { const d = new Date(); const day = d.getDay() || 7; d.setHours(0,0,0,0); d.setDate(d.getDate() - day + 1 + (offsetWeeks * 7)); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

    useEffect(() => {
        const fetchDashboardStats = async () => {
            setIsLoading(true);
            try {
                const resUsers = await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action: 'getUsers' }) });
                const dataUsers = await resUsers.json();
                let activeRecruiters = 0; if (dataUsers.status === 'success') { const safeUsers = Array.isArray(dataUsers.data) ? dataUsers.data : []; activeRecruiters = safeUsers.filter(u => u.role === 'Staff' && (u.status === 'Aktif' || u.status === 'Online')).length; }

                const resData = await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action: 'getDailyData', role: authUser ? authUser.role : null, username: authUser ? authUser.username : null, name: authUser ? authUser.name : null }) });
                const resultData = await resData.json();

                if (resultData.status === 'success') {
                    let filteredData = Array.isArray(resultData.data) ? resultData.data : [];
                    
                    if (!isPrivileged) {
                        filteredData = filteredData.filter(d => d.recruiter === authUser.username || d.recruiter === authUser.name);
                    }

                    const thisWeekMonday = getOffsetMondayStr(0); const today = new Date(); today.setHours(0,0,0,0);
                    let sTotal = filteredData.length, sPending = 0, sActive = 0, sFailed = 0, sThisWeek = 0, aHighRisk = 0, aMediumRisk = 0; 

                    filteredData.forEach(d => {
                        if (d.results === 'Pending') sPending++; if (d.results === 'Acc') sActive++; if (d.results === 'Reject') sFailed++;
                        if (getMondayStr(d.tanggal) === thisWeekMonday) sThisWeek++;
                        if (d.results === 'Pending' && d.tanggal) {
                            const inputDate = new Date(d.tanggal);
                            if (!isNaN(inputDate.getTime())) {
                                inputDate.setHours(0,0,0,0); const diffDays = Math.ceil(Math.abs(today - inputDate) / (1000 * 60 * 60 * 24));
                                if (diffDays > 7) aHighRisk++; else if (diffDays > 3) aMediumRisk++;
                            }
                        }
                    });
                    setStats({ total: sTotal, pending: sPending, active: sActive, failed: sFailed, recruiters: activeRecruiters, thisWeek: sThisWeek });
                    setAlerts({ highRisk: aHighRisk, mediumRisk: aMediumRisk });
                }
            } catch (error) {} finally { setIsLoading(false); }
        };
        if (authUser) fetchDashboardStats();
    }, [authUser, isPrivileged]);

    const funnelDihubungi = stats.total, funnelWawancara = stats.active + stats.failed, funnelDiterima = stats.active;
    const pctDihubungi = stats.total > 0 ? 100 : 0, pctWawancara = stats.total > 0 ? Math.round((funnelWawancara / stats.total) * 100) : 0, pctDiterima = stats.total > 0 ? Math.round((funnelDiterima / stats.total) * 100) : 0;

    const statCards = [
        { label: `Total Leads ${!isPrivileged ? 'Anda' : ''}`, value: stats.total, icon: 'ph-users', color: 'blue', grad: 'from-blue-500 to-indigo-600' },
        { label: 'Pending', value: stats.pending, icon: 'ph-clock', color: 'amber', grad: 'from-amber-400 to-orange-500' },
        { label: 'Aktif/Yes', value: stats.active, icon: 'ph-check-circle', color: 'emerald', grad: 'from-emerald-400 to-teal-500' },
        { label: 'Gugur/No', value: stats.failed, icon: 'ph-warning-circle', color: 'rose', grad: 'from-rose-400 to-red-500' },
        { label: 'Recruiter Aktif', value: stats.recruiters, icon: 'ph-user-gear', color: 'indigo', grad: 'from-indigo-400 to-purple-500' },
        { label: 'Minggu Ini', value: stats.thisWeek, icon: 'ph-trend-up', color: 'violet', grad: 'from-violet-400 to-fuchsia-500' }
    ];

    return (
        <div className="space-y-4 sm:space-y-6 lg:space-y-8 animate-in fade-in duration-500 pb-8">
            
            {/* Header Dashboard Responsif */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 sm:gap-4 bg-white/60 dark:bg-gray-800/60 p-4 sm:p-6 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-md shadow-sm">
                <div className="w-full md:w-auto">
                    <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                        <i className="ph-fill ph-squares-four text-indigo-500 animate-pulse"></i> Executive Overview
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 sm:mt-1.5 leading-relaxed">
                        Ringkasan performa rekrutmen {isPrivileged ? 'seluruh tim' : 'pribadi Anda'} secara *real-time*.
                    </p>
                </div>
                <div className="w-full md:w-auto text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center bg-white/80 dark:bg-gray-900/80 px-3 py-2 rounded-lg border border-gray-200/80 dark:border-gray-700/80 shadow-inner">
                    <i className="ph-bold ph-calendar-blank mr-1.5 text-indigo-500"></i> {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
            </div>

            {/* Grid Kartu Statistik (2 kolom di HP, 3 di Tablet, 6 di Laptop) */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
                {statCards.map((card, idx) => (
                    <div key={idx} className="relative group overflow-hidden rounded-xl sm:rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        
                        {isLoading && (
                            <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm z-20 flex justify-center items-center">
                                <i className={`ph-bold ph-spinner ph-spin text-2xl text-${card.color}-500`}></i>
                            </div>
                        )}
                        
                        {/* Garis Aksen Atas */}
                        <div className={`absolute top-0 left-0 w-full h-1 sm:h-1.5 bg-gradient-to-r ${card.grad}`}></div>
                        
                        <div className="p-3 sm:p-4 lg:p-5 flex flex-col justify-between h-full relative z-10">
                            <div className="flex justify-between items-start mb-2 sm:mb-4">
                                <span className="text-[9px] sm:text-[10px] lg:text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold leading-tight break-words max-w-[70%]">
                                    {card.label}
                                </span>
                                <div className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-${card.color}-50 dark:bg-${card.color}-900/20 text-${card.color}-500 dark:text-${card.color}-400 group-hover:scale-110 transition-transform duration-300 shadow-inner`}>
                                    <i className={`ph-fill ${card.icon} text-base sm:text-lg lg:text-xl`}></i>
                                </div>
                            </div>
                            <div className="flex items-end justify-between mt-1 sm:mt-0">
                                <span className={`text-2xl sm:text-3xl lg:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-br ${card.grad} drop-shadow-sm`}>
                                    {isLoading ? '-' : card.value}
                                </span>
                                <i className={`ph-fill ${card.icon} absolute -bottom-3 -right-2 sm:-bottom-4 sm:-right-2 text-5xl sm:text-6xl lg:text-7xl opacity-[0.04] dark:opacity-[0.03] group-hover:scale-125 transition-transform duration-500`}></i>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bagian Bawah: Funnel & Alerts (Menumpuk di HP, Sebelahan di Laptop) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                
                {/* Recruitment Funnel Card (Responsive Widths) */}
                <div className="lg:col-span-2 relative bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-gray-700 shadow-lg overflow-hidden flex flex-col min-h-[300px]">
                    <div className="absolute -top-16 -right-16 sm:-top-24 sm:-right-24 w-48 h-48 sm:w-64 sm:h-64 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
                    
                    {isLoading && (
                        <div className="absolute inset-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md z-20 flex justify-center items-center">
                            <div className="flex flex-col items-center gap-2 sm:gap-3">
                                <i className="ph-bold ph-spinner ph-spin text-indigo-500 text-3xl sm:text-4xl"></i>
                                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-indigo-500">Menganalisis...</span>
                            </div>
                        </div>
                    )}

                    <div className="p-4 sm:p-6 lg:p-8 flex-1 relative z-10 flex flex-col">
                        <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center mb-6 sm:mb-8 gap-3 border-b border-gray-100 dark:border-gray-700/50 pb-4">
                            <h3 className="font-black text-base sm:text-lg lg:text-xl flex items-center text-gray-800 dark:text-white">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mr-2 sm:mr-3 text-indigo-600 dark:text-indigo-400">
                                    <i className="ph-fill ph-funnel text-lg sm:text-xl"></i>
                                </div>
                                Recruitment Funnel {isPrivileged ? '(Global)' : '(Personal)'}
                            </h3>
                            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest shadow-inner w-max">
                                All Time
                            </span>
                        </div>

                        {/* Implementasi Funnel dengan Flex dan Persentase Lebar agar aman di Layar HP */}
                        <div className="space-y-5 sm:space-y-6 flex-1 flex flex-col justify-center">
                            
                            {/* Step 1: Leads (100% Width) */}
                            <div className="w-full group">
                                <div className="flex justify-between items-end text-[10px] sm:text-xs lg:text-sm mb-1.5 sm:mb-2">
                                    <span className="font-bold text-gray-700 dark:text-gray-300 flex items-center flex-wrap">
                                        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-500 mr-1.5 sm:mr-2 shadow-[0_0_8px_rgba(59,130,246,0.6)] shrink-0"></span>
                                        <span className="mr-1">Total Leads</span> 
                                        <span className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded font-black text-[9px] sm:text-xs">({funnelDihubungi})</span>
                                    </span>
                                    <span className="text-blue-600 dark:text-blue-400 font-black">{pctDihubungi}%</span>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-gray-700/50 rounded-full h-2.5 sm:h-3 lg:h-4 overflow-hidden shadow-inner relative">
                                    <div className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-1000 ease-out relative overflow-hidden group-hover:brightness-110" style={{ width: `${pctDihubungi}%` }}>
                                        <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Step 2: Proses (90% Width, geser 10% dari kiri) */}
                            <div className="w-[90%] sm:w-[92%] ml-[10%] sm:ml-[8%] group relative">
                                {/* Garis penghubung visual */}
                                <div className="absolute -left-3 sm:-left-4 lg:-left-6 top-1/2 -translate-y-1/2 w-2.5 sm:w-3 lg:w-5 border-t-2 border-dashed border-gray-200 dark:border-gray-700"></div>
                                
                                <div className="flex justify-between items-end text-[10px] sm:text-xs lg:text-sm mb-1.5 sm:mb-2 border-l-2 border-dashed border-gray-200 dark:border-gray-700 pl-3 sm:pl-4 lg:pl-6 -ml-3 sm:-ml-4 lg:-ml-6">
                                    <span className="font-bold text-gray-700 dark:text-gray-300 flex items-center flex-wrap">
                                        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-500 mr-1.5 sm:mr-2 shadow-[0_0_8px_rgba(245,158,11,0.6)] shrink-0"></span>
                                        <span className="mr-1">Diproses</span> 
                                        <span className="px-1.5 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded font-black text-[9px] sm:text-xs">({funnelWawancara})</span>
                                    </span>
                                    <span className="text-amber-600 dark:text-amber-400 font-black">{pctWawancara}%</span>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-gray-700/50 rounded-full h-2.5 sm:h-3 lg:h-4 overflow-hidden shadow-inner relative ml-0 border-l-2 border-transparent">
                                    <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-1000 ease-out delay-150 relative overflow-hidden group-hover:brightness-110" style={{ width: `${pctWawancara}%` }}>
                                        <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite_0.5s]"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Step 3: Diterima (80% Width, geser 20% dari kiri) */}
                            <div className="w-[80%] sm:w-[84%] ml-[20%] sm:ml-[16%] group relative">
                                <div className="absolute -left-3 sm:-left-4 lg:-left-6 top-1/2 -translate-y-1/2 w-2.5 sm:w-3 lg:w-5 border-t-2 border-dashed border-gray-200 dark:border-gray-700"></div>
                                
                                <div className="flex justify-between items-end text-[10px] sm:text-xs lg:text-sm mb-1.5 sm:mb-2 border-l-2 border-dashed border-gray-200 dark:border-gray-700 pl-3 sm:pl-4 lg:pl-6 -ml-3 sm:-ml-4 lg:-ml-6">
                                    <span className="font-bold text-gray-700 dark:text-gray-300 flex items-center flex-wrap">
                                        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 mr-1.5 sm:mr-2 shadow-[0_0_8px_rgba(16,185,129,0.6)] shrink-0"></span>
                                        <span className="mr-1">Diterima (ACC)</span> 
                                        <span className="px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded font-black text-[9px] sm:text-xs">({funnelDiterima})</span>
                                    </span>
                                    <span className="text-emerald-600 dark:text-emerald-400 font-black">{pctDiterima}%</span>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-gray-700/50 rounded-full h-2.5 sm:h-3 lg:h-4 overflow-hidden shadow-inner relative ml-0 border-l-2 border-transparent">
                                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-1000 ease-out delay-300 relative overflow-hidden group-hover:brightness-110" style={{ width: `${pctDiterima}%` }}>
                                        <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite_1s]"></div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Follow Up Alerts Card (Batasi tinggi di HP agar tidak makan layar penuh) */}
                <div className="relative bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-gray-700 shadow-lg overflow-hidden flex flex-col max-h-[350px] lg:max-h-none">
                    <div className="absolute top-0 right-0 w-full h-1.5 sm:h-2 bg-gradient-to-r from-rose-500 to-amber-500"></div>
                    
                    {isLoading && (
                        <div className="absolute inset-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md z-20 flex justify-center items-center">
                             <div className="w-8 h-8 sm:w-10 sm:h-10 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin"></div>
                        </div>
                    )}

                    <div className="p-4 sm:p-5 lg:p-6 flex flex-col h-full relative z-10">
                        <h3 className="font-black text-base sm:text-lg mb-4 sm:mb-6 flex items-center text-gray-800 dark:text-white border-b border-gray-100 dark:border-gray-700/50 pb-3 sm:pb-4 shrink-0">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center mr-2 sm:mr-3 text-rose-500 animate-pulse">
                                <i className="ph-fill ph-warning-circle text-lg sm:text-xl"></i>
                            </div>
                            Follow Up Alerts
                        </h3>
                        
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 sm:pr-2 space-y-3 sm:space-y-4">
                            {alerts.highRisk === 0 && alerts.mediumRisk === 0 ? (
                                <div className="h-full min-h-[150px] lg:min-h-[200px] flex flex-col items-center justify-center text-gray-400 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100/50 dark:border-emerald-800/30 p-4">
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center mb-2 sm:mb-3 text-emerald-500 shadow-inner">
                                        <i className="ph-fill ph-check-circle text-3xl sm:text-4xl"></i>
                                    </div>
                                    <p className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-500 text-center">Semua Data Aman!</p>
                                    <p className="text-[9px] sm:text-[10px] mt-1 text-center opacity-70">Tidak ada kandidat pending melewati batas kritis.</p>
                                </div>
                            ) : (
                                <div className="space-y-3 sm:space-y-4 pb-2">
                                    {alerts.highRisk > 0 && (
                                        <div className="p-3 sm:p-4 bg-gradient-to-br from-rose-50 to-white dark:from-rose-950/30 dark:to-gray-800/50 rounded-xl sm:rounded-2xl border border-rose-200 dark:border-rose-800/50 shadow-sm relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-12 h-12 sm:w-16 sm:h-16 bg-rose-500/10 rounded-bl-full"></div>
                                            <div className="flex items-start gap-2.5 sm:gap-3 relative z-10">
                                                <div className="bg-rose-100 dark:bg-rose-900/50 p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-rose-600 dark:text-rose-400 shrink-0">
                                                    <i className="ph-fill ph-siren text-lg sm:text-xl animate-pulse"></i>
                                                </div>
                                                <div>
                                                    <span className="text-rose-700 dark:text-rose-400 font-black text-xs sm:text-sm block mb-0.5 sm:mb-1">
                                                        {alerts.highRisk} Kandidat &gt; 7 Hari
                                                    </span>
                                                    <span className="text-rose-600/80 dark:text-rose-400/80 text-[9px] sm:text-xs font-medium leading-relaxed block">
                                                        Risiko sangat tinggi. Segera eksekusi di menu <b className="underline decoration-dashed cursor-help">Follow Up</b>.
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {alerts.mediumRisk > 0 && (
                                        <div className="p-3 sm:p-4 bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/30 dark:to-gray-800/50 rounded-xl sm:rounded-2xl border border-amber-200 dark:border-amber-800/50 shadow-sm relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-12 h-12 sm:w-16 sm:h-16 bg-amber-500/10 rounded-bl-full"></div>
                                            <div className="flex items-start gap-2.5 sm:gap-3 relative z-10">
                                                <div className="bg-amber-100 dark:bg-amber-900/50 p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-amber-600 dark:text-amber-400 shrink-0">
                                                    <i className="ph-fill ph-clock-countdown text-lg sm:text-xl"></i>
                                                </div>
                                                <div>
                                                    <span className="text-amber-700 dark:text-amber-400 font-black text-xs sm:text-sm block mb-0.5 sm:mb-1">
                                                        {alerts.mediumRisk} Kandidat &gt; 3 Hari
                                                    </span>
                                                    <span className="text-amber-600/80 dark:text-amber-400/80 text-[9px] sm:text-xs font-medium leading-relaxed block">
                                                        {isPrivileged ? 'Arahkan staf terkait untuk update kepastian.' : 'Segera follow up dan update status kandidat ini.'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            <style jsx>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(200%); }
                }
            `}</style>
        </div>
    );
};

const DailyData = ({ authUser }) => {
    const [data, setData] = useState([]);
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [activeTab, setActiveTab] = useState('thisWeek'); 
    const [historyFilter, setHistoryFilter] = useState(-1); 
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    const initialForm = {
        id: '',
        tanggal: new Date().toISOString().split('T')[0],
        recruiter: '',
        channels: 'Instagram',
        email: '',
        wa: '',
        uid: '',
        username: '',
        results: 'Pending',
        grup: 'T0-SANDI'
    };

    const [formData, setFormData] = useState(initialForm);
    const isPrivileged = authUser && ['Superadmin', 'Admin'].includes(authUser.role);

    const getMondayStr = (dateInput) => {
        if (!dateInput)
            return "";
        const d = new Date(dateInput);
        if (isNaN(d.getTime()))
            return "";
        const localDay = d.getDay() || 7;
        const target = new Date(d.getTime());
        target.setDate(d.getDate() - localDay + 1);
        return `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}-${String(target.getDate()).padStart(2, '0')}`;
    };

    const getOffsetMondayStr = (offsetWeeks = 0) => {
        const d = new Date();
        const day = d.getDay() || 7;
        d.setHours(0,0,0,0);
        d.setDate(d.getDate() - day + 1 + (offsetWeeks * 7));
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    const formatToDDMMYYYY = (dateStr) => {
        if (!dateStr)
            return '-';
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? dateStr : `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    };

    const thisWeekMonday = getOffsetMondayStr(0);
    const isThursday = new Date().getDay() === 4;

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const resUsers = await fetch(SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'getUsers'
                })
            });
            const dataUsers = await resUsers.json();
            if (dataUsers.status === 'success') {
                setUsers(Array.isArray(dataUsers.data) ? dataUsers.data : []);
            }

            const resData = await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action: 'getDailyData', role: authUser ? authUser.role : null, username: authUser ? authUser.username : null, name: authUser ? authUser.name : null }) });
            const resultData = await resData.json();
            if (resultData.status === 'success') { setData(Array.isArray(resultData.data) ? resultData.data : []); }
        } catch (error) { console.error("Error fetching data:", error); }
        finally { setIsLoading(false); }
    };

    useEffect(() => { fetchData(); }, [authUser]);
    useEffect(() => { setCurrentPage(1); }, [activeTab, historyFilter, data.length]);

    const handleOpenAdd = () => {
        setModalMode('add');
        setFormData({ ...initialForm, recruiter: (authUser && authUser.role === 'Staff') ? authUser.username : '' }); setIsModalOpen(true);
    };
    
    const handleOpenEdit = (item) => { 
        setModalMode('edit'); 
        let safeDate = new Date().toISOString().split('T')[0];
        try { if(item.tanggal) { const d = new Date(item.tanggal); if(!isNaN(d.getTime())) { safeDate = new Date(d.getTime() - (d.getTimezoneOffset()*60*1000)).toISOString().split('T')[0]; } } } catch(e) {}
        setFormData({ ...item, tanggal: safeDate }); setIsModalOpen(true); 
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); 
        const action = modalMode === 'add' ? 'addDailyData' : 'updateDailyData'; 
        const payload = { ...formData, id: modalMode === 'add' ? Date.now() : formData.id };
        try { await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action, ...payload }) }); fetchData(); setIsModalOpen(false); } 
        catch (error) { alert("Terjadi kesalahan koneksi."); }
    };

    const handleDelete = async (id) => { 
        if (!window.confirm("Yakin ingin menghapus data pelamar ini?")) return; 
        try { await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action: 'deleteDailyData', id }) }); fetchData(); } 
        catch (error) { alert("Terjadi kesalahan saat menghapus."); } 
    };

    // Filter Data Berdasarkan Tab Aktif
    const currentDisplayData = data.filter(d => {
        const itemMonday = getMondayStr(d.tanggal);
        if (activeTab === 'thisWeek') return itemMonday === thisWeekMonday;
        else return historyFilter === 'all' ? itemMonday < thisWeekMonday : itemMonday === getOffsetMondayStr(historyFilter);
    });

    // Kalkulasi Statistik Mini untuk Data yang Ditampilkan
    const statTotal = currentDisplayData.length;
    const statPending = currentDisplayData.filter(d => d.results === 'Pending').length;
    const statAcc = currentDisplayData.filter(d => d.results === 'Acc').length;
    const statReject = currentDisplayData.filter(d => d.results === 'Reject').length;

    // Paginasi
    const totalPages = Math.ceil(currentDisplayData.length / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = currentDisplayData.slice(startIndex, startIndex + itemsPerPage);

    // CSS Utilities
    const inputClass = "w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all";
    const Label = ({children, icon}) => <label className="flex items-center text-[10px] font-black text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-widest"><i className={`ph-bold ${icon} mr-1.5 text-indigo-500`}></i> {children}</label>;

    // Fungsi Render Badge Status (Tanpa perlu komponen eksternal)
    const renderStatusBadge = (status) => {
        let colors = "bg-gray-100 text-gray-600 border-gray-200";
        if (status === 'Acc') colors = "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50";
        if (status === 'Reject') colors = "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800/50";
        if (status === 'Pending') colors = "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50";
        
        return <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border shadow-sm ${colors}`}>{status}</span>;
    };

    return (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-10">
            
            {/* Header & Navigasi Tab */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6 bg-white/60 dark:bg-gray-800/60 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-md shadow-sm">
                
                {/* Custom Segmented Control (Pill Tabs) */}
                <div className="flex bg-gray-100/80 dark:bg-gray-900/50 p-1.5 rounded-xl w-full md:w-auto border border-gray-200/50 dark:border-gray-700/50 shadow-inner">
                    <button onClick={() => setActiveTab('thisWeek')} className={`flex-1 md:flex-none px-4 sm:px-6 py-2.5 rounded-lg text-xs sm:text-sm font-black transition-all ${activeTab === 'thisWeek' ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-gray-200 dark:border-gray-700' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                        Minggu Ini
                    </button>
                    <button onClick={() => setActiveTab('lastWeek')} className={`flex-1 md:flex-none px-4 sm:px-6 py-2.5 rounded-lg text-xs sm:text-sm font-black transition-all flex items-center justify-center ${activeTab === 'lastWeek' ? 'bg-white dark:bg-gray-800 text-amber-600 dark:text-amber-400 shadow-sm border border-gray-200 dark:border-gray-700' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                        Pemeriksaan 
                        {isThursday && <span className="flex w-2 h-2 ml-2 bg-rose-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.8)]"></span>}
                    </button>
                </div>

                {isPrivileged && (
                    <button onClick={handleOpenAdd} className="w-full md:w-auto px-6 py-3 md:py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_20px_rgba(79,70,229,0.5)] hover:bg-indigo-500 transition-all transform hover:-translate-y-0.5">
                        <i className="ph-bold ph-plus text-lg mr-2"></i> Tambah Data
                    </button>
                )}
            </div>

            {/* Mini Dashboard Statistik */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {[ 
                    { l: 'Total Data', v: statTotal, c: 'blue', i: 'ph-files' }, 
                    { l: 'Pending', v: statPending, c: 'amber', i: 'ph-clock' }, 
                    { l: 'Diterima (Acc)', v: statAcc, c: 'emerald', i: 'ph-check-circle' }, 
                    { l: 'Ditolak (Reject)', v: statReject, c: 'rose', i: 'ph-x-circle' } 
                ].map((s, idx) => (
                    <div key={idx} className="bg-white/80 dark:bg-gray-800/80 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm flex items-center gap-3 sm:gap-4 backdrop-blur-md">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-${s.c}-50 dark:bg-${s.c}-900/20 text-${s.c}-500 flex items-center justify-center shrink-0 shadow-inner border border-${s.c}-100 dark:border-${s.c}-800/50`}>
                            <i className={`ph-fill ${s.i} text-xl sm:text-2xl`}></i>
                        </div>
                        <div>
                            <div className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">{s.l}</div>
                            <div className={`text-lg sm:text-xl font-black text-${s.c}-600 dark:text-${s.c}-400`}>{s.v}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Area Tabel Utama */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden relative">
                
                {/* Header Area Tabel */}
                <div className={`p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 ${activeTab === 'lastWeek' && isThursday ? 'bg-amber-50/50 dark:bg-amber-900/10' : 'bg-gray-50/50 dark:bg-gray-800/30'}`}>
                    <div>
                        <h3 className="font-black text-base sm:text-lg flex items-center text-gray-800 dark:text-white">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 text-white shadow-md ${activeTab === 'thisWeek' ? 'bg-gradient-to-br from-indigo-400 to-blue-600' : 'bg-gradient-to-br from-amber-400 to-orange-600'}`}>
                                <i className={`ph-bold ${activeTab === 'thisWeek' ? 'ph-calendar-plus' : 'ph-list-magnifying-glass'} text-lg`}></i> 
                            </div>
                            {activeTab === 'thisWeek' ? 'Data Pelamar Minggu Ini' : 'Evaluasi Pelamar Terlampau'}
                        </h3>
                        <p className="text-[10px] sm:text-xs text-gray-500 mt-2 font-medium bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 px-3 py-1.5 rounded-lg inline-block shadow-sm">
                            <i className="ph-bold ph-info mr-1"></i>
                            {activeTab === 'thisWeek' ? `Rentang Terbuka: ${formatToDDMMYYYY(thisWeekMonday)} s/d Hari Minggu.` : historyFilter === 'all' ? `Menampilkan seluruh riwayat historis pelamar secara permanen.` : `Rentang Periksa: ${formatToDDMMYYYY(getOffsetMondayStr(historyFilter))} s/d ${formatToDDMMYYYY(new Date(new Date(getOffsetMondayStr(historyFilter)).getTime() + 6*24*60*60*1000).toISOString())}`}
                        </p>
                    </div>
                    
                    {activeTab === 'lastWeek' && (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 bg-white dark:bg-gray-900 p-2 sm:p-1.5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm shrink-0">
                            <label className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest pl-2">Filter Riwayat:</label>
                            <select value={historyFilter} onChange={(e) => setHistoryFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))} className="w-full sm:w-auto bg-gray-50 dark:bg-gray-800 border-none rounded-lg px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-amber-500 outline-none text-gray-700 dark:text-gray-200 cursor-pointer">
                                <option value={-1}>1 Minggu Lalu (Krusial)</option>
                                <option value={-2}>2 Minggu Lalu</option>
                                <option value={-3}>3 Minggu Lalu</option>
                                <option value="all">Semua Data Lama</option>
                            </select>
                        </div>
                    )}
                </div>

                {/* Konten Tabel */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <i className="ph-bold ph-spinner ph-spin text-4xl mb-3 text-indigo-500"></i>
                        <p className="text-[10px] sm:text-xs font-bold tracking-widest uppercase">Memuat Database...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left whitespace-nowrap min-w-[800px]">
                            <thead className="bg-gray-50/80 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700 text-[10px] font-black text-gray-400 uppercase tracking-widest sticky top-0 z-10 backdrop-blur-md">
                                <tr>
                                    <th className="px-4 sm:px-6 py-4">Data Pelamar</th>
                                    <th className="px-4 sm:px-6 py-4">Informasi Kontak</th>
                                    <th className="px-4 sm:px-6 py-4">Recruiter & Jalur</th>
                                    <th className="px-4 sm:px-6 py-4">Status Akhir</th>
                                    {isPrivileged && <th className="px-4 sm:px-6 py-4 text-right">Aksi</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                                {paginatedData.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-12 text-gray-400 bg-gray-50/50 dark:bg-gray-800/30">
                                            <i className="ph-fill ph-folder-open text-4xl mb-2 text-gray-300 dark:text-gray-600 block"></i>
                                            <span className="text-xs sm:text-sm font-bold">KOSONG. Belum ada entri pelamar di rentang waktu ini.</span>
                                        </td>
                                    </tr>
                                ) : paginatedData.map((d, i) => (
                                    <tr key={i} className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors group">
                                        
                                        {/* Kolom 1: Profil */}
                                        <td className="px-4 sm:px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-gray-500 border border-gray-300 dark:border-gray-600 shrink-0">
                                                    <i className="ph-fill ph-user text-lg"></i>
                                                </div>
                                                <div>
                                                    <div className="font-black text-sm text-gray-900 dark:text-white mb-0.5">{d.username}</div>
                                                    <div className="text-[10px] text-gray-400 font-bold flex items-center gap-1.5">
                                                        <i className="ph-bold ph-calendar-blank"></i> {formatToDDMMYYYY(d.tanggal)}
                                                    </div>
                                                    <div className="flex gap-1.5 mt-1.5">
                                                        <span className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-1.5 py-0.5 rounded text-[9px] font-mono text-gray-500">UID: {d.uid}</span>
                                                        <span className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-1.5 py-0.5 rounded text-[9px] font-mono text-gray-500">ID: {d.pelamarId || d.id}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Kolom 2: Kontak */}
                                        <td className="px-4 sm:px-6 py-4">
                                            <div className="font-bold text-xs text-gray-700 dark:text-gray-300 flex items-center mb-1.5 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded w-max border border-emerald-100 dark:border-emerald-800/30">
                                                <i className="ph-bold ph-whatsapp-logo text-emerald-500 mr-1.5 text-sm"></i> {d.wa}
                                            </div>
                                            <div className="text-[10px] font-bold text-gray-500 flex items-center pl-1">
                                                <i className="ph-bold ph-envelope-simple mr-1.5"></i> {d.email || 'Tidak ada email'}
                                            </div>
                                        </td>

                                        {/* Kolom 3: Recruiter */}
                                        <td className="px-4 sm:px-6 py-4">
                                            <div className="font-black text-xs text-indigo-600 dark:text-indigo-400 flex items-center mb-1">
                                                <i className="ph-fill ph-identification-card mr-1.5 text-sm"></i> {d.recruiter || 'Unknown'}
                                            </div>
                                            <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest flex items-center bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full w-max border border-gray-200 dark:border-gray-700">
                                                <i className="ph-bold ph-broadcast mr-1"></i> {d.channels || '-'}
                                            </div>
                                        </td>

                                        {/* Kolom 4: Status */}
                                        <td className="px-4 sm:px-6 py-4">
                                            <div className="mb-2">{renderStatusBadge(d.results)}</div>
                                            <div className="text-[9px] text-gray-500 font-black flex items-center">
                                                <i className="ph-bold ph-users-three mr-1"></i> Grup: <span className="ml-1 text-gray-700 dark:text-gray-300">{d.grup}</span>
                                            </div>
                                        </td>

                                        {/* Kolom 5: Aksi */}
                                        {isPrivileged && (
                                            <td className="px-4 sm:px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => handleOpenEdit(d)} className="w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all shadow-sm">
                                                        <i className="ph-bold ph-pencil-simple"></i>
                                                    </button>
                                                    <button onClick={() => handleDelete(d.id)} className="w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-500 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-all shadow-sm">
                                                        <i className="ph-bold ph-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Footer Paginasi */}
                {totalPages > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 py-4 bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 gap-3">
                        <div className="text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 text-center sm:text-left">
                            Menampilkan <span className="text-indigo-600 dark:text-indigo-400">{startIndex + 1}</span> - <span className="text-indigo-600 dark:text-indigo-400">{Math.min(startIndex + itemsPerPage, currentDisplayData.length)}</span> dari <span className="text-gray-900 dark:text-white">{currentDisplayData.length}</span> entri
                        </div>
                        <div className="flex items-center justify-center gap-2 w-full sm:w-auto">
                            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="flex-1 sm:flex-none justify-center px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-bold text-gray-600 dark:text-gray-300 disabled:opacity-50 hover:bg-white dark:hover:bg-gray-700 transition-colors flex items-center shadow-sm">
                                <i className="ph-bold ph-caret-left mr-1"></i> Prev
                            </button>
                            <span className="text-xs font-bold px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-300 shadow-sm">
                                Hal {currentPage} / {totalPages}
                            </span>
                            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="flex-1 sm:flex-none justify-center px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-bold text-gray-600 dark:text-gray-300 disabled:opacity-50 hover:bg-white dark:hover:bg-gray-700 transition-colors flex items-center shadow-sm">
                                Next <i className="ph-bold ph-caret-right ml-1"></i>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* MODAL INPUT / EDIT RESPONSIVE */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
                    <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col relative z-10 animate-in zoom-in-95 duration-200 border-t-4 border-t-indigo-500">
                        
                        {/* Header Modal */}
                        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/80 dark:bg-gray-800/50">
                            <h2 className="font-black text-lg sm:text-xl flex items-center text-gray-900 dark:text-white">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mr-3">
                                    <i className={`ph-bold ${modalMode === 'add' ? 'ph-plus' : 'ph-pencil-simple'} text-xl`}></i>
                                </div>
                                {modalMode === 'add' ? 'Input Data Baru' : 'Edit Formulir Pelamar'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-rose-100 hover:text-rose-600 text-gray-400 transition-colors bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                                <i className="ph-bold ph-x text-lg"></i>
                            </button>
                        </div>

                        {/* Form Body (2 Kolom di Tablet/Laptop, 1 Kolom di HP) */}
                        <form onSubmit={handleSubmit} className="p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-[80vh] custom-scrollbar bg-gray-50/30 dark:bg-gray-900/30">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 lg:gap-8">
                                
                                {/* Blok Kiri: Data Fundamental */}
                                <div className="space-y-4 bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                    <h4 className="font-black text-xs text-indigo-500 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700 pb-2 mb-4 flex items-center"><i className="ph-bold ph-identification-card mr-2"></i> Identitas & Penanggung Jawab</h4>
                                    
                                    <div><Label icon="ph-calendar">Tanggal Terdaftar</Label><input type="date" required className={inputClass} value={formData.tanggal} onChange={e=>setFormData({...formData, tanggal: e.target.value})}/></div>
                                    
                                    <div>
                                        <Label icon="ph-user-gear">Recruiter (Agen)</Label>
                                        <select required className={inputClass} value={formData.recruiter} onChange={e=>setFormData({...formData, recruiter: e.target.value})} disabled={authUser && authUser.role === 'Staff'}>
                                            <option value="" disabled>-- Pilih Agen Bertugas --</option>
                                            {users.filter(u => u.status === 'Aktif' && u.role === 'Staff').map((u, i) => <option key={i} value={u.username}>{u.name} ({u.username})</option>)}
                                            {formData.recruiter && !users.find(u => u.username === formData.recruiter) && (<option value={formData.recruiter}>{formData.recruiter} (Legacy/Non-Aktif)</option>)}
                                        </select>
                                    </div>

                                    <div><Label icon="ph-user">Nama Pelamar (Username IG/Tele)</Label><input type="text" placeholder="Ketik nama panggilan/username..." required className={inputClass} value={formData.username} onChange={e=>setFormData({...formData, username: e.target.value})}/></div>
                                    
                                    <div><Label icon="ph-hash">UID Sistem (Wajib Angka)</Label><input type="text" placeholder="Contoh: 8371928" required className={inputClass} value={formData.uid} onChange={e=>setFormData({...formData, uid: e.target.value})}/></div>
                                </div>

                                {/* Blok Kanan: Kontak & Penempatan */}
                                <div className="space-y-4 bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                    <h4 className="font-black text-xs text-emerald-500 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700 pb-2 mb-4 flex items-center"><i className="ph-bold ph-phone-call mr-2"></i> Kontak & Penempatan</h4>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div><Label icon="ph-whatsapp-logo">WhatsApp Pelamar</Label><input type="text" placeholder="0812..." required className={inputClass} value={formData.wa} onChange={e=>setFormData({...formData, wa: e.target.value})}/></div>
                                        <div><Label icon="ph-envelope-simple">Email (Opsional)</Label><input type="email" placeholder="mail@domain.com" className={inputClass} value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})}/></div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label icon="ph-broadcast">Jalur Kedatangan (Channel)</Label>
                                            <select className={inputClass} value={formData.channels} onChange={e=>setFormData({...formData, channels: e.target.value})}>
                                                <option>Instagram</option><option>TikTok</option><option>Facebook</option><option>Website</option><option>Referral</option>
                                            </select>
                                        </div>
                                        <div>
                                            <Label icon="ph-users-three">Alokasi Grup</Label>
                                            <select className={inputClass} value={formData.grup} onChange={e=>setFormData({...formData, grup: e.target.value})}>
                                                <option>T0-MAHA</option><option>T0-LADDY</option><option>T0-SANDI</option><option>T0-MARK</option><option>V0</option><option>T3</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="pt-2 mt-2 border-t border-dashed border-gray-200 dark:border-gray-700">
                                        <Label icon="ph-gavel">Keputusan Final (Result)</Label>
                                        <select className={`${inputClass} font-black text-base py-3 ${formData.results === 'Acc' ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : formData.results === 'Reject' ? 'text-rose-600 bg-rose-50 border-rose-200' : 'text-amber-600 bg-amber-50 border-amber-200'}`} value={formData.results} onChange={e=>setFormData({...formData, results: e.target.value})}>
                                            <option value="Pending">⚠️ Pending (Menunggu Diproses)</option>
                                            <option value="Acc">✅ Acc (Diterima)</option>
                                            <option value="Reject">❌ Reject (Gugur/Ditolak)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Tombol Aksi Bawah */}
                            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto px-6 py-3.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                                    Batalkan Pengisian
                                </button>
                                <button type="submit" className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/30 hover:bg-indigo-700 flex justify-center items-center transition-all transform hover:-translate-y-0.5">
                                    <i className="ph-bold ph-floppy-disk mr-2 text-xl"></i> {modalMode === 'add' ? 'Terbitkan Data Pelamar' : 'Simpan Perubahan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};





    const FollowUpCenter = ({ authUser }) => {
        const [data, setData] = useState([]);
        const [isLoading, setIsLoading] = useState(true);

        const isPrivileged = authUser && ['Superadmin', 'Admin'].includes(authUser.role);

        useEffect(() => {
            const fetchData = async () => {
                try {
                    const res = await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action: 'getDailyData', role: authUser ? authUser.role : null, username: authUser ? authUser.username : null, name: authUser ? authUser.name : null }) });
                    const result = await res.json();
                    if (result.status === 'success') { 
                        let fetchedData = Array.isArray(result.data) ? result.data : [];
                        if (!isPrivileged) {
                            fetchedData = fetchedData.filter(d => d.recruiter === authUser.username || d.recruiter === authUser.name);
                        }
                        setData(fetchedData); 
                    }
                } catch (error) {} finally { setIsLoading(false); }
            };
            fetchData();
        }, [authUser, isPrivileged]);

        const getPriorityInfo = (days) => {
            if (days > 7) return { level: 'High', color: 'rose', icon: 'ph-warning-circle' };
            if (days > 3) return { level: 'Medium', color: 'amber', icon: 'ph-clock' };
            return { level: 'Low', color: 'blue', icon: 'ph-check-circle' };
        };

        const today = new Date(); today.setHours(0,0,0,0);
        const categorized = { High: [], Medium: [], Low: [] };
        
        data.filter(c => c.results === 'Pending').forEach(c => {
            let days = 0;
            if (c.tanggal) {
                const inputDate = new Date(c.tanggal);
                if (!isNaN(inputDate.getTime())) {
                    inputDate.setHours(0,0,0,0);
                    const diffTime = Math.abs(today - inputDate);
                    days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                }
            }
            const p = getPriorityInfo(days); categorized[p.level].push({ ...c, days });
        });

        if (isLoading) return <div className="flex justify-center p-12"><i className="ph-bold ph-spinner ph-spin text-4xl text-indigo-500"></i></div>;

        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {['High', 'Medium', 'Low'].map((level) => {
                    const colItems = categorized[level]; const styleInfo = getPriorityInfo(level === 'High' ? 8 : level === 'Medium' ? 4 : 1);
                    return (
                        <Card key={level} className={`border-t-4 border-t-${styleInfo.color}-500 flex flex-col max-h-[75vh]`}>
                            <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex justify-between items-center sticky top-0"><h3 className="font-bold flex items-center text-sm md:text-base"><i className={`ph-bold ${styleInfo.icon} mr-2 text-${styleInfo.color}-500 text-lg`}></i> {level} Priority</h3><span className={`bg-${styleInfo.color}-100 text-${styleInfo.color}-800 px-2.5 py-1 rounded-full text-xs font-bold`}>{colItems.length}</span></div>
                            <div className="overflow-y-auto custom-scrollbar flex-1 p-3 space-y-3">
                                {colItems.length > 0 ? colItems.map((c, i) => (
                                    <div key={i} className="p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl hover:border-indigo-300 transition-colors shadow-sm"><div className="flex justify-between items-start mb-2"><div><div className="font-bold text-sm">{c.username}</div><div className="text-xs text-gray-500 font-mono mt-0.5">{c.uid}</div></div><div className={`text-xs font-bold flex items-center text-${styleInfo.color}-500 bg-${styleInfo.color}-50 dark:bg-${styleInfo.color}-900/20 px-2 py-0.5 rounded`}><i className="ph-bold ph-clock mr-1"></i> {c.days} Hari</div></div><div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50 dark:border-gray-700/50"><div className="text-xs text-gray-500 flex items-center font-medium"><i className="ph-bold ph-user-circle mr-1 text-gray-400"></i> {c.recruiter || 'Unknown'}</div><span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-[10px] font-bold text-gray-500">{c.wa}</span></div></div>
                                )) : <div className="h-32 flex flex-col items-center justify-center text-gray-400"><i className="ph-bold ph-check-circle text-3xl mb-2 text-emerald-400 opacity-50"></i><p className="text-sm">Semua Clear!</p></div>}
                            </div>
                        </Card>
                    )
                })}
            </div>
        );
    };

    const RecruiterPerformance = ({ authUser }) => {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const isPrivileged = authUser && ['Superadmin', 'Admin'].includes(authUser.role);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action: 'getDailyData', role: authUser ? authUser.role : null, username: authUser ? authUser.username : null, name: authUser ? authUser.name : null }) });
                const result = await res.json();
                if (result.status === 'success') { 
                    let fetchedData = Array.isArray(result.data) ? result.data : [];
                    if (!isPrivileged) fetchedData = fetchedData.filter(d => d.recruiter === authUser.username || d.recruiter === authUser.name);
                    setData(fetchedData); 
                }
            } catch (error) {} finally { setIsLoading(false); }
        };
        fetchData();
    }, [authUser, isPrivileged]);

    const performanceMap = data.reduce((acc, curr) => {
        const rec = curr.recruiter || 'Unknown';
        if (!acc[rec]) acc[rec] = { total: 0, acc: 0 };
        acc[rec].total += 1;
        if (curr.results === 'Acc') acc[rec].acc += 1;
        return acc;
    }, {});

    if (isLoading) return <div className="flex justify-center p-12"><i className="ph-bold ph-spinner ph-spin text-4xl text-indigo-500"></i></div>;
    const recruiters = Object.keys(performanceMap);
    if (recruiters.length === 0) return <div className="text-center p-10 text-gray-500 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl">Belum ada data rekapan performance recruiter.</div>;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recruiters.map((name, i) => {
                const stats = performanceMap[name]; const convRate = stats.total > 0 ? Math.round((stats.acc / stats.total) * 100) : 0; const icons = ['ph-lightning', 'ph-target', 'ph-trend-up', 'ph-star']; const icon = icons[i % icons.length];
                return (
                    <Card key={i} className="p-5 relative group hover:shadow-md transition-all">
                        <i className={`ph-bold ${icon} absolute -top-4 -right-4 text-9xl text-indigo-500 opacity-5 dark:opacity-10 group-hover:scale-110 group-hover:text-indigo-600 transition-transform duration-500`}></i>
                        <div className="text-xs font-bold text-indigo-600 uppercase mb-2 flex items-center"><i className={`ph-bold ${icon} mr-1.5 text-sm`}></i>{stats.acc >= 10 ? 'Top Performer' : 'Active'}</div>
                        <h3 className="text-xl font-bold mb-5 relative z-10">{name}</h3><ProgressBar progress={convRate} label={`Conversion Rate (${stats.acc}/${stats.total})`} color="bg-indigo-500" />
                    </Card>
                );
            })}
        </div>
    );
};

    const RecruitmentGoals = ({ authUser }) => {
        const [data, setData] = useState([]);
        const [isLoading, setIsLoading] = useState(true);
        const isPrivileged = authUser && ['Superadmin', 'Admin'].includes(authUser.role);

        useEffect(() => {
            const fetchData = async () => {
                try {
                    const res = await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action: 'getDailyData', role: authUser ? authUser.role : null, username: authUser ? authUser.username : null, name: authUser ? authUser.name : null }) });
                    const result = await res.json();
                    if (result.status === 'success') { 
                        let fetchedData = Array.isArray(result.data) ? result.data : [];
                        if (!isPrivileged) fetchedData = fetchedData.filter(d => d.recruiter === authUser.username || d.recruiter === authUser.name);
                        setData(fetchedData); 
                    }
                } catch (error) {} finally { setIsLoading(false); }
            };
            fetchData();
        }, [authUser, isPrivileged]);

        const targetPerRecruiter = 30; const targetCompany = 100; 
        const progressMap = data.reduce((acc, curr) => { if (curr.results === 'Acc') { const rec = curr.recruiter || 'Unknown'; if (!acc[rec]) acc[rec] = 0; acc[rec] += 1; } return acc; }, {});
        const totalAcc = Object.values(progressMap).reduce((a, b) => a + b, 0);
        const companyProgress = Math.min(Math.round((totalAcc / targetCompany) * 100), 100);

        if (isLoading) return <div className="flex justify-center p-12"><i className="ph-bold ph-spinner ph-spin text-4xl text-indigo-500"></i></div>;

        return (
            <div className="space-y-6">
                <div className="bg-gray-900 text-white p-6 md:p-8 rounded-2xl mb-6 flex flex-col md:flex-row justify-between items-center shadow-xl relative overflow-hidden gap-6">
                    <i className="ph-bold ph-target absolute -right-10 opacity-10 text-[200px] pointer-events-none"></i>
                    <div className="z-10 w-full md:w-auto text-center md:text-left"><div className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-2">Target {isPrivileged ? 'Perusahaan' : 'Pribadi'} (All Time)</div><div className="text-5xl md:text-6xl font-black mb-3">{totalAcc} <span className="text-xl md:text-2xl text-gray-500 font-normal">/ {targetCompany}</span></div><div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-bold border border-emerald-500/30"><i className="ph-bold ph-trend-up mr-2"></i> {companyProgress >= 100 ? 'Goal Reached!' : 'On Track'}</div></div>
                    <div className="z-10 w-full md:w-1/2 bg-gray-800/80 p-5 rounded-xl backdrop-blur-sm border border-gray-700"><div className="flex justify-between text-sm mb-2 font-bold text-gray-300"><span>Progress Total</span><span className="text-indigo-400">{companyProgress}%</span></div><div className="w-full bg-gray-900 rounded-full h-4 overflow-hidden"><div className={`h-4 rounded-full relative ${companyProgress >= 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{ width: `${companyProgress}%` }}><div className="absolute inset-0 bg-white/20 animate-pulse"></div></div></div></div>
                </div>
                {Object.keys(progressMap).length === 0 && <div className="text-center p-10 text-gray-500 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl">Belum ada data pencapaian (ACC) yang masuk.</div>}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Object.keys(progressMap).map((name, i) => {
                        const current = progressMap[name]; const pct = Math.min(Math.round((current / targetPerRecruiter) * 100), 100);
                        return (
                            <Card key={i} className="p-5"><div className="flex justify-between items-start mb-6"><div className="flex items-center"><div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 font-bold flex items-center justify-center mr-3 text-lg">{name.charAt(0).toUpperCase()}</div><div><h4 className="font-bold">{name}</h4><div className="text-xs text-gray-500 font-medium">Target: {targetPerRecruiter}</div></div></div><div className="text-2xl font-black">{current}</div></div><ProgressBar progress={pct} label={`${pct}% Tercapai`} color={pct >= 100 ? 'bg-emerald-500' : 'bg-indigo-500'} /></Card>
                        )
                    })}
                </div>
            </div>
        );
    };

    const ChannelPerformance = ({ authUser }) => {
        const [data, setData] = useState([]);
        const [isLoading, setIsLoading] = useState(true);
        const isPrivileged = authUser && ['Superadmin', 'Admin'].includes(authUser.role);

        useEffect(() => {
            const fetchData = async () => {
                try {
                    const res = await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action: 'getDailyData', role: authUser ? authUser.role : null, username: authUser ? authUser.username : null, name: authUser ? authUser.name : null }) });
                    const result = await res.json();
                    if (result.status === 'success') {
                        let fetchedData = Array.isArray(result.data) ? result.data : [];
                        if (!isPrivileged) fetchedData = fetchedData.filter(d => d.recruiter === authUser.username || d.recruiter === authUser.name);
                        setData(fetchedData); 
                    }
                } catch (error) {} finally { setIsLoading(false); }
            };
            fetchData();
        }, [authUser, isPrivileged]);

        if (isLoading) return <div className="flex justify-center p-12"><i className="ph-bold ph-spinner ph-spin text-4xl text-indigo-500"></i></div>;
        const channelMap = data.reduce((acc, curr) => { const ch = curr.channels || 'Lainnya'; if (!acc[ch]) acc[ch] = { count: 0, acc: 0, recruiters: {} }; acc[ch].count += 1; if (curr.results === 'Acc') acc[ch].acc += 1; const rec = curr.recruiter || 'Unknown'; if (!acc[ch].recruiters[rec]) acc[ch].recruiters[rec] = 0; acc[ch].recruiters[rec] += 1; return acc; }, {});
        const channels = Object.keys(channelMap);
        if (channels.length === 0) return <div className="text-center p-10 text-gray-500 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl">Belum ada data performance channel.</div>;

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {channels.map((name, i) => {
                    const c = channelMap[name]; const convRate = c.count > 0 ? Math.round((c.acc / c.count) * 100) : 0; let topPic = '-', maxLeads = 0;
                    for (const [pic, leads] of Object.entries(c.recruiters)) { if (leads > maxLeads) { maxLeads = leads; topPic = pic; } }
                    return (
                        <Card key={i} className="p-5 hover:border-indigo-300 transition-colors group"><div className="flex justify-between items-start mb-6"><div><h3 className="font-bold text-lg mb-2">{name}</h3><Badge variant="indigo">{convRate}% Konversi</Badge></div><div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-50 text-emerald-500 dark:bg-emerald-900/20`}><i className={`ph-bold ph-arrow-up-right text-xl`}></i></div></div><div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-end"><div><div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Leads</div><div className="text-3xl font-black">{c.count}</div></div><div className="text-right"><div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Top PIC</div><div className="text-sm font-bold flex items-center"><i className="ph-bold ph-medal mr-1 text-amber-500"></i> {topPic}</div></div></div></Card>
                    );
                })}
            </div>
        );
    };

    const SystemSettings = () => (
        <div className="max-w-3xl space-y-6">
            <Card className="p-5 sm:p-6"><h3 className="font-bold text-lg mb-6 border-b border-gray-100 dark:border-gray-700 pb-3 flex items-center"><i className="ph-bold ph-buildings mr-2 text-indigo-500 text-xl"></i> Pengaturan Perusahaan</h3><div className="space-y-4"><div><label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Target Rekrutmen Bulanan</label><input type="number" defaultValue="100" className="w-full sm:w-1/2 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-indigo-500" /></div><div><label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Mata Uang Default</label><select className="w-full sm:w-1/2 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-indigo-500"><option>IDR (Rupiah)</option><option>USD (US Dollar)</option></select></div></div></Card>
            <Card className="p-5 sm:p-6"><h3 className="font-bold text-lg mb-6 border-b border-gray-100 dark:border-gray-700 pb-3 flex items-center"><i className="ph-bold ph-bell-ringing mr-2 text-indigo-500 text-xl"></i> Notifikasi Sistem</h3><div className="space-y-4">{[ {t:'Daily Email Digest', d:'Kirim laporan harian ke email Admin.'}, {t:'SLA Warning Alert', d:'Beri tanda merah jika kandidat pending > 7 hari.'}, {t:'Payroll Auto-Draft', d:'Buat draft payroll otomatis di akhir minggu.'} ].map((n, i) => (<div key={i} className="flex justify-between items-center py-3 border-b border-gray-50 dark:border-gray-800/50 last:border-0"><div className="pr-4"><div className="font-bold text-sm sm:text-base">{n.t}</div><div className="text-xs text-gray-500 mt-1">{n.d}</div></div><input type="checkbox" defaultChecked={i!==2} className="w-5 h-5 text-indigo-600 rounded cursor-pointer shrink-0" /></div>))}</div></Card>
            <div className="flex justify-end pt-2"><button className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg justify-center flex items-center"><i className="ph-bold ph-floppy-disk mr-2 text-lg"></i> Simpan Konfigurasi</button></div>
        </div>
    );

    const Payroll = () => (
        <div className="space-y-6">
            <Card className="p-6">
                <div className="flex justify-between items-center mb-6"><h3 className="font-bold text-lg flex items-center"><i className="ph-bold ph-currency-circle-dollar text-indigo-500 mr-2 text-xl"></i> Payroll Overview</h3><button className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm flex items-center shadow-lg hover:bg-indigo-700"><i className="ph-bold ph-plus mr-2"></i> Create Draft</button></div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap"><thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 text-xs font-bold text-gray-500 uppercase"><tr><th className="px-4 py-3">Period & ID</th><th className="px-4 py-3">Total Amount</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Top Earner</th></tr></thead><tbody className="divide-y divide-gray-100 dark:divide-gray-700">{DB.payroll.length === 0 ? <tr><td colSpan="4" className="text-center py-6 text-gray-500">Belum ada data payroll.</td></tr> : DB.payroll.map((p, i) => (<tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/50"><td className="px-4 py-3 font-bold">{p.period} <div className="text-xs text-gray-500 font-mono mt-1">{p.id}</div></td><td className="px-4 py-3 text-emerald-600 dark:text-emerald-400 font-bold">{p.total}</td><td className="px-4 py-3"><Badge variant={p.status === 'Paid' ? 'success' : 'warning'}>{p.status}</Badge></td><td className="px-4 py-3 text-sm font-medium"><i className="ph-bold ph-star text-amber-500 mr-1"></i> {p.topEarner}</td></tr>))}</tbody></table>
                </div>
            </Card>
        </div>
    );




const DailyStats = ({ authUser }) => {
    const [users, setUsers] = useState([]);
        const [dailyCandidates, setDailyCandidates] = useState([]);
        const [perfData, setPerfData] = useState([]);
        const [isLoading, setIsLoading] = useState(true);
        const [activeTab, setActiveTab] = useState('harian');
        const [searchQuery, setSearchQuery] = useState('');
        const [weekOffset, setWeekOffset] = useState(0);
        const [arsipOffset, setArsipOffset] = useState(-1);

        const [harianDate, setHarianDate] = useState(() => {
            const d = new Date(); d.setDate(d.getDate() - 1); d.setHours(0,0,0,0);
            return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
        });

        const [isModalOpen, setIsModalOpen] = useState(false);
        const [modalMode, setModalMode] = useState('add');
        const [formData, setFormData] = useState({ id: '', tanggal: new Date().toISOString().split('T')[0], username: '', postingan: '', kunjungan: '', pelamar: '', pengujian: '' });

        const isPrivileged = authUser && ['Superadmin', 'Admin'].includes(authUser.role);

        useEffect(() => { if (isPrivileged) setActiveTab('input'); }, [isPrivileged]);

        const getOffsetMondayStr = (offset) => { 
            const d = new Date(); const day = d.getDay() || 7; d.setHours(0,0,0,0); d.setDate(d.getDate() - day + 1 + (offset * 7)); 
            const tzOffset = d.getTimezoneOffset() * 60000; 
            return new Date(d.getTime() - tzOffset).toISOString().split('T')[0]; 
        };

        const fetchData = async () => {
            setIsLoading(true);
            try {
                const resUsers = await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action: 'getUsers' }) });
                const dataUsers = await resUsers.json();
                if (dataUsers.status === 'success') { setUsers(Array.isArray(dataUsers.data) ? dataUsers.data : []); }

                const resCands = await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action: 'getDailyData', role: authUser ? authUser.role : null, username: authUser ? authUser.username : null, name: authUser ? authUser.name : null }) });
                const dataCands = await resCands.json();
                if (dataCands.status === 'success') { setDailyCandidates(Array.isArray(dataCands.data) ? dataCands.data : []); }

                try {
                    const resPerf = await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action: 'getPerfData' }) });
                    const dataPerf = await resPerf.json();
                    if (dataPerf.status === 'success' && dataPerf.data) {
                        const finalPerfData = isPrivileged ? dataPerf.data : dataPerf.data.filter(d => d.username === authUser.username || d.username === authUser.name);
                        setPerfData(finalPerfData); 
                        localStorage.setItem('recruitOps_perfData', JSON.stringify(finalPerfData));
                    }
                } catch (e) { const saved = localStorage.getItem('recruitOps_perfData'); if (saved) setPerfData(JSON.parse(saved)); }
            } catch (error) {} finally { setIsLoading(false); }
        };

        useEffect(() => { fetchData(); }, []);

        const computeT0V0 = (username, dateStr) => {
            const cands = dailyCandidates.filter(c => {
                if (c.recruiter !== username || c.results !== 'Acc') return false;
                let dStr = "";
                try { if (c.tanggal) { const d = new Date(c.tanggal); if (!isNaN(d.getTime())) { dStr = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0]; } } } catch(e){}
                return dStr === dateStr;
            });
            let t0 = 0, v0 = 0; cands.forEach(c => { if ((c.grup || '').toUpperCase().includes('V0')) v0++; else t0++; });
            return { t0, v0, totalHarian: t0 + v0 };
        };

        const evaluateTarget = (totalHarian, postingan) => {
            const posts = Number(postingan) || 0; let reqPosting = 0;
            if (totalHarian >= 3) reqPosting = 0; else if (totalHarian === 2) reqPosting = 30; else if (totalHarian === 1) reqPosting = 60; else reqPosting = 90;
            const isMet = posts >= reqPosting; const denda = isMet ? 0 : 5000;
            return { reqPosting, isMet, denda };
        };

        const generateWeeklySummary = (offset, listToProcess) => {
            const monday = getOffsetMondayStr(offset);
            const weekDays = [0,1,2,3,4,5,6].map(i => { const d = new Date(monday); d.setDate(d.getDate() + i); return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0]; });

            return listToProcess.map(staff => {
                const username = staff.username || staff.name;
                
                let joinDateObj = new Date(0);
                if (staff.tanggalBergabung && staff.tanggalBergabung !== '-') {
                    const jd = new Date(staff.tanggalBergabung);
                    if (!isNaN(jd.getTime())) { jd.setHours(0,0,0,0); joinDateObj = jd; }
                }

                let stats = { username, posts:0, kunjungan:0, pelamar:0, pengujian:0, t0:0, v0:0, totalHarian:0, missCount:0, denda:0, dapatBonus: false };
                let evaluatedDays = 0;
                
                weekDays.forEach(dateStr => {
                    const currentEvalDate = new Date(dateStr);
                    currentEvalDate.setHours(0,0,0,0);

                    if (currentEvalDate.getTime() > new Date().setHours(0,0,0,0)) return; 
                    
                    if (currentEvalDate.getTime() < joinDateObj.getTime()) return;

                    evaluatedDays++;
                    const t0v0 = computeT0V0(username, dateStr); 
                    const p = perfData.find(x => x.username === username && x.tanggal === dateStr);
                    const posts = p && p.postingan ? Number(p.postingan) : 0;
                    const evalDay = evaluateTarget(t0v0.totalHarian, posts);

                    stats.posts += posts; stats.kunjungan += p && p.kunjungan ? Number(p.kunjungan) : 0; stats.pelamar += p && p.pelamar ? Number(p.pelamar) : 0; stats.pengujian += p && p.pengujian ? Number(p.pengujian) : 0;
                    stats.t0 += t0v0.t0; stats.v0 += t0v0.v0; stats.totalHarian += t0v0.totalHarian; stats.denda += evalDay.denda;
                    if (!evalDay.isMet) stats.missCount++;
                });
                
                stats.dapatBonus = (evaluatedDays > 0 && stats.missCount === 0);
                return stats;
            }).sort((a,b) => b.totalHarian - a.totalHarian).map((s, idx) => ({ ...s, rank: idx + 1 }));
        };

        const activeFormStats = computeT0V0(formData.username, formData.tanggal);
        const evalForm = evaluateTarget(activeFormStats.totalHarian, formData.postingan);

        const handleSavePerf = (e) => {
            e.preventDefault();
            const payload = { id: modalMode === 'add' ? Date.now() : formData.id, tanggal: formData.tanggal, username: formData.username, postingan: parseInt(formData.postingan) || 0, kunjungan: parseInt(formData.kunjungan) || 0, pelamar: parseInt(formData.pelamar) || 0, pengujian: parseInt(formData.pengujian) || 0 };
            let newData = [...perfData];
            if (modalMode === 'add') { const existingIdx = newData.findIndex(p => p.tanggal === payload.tanggal && p.username === payload.username); if (existingIdx >= 0) { newData[existingIdx] = payload; } else { newData.push(payload); } } else { newData = newData.map(p => p.id === payload.id ? payload : p); }
            setPerfData(newData); localStorage.setItem('recruitOps_perfData', JSON.stringify(newData));
            fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action: 'addPerfData', ...payload }) }).catch(()=>{});
            setIsModalOpen(false);
        };

        const handleDelete = (id) => { if(!window.confirm("Hapus data stats ini?")) return; const newData = perfData.filter(p => p.id !== id); setPerfData(newData); localStorage.setItem('recruitOps_perfData', JSON.stringify(newData)); };
        const exportCSV = (dataRows, filename) => { const csv = dataRows.map(row => row.join(',')).join('\n'); const blob = new Blob([csv], { type: 'text/csv' }); const url = window.URL.createObjectURL(blob); const a = document.createElement('a'); a.setAttribute('href', url); a.setAttribute('download', filename); a.click(); };
        const handlePrint = () => window.print();

        const globalStaffList = users.filter(u => u.role === 'Staff' && u.status === 'Aktif');
        const harianStaffList = isPrivileged ? globalStaffList : globalStaffList.filter(u => u.username === authUser.username || u.name === authUser.name);

        const globalWeeklySummary = generateWeeklySummary(0, globalStaffList);
        const arsipSummary = isPrivileged ? generateWeeklySummary(arsipOffset, globalStaffList) : [];
        const displayWeekly = isPrivileged ? globalWeeklySummary : globalWeeklySummary.filter(s => s.username === authUser.username || s.username === authUser.name);
        
        const displayHarian = harianStaffList.map(staff => {
            const username = staff.username || staff.name; 
            
            let joinDateObj = new Date(0);
            if (staff.tanggalBergabung && staff.tanggalBergabung !== '-') {
                const jd = new Date(staff.tanggalBergabung);
                if (!isNaN(jd.getTime())) { jd.setHours(0,0,0,0); joinDateObj = jd; }
            }
            const currentEvalDate = new Date(harianDate); currentEvalDate.setHours(0,0,0,0);
            const isBeforeJoin = currentEvalDate.getTime() < joinDateObj.getTime();

            const t0v0 = computeT0V0(username, harianDate); 
            const p = perfData.find(x => x.username === username && x.tanggal === harianDate);
            const hasInput = !!p; const posts = p && p.postingan ? Number(p.postingan) : 0;
            
            let evalDay = { reqPosting: 0, isMet: true, denda: 0 };
            let statusHarian = '';

            if (isBeforeJoin) {
                statusHarian = 'Belum Bergabung';
            } else {
                evalDay = evaluateTarget(t0v0.totalHarian, posts);
                if (!hasInput && t0v0.totalHarian === 0) { statusHarian = 'Belum Lapor'; } 
                else if (evalDay.isMet) { statusHarian = 'Sesuai Target'; } 
                else { statusHarian = 'Kurang Target'; }
            }

            return { username, posts, kunjungan: p && p.kunjungan ? Number(p.kunjungan) : 0, pelamar: p && p.pelamar ? Number(p.pelamar) : 0, pengujian: p && p.pengujian ? Number(p.pengujian) : 0, ...t0v0, denda: evalDay.denda, statusHarian, reqPosting: evalDay.reqPosting };
        }).filter(s => s.statusHarian !== 'Belum Bergabung'); 

        const totalWeekly = displayWeekly.reduce((acc, curr) => ({ posts: acc.posts + curr.posts, pelamar: acc.pelamar + curr.pelamar, pengujian: acc.pengujian + curr.pengujian, t0: acc.t0 + curr.t0, v0: acc.v0 + curr.v0, denda: acc.denda + curr.denda }), { posts: 0, pelamar: 0, pengujian: 0, t0: 0, v0: 0, denda: 0 });
        const InputClass = "w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all";

        const renderHarianCard = (s) => (
            <div key={s.username} className="bg-white dark:bg-gray-800 p-3.5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col gap-3 hover:border-indigo-300 transition-colors">
                <div className="flex justify-between items-center">
                    <div className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 flex items-center justify-center text-xs">{s.username.charAt(0).toUpperCase()}</div>{s.username}</div>
                    {s.statusHarian === 'Sesuai Target' && <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2.5 py-1 rounded text-[10px] font-bold shadow-sm">Aman <i className="ph-bold ph-check"></i></span>}
                    {s.statusHarian === 'Kurang Target' && <span className="bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 px-2.5 py-1 rounded text-[10px] font-bold shadow-sm" title={`Butuh ${s.reqPosting} post`}>Denda 5K <i className="ph-bold ph-warning"></i></span>}
                    {s.statusHarian === 'Belum Lapor' && <span className="bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 px-2.5 py-1 rounded text-[10px] font-bold shadow-sm">Kosong</span>}
                </div>
                <div className="flex justify-between items-center text-xs bg-gray-50 dark:bg-gray-900/50 p-2 rounded-lg border border-gray-100 dark:border-gray-800">
                    <div className="text-center"><div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Rekrut</div><div className="font-black text-indigo-600 dark:text-indigo-400 text-base">{s.totalHarian}</div></div>
                    <div className="text-center"><div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Posts</div><div className="font-black text-gray-700 dark:text-gray-300 text-base">{s.posts}</div></div>
                    <div className="text-center"><div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">T0 / V0</div><div className="font-black text-gray-700 dark:text-gray-300 text-base">{s.t0} / {s.v0}</div></div>
                </div>
            </div>
        );

        return (
            <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[ { l:'Total Posts', v: totalWeekly.posts, i:'ph-file-text', c:'text-blue-600', b:'bg-blue-50' }, { l:'Total Pelamar', v: totalWeekly.pelamar, i:'ph-users', c:'text-indigo-600', b:'bg-indigo-50' }, { l:'Pengujian', v: totalWeekly.pengujian, i:'ph-exam', c:'text-amber-600', b:'bg-amber-50' }, { l:'T0 (Acc)', v: totalWeekly.t0, i:'ph-check-circle', c:'text-emerald-600', b:'bg-emerald-50' }, { l:'V0 (VIP)', v: totalWeekly.v0, i:'ph-star', c:'text-purple-600', b:'bg-purple-50' }, { l:'Denda', v: `Rp ${(totalWeekly.denda).toLocaleString('id-ID')}`, i:'ph-warning-circle', c:'text-rose-600', b:'bg-rose-50' } ].map((k,idx)=>(
                        <div key={idx} className="p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden">
                            {isLoading && <div className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 flex justify-center items-center z-10"><i className="ph-bold ph-spinner ph-spin text-indigo-500"></i></div>}
                            <div className="flex justify-between items-start mb-2"><span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{k.l}</span><div className={`p-1.5 rounded-lg ${k.b} dark:bg-gray-900`}><i className={`ph-bold ${k.i} text-base ${k.c}`}></i></div></div><span className="text-xl font-black text-gray-800 dark:text-white">{isLoading ? '-' : k.v}</span>
                        </div>
                    ))}
                </div>

                <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl p-6 shadow-lg relative overflow-hidden text-white">
                    <i className="ph-fill ph-ranking absolute -right-10 -bottom-10 text-[180px] opacity-10 pointer-events-none"></i>
                    <h3 className="font-black text-lg mb-4 flex items-center"><i className="ph-bold ph-trophy mr-2 text-amber-400 text-2xl"></i> {isPrivileged ? 'Top Performers (Minggu Ini)' : 'Peringkat Saya (Minggu Ini)'}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
                        {isPrivileged ? (
                            globalWeeklySummary.slice(0, 3).map((staff, i) => (
                                <div key={i} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 flex items-center">
                                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl mr-4 shadow-inner relative">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}<span className="absolute -bottom-1 -right-1 bg-indigo-600 text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-indigo-900">{i+1}</span></div>
                                    <div><div className="font-bold text-sm">{staff.username}</div><div className="text-xs text-indigo-200 mt-0.5">Total T0+V0: <span className="font-black text-white">{staff.totalHarian}</span></div></div>
                                </div>
                            ))
                        ) : (
                            displayWeekly.map((staff, i) => (
                                <div key={i} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 flex items-center md:col-span-1">
                                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl mr-4 shadow-inner relative">{staff.rank === 1 ? '🥇' : staff.rank === 2 ? '🥈' : staff.rank === 3 ? '🥉' : '🎖️'}<span className="absolute -bottom-1 -right-1 bg-indigo-600 text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-indigo-900">{staff.rank}</span></div>
                                    <div><div className="font-bold text-sm">{staff.username}</div><div className="text-xs text-indigo-200 mt-0.5">Peringkat <span className="font-black text-white">{staff.rank}</span> dari {globalStaffList.length}</div></div>
                                </div>
                            ))
                        )}
                        {globalWeeklySummary.length === 0 && <div className="col-span-3 text-sm text-indigo-300">Belum ada data performa minggu ini.</div>}
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
                    <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 overflow-x-auto hide-scrollbar">
                        {isPrivileged && <button onClick={() => setActiveTab('input')} className={`px-6 py-4 font-bold text-sm flex items-center whitespace-nowrap transition-colors border-b-2 ${activeTab === 'input' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-800' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}><i className="ph-bold ph-pencil-simple-line mr-2 text-lg"></i> Input Data</button>}
                        <button onClick={() => setActiveTab('harian')} className={`px-6 py-4 font-bold text-sm flex items-center whitespace-nowrap transition-colors border-b-2 ${activeTab === 'harian' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-800' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}><i className="ph-bold ph-calendar-check mr-2 text-lg"></i> Rekap Harian</button>
                        <button onClick={() => setActiveTab('mingguan')} className={`px-6 py-4 font-bold text-sm flex items-center whitespace-nowrap transition-colors border-b-2 ${activeTab === 'mingguan' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-800' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}><i className="ph-bold ph-calendar-blank mr-2 text-lg"></i> Rekap Mingguan</button>
                        {isPrivileged && <button onClick={() => setActiveTab('arsip')} className={`px-6 py-4 font-bold text-sm flex items-center whitespace-nowrap transition-colors border-b-2 ${activeTab === 'arsip' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-800' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}><i className="ph-bold ph-archive mr-2 text-lg"></i> Arsip Mingguan</button>}
                    </div>
                    
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex-1 w-full md:w-auto">
                            {activeTab === 'input' && (
                                <div className="relative"><i className="ph-bold ph-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i><input type="text" placeholder="Cari username atau tanggal..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} className="w-full md:max-w-xs pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-900 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                            )}
                            {activeTab === 'harian' && (
                                <div className="flex items-center gap-3 w-full overflow-x-auto hide-scrollbar"><input type="date" value={harianDate} onChange={e=>setHarianDate(e.target.value)} className="px-3 py-2 bg-gray-100 dark:bg-gray-900 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500" /><button onClick={()=>{const d=new Date(); d.setHours(0,0,0,0); setHarianDate(new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0])}} className="px-3 py-2 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-xl text-xs font-bold whitespace-nowrap">Hari Ini</button><button onClick={()=>{const d=new Date(); d.setDate(d.getDate()-1); d.setHours(0,0,0,0); setHarianDate(new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0])}} className="px-3 py-2 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold whitespace-nowrap">Kemarin</button></div>
                            )}
                            {activeTab === 'arsip' && (
                                <div className="flex items-center gap-2"><label className="text-xs font-bold text-gray-500 uppercase whitespace-nowrap">Pilih Minggu:</label><select value={arsipOffset} onChange={e => setArsipOffset(Number(e.target.value))} className="bg-gray-100 dark:bg-gray-900 border-none rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none"><option value={-1}>Minggu Lalu (H-1 Mgg)</option><option value={-2}>2 Minggu Lalu (H-2 Mgg)</option><option value={-3}>3 Minggu Lalu (H-3 Mgg)</option><option value={-4}>4 Minggu Lalu (H-4 Mgg)</option></select></div>
                            )}
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-end">
                            <button onClick={()=>fetchData()} className="p-2.5 text-gray-500 bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors" title="Refresh Data"><i className="ph-bold ph-arrows-clockwise text-lg"></i></button>
                            {['harian', 'mingguan', 'arsip'].includes(activeTab) && (
                                <><button onClick={() => exportCSV(activeTab === 'harian' ? [['Username','Posts','Kunjungan','Pelamar','Pengujian','T0','V0','Total Harian','Denda'], ...displayHarian.map(s => [s.username, s.posts, s.kunjungan, s.pelamar, s.pengujian, s.t0, s.v0, s.totalHarian, s.denda])] : [['Rank', 'Username','Posts','Kunjungan','Pelamar','Pengujian','T0','V0','Total Harian','Miss Target','Total Denda', 'Bonus 50K'], ...(activeTab === 'arsip' ? arsipSummary : displayWeekly).map(s => [s.rank, s.username, s.posts, s.kunjungan, s.pelamar, s.pengujian, s.t0, s.v0, s.totalHarian, s.missCount, s.denda, s.dapatBonus ? 'Dapat' : 'Tidak'])], `Export_${activeTab}_${new Date().getTime()}.csv`)} className="p-2.5 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-xl transition-colors font-bold text-sm flex items-center"><i className="ph-bold ph-file-csv mr-2 text-lg"></i> Excel</button><button onClick={handlePrint} className="p-2.5 text-rose-600 bg-rose-50 dark:bg-rose-900/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-xl transition-colors font-bold text-sm flex items-center"><i className="ph-bold ph-printer mr-2 text-lg"></i> Print</button></>
                            )}
                            {activeTab === 'input' && <button onClick={()=>{setModalMode('add'); setFormData({id:'', tanggal: new Date().toISOString().split('T')[0], username: isPrivileged ? '' : authUser.username, postingan:'', kunjungan:'', pelamar:'', pengujian:''}); setIsModalOpen(true);}} className="px-4 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 flex items-center transition-colors"><i className="ph-bold ph-plus mr-2 text-lg"></i> Tambah Data</button>}
                        </div>
                    </div>

                    {activeTab === 'input' && isPrivileged && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left whitespace-nowrap">
                                <thead className="bg-gray-50 dark:bg-gray-800 text-xs font-black text-gray-500 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700"><tr><th className="px-4 py-3">Tanggal & User</th><th className="px-4 py-3 text-center">Posts</th><th className="px-4 py-3 text-center">Kunjungan</th><th className="px-4 py-3 text-center">Pelamar</th><th className="px-4 py-3 text-center">Pengujian</th><th className="px-4 py-3 text-center">Auto-Stats (T0/V0)</th><th className="px-4 py-3 text-center">Total & Denda</th><th className="px-4 py-3 text-right">Aksi</th></tr></thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {isLoading ? [...Array(3)].map((_,i)=><tr key={i}><td colSpan="8" className="px-4 py-6"><div className="h-6 bg-gray-200 dark:bg-gray-700 animate-pulse rounded w-full"></div></td></tr>) : 
                                     perfData.filter(p => p.username.toLowerCase().includes(searchQuery.toLowerCase()) || p.tanggal.includes(searchQuery)).length === 0 ? <tr><td colSpan="8" className="text-center py-10 text-gray-400">Belum ada data input.</td></tr> :
                                     perfData.filter(p => p.username.toLowerCase().includes(searchQuery.toLowerCase()) || p.tanggal.includes(searchQuery)).sort((a,b)=>new Date(b.tanggal)-new Date(a.tanggal)).map((p, i) => {
                                        const auto = computeT0V0(p.username, p.tanggal); const evalP = evaluateTarget(auto.totalHarian, p.postingan);
                                        return (
                                            <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 group">
                                                <td className="px-4 py-3"><div className="font-bold text-sm text-gray-900 dark:text-white">{p.username}</div><div className="text-[10px] text-gray-500 mt-0.5">{formatToDDMMYYYY(p.tanggal)}</div></td><td className="px-4 py-3 text-center font-bold text-sm">{p.postingan || 0}</td><td className="px-4 py-3 text-center font-bold text-sm">{p.kunjungan || 0}</td><td className="px-4 py-3 text-center font-bold text-sm">{p.pelamar || 0}</td><td className="px-4 py-3 text-center font-bold text-sm">{p.pengujian || 0}</td>
                                                <td className="px-4 py-3 text-center text-xs"><span className="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 px-2 py-1 rounded font-bold mr-1">T0: {auto.t0}</span><span className="bg-purple-50 text-purple-600 dark:bg-purple-900/30 px-2 py-1 rounded font-bold">V0: {auto.v0}</span></td>
                                                <td className="px-4 py-3 text-center"><div className="text-sm font-black text-gray-800 dark:text-white mb-1">{auto.totalHarian}</div>{evalP.denda > 0 ? <span className="bg-rose-100 text-rose-600 px-2 py-0.5 rounded text-[10px] font-bold shadow-sm">Denda Rp 5K</span> : <span className="bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded text-[10px] font-bold shadow-sm">Aman</span>}</td>
                                                <td className="px-4 py-3 text-right"><div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={()=>{setModalMode('edit'); setFormData(p); setIsModalOpen(true);}} className="p-1.5 text-gray-400 hover:text-indigo-500 bg-gray-100 dark:bg-gray-800 rounded"><i className="ph-bold ph-pencil-simple text-lg"></i></button><button onClick={()=>handleDelete(p.id)} className="p-1.5 text-gray-400 hover:text-rose-500 bg-gray-100 dark:bg-gray-800 rounded"><i className="ph-bold ph-trash text-lg"></i></button></div></td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'harian' && (
                        <div className="p-5 print:p-0 bg-gray-50/50 dark:bg-gray-900/50">
                            <h2 className="hidden print:block text-xl font-bold mb-4 text-center">Rekap Harian - {formatToDDMMYYYY(harianDate)}</h2>
                            {isLoading ? <div className="flex flex-col items-center justify-center py-12 text-gray-400"><i className="ph-bold ph-spinner ph-spin text-3xl mb-2"></i></div> : (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-800/30 shadow-sm flex flex-col">
                                        <h4 className="font-black text-emerald-700 dark:text-emerald-400 mb-4 flex items-center justify-between border-b border-emerald-200/50 dark:border-emerald-800/50 pb-3"><span><i className="ph-fill ph-check-circle mr-2 text-xl"></i> Sesuai Target</span><span className="bg-emerald-200 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200 px-2 py-0.5 rounded-full text-xs">{displayHarian.filter(s => s.statusHarian === 'Sesuai Target').length} Staff</span></h4>
                                        <div className="space-y-3 flex-1">{displayHarian.filter(s => s.statusHarian === 'Sesuai Target').map(renderHarianCard)}{displayHarian.filter(s => s.statusHarian === 'Sesuai Target').length === 0 && <div className="text-xs text-gray-400 text-center py-6">Tidak ada data.</div>}</div>
                                    </div>
                                    <div className="bg-rose-50/50 dark:bg-rose-900/10 rounded-2xl p-4 border border-rose-100 dark:border-rose-800/30 shadow-sm flex flex-col">
                                        <h4 className="font-black text-rose-700 dark:text-rose-400 mb-4 flex items-center justify-between border-b border-rose-200/50 dark:border-rose-800/50 pb-3"><span><i className="ph-fill ph-warning-circle mr-2 text-xl"></i> Kurang Target</span><span className="bg-rose-200 text-rose-800 dark:bg-rose-800 dark:text-rose-200 px-2 py-0.5 rounded-full text-xs">{displayHarian.filter(s => s.statusHarian === 'Kurang Target').length} Staff</span></h4>
                                        <div className="space-y-3 flex-1">{displayHarian.filter(s => s.statusHarian === 'Kurang Target').map(renderHarianCard)}{displayHarian.filter(s => s.statusHarian === 'Kurang Target').length === 0 && <div className="text-xs text-gray-400 text-center py-6">Tidak ada data.</div>}</div>
                                    </div>
                                    <div className="bg-gray-100/50 dark:bg-gray-800/50 rounded-2xl p-4 border border-gray-200 dark:border-gray-700/50 shadow-sm flex flex-col">
                                        <h4 className="font-black text-gray-600 dark:text-gray-400 mb-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3"><span><i className="ph-fill ph-prohibit mr-2 text-xl"></i> Belum Lapor</span><span className="bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs">{displayHarian.filter(s => s.statusHarian === 'Belum Lapor').length} Staff</span></h4>
                                        <div className="space-y-3 flex-1">{displayHarian.filter(s => s.statusHarian === 'Belum Lapor').map(renderHarianCard)}{displayHarian.filter(s => s.statusHarian === 'Belum Lapor').length === 0 && <div className="text-xs text-gray-400 text-center py-6">Tidak ada data.</div>}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'mingguan' && (
                        <div className="overflow-x-auto print:p-0 p-4">
                            <h2 className="hidden print:block text-xl font-bold mb-4 text-center">Rekap Mingguan - Mulai {formatToDDMMYYYY(getOffsetMondayStr(0))}</h2>
                            <table className="w-full text-left whitespace-nowrap">
                                <thead className="bg-purple-50 dark:bg-purple-900/20 text-xs font-black text-purple-800 dark:text-purple-300 uppercase tracking-wider border-b border-purple-100 dark:border-purple-800"><tr><th className="px-4 py-3 text-center">Rank</th><th className="px-4 py-3 border-l border-purple-100 dark:border-purple-800">Username</th><th className="px-4 py-3 text-center border-l border-purple-100 dark:border-purple-800">Posts</th><th className="px-4 py-3 text-center border-l border-purple-100 dark:border-purple-800">Kunj</th><th className="px-4 py-3 text-center border-l border-purple-100 dark:border-purple-800">Pmr</th><th className="px-4 py-3 text-center border-l border-purple-100 dark:border-purple-800">Uji</th><th className="px-4 py-3 text-center border-l border-purple-100 dark:border-purple-800">T0</th><th className="px-4 py-3 text-center border-l border-purple-100 dark:border-purple-800">V0</th><th className="px-4 py-3 text-center border-l border-purple-100 dark:border-purple-800">Tot. Harian</th><th className="px-4 py-3 text-center border-l border-purple-100 dark:border-purple-800">Miss</th><th className="px-4 py-3 text-right border-l border-purple-100 dark:border-purple-800">Total Denda</th><th className="px-4 py-3 text-center border-l border-purple-100 dark:border-purple-800"><i className="ph-fill ph-gift text-amber-500 mr-1"></i> Bonus</th></tr></thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {isLoading ? [...Array(3)].map((_,i)=><tr key={i}><td colSpan="12" className="px-4 py-6"><div className="h-6 bg-gray-200 dark:bg-gray-700 animate-pulse rounded w-full"></div></td></tr>) : 
                                     displayWeekly.length === 0 ? <tr><td colSpan="12" className="text-center py-10 text-gray-400 font-bold">Tidak ada data mingguan.</td></tr> :
                                     displayWeekly.map((s, i) => (
                                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="px-4 py-3 text-center font-black text-gray-500">#{s.rank}</td><td className="px-4 py-3 font-bold text-sm text-gray-900 dark:text-white border-l border-gray-100 dark:border-gray-700 flex items-center">{s.rank === 1 ? <i className="ph-fill ph-medal text-amber-500 mr-2 text-lg"></i> : s.rank === 2 ? <i className="ph-fill ph-medal text-gray-400 mr-2 text-lg"></i> : s.rank === 3 ? <i className="ph-fill ph-medal text-amber-700 mr-2 text-lg"></i> : null}{s.username}</td><td className="px-4 py-3 text-center font-bold text-gray-600 dark:text-gray-300 border-l border-gray-100 dark:border-gray-700">{s.posts}</td><td className="px-4 py-3 text-center font-bold text-gray-600 dark:text-gray-300 border-l border-gray-100 dark:border-gray-700">{s.kunjungan}</td><td className="px-4 py-3 text-center font-bold text-gray-600 dark:text-gray-300 border-l border-gray-100 dark:border-gray-700">{s.pelamar}</td><td className="px-4 py-3 text-center font-bold text-gray-600 dark:text-gray-300 border-l border-gray-100 dark:border-gray-700">{s.pengujian}</td><td className="px-4 py-3 text-center font-black text-emerald-600 border-l border-gray-100 dark:border-gray-700">{s.t0}</td><td className="px-4 py-3 text-center font-black text-purple-600 border-l border-gray-100 dark:border-gray-700">{s.v0}</td><td className="px-4 py-3 text-center font-black text-indigo-600 dark:text-indigo-400 border-l border-gray-100 dark:border-gray-700 text-lg bg-indigo-50/50 dark:bg-indigo-900/10">{s.totalHarian}</td><td className="px-4 py-3 text-center font-black text-rose-600 border-l border-gray-100 dark:border-gray-700">{s.missCount > 0 ? `${s.missCount} Hari` : '-'}</td><td className="px-4 py-3 text-right font-black border-l border-gray-100 dark:border-gray-700">{s.denda > 0 ? <span className="text-rose-600 bg-rose-50 px-2 py-1 rounded shadow-sm">Rp {(s.denda).toLocaleString('id-ID')}</span> : <span className="text-emerald-500 px-2 py-1 bg-emerald-50 rounded">Rp 0</span>}</td><td className="px-4 py-3 text-center font-black border-l border-gray-100 dark:border-gray-700">{s.dapatBonus ? <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 px-2 py-1 rounded text-[10px] shadow-sm"><i className="ph-fill ph-star mr-1"></i> 50K</span> : <span className="text-gray-400">-</span>}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'arsip' && isPrivileged && (
                        <div className="overflow-x-auto print:p-0 p-4">
                            <h2 className="text-xl font-bold mb-1 text-center">Arsip Mingguan</h2>
                            <h3 className="text-xs text-gray-500 font-bold mb-5 text-center">Periode: {formatToDDMMYYYY(getOffsetMondayStr(arsipOffset))} s/d {formatToDDMMYYYY(new Date(new Date(getOffsetMondayStr(arsipOffset)).getTime() + 6*24*60*60*1000).toISOString())}</h3>
                            <table className="w-full text-left whitespace-nowrap">
                                <thead className="bg-purple-50 dark:bg-purple-900/20 text-xs font-black text-purple-800 dark:text-purple-300 uppercase tracking-wider border-b border-purple-100 dark:border-purple-800"><tr><th className="px-4 py-3 text-center">Rank</th><th className="px-4 py-3 border-l border-purple-100 dark:border-purple-800">Username</th><th className="px-4 py-3 text-center border-l border-purple-100 dark:border-purple-800">Posts</th><th className="px-4 py-3 text-center border-l border-purple-100 dark:border-purple-800">Kunj</th><th className="px-4 py-3 text-center border-l border-purple-100 dark:border-purple-800">Pmr</th><th className="px-4 py-3 text-center border-l border-purple-100 dark:border-purple-800">Uji</th><th className="px-4 py-3 text-center border-l border-purple-100 dark:border-purple-800">T0</th><th className="px-4 py-3 text-center border-l border-purple-100 dark:border-purple-800">V0</th><th className="px-4 py-3 text-center border-l border-purple-100 dark:border-purple-800">Tot. Harian</th><th className="px-4 py-3 text-center border-l border-purple-100 dark:border-purple-800">Miss</th><th className="px-4 py-3 text-right border-l border-purple-100 dark:border-purple-800">Total Denda</th><th className="px-4 py-3 text-center border-l border-purple-100 dark:border-purple-800"><i className="ph-fill ph-gift text-amber-500 mr-1"></i> Bonus</th></tr></thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {isLoading ? [...Array(3)].map((_,i)=><tr key={i}><td colSpan="12" className="px-4 py-6"><div className="h-6 bg-gray-200 dark:bg-gray-700 animate-pulse rounded w-full"></div></td></tr>) : 
                                     arsipSummary.length === 0 ? <tr><td colSpan="12" className="text-center py-10 text-gray-400 font-bold">Tidak ada data arsip.</td></tr> :
                                     arsipSummary.map((s, i) => (
                                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="px-4 py-3 text-center font-black text-gray-500">#{s.rank}</td><td className="px-4 py-3 font-bold text-sm text-gray-900 dark:text-white border-l border-gray-100 dark:border-gray-700 flex items-center">{s.rank === 1 ? <i className="ph-fill ph-medal text-amber-500 mr-2 text-lg"></i> : s.rank === 2 ? <i className="ph-fill ph-medal text-gray-400 mr-2 text-lg"></i> : s.rank === 3 ? <i className="ph-fill ph-medal text-amber-700 mr-2 text-lg"></i> : null}{s.username}</td><td className="px-4 py-3 text-center font-bold text-gray-600 dark:text-gray-300 border-l border-gray-100 dark:border-gray-700">{s.posts}</td><td className="px-4 py-3 text-center font-bold text-gray-600 dark:text-gray-300 border-l border-gray-100 dark:border-gray-700">{s.kunjungan}</td><td className="px-4 py-3 text-center font-bold text-gray-600 dark:text-gray-300 border-l border-gray-100 dark:border-gray-700">{s.pelamar}</td><td className="px-4 py-3 text-center font-bold text-gray-600 dark:text-gray-300 border-l border-gray-100 dark:border-gray-700">{s.pengujian}</td><td className="px-4 py-3 text-center font-black text-emerald-600 border-l border-gray-100 dark:border-gray-700">{s.t0}</td><td className="px-4 py-3 text-center font-black text-purple-600 border-l border-gray-100 dark:border-gray-700">{s.v0}</td><td className="px-4 py-3 text-center font-black text-indigo-600 dark:text-indigo-400 border-l border-gray-100 dark:border-gray-700 text-lg bg-indigo-50/50 dark:bg-indigo-900/10">{s.totalHarian}</td><td className="px-4 py-3 text-center font-black text-rose-600 border-l border-gray-100 dark:border-gray-700">{s.missCount > 0 ? `${s.missCount} Hari` : '-'}</td><td className="px-4 py-3 text-right font-black border-l border-gray-100 dark:border-gray-700">{s.denda > 0 ? <span className="text-rose-600 bg-rose-50 px-2 py-1 rounded shadow-sm">Rp {(s.denda).toLocaleString('id-ID')}</span> : <span className="text-emerald-500 px-2 py-1 bg-emerald-50 rounded">Rp 0</span>}</td><td className="px-4 py-3 text-center font-black border-l border-gray-100 dark:border-gray-700">{s.dapatBonus ? <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 px-2 py-1 rounded text-[10px] shadow-sm"><i className="ph-fill ph-star mr-1"></i> 50K</span> : <span className="text-gray-400">-</span>}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={()=>setIsModalOpen(false)}></div>
                        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col relative z-10 animate-in zoom-in-95 duration-200 border-t-4 border-t-indigo-600">
                            <div className="px-6 py-4 border-b border-gray-200/50 dark:border-gray-700/50 flex justify-between bg-white/50 dark:bg-gray-800/50 items-center"><h2 className="font-black flex items-center text-lg text-indigo-900 dark:text-indigo-300"><i className={`ph-bold ${modalMode === 'add' ? 'ph-plus-circle' : 'ph-pencil-simple'} text-indigo-600 mr-2 text-2xl`}></i> {modalMode === 'add' ? 'Input Daily Stats Baru' : 'Edit Daily Stats'}</h2><button onClick={()=>setIsModalOpen(false)}><i className="ph-bold ph-x text-gray-400 hover:text-rose-500 text-xl transition-colors"></i></button></div>
                            <form onSubmit={handleSavePerf} className="p-6 overflow-y-auto max-h-[85vh] custom-scrollbar">
                                <div className="mb-6 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4 flex items-start gap-3"><i className="ph-fill ph-info text-indigo-500 text-2xl shrink-0"></i><div className="w-full"><h4 className="font-bold text-indigo-800 dark:text-indigo-300 text-sm">Target Rekrutmen & Bonus Mingguan (50K)</h4><div className="text-xs text-indigo-700 dark:text-indigo-400 mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2"><div className="bg-white/50 dark:bg-gray-800/50 p-2 rounded text-center border border-indigo-100 dark:border-indigo-800"><b>3+ Rekrut</b><br/>0 Post</div><div className="bg-white/50 dark:bg-gray-800/50 p-2 rounded text-center border border-indigo-100 dark:border-indigo-800"><b>2 Rekrut</b><br/>30 Post</div><div className="bg-white/50 dark:bg-gray-800/50 p-2 rounded text-center border border-indigo-100 dark:border-indigo-800"><b>1 Rekrut</b><br/>60 Post</div><div className="bg-white/50 dark:bg-gray-800/50 p-2 rounded text-center border border-indigo-100 dark:border-indigo-800"><b>0 Rekrut</b><br/>90 Post</div></div><p className="text-[10px] font-bold text-rose-500 mt-2">*Tidak capai kombinasi target ini = Denda Rp 5.000/hari.</p></div></div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div><label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Tanggal</label><input type="date" required className={InputClass} value={formData.tanggal} onChange={e=>setFormData({...formData, tanggal: e.target.value})} disabled={modalMode === 'edit'} /></div>
                                    <div><label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Username Staff</label><select required className={InputClass} value={formData.username} onChange={e=>setFormData({...formData, username: e.target.value})} disabled={modalMode === 'edit' || !isPrivileged}><option value="" disabled>Pilih Staff...</option>{globalStaffList.map((u, i) => <option key={i} value={u.username}>{u.name} ({u.username})</option>)}</select></div>
                                    <div className="sm:col-span-2 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800 grid grid-cols-2 md:grid-cols-4 gap-4"><div><label className="block text-xs font-bold text-gray-500 mb-1">Total Posts</label><input type="number" min="0" required placeholder="0" className={InputClass} value={formData.postingan} onChange={e=>setFormData({...formData, postingan: e.target.value})} /></div><div><label className="block text-xs font-bold text-gray-500 mb-1">Kunjungan</label><input type="number" min="0" required placeholder="0" className={InputClass} value={formData.kunjungan} onChange={e=>setFormData({...formData, kunjungan: e.target.value})} /></div><div><label className="block text-xs font-bold text-gray-500 mb-1">Pelamar</label><input type="number" min="0" required placeholder="0" className={InputClass} value={formData.pelamar} onChange={e=>setFormData({...formData, pelamar: e.target.value})} /></div><div><label className="block text-xs font-bold text-gray-500 mb-1">Pengujian</label><input type="number" min="0" required placeholder="0" className={InputClass} value={formData.pengujian} onChange={e=>setFormData({...formData, pengujian: e.target.value})} /></div></div>
                                    <div className="sm:col-span-2 mt-2"><label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider"><i className="ph-bold ph-robot"></i> Perhitungan Otomatis (Live Preview)</label><div className="flex bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl divide-x divide-indigo-100 dark:divide-indigo-800 shadow-inner"><div className="flex-1 p-3 text-center"><div className="text-[10px] font-bold text-indigo-400 uppercase">Auto T0</div><div className="text-xl font-black text-emerald-600">{formData.username ? activeFormStats.t0 : '-'}</div></div><div className="flex-1 p-3 text-center"><div className="text-[10px] font-bold text-indigo-400 uppercase">Auto V0</div><div className="text-xl font-black text-purple-600">{formData.username ? activeFormStats.v0 : '-'}</div></div><div className="flex-1 p-3 text-center"><div className="text-[10px] font-bold text-indigo-400 uppercase">Tot Harian</div><div className="text-xl font-black text-indigo-600 dark:text-indigo-400">{formData.username ? activeFormStats.totalHarian : '-'}</div></div><div className="flex-1 p-3 text-center flex flex-col justify-center items-center bg-white/50 dark:bg-gray-800/50"><div className="text-[10px] font-bold text-gray-500 uppercase mb-1">Denda Form</div>{formData.username ? (evalForm.denda > 0 ? <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow animate-pulse" title={`Butuh ${evalForm.reqPosting} posting`}>Rp 5.000</span> : <span className="bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow">Rp 0 (Aman)</span>) : <span className="text-gray-400 text-xs">-</span>}</div></div></div>
                                </div>
                                <div className="mt-8 pt-5 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3"><button type="button" onClick={()=>setIsModalOpen(false)} className="px-5 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 transition-colors">Batal</button><button type="submit" disabled={!formData.username} className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 flex items-center transition-colors disabled:opacity-50"><i className="ph-bold ph-floppy-disk mr-2 text-lg"></i> Simpan Laporan</button></div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        );
    };






//------------------------------------------------------------------------------------------------------------------------------------------//
const UserManagement = ({ authUser }) => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({ name: '', username: '', uid: '', password: '', role: 'Staff', status: 'Aktif', photoUrl: '', photoBase64: '' });
    const [originalUsername, setOriginalUsername] = useState('');
    const [expandedUser, setExpandedUser] = useState(null);

    const [adminPage, setAdminPage] = useState(1);
    const [staffPage, setStaffPage] = useState(1);
    const itemsPerPage = 10;

    const isSuperadmin = authUser && authUser.role === 'Superadmin';
    const isAdmin = authUser && authUser.role === 'Admin';

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action: 'getUsers' }) });
            const result = await response.json();
            if (result.status === 'success') { setUsers(Array.isArray(result.data) ? result.data : []); } else { setUsers([]); }
        } catch (error) { setUsers([]); } finally { setIsLoading(false); }
    };

    useEffect(() => { fetchUsers(); }, []);

    const adminUsers = users.filter(u => u.role === 'Superadmin' || u.role === 'Admin');
    const staffUsers = users.filter(u => u.role === 'Staff');

    const totalAdminPages = Math.ceil(adminUsers.length / itemsPerPage) || 1;
    const adminStartIndex = (adminPage - 1) * itemsPerPage;
    const adminPaginated = adminUsers.slice(adminStartIndex, adminStartIndex + itemsPerPage);

    const totalStaffPages = Math.ceil(staffUsers.length / itemsPerPage) || 1;
    const staffStartIndex = (staffPage - 1) * itemsPerPage;
    const staffPaginated = staffUsers.slice(staffStartIndex, staffStartIndex + itemsPerPage);

    useEffect(() => { setAdminPage(1); }, [adminUsers.length]);
    useEffect(() => { setStaffPage(1); }, [staffUsers.length]);

    const toggleExpand = (username) => { setExpandedUser(prev => prev === username ? null : username); };

    const handleOpenAdd = () => { setModalMode('add'); setFormData({ name: '', username: '', uid: '', password: '', role: 'Staff', status: 'Aktif', photoUrl: '', photoBase64: '' }); setIsModalOpen(true); };
    const handleOpenEdit = (user) => { setModalMode('edit'); setOriginalUsername(user.username); setFormData({ name: user.name || '', username: user.username || '', uid: user.uid || '', password: '', role: user.role || 'Staff', status: user.status || 'Aktif', photoUrl: user.photoUrl || '', photoBase64: '' }); setIsModalOpen(true); };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2000000) { alert('Ukuran foto maksimal 2MB!'); return; }
        
        const reader = new FileReader();
        reader.onloadend = () => { setFormData({ ...formData, photoBase64: reader.result }); };
        reader.readAsDataURL(file);
    };

    const handleAcc = async (user) => {
        const newRole = isSuperadmin ? (user.role || 'Staff') : 'Staff';
        if (!window.confirm(`Setujui ${user.name || user.username} sebagai ${newRole} dan Aktifkan akunnya?`)) return;
        setIsLoading(true);
        try {
            const payload = { action: 'updateUser', oldUsername: user.username, username: user.username, name: user.name || '', role: newRole, status: 'Aktif', password: '', uid: user.uid || '' };
            const response = await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify(payload) });
            const result = await response.json();
            if (result.status === 'success') fetchUsers(); else { alert(result.message); setIsLoading(false); }
        } catch (error) { alert('Terjadi kesalahan koneksi.'); setIsLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); setIsSubmitting(true); const action = modalMode === 'add' ? 'addUser' : 'updateUser';
        try {
            const payload = { action, ...formData }; if (modalMode === 'edit') payload.oldUsername = originalUsername;
            const response = await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify(payload) });
            const result = await response.json();
            if (result.status === 'success') { fetchUsers(); setIsModalOpen(false); } else alert(result.message);
        } catch (error) { alert('Terjadi kesalahan koneksi.'); } finally { setIsSubmitting(false); }
    };

    const handleDelete = async (username) => {
        if (!window.confirm(`Yakin ingin menghapus user ${username}? Tindakan ini tidak bisa dibatalkan.`)) return;
        setUsers(users.filter(u => u.username !== username));
        try {
            const response = await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action: 'deleteUser', username }) });
            const result = await response.json();
            if (result.status !== 'success') { alert(result.message); fetchUsers(); }
        } catch (error) { alert('Terjadi kesalahan saat menghapus.'); fetchUsers(); }
    };

    const inputClass = "w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all";
    const Label = ({children}) => <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">{children}</label>;

    const isNewUser = (dateStr) => {
        if (!dateStr || dateStr === '-') return false;
        try {
            const joinDate = new Date(dateStr);
            if (isNaN(joinDate.getTime())) return false;
            const diffTime = new Date() - joinDate;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays >= 0 && diffDays <= 7;
        } catch(e) { return false; }
    };

    const getRoleStyles = (role, isExpanded) => {
        const styles = {
            Superadmin: {
                card: isExpanded ? 'border-rose-300 dark:border-rose-700/50 shadow-md' : 'border-rose-200 dark:border-rose-900/50 hover:border-rose-300 dark:hover:border-rose-700',
                header: isExpanded ? 'bg-rose-50/80 dark:bg-rose-950/40' : 'bg-white dark:bg-gray-800/80 hover:bg-rose-50/50 dark:hover:bg-rose-950/20',
                avatar: 'bg-gradient-to-br from-rose-500 to-red-700 text-white shadow-rose-500/40 border-rose-400',
                imgBorder: 'border-rose-400',
                name: 'text-rose-600 dark:text-rose-500',
                badge: 'bg-gradient-to-b from-rose-500 to-red-700 border-rose-400/50 shadow-[0_2px_10px_rgba(225,29,72,0.4)]',
                badgeText: 'SUPERADMIN',
                badgeIcon: 'ph-user-gear',
                detail: 'border-rose-100 dark:border-rose-900/30 bg-rose-50/40 dark:bg-rose-950/20',
                grad: ['#FDE047', '#F59E0B', '#B45309'], 
                glow: 'drop-shadow-[0_2px_4px_rgba(225,29,72,0.6)]',
                iconPath: 'M3.75 21h16.5a.75.75 0 00.75-.75v-1.5a.75.75 0 00-.75-.75H3.75a.75.75 0 00-.75.75v1.5c0 .41.34.75.75.75zm16.7-9.41l-3.8-5.33a.75.75 0 00-1.26.13l-3.39 6.78-3.39-6.78a.75.75 0 00-1.26-.13l-3.8 5.33A.75.75 0 003.88 16.5h16.24a.75.75 0 00.58-1.21z' 
            },
            Admin: {
                card: isExpanded ? 'border-blue-300 dark:border-blue-700/50 shadow-md' : 'border-blue-200 dark:border-blue-900/50 hover:border-blue-300 dark:hover:border-blue-700',
                header: isExpanded ? 'bg-blue-50/80 dark:bg-blue-950/40' : 'bg-white dark:bg-gray-800/80 hover:bg-blue-50/50 dark:hover:bg-blue-950/20',
                avatar: 'bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-blue-500/40 border-blue-400',
                imgBorder: 'border-blue-400',
                name: 'text-blue-600 dark:text-blue-400',
                badge: 'bg-gradient-to-b from-blue-500 to-blue-700 border-blue-400/50 shadow-[0_2px_10px_rgba(59,130,246,0.4)]',
                badgeText: 'ADMIN',
                badgeIcon: 'ph-shield-check',
                detail: 'border-blue-100 dark:border-blue-900/30 bg-blue-50/40 dark:bg-blue-950/20',
                grad: ['#93C5FD', '#3B82F6', '#1E3A8A'], 
                glow: 'drop-shadow-[0_2px_4px_rgba(59,130,246,0.6)]',
                iconPath: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z' 
            },
            Staff: {
                card: isExpanded ? 'border-amber-300 dark:border-amber-700/50 shadow-md' : 'border-amber-200 dark:border-amber-900/50 hover:border-amber-300 dark:hover:border-amber-700',
                header: isExpanded ? 'bg-amber-50/80 dark:bg-amber-950/40' : 'bg-white dark:bg-gray-800/80 hover:bg-amber-50/50 dark:hover:bg-amber-950/20',
                avatar: 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-amber-500/40 border-amber-400',
                imgBorder: 'border-amber-400',
                name: 'text-amber-600 dark:text-amber-500',
                badge: 'bg-gradient-to-b from-amber-500 to-orange-600 border-amber-400/50 shadow-[0_2px_10px_rgba(245,158,11,0.4)]',
                badgeText: 'STAFF',
                badgeIcon: 'ph-users',
                detail: 'border-amber-100 dark:border-amber-900/30 bg-amber-50/40 dark:bg-amber-950/20',
                grad: ['#FEF08A', '#EAB308', '#854D0E'], 
                glow: 'drop-shadow-[0_2px_4px_rgba(245,158,11,0.6)]',
                iconPath: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' 
            }
        };
        return styles[role] || styles['Staff'];
    };

    const renderUserList = (dataList) => (
        <div className="space-y-3">
            {dataList.length === 0 ? <div className="text-center py-10 text-gray-500 font-medium bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">Belum ada data di kategori ini.</div> : dataList.map((u, i) => {
                const isPending = u.status === 'Pending'; 
                const canEdit = isSuperadmin || (isAdmin && (u.role === 'Staff' || isPending) && u.role !== 'Superadmin' && u.role !== 'Admin'); 
                const canDelete = isSuperadmin && authUser && u.username !== authUser.username;
                const isExpanded = expandedUser === u.username;
                const st = getRoleStyles(u.role, isExpanded);
                
                const displayPhoto = (formData.username === u.username && formData.photoBase64) ? formData.photoBase64 : u.photoUrl;
                const newlyJoined = isNewUser(u.tanggalBergabung); 

                return (
                    <div key={i} className={`rounded-2xl border transition-all duration-300 overflow-hidden shadow-sm ${st.card}`}>
                        
                        {/* HEADER PROFIL (Dapat di Klik) */}
                        <div onClick={() => toggleExpand(u.username)} className={`flex items-center justify-between p-3 sm:p-4 cursor-pointer transition-colors select-none ${st.header}`}>
                            
                            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                                {/* Avatar */}
                                {displayPhoto ? (
                                    <img src={displayPhoto} alt={u.name} className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shrink-0 shadow-sm border-2 ${st.imgBorder}`} />
                                ) : (
                                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-black text-lg sm:text-xl shrink-0 shadow-inner ${st.avatar}`}>
                                        {u.name ? u.name.charAt(0).toUpperCase() : '?'}
                                    </div>
                                )}
                                
                                {/* Info Teks */}
                                <div className="min-w-0 flex-1">
                                    <div className={`font-black flex items-center gap-1.5 drop-shadow-sm text-base sm:text-lg flex-wrap ${st.name}`}>
                                        <svg className={`w-5 h-5 sm:w-6 sm:h-6 shrink-0 ${st.glow} animate-pulse`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <defs>
                                                <linearGradient id={`grad-${u.username}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                                    <stop offset="0%" stopColor={st.grad[0]} />
                                                    <stop offset="50%" stopColor={st.grad[1]} />
                                                    <stop offset="100%" stopColor={st.grad[2]} />
                                                </linearGradient>
                                            </defs>
                                            <path d={st.iconPath} fill={`url(#grad-${u.username})`} />
                                        </svg>
                                        
                                        {/* Truncate agar nama yang terlalu panjang tidak merusak layout HP */}
                                        <span className="truncate max-w-[120px] sm:max-w-xs">{u.name || 'Unknown'}</span>

                                        {/* BADGE "NEW" PILL SHAPE */}
                                        {newlyJoined && (
                                            <span className="px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-full text-[8px] sm:text-[9px] font-black bg-gradient-to-r from-rose-500 to-red-600 text-white animate-pulse shadow-[0_2px_10px_rgba(244,63,94,0.4)] border border-rose-400/50 uppercase tracking-widest shrink-0 flex items-center gap-1">
                                                <i className="ph-fill ph-sparkle text-[10px]"></i> NEW
                                            </span>
                                        )}
                                    </div>
                                    <div className={`text-[10px] sm:text-xs font-mono mt-0.5 flex items-center font-bold opacity-80 truncate ${st.name}`}>
                                        <i className="ph-bold ph-at mr-1 shrink-0"></i><span className="truncate">{u.username || 'Unknown'}</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Status & Icon Dropdown */}
                            <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-2">
                                <div className={`hidden sm:block text-xs font-bold px-2 py-1 rounded border ${u.status === 'Aktif' || u.status === 'Online' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : u.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`}>
                                    {u.status}
                                </div>
                                <div className={`w-3 h-3 rounded-full shadow-sm sm:hidden relative ${u.status === 'Aktif' || u.status === 'Online' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : u.status === 'Pending' ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]' : 'bg-rose-500'}`}></div>
                                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-colors ${isExpanded ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400' : 'bg-gray-100 text-gray-400 dark:bg-gray-700'}`}>
                                    <i className={`ph-bold ph-caret-down text-sm sm:text-base transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}></i>
                                </div>
                            </div>
                        </div>

                        {/* DETAIL MENGEMBANG (Expanded Content) */}
                        {isExpanded && (
                            <div className={`p-4 sm:p-5 border-t animate-in slide-in-from-top-2 duration-200 ${st.detail}`}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 items-start">
                                    
                                    {/* Kolom 1: Otoritas */}
                                    <div>
                                        <span className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 sm:mb-2.5">Otoritas Sistem</span>
                                        <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-white text-[10px] font-black uppercase tracking-widest border ${st.badge}`}>
                                            <i className={`ph-fill ${st.badgeIcon} mr-1.5 text-sm drop-shadow-md`}></i> {st.badgeText}
                                        </div>
                                    </div>
                                    
                                    {/* Kolom 2: Informasi */}
                                    <div>
                                        <span className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 sm:mb-2.5">Informasi Data</span>
                                        <div className="space-y-1.5 sm:space-y-2 text-xs text-gray-700 dark:text-gray-300">
                                            <div className="flex items-center"><span className="w-20 text-gray-400 flex items-center"><i className="ph-bold ph-hash mr-1.5"></i> UID</span><span className="font-mono font-bold bg-white/60 dark:bg-gray-800/60 px-2 py-0.5 rounded border border-gray-100 dark:border-gray-700 truncate max-w-[120px] sm:max-w-[200px]">{u.uid || '-'}</span></div>
                                            <div className="flex items-center"><span className="w-20 text-gray-400 flex items-center"><i className="ph-bold ph-calendar-blank mr-1.5"></i> Gabung</span><span className="font-bold">{formatToDDMMYYYY(u.tanggalBergabung)}</span></div>
                                        </div>
                                    </div>
                                    
                                    {/* Kolom 3: Tindakan (Tombol) */}
                                    <div className="sm:col-span-2 lg:col-span-1 lg:text-right flex flex-col lg:items-end justify-start mt-2 sm:mt-0">
                                        <span className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 lg:mb-2.5">Tindakan</span>
                                        
                                        {/* Container tombol disesuaikan agar full-width di HP, dan rapi di Layar Besar */}
                                        <div className="flex flex-col sm:flex-row lg:flex-row flex-wrap gap-2 w-full lg:w-auto">
                                            {isPending && (isSuperadmin || isAdmin) && (
                                                <button onClick={() => handleAcc(u)} className="w-full sm:w-auto justify-center px-4 py-2.5 sm:py-2 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center transform sm:hover:-translate-y-0.5">
                                                    <i className="ph-bold ph-check-circle mr-1.5 text-base"></i> Terima (ACC)
                                                </button>
                                            )}
                                            {canEdit && (
                                                <button onClick={() => handleOpenEdit(u)} className="w-full sm:w-auto justify-center px-4 py-2.5 sm:py-2 text-xs font-bold text-indigo-700 bg-indigo-100 hover:bg-indigo-500 hover:text-white dark:bg-indigo-900/40 dark:text-indigo-300 dark:hover:bg-indigo-600 dark:hover:text-white rounded-xl transition-all shadow-sm flex items-center transform sm:hover:-translate-y-0.5">
                                                    <i className="ph-bold ph-pencil-simple mr-1.5 text-base"></i> Edit Profil
                                                </button>
                                            )}
                                            {canDelete && (
                                                <button onClick={() => handleDelete(u.username)} className="w-full sm:w-auto justify-center px-4 py-2.5 sm:py-2 text-xs font-bold text-rose-700 bg-rose-100 hover:bg-rose-500 hover:text-white dark:bg-rose-900/40 dark:text-rose-300 dark:hover:bg-rose-600 dark:hover:text-white rounded-xl transition-all shadow-sm flex items-center transform sm:hover:-translate-y-0.5">
                                                    <i className="ph-bold ph-trash mr-1.5 text-base"></i> Hapus
                                                </button>
                                            )}
                                            {!isPending && !canEdit && !canDelete && (
                                                <span className="w-full lg:w-auto text-center text-xs text-gray-400 italic bg-white/50 dark:bg-gray-800/50 px-3 py-2 sm:py-1.5 rounded-lg border border-gray-100 dark:border-gray-700">Tidak ada aksi tersedia</span>
                                            )}
                                        </div>
                                    </div>

                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );

    const renderPagination = (currentPage, setPage, totalPages, totalItems, startIndex) => {
        if (totalItems === 0) return null;
        return (
            <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700 gap-3">
                <div className="text-xs font-bold text-center sm:text-left text-gray-500 dark:text-gray-400">
                    Menampilkan <span className="text-indigo-600 dark:text-indigo-400">{startIndex + 1}</span> - <span className="text-indigo-600 dark:text-indigo-400">{Math.min(startIndex + itemsPerPage, totalItems)}</span> dari <span className="text-gray-900 dark:text-white">{totalItems}</span> data
                </div>
                <div className="flex items-center justify-center gap-2 w-full sm:w-auto">
                    <button onClick={() => setPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="flex-1 sm:flex-none justify-center px-3 py-2 sm:py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-bold text-gray-600 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center shadow-sm"><i className="ph-bold ph-caret-left mr-1"></i> Prev</button>
                    <span className="text-xs font-bold px-3 py-2 sm:py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-300 shadow-inner">Hal {currentPage} / {totalPages}</span>
                    <button onClick={() => setPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="flex-1 sm:flex-none justify-center px-3 py-2 sm:py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-bold text-gray-600 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center shadow-sm">Next <i className="ph-bold ph-caret-right ml-1"></i></button>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6 sm:space-y-8">
            <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden relative min-h-[500px]">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

                <div className="p-4 sm:p-6 relative z-10">
                    
                    {/* Header Judul & Tombol Tambah */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4 border-b border-gray-100 dark:border-gray-700/50 pb-4 sm:pb-5">
                        <h3 className="font-black text-lg sm:text-xl flex items-center text-gray-900 dark:text-white tracking-tight">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 mr-3"><i className="ph-bold ph-users text-lg sm:text-xl"></i></div>
                            User Management
                        </h3>
                        <button onClick={handleOpenAdd} className="w-full sm:w-auto px-5 py-3 sm:py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_20px_rgba(79,70,229,0.5)] hover:bg-indigo-500 transition-all transform hover:-translate-y-0.5"><i className="ph-bold ph-user-plus mr-2 text-lg"></i> Tambah User</button>
                    </div>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400"><i className="ph-bold ph-spinner ph-spin text-4xl mb-3 text-indigo-500"></i><p className="text-xs sm:text-sm font-bold tracking-widest uppercase">Sinkronisasi Data...</p></div>
                    ) : (
                        <div className="space-y-8 sm:space-y-10">
                            
                            <section>
                                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                                    <h4 className="font-black text-base sm:text-lg text-rose-600 dark:text-rose-500 flex items-center"><i className="ph-fill ph-shield-check mr-2 text-lg sm:text-xl"></i> Otoritas Sistem</h4>
                                    <span className="bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold">{adminUsers.length}</span>
                                </div>
                                {renderUserList(adminPaginated)}
                                {renderPagination(adminPage, setAdminPage, totalAdminPages, adminUsers.length, adminStartIndex)}
                            </section>

                            <section>
                                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                                    <h4 className="font-black text-base sm:text-lg text-amber-600 dark:text-amber-500 flex items-center"><i className="ph-fill ph-users-three mr-2 text-lg sm:text-xl"></i> Tim Operasional (Staff)</h4>
                                    <span className="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-500 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold">{staffUsers.length}</span>
                                </div>
                                {renderUserList(staffPaginated)}
                                {renderPagination(staffPage, setStaffPage, totalStaffPages, staffUsers.length, staffStartIndex)}
                            </section>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Input/Edit User */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
                    <div className="absolute inset-0 bg-gray-900/70 backdrop-blur-sm" onClick={()=>setIsModalOpen(false)}></div>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col relative z-10 animate-in zoom-in-95 duration-200 border-t-4 border-t-indigo-500">
                        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/80 dark:bg-gray-800/50 backdrop-blur-sm">
                            <h2 className="font-black text-lg sm:text-xl flex items-center text-gray-900 dark:text-white"><i className={`ph-fill ${modalMode === 'add' ? 'ph-user-plus' : 'ph-pencil-simple'} text-indigo-600 mr-2 text-xl sm:text-2xl`}></i> {modalMode === 'add' ? 'Tambah User Baru' : 'Edit Data User'}</h2>
                            <button onClick={()=>setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-rose-100 hover:text-rose-600 text-gray-400 transition-colors"><i className="ph-bold ph-x text-lg sm:text-xl"></i></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto max-h-[80vh] custom-scrollbar">
                            <div className="flex flex-col items-center mb-4 sm:mb-6">
                                <div className="relative group cursor-pointer mb-2">
                                    <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" id="photo-upload" disabled={isSubmitting} />
                                    <label htmlFor="photo-upload" className="block relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden shadow-lg border-4 border-white dark:border-gray-700 cursor-pointer">
                                        {(formData.photoBase64 || formData.photoUrl) ? (
                                            <img src={formData.photoBase64 || formData.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-500"><i className="ph-fill ph-user text-3xl sm:text-4xl"></i></div>
                                        )}
                                        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><i className="ph-bold ph-camera text-white text-lg sm:text-xl mb-1"></i><span className="text-white text-[9px] sm:text-[10px] font-bold">Ganti Foto</span></div>
                                    </label>
                                </div>
                                <span className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase tracking-wider">Format JPG/PNG • Max 2MB</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                                <div className="sm:col-span-2"><Label>Nama Lengkap</Label><div className="relative"><i className="ph-bold ph-identification-card absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg"></i><input type="text" placeholder="Masukkan nama lengkap" required className={`${inputClass} pl-10`} value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} disabled={isSubmitting} /></div></div>
                                <div><Label>Username Telegram</Label><div className="relative"><i className="ph-bold ph-at absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg"></i><input type="text" placeholder="@username" required className={`${inputClass} pl-10 ${(!isSuperadmin && modalMode === 'edit') ? 'bg-gray-100 dark:bg-gray-700/50 cursor-not-allowed opacity-70' : ''}`} value={formData.username} onChange={e=>setFormData({...formData, username: e.target.value})} disabled={(!isSuperadmin && modalMode === 'edit') || isSubmitting} /></div>{(!isSuperadmin && modalMode === 'edit') && <span className="text-[9px] sm:text-[10px] font-bold text-amber-500 mt-1.5 block flex items-center"><i className="ph-fill ph-warning mr-1"></i> Username dilock.</span>}</div>
                                <div><Label>UID</Label><div className="relative"><i className="ph-bold ph-hash absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg"></i><input type="text" placeholder="Masukkan UID" required className={`${inputClass} pl-10`} value={formData.uid} onChange={e=>setFormData({...formData, uid: e.target.value})} disabled={isSubmitting} /></div></div>
                                <div><Label>Password {modalMode === 'edit' && <span className="text-gray-400 font-normal">(Opsional)</span>}</Label><div className="relative"><i className="ph-bold ph-lock-key absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg"></i><input type="password" placeholder={modalMode === 'edit' ? 'Kosongkan jika tetap' : 'Buat password'} required={modalMode === 'add'} className={`${inputClass} pl-10`} value={formData.password} onChange={e=>setFormData({...formData, password: e.target.value})} disabled={isSubmitting} /></div></div>
                                <div>
                                    <Label>Pilih Role</Label><div className="relative"><i className="ph-bold ph-shield-star absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg"></i><select className={`${inputClass} pl-10 font-bold`} value={formData.role} onChange={e=>setFormData({...formData, role: e.target.value})} disabled={!isSuperadmin || isSubmitting}><option value="Staff">Staff (Akses Terbatas)</option>{isSuperadmin && <option value="Admin">Admin (Bisa edit data)</option>}{isSuperadmin && <option value="Superadmin">Superadmin (Akses Penuh)</option>}</select></div>
                                    {!isSuperadmin && <span className="text-[9px] sm:text-[10px] font-bold text-amber-500 mt-1.5 block flex items-center"><i className="ph-fill ph-warning mr-1"></i> Hanya bisa Staff.</span>}
                                </div>
                                <div className="sm:col-span-2"><Label>Status Akun</Label><div className="relative"><i className="ph-bold ph-activity absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg"></i><select className={`${inputClass} pl-10 font-bold`} value={formData.status} onChange={e=>setFormData({...formData, status: e.target.value})} disabled={isSubmitting}><option value="Aktif">🟢 Aktif</option><option value="Pending">🟡 Pending (Menunggu)</option><option value="Nonaktif">🔴 Nonaktif / Suspend</option></select></div></div>
                            </div>
                            <div className="pt-5 sm:pt-6 flex flex-col sm:flex-row gap-3 border-t border-gray-100 dark:border-gray-700 mt-4">
                                <button type="button" onClick={()=>setIsModalOpen(false)} className="w-full sm:w-1/3 py-3 sm:py-3.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" disabled={isSubmitting}>Batal</button>
                                <button type="submit" className="w-full sm:w-2/3 py-3 sm:py-3.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:bg-indigo-700 flex justify-center items-center transition-all transform sm:hover:-translate-y-0.5 disabled:opacity-70 disabled:transform-none" disabled={isSubmitting}>{isSubmitting ? <><i className="ph-bold ph-spinner ph-spin mr-2 text-lg sm:text-xl"></i> Memproses</> : <><i className="ph-bold ph-floppy-disk mr-2 text-lg sm:text-xl"></i> Simpan Data</>}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};














    const App = () => {
        const [authUser, setAuthUser] = useState(() => { 
            try { const saved = localStorage.getItem('recruitOps_session'); return saved ? JSON.parse(saved) : null; } 
            catch (error) { return null; } 
        });
        const [authView, setAuthView] = useState('login');
        const [activeTab, setActiveTab] = useState('dashboard');
        const [isSidebarOpen, setSidebarOpen] = useState(false);
        const [isDark, setIsDark] = useState(() => localStorage.getItem('recruitOps_theme') === 'dark');
        const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
        const [isCheckingSession, setIsCheckingSession] = useState(true);
        const [unreadAnnouncements, setUnreadAnnouncements] = useState(0);

        useEffect(() => { 
            const handleResize = () => setIsMobile(window.innerWidth < 768); 
            window.addEventListener('resize', handleResize); setTimeout(() => setIsCheckingSession(false), 300); 
            return () => window.removeEventListener('resize', handleResize); 
        }, []);

        useEffect(() => { 
            if (isDark) { document.documentElement.classList.add('dark'); localStorage.setItem('recruitOps_theme', 'dark'); } 
            else { document.documentElement.classList.remove('dark'); localStorage.setItem('recruitOps_theme', 'light'); } 
        }, [isDark]);

        useEffect(() => { if (authUser) setActiveTab(authUser.role === 'Staff' ? 'daily_stats' : 'dashboard'); }, [authUser]);

        useEffect(() => {
            const checkUnread = () => { const saved = localStorage.getItem('recruitOps_announcements'); if(saved) { const posts = JSON.parse(saved); const recent = posts.filter(p => new Date(p.timestamp) > new Date(Date.now() - 86400000)).length; setUnreadAnnouncements(recent); } };
            checkUnread(); const intv = setInterval(checkUnread, 5000); return () => clearInterval(intv);
        }, []);

        const login = (user) => { let validRole = user.role ? user.role.toString().trim() : 'Staff'; validRole = validRole.charAt(0).toUpperCase() + validRole.slice(1).toLowerCase(); if (!['Superadmin', 'Admin', 'Staff'].includes(validRole)) validRole = 'Staff'; const finalUser = { ...user, role: validRole }; setAuthUser(finalUser); localStorage.setItem('recruitOps_session', JSON.stringify(finalUser)); };
        const logout = () => { setAuthUser(null); localStorage.removeItem('recruitOps_session'); setAuthView('login'); };
        const changeTab = (id) => { setActiveTab(id); if(isMobile) setSidebarOpen(false); };

        if (isCheckingSession) return (<div className={`h-dvh flex items-center justify-center ${isDark ? 'dark bg-gray-900' : 'bg-[#F8FAFC]'}`}><div className="flex flex-col items-center"><i className="ph-bold ph-spinner ph-spin text-4xl text-indigo-600 dark:text-indigo-400 mb-4"></i><span className="text-gray-500 dark:text-gray-400 font-bold text-sm">Memuat ruang kerja...</span></div></div>);
        if (!authUser) return (<div className={isDark ? 'dark' : ''}>{authView === 'login' ? <Login onLogin={login} onNavigateRegister={()=>setAuthView('register')} /> : <Register onRegister={login} onNavigateLogin={()=>setAuthView('login')} />}<button onClick={()=>setIsDark(!isDark)} className="fixed top-4 right-4 p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg text-gray-500 z-50 transition-transform active:scale-95"><i className={`ph-bold ${isDark?'ph-sun':'ph-moon'} text-xl`}></i></button></div>);

        const NAVIGATION = [
            { s: 'Overview', allowed: ['Superadmin', 'Admin', 'Staff'], items: [{ id: 'dashboard', l: 'Executive Dashboard', i: 'ph-squares-four', roles: ['Superadmin', 'Admin'] }, { id: 'announcement', l: 'Announcement Center', i: 'ph-megaphone', roles: ['Superadmin', 'Admin', 'Staff'], badge: unreadAnnouncements }, { id: 'follow_up', l: 'Follow Up Center', i: 'ph-bell-ringing', roles: ['Superadmin', 'Admin', 'Staff'] }] },
            { s: 'Performance', allowed: ['Superadmin', 'Admin', 'Staff'], items: [{ id: 'performance', l: 'Recruiter Performance', i: 'ph-medal', roles: ['Superadmin', 'Admin', 'Staff'] }, { id: 'goals', l: 'Recruitment Goals', i: 'ph-target', roles: ['Superadmin', 'Admin'] }, { id: 'channels', l: 'Channel Performance', i: 'ph-megaphone', roles: ['Superadmin', 'Admin'] }] },
            { s: 'Management', allowed: ['Superadmin', 'Admin', 'Staff'], items: [{ id: 'daily_data', l: 'Daily Data', i: 'ph-address-book', roles: ['Superadmin', 'Admin', 'Staff'] }, { id: 'daily_stats', l: 'Daily Stats', i: 'ph-chart-bar', roles: ['Superadmin', 'Admin', 'Staff'] }, { id: 'payroll', l: 'Payroll', i: 'ph-currency-circle-dollar', roles: ['Superadmin', 'Admin'] }, { id: 'users', l: 'User Accounts', i: 'ph-user-gear', roles: ['Superadmin', 'Admin'] }] },
            { s: 'System', allowed: ['Superadmin'], items: [{ id: 'settings', l: 'Settings', i: 'ph-gear', roles: ['Superadmin'] }] }
        ].map(sec => ({ ...sec, items: sec.items.filter(item => item.roles.includes(authUser.role)) })).filter(sec => sec.items.length > 0 && sec.allowed.includes(authUser.role));

        let pageTitle = 'Dashboard'; NAVIGATION.forEach(sec => sec.items.forEach(item => { if(item.id === activeTab) pageTitle = item.l; }));

        const renderPageContent = () => {
            switch(activeTab) {
                case 'dashboard': return <ExecutiveDashboard authUser={authUser} />;
                case 'announcement': return <AnnouncementCenter authUser={authUser} />;
                case 'follow_up': return <FollowUpCenter authUser={authUser} />;
                case 'performance': return <RecruiterPerformance authUser={authUser} />;
                case 'goals': return <RecruitmentGoals authUser={authUser} />;
                case 'channels': return <ChannelPerformance authUser={authUser} />;
                case 'daily_data': return <DailyData authUser={authUser} />;
                case 'daily_stats': return <DailyStats authUser={authUser} />;
                case 'payroll': return <Payroll />;
                case 'users': return <UserManagement authUser={authUser} />;
                case 'settings': return <SystemSettings />;
                default: return <ExecutiveDashboard authUser={authUser} />;
            }
        };

        const bottomNavItems = [...(authUser.role !== 'Staff' ? [{ id: 'dashboard', label: 'Home', icon: 'ph-house' }] : []), { id: 'announcement', label: 'Comm', icon: 'ph-megaphone', badge: unreadAnnouncements }, { id: 'daily_data', label: 'Input', icon: 'ph-address-book' }, { id: 'daily_stats', label: 'Stats', icon: 'ph-chart-bar' }, { id: 'follow_up', label: 'Follow', icon: 'ph-bell-ringing' }];

        return (
            <div className={`${isDark ? 'dark' : ''} h-dvh overflow-hidden flex flex-col bg-[#F8FAFC] dark:bg-gray-900 transition-colors`}>
                <div className="flex flex-1 overflow-hidden relative">
                    {isMobile && isSidebarOpen && <div className="fixed inset-0 bg-gray-900/50 dark:bg-black/60 backdrop-blur-sm z-40" onClick={() => setSidebarOpen(false)} />}
                    <aside className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                        <div className="h-16 flex items-center px-6 border-b border-gray-100 dark:border-gray-700 shrink-0">
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-indigo-500/30 border-t border-indigo-400/50 relative overflow-hidden group shrink-0"><div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div><svg className="w-5 h-5 text-white relative z-10 drop-shadow-md group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L3 21H7.5L12 11L16.5 21H21L12 2Z" fill="currentColor"/><path d="M9.5 15H14.5L12 9.5L9.5 15Z" fill="currentColor" fillOpacity="0.4"/></svg></div>
                            <span className="text-xl font-bold">Recruit<span className="text-indigo-600">Ops</span></span>
                            {isMobile && <button onClick={()=>setSidebarOpen(false)} className="ml-auto text-gray-400 text-xl p-2"><i className="ph-bold ph-x"></i></button>}
                        </div>
                        <div className="flex-1 overflow-y-auto py-6 px-4 custom-scrollbar pb-24 md:pb-6">
                            {NAVIGATION.map((group, idx) => (
                                <div key={idx} className="mb-6"><h4 className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{group.s}</h4><nav className="space-y-1">{group.items.map(item => (<button key={item.id} onClick={()=>changeTab(item.id)} className={`w-full relative flex items-center px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab===item.id ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}><i className={`ph-bold ${item.i} text-xl mr-3 ${activeTab===item.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}></i>{item.l}{item.badge > 0 && <span className="absolute right-3 bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full">{item.badge}</span>}</button>))}</nav></div>
                            ))}
                        </div>
                        <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/80 shrink-0 flex items-center justify-between"><div className="flex items-center"><div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 flex items-center justify-center font-bold">{authUser.name ? authUser.name.charAt(0) : 'U'}</div><div className="ml-3"><p className="text-sm font-bold truncate w-24">{authUser.name || 'User'}</p><p className="text-[10px] uppercase font-bold text-indigo-500">{authUser.role || 'Staff'}</p></div></div><button onClick={logout} className="p-2 text-gray-400 hover:text-rose-500 bg-gray-100 dark:bg-gray-700 rounded-lg"><i className="ph-bold ph-sign-out text-xl"></i></button></div>
                    </aside>

                    <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative pb-16 md:pb-0">
                        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 lg:px-8 z-10 shrink-0"><div className="flex items-center"><h1 className="text-xl font-bold sm:block">{pageTitle}</h1></div><div className="flex items-center gap-2"><button onClick={()=>setIsDark(!isDark)} className="p-2 text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-full transition-colors active:scale-95"><i className={`ph-bold ${isDark?'ph-sun':'ph-moon'} text-xl`}></i></button></div></header>
                        <div className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar"><div className="max-w-7xl mx-auto pb-6 print:pb-0">{renderPageContent()}</div></div>
                    </main>
                </div>

                {isMobile && (
                    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-40 flex justify-around items-center h-16 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pb-safe">
                        {bottomNavItems.map((item) => (
                            <button key={item.id} onClick={() => changeTab(item.id)} className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors relative ${activeTab === item.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`}><div className="relative"><i className={`${activeTab === item.id ? 'ph-fill' : 'ph'} ${item.icon} text-2xl`}></i>{item.badge > 0 && <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[9px] px-1 rounded-full border border-white dark:border-gray-800">{item.badge}</span>}</div><span className="text-[10px] font-bold">{item.label}</span></button>
                        ))}
                        <button onClick={() => setSidebarOpen(true)} className={`flex flex-col items-center justify-center w-full h-full space-y-1 text-gray-400 dark:text-gray-500`}><i className="ph ph-list text-2xl"></i><span className="text-[10px] font-bold">Menu</span></button>
                    </nav>
                )}
            </div>
        );
    };

    const root = ReactDOM.createRoot(document.getElementById("root"));
    root.render(<App />);
