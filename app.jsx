const { useState, useEffect, useRef } = React;

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
    } catch(e) {
        return dateStr;
    }
};


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
                <div className="text-center mb-8"><h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Team<span className="text-indigo-600">AzurLize</span></h1><p className="text-sm text-gray-500">{title}</p>{subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}</div>
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
                    <div className="relative"><i className="ph-bold ph-user absolute left-3 top-1/2 -translate-y-1/2 text-xl text-gray-400"></i><input type="text" placeholder="Username...." value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className={inputClass} disabled={isLoading} required /></div>
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
                    <div className="relative"><i className="ph-bold ph-user absolute left-3 top-1/2 -translate-y-1/2 text-xl text-gray-400"></i><input type="text" placeholder="Username (Tanpa '@')" value={formData.username} required onChange={e => setFormData({...formData, username: e.target.value})} className={inputClass} disabled={isLoading || successMsg}/></div>
                    <div className="relative"><i className="ph-bold ph-hash absolute left-3 top-1/2 -translate-y-1/2 text-xl text-gray-400"></i><input type="text" placeholder="UID Anda" value={formData.uid} required onChange={e => setFormData({...formData, uid: e.target.value})} className={inputClass} disabled={isLoading || successMsg}/></div>
                    <div className="relative"><i className="ph-bold ph-lock-key absolute left-3 top-1/2 -translate-y-1/2 text-xl text-gray-400"></i><input type="password" placeholder="Password" value={formData.password} required onChange={e => setFormData({...formData, password: e.target.value})} className={inputClass} disabled={isLoading || successMsg}/></div>
                    <button type="submit" disabled={isLoading || successMsg} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold transition-colors">{isLoading ? 'Memproses...' : 'Daftar Sekarang'}</button>
                </form>
                <div className="mt-6 text-center text-sm text-gray-500"><button onClick={onNavigateLogin} className="text-indigo-600 font-bold hover:underline">Sudah punya akun? Masuk</button></div>
            </AuthLayout>
        );
    };

const ANNOUNCEMENT_CHANNELS = [
    { id: 'rules', name: 'Rules', icon: 'ph-push-pin', color: 'rose', grad: 'from-rose-500 to-red-600' },
    { id: 'announcement', name: 'Announcement', icon: 'ph-megaphone', color: 'indigo', grad: 'from-indigo-500 to-violet-600' },
    { id: 'bonus', name: 'Bonus & Reward', icon: 'ph-confetti', color: 'amber', grad: 'from-amber-400 to-orange-500' },
    { id: 'event', name: 'Event', icon: 'ph-calendar-blank', color: 'emerald', grad: 'from-emerald-400 to-teal-500' },
    { id: 'general', name: 'General Discussion', icon: 'ph-chats', color: 'blue', grad: 'from-blue-500 to-cyan-500' }
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

    // STATE Pelacakan Pesan Terbaca (Read Receipts)
    const [readPosts, setReadPosts] = useState(() => {
        try { return JSON.parse(localStorage.getItem(`recruitOps_read_${authUser.username}`)) || []; } 
        catch (e) { return []; }
    });

    const canPost = (channelId) => channelId === 'general' || ['Superadmin', 'Admin'].includes(authUser.role);
    const canPin = () => ['Superadmin', 'Admin'].includes(authUser.role);
    const canEdit = (p) => authUser.role === 'Superadmin' || (authUser.role === 'Admin' && p.author === authUser.name) || (authUser.role === 'Staff' && p.author === authUser.name);
    const canDelete = (p) => authUser.role === 'Superadmin' || (authUser.role === 'Admin' && (p.author === authUser.name || p.role === 'Staff')) || (authUser.role === 'Staff' && p.author === authUser.name);

    // Gaya Sesuai Role (Superadmin Merah, Admin Biru, Staff Oranye)
    const getRoleStyle = (role) => {
        const r = (role || 'staff').toLowerCase();
        if (r === 'superadmin') return { 
            avatarBg: 'bg-[#e73a4b]', 
            icon: 'ph-fill ph-crown text-[#e73a4b]', 
            badge: 'bg-[#e73a4b]/10 text-[#e73a4b] border-[#e73a4b]/20',
            textColor: 'text-[#e73a4b]'
        };
        if (r === 'admin') return { 
            avatarBg: 'bg-[#2563eb]', 
            icon: 'ph-fill ph-shield-check text-[#2563eb]', 
            badge: 'bg-[#2563eb]/10 text-[#2563eb] border-[#2563eb]/20',
            textColor: 'text-[#2563eb]'
        };
        return { 
            avatarBg: 'bg-[#f59e0b]', 
            icon: 'ph-fill ph-user text-[#f59e0b]', 
            badge: 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20',
            textColor: 'text-[#f59e0b]'
        };
    };

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

    const currentPosts = posts.filter(p => p.channelId === activeChannel).sort((a, b) => {
        if(activeChannel === 'general') return new Date(a.timestamp) - new Date(b.timestamp); 
        if (a.pinned !== b.pinned) return b.pinned ? 1 : -1;
        return new Date(b.timestamp) - new Date(a.timestamp); 
    });

    // Otomatis Menandai Pesan Terbaca
    useEffect(() => {
        if (currentPosts.length > 0) {
            const unreadIds = currentPosts.map(p => p.id).filter(id => !readPosts.includes(id));
            if (unreadIds.length > 0) {
                const updatedReads = [...readPosts, ...unreadIds];
                setReadPosts(updatedReads);
                localStorage.setItem(`recruitOps_read_${authUser.username}`, JSON.stringify(updatedReads));
            }
        }
        if (activeChannel === 'general' && chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }, [currentPosts, activeChannel, authUser.username, readPosts]);

    const handlePost = async (e) => {
        e.preventDefault(); if (!newContent.trim()) return;
        const tempId = Date.now();
        const newPost = { id: tempId, channelId: activeChannel, author: authUser.name, role: authUser.role, content: newContent, timestamp: new Date().toISOString(), likes: [], comments: [], pinned: false, isPending: true };
        setPosts(prev => [...prev, newPost]); setNewContent('');
        
        const newReads = [...readPosts, tempId];
        setReadPosts(newReads); localStorage.setItem(`recruitOps_read_${authUser.username}`, JSON.stringify(newReads));

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
        const newComment = { id: tempCommentId, author: authUser.name, role: authUser.role, content: text, timestamp: new Date().toISOString(), isPending: true };
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

    // =========================================================================
    // RENDER 1: PENGUMUMAN (Feed Post - Identik Dengan Gambar Pertama)
    // =========================================================================
    const renderFeedPost = (p) => {
        const style = getRoleStyle(p.role);
        return (
            <div key={p.id} className={`p-4 sm:p-5 mb-5 rounded-3xl border transition-all duration-300 relative group overflow-hidden ${p.pinned ? 'bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800 shadow-md' : 'bg-white dark:bg-[#1a202c] border-gray-100 dark:border-gray-700/60 shadow-sm'} ${p.isPending || p.isDeleting || p.isEditing ? 'opacity-60 grayscale-[30%]' : 'hover:shadow-lg hover:-translate-y-0.5'}`}>
                {p.pinned && <div className="absolute top-0 right-0 bg-gradient-to-l from-indigo-500 to-purple-500 text-white px-3 py-1 rounded-bl-xl text-[10px] font-black tracking-widest uppercase shadow-sm flex items-center z-10"><i className="ph-fill ph-push-pin mr-1.5 text-sm"></i> Pinned</div>}
                
                <div className="flex justify-between items-start mb-4 relative z-10">
                    {/* Header Presisi Sesuai Screenshot */}
                    <div className="flex items-start gap-3 sm:gap-4">
                        <div className={`w-12 h-12 sm:w-14 sm:h-14 mt-1 rounded-full flex items-center justify-center font-black text-xl sm:text-2xl text-white shadow-sm shrink-0 border border-white/20 ${style.avatarBg}`}>
                            {p.author ? p.author.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div className="flex flex-col items-start gap-1.5">
                            <div className={`font-black text-sm sm:text-base flex items-center gap-1.5 ${style.textColor}`}>
                                <i className={`${style.icon} text-sm`}></i> {p.author || 'Unknown'} 
                            </div>
                            <span className={`px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${style.badge}`}>
                                {p.role}
                            </span>
                            <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-bold mt-0.5 flex items-center">
                                <i className="ph-bold ph-clock mr-1.5"></i> {formatTime(p.timestamp)}
                                {p.isPending && <span className="italic ml-2 flex items-center text-indigo-500"><i className="ph-bold ph-spinner ph-spin mr-1"></i> Mengirim...</span>}
                                {p.isDeleting && <span className="italic ml-2 flex items-center text-rose-500"><i className="ph-bold ph-spinner ph-spin mr-1"></i> Menghapus...</span>}
                                {p.isEditing && <span className="italic ml-2 flex items-center text-blue-500"><i className="ph-bold ph-spinner ph-spin mr-1"></i> Menyimpan...</span>}
                            </div>
                        </div>
                    </div>
                    {/* Action Buttons */}
                    <div className="flex gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        {canPin() && !p.isPending && !p.isDeleting && !p.isEditing && <button onClick={() => handleTogglePin(p.id)} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors border ${p.pinned ? 'bg-indigo-100 text-indigo-600 border-indigo-200 dark:bg-indigo-900/50 dark:border-indigo-800' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30'}`}><i className="ph-bold ph-push-pin text-base"></i></button>}
                        {canEdit(p) && !p.isPending && !p.isDeleting && !p.isEditing && <button onClick={() => { setEditingPost(p); setEditContent(p.content); }} className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"><i className="ph-bold ph-pencil-simple text-base"></i></button>}
                        {canDelete(p) && !p.isPending && !p.isEditing && <button disabled={p.isDeleting} onClick={() => handleDelete(p.id)} className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-colors ${p.isDeleting ? 'bg-gray-50 border-gray-200 text-gray-300' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30'}`}><i className="ph-bold ph-trash text-base"></i></button>}
                    </div>
                </div>
                
                {/* Konten Pesan */}
                {editingPost?.id === p.id ? (
                    <form onSubmit={handleEditSubmit} className="mt-2 mb-4 ml-0">
                        <textarea className="w-full p-4 border border-indigo-200 dark:border-indigo-800/50 rounded-xl bg-indigo-50/30 dark:bg-indigo-900/20 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-sm" rows="3" value={editContent} onChange={(e) => setEditContent(e.target.value)} autoFocus />
                        <div className="flex gap-2 mt-3 justify-end">
                            <button type="button" onClick={() => setEditingPost(null)} className="px-5 py-2 text-xs font-black text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 rounded-lg transition-colors uppercase tracking-widest">Batal</button>
                            <button type="submit" className="px-5 py-2 text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-sm uppercase tracking-widest flex items-center"><i className="ph-bold ph-floppy-disk mr-1.5"></i> Simpan</button>
                        </div>
                    </form>
                ) : (
                    <div className="text-gray-800 dark:text-gray-200 text-sm whitespace-pre-wrap leading-relaxed mb-5 ml-0 relative z-10">
                        {p.content}
                    </div>
                )}
                
                {/* Footer Interaksi */}
                <div className="flex items-center gap-6 pt-4 border-t border-gray-100 dark:border-gray-700/50 ml-0">
                    <button disabled={p.isPending || p.isDeleting || p.isEditing} onClick={() => handleToggleLike(p.id)} className={`flex items-center gap-1.5 text-xs font-black transition-all ${p.likes.includes(authUser.name) ? 'text-rose-500 scale-105' : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'} disabled:opacity-50`}><i className={`${p.likes.includes(authUser.name) ? 'ph-fill' : 'ph-bold'} ph-heart text-xl`}></i> {p.likes.length > 0 ? p.likes.length : 'Suka'}</button>
                    <span className="text-xs text-gray-400 font-black flex items-center gap-1.5"><i className="ph-bold ph-chat-circle text-xl"></i> {p.comments.length} Komentar</span>
                </div>
                
                {/* Daftar Komentar */}
                {p.comments.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-dashed border-gray-200 dark:border-gray-700/50 space-y-3 ml-0">
                        {p.comments.map(c => {
                            const cStyle = getRoleStyle(c.role);
                            return (
                                <div key={c.id} className={`flex gap-3 bg-gray-50/80 dark:bg-gray-800/50 p-3.5 rounded-2xl border border-gray-100 dark:border-gray-700/30 ${c.isPending ? 'opacity-60 grayscale-[30%]' : ''}`}>
                                    <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-black text-sm text-white shrink-0 shadow-sm ${cStyle.avatarBg}`}>{c.author ? c.author.charAt(0).toUpperCase() : '?'}</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1">
                                            <span className={`font-black text-xs flex items-center gap-1.5 truncate ${cStyle.textColor}`}>
                                                <i className={`${cStyle.icon} text-[10px]`}></i> {c.author || 'Unknown'}
                                            </span>
                                            <span className="text-[9px] font-bold text-gray-400 flex items-center mt-1 sm:mt-0">
                                                {c.isPending && <i className="ph-bold ph-spinner ph-spin mr-1 text-indigo-500"></i>}{formatTime(c.timestamp)}
                                            </span>
                                        </div>
                                        <div className="text-xs leading-relaxed text-gray-700 dark:text-gray-300">{c.content}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Form Balasan */}
                <form onSubmit={(e) => handleComment(e, p.id)} className="mt-4 ml-0 flex gap-2 relative">
                    <input type="text" disabled={p.isPending || p.isDeleting || p.isEditing} placeholder={p.isPending || p.isDeleting || p.isEditing ? "Harap tunggu..." : "Tulis balasan komentar..."} value={replyContent[p.id] || ''} onChange={e => setReplyContent({...replyContent, [p.id]: e.target.value})} className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow disabled:opacity-50" />
                    <button type="submit" disabled={!replyContent[p.id] || p.isPending || p.isDeleting || p.isEditing} className="w-10 h-10 flex items-center justify-center bg-indigo-600 text-white rounded-xl disabled:opacity-50 hover:bg-indigo-700 transition-colors shadow-sm shrink-0"><i className="ph-bold ph-paper-plane-right text-lg"></i></button>
                </form>
            </div>
        );
    };

    // =========================================================================
    // RENDER 2: CHAT BUBBLE (General Discussion - Anti Berantakan/Pecah)
    // =========================================================================
    const renderChatMessage = (p) => {
        const isMe = p.author === authUser.name;
        const style = getRoleStyle(p.role);
        return (
            <div key={p.id} className={`flex w-full mb-6 ${isMe ? 'justify-end' : 'justify-start'} group transition-all duration-300 ${p.isPending || p.isDeleting || p.isEditing ? 'opacity-60 grayscale-[30%]' : ''}`}>
                
                {/* Kontainer Utama Chat Kiri / Kanan */}
                <div className={`flex max-w-[90%] md:max-w-[75%] gap-2 sm:gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    
                    {/* Avatar di Pojok Bawah */}
                    <div className="flex flex-col justify-end pb-1 shrink-0">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-black text-xs sm:text-sm text-white shadow-sm border border-white/10 ${style.avatarBg}`}>
                            {p.author ? p.author.charAt(0).toUpperCase() : '?'}
                        </div>
                    </div>

                    {/* Kolom Teks & Info */}
                    <div className={`flex flex-col min-w-0 ${isMe ? 'items-end' : 'items-start'}`}>
                        
                        {/* Header: Nama & Waktu */}
                        <div className={`flex items-center gap-2 mb-1.5 px-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                            <span className={`font-black text-[11px] sm:text-xs flex items-center gap-1 ${style.textColor}`}>
                                {!isMe && <i className={`${style.icon} text-[10px]`}></i>}
                                {p.author || 'Unknown'}
                                {isMe && <i className={`${style.icon} text-[10px]`}></i>}
                            </span>
                            <span className="text-[9px] font-bold text-gray-400 flex items-center">
                                {p.isPending && <i className="ph-bold ph-spinner ph-spin mr-1 text-indigo-400"></i>}
                                {p.isDeleting && <i className="ph-bold ph-spinner ph-spin mr-1 text-rose-400"></i>}
                                {p.isEditing && <i className="ph-bold ph-spinner ph-spin mr-1 text-blue-400"></i>}
                                {formatTime(p.timestamp)}
                            </span>
                        </div>

                        {/* Bubble Chat Utama */}
                        <div className={`px-4 py-2.5 sm:py-3 rounded-2xl text-sm leading-relaxed shadow-sm relative break-words w-full ${isMe ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white dark:bg-[#1a202c] border border-gray-100 dark:border-gray-700/60 text-gray-800 dark:text-gray-200 rounded-bl-sm'}`}>
                            {editingPost?.id === p.id ? (
                                <form onSubmit={handleEditSubmit} className="min-w-[200px] sm:min-w-[300px]">
                                    <textarea className={`w-full p-3 border rounded-xl outline-none focus:ring-2 resize-none text-xs sm:text-sm font-medium custom-scrollbar ${isMe ? 'bg-indigo-500 border-indigo-400 text-white placeholder-indigo-300 focus:ring-white/50' : 'bg-gray-50 border-gray-300 dark:bg-gray-800 dark:border-gray-600 focus:ring-indigo-500'}`} rows="2" value={editContent} onChange={(e) => setEditContent(e.target.value)} autoFocus />
                                    <div className="flex gap-2 mt-2 justify-end">
                                        <button type="button" onClick={() => setEditingPost(null)} className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg ${isMe ? 'text-indigo-200 hover:bg-indigo-700' : 'text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700'}`}>Batal</button>
                                        <button type="submit" className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg ${isMe ? 'bg-white text-indigo-600 hover:bg-indigo-100' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>Simpan</button>
                                    </div>
                                </form>
                            ) : p.content}
                        </div>

                        {/* Aksi Bawah Chat (Suka, Edit, Hapus) */}
                        <div className={`flex items-center gap-1.5 mt-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                            <button disabled={p.isPending || p.isDeleting || p.isEditing} onClick={() => handleToggleLike(p.id)} className={`text-[10px] font-black flex items-center gap-1 px-1.5 py-1 rounded ${p.likes.includes(authUser.name) ? 'text-rose-500' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'} disabled:opacity-50`}><i className={`${p.likes.includes(authUser.name) ? 'ph-fill' : 'ph-bold'} ph-heart text-sm`}></i> {p.likes.length > 0 && p.likes.length}</button>
                            {canEdit(p) && !p.isPending && !p.isDeleting && !p.isEditing && <button onClick={() => { setEditingPost(p); setEditContent(p.content); }} className="text-[10px] font-bold text-blue-400 hover:text-blue-600 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 w-6 h-6 rounded-md flex items-center justify-center transition-colors"><i className="ph-bold ph-pencil-simple text-sm"></i></button>}
                            {canDelete(p) && !p.isPending && !p.isEditing && <button disabled={p.isDeleting} onClick={() => handleDelete(p.id)} className={`text-[10px] font-bold w-6 h-6 rounded-md flex items-center justify-center transition-colors ${p.isDeleting ? 'text-gray-300' : 'text-rose-400 hover:text-rose-600 bg-rose-50 dark:bg-rose-900/30 hover:bg-rose-100'}`}><i className="ph-bold ph-trash text-sm"></i></button>}
                        </div>

                    </div>
                </div>
            </div>
        );
    };

    const activeChannelInfo = ANNOUNCEMENT_CHANNELS.find(c => c.id === activeChannel);

    return (
        <div className="h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)] flex flex-col md:flex-row bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-[24px] shadow-sm border border-gray-200/80 dark:border-gray-800/80 overflow-hidden relative animate-in fade-in duration-500">
            
            {/* MOBILE: Horizontal Scroll Tabs (Pill Menu) */}
            <div className="md:hidden flex overflow-x-auto hide-scrollbar bg-gray-50/90 dark:bg-gray-900/90 border-b border-gray-200/80 dark:border-gray-800/80 p-2.5 gap-2 shrink-0 snap-x z-20">
                {ANNOUNCEMENT_CHANNELS.map(c => {
                    const unreadCount = posts.filter(p => p.channelId === c.id && !readPosts.includes(p.id)).length; 
                    const isActive = activeChannel === c.id;
                    return (
                        <button key={c.id} onClick={() => setActiveChannel(c.id)} className={`flex items-center whitespace-nowrap px-4 py-2.5 rounded-xl text-[11px] font-black transition-all duration-300 snap-center relative border shadow-sm ${isActive ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200/80 dark:border-gray-700/80 transform scale-[1.02]' : 'bg-gray-100/50 dark:bg-gray-800/50 text-gray-500 border-transparent hover:bg-gray-200/50 dark:hover:bg-gray-800'}`}>
                            <i className={`ph-fill ${c.icon} mr-2 text-base text-${c.color}-500 drop-shadow-sm`}></i> {c.name}
                            {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] px-1.5 py-0.5 rounded-full shadow-sm animate-pulse border border-white dark:border-gray-900">{unreadCount > 99 ? '99+' : unreadCount}</span>}
                        </button>
                    )
                })}
            </div>

            {/* TABLET & LAPTOP: Vertical Sidebar */}
            <div className="hidden md:flex w-64 lg:w-72 h-full bg-gray-50/90 dark:bg-[#111827]/90 border-r border-gray-200/80 dark:border-gray-800/80 flex-col shrink-0 z-20">
                <div className="h-16 px-6 border-b border-gray-200/80 dark:border-gray-800/80 flex items-center bg-white/50 dark:bg-gray-900/50 shrink-0">
                    <h2 className="font-black text-xs uppercase tracking-widest text-gray-500 flex items-center">
                        <i className="ph-bold ph-hash mr-2 text-lg"></i> Channels
                    </h2>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                    {ANNOUNCEMENT_CHANNELS.map(c => {
                        const unreadCount = posts.filter(p => p.channelId === c.id && !readPosts.includes(p.id)).length; 
                        const isActive = activeChannel === c.id;
                        return (
                            <button key={c.id} onClick={() => setActiveChannel(c.id)} className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-black transition-all group overflow-hidden relative border ${isActive ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm border-gray-200/80 dark:border-gray-700/80' : 'text-gray-500 hover:bg-white/50 dark:hover:bg-gray-800/50 hover:text-gray-700 dark:hover:text-gray-300 border-transparent'}`}>
                                {isActive && <div className={`absolute left-0 top-0 w-1 h-full bg-gradient-to-b ${c.grad}`}></div>}
                                <div className="flex items-center">
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center mr-3.5 transition-colors shadow-inner ${isActive ? `bg-${c.color}-50 dark:bg-${c.color}-900/30 text-${c.color}-500` : 'bg-gray-100 dark:bg-gray-800 text-gray-400 group-hover:text-gray-500 group-hover:bg-gray-200 dark:group-hover:bg-gray-700'}`}>
                                        <i className={`ph-fill ${c.icon} text-lg`}></i> 
                                    </div>
                                    {c.name}
                                </div>
                                {unreadCount > 0 && <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full shadow-sm animate-pulse">{unreadCount > 99 ? '99+' : unreadCount}</span>}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* AREA KONTEN (Feed & Chat) */}
            <div className="flex-1 flex flex-col min-w-0 bg-white/50 dark:bg-gray-900/30 relative">
                
                {/* Header Channel Aktif */}
                <div className="h-14 sm:h-16 bg-white/90 dark:bg-[#1a202c]/90 backdrop-blur-md border-b border-gray-200/80 dark:border-gray-800/80 flex items-center px-4 sm:px-6 shrink-0 z-10 shadow-sm">
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br ${activeChannelInfo.grad} flex items-center justify-center text-white shadow-sm mr-3`}>
                        <i className={`ph-bold ${activeChannelInfo.icon} text-lg sm:text-xl`}></i>
                    </div>
                    <div>
                        <h3 className="font-black text-gray-900 dark:text-white text-sm sm:text-base leading-tight">{activeChannelInfo.name}</h3>
                        <p className="text-[9px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Channel Komunikasi</p>
                    </div>
                    {activeChannel === 'rules' && <span className="ml-auto text-[9px] sm:text-[10px] bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-900/30 dark:border-rose-800/50 px-2 sm:px-2.5 py-1 rounded-md font-black uppercase tracking-widest shadow-sm flex items-center"><i className="ph-bold ph-warning mr-1"></i> Wajib Baca</span>}
                </div>

                {/* Kontainer Pesan */}
                <div className={`flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar relative ${activeChannel === 'general' ? 'bg-[#F8FAFC] dark:bg-[#0f1219] bg-[url("https://www.transparenttextures.com/patterns/cubes.png")] bg-blend-multiply dark:bg-blend-overlay opacity-90 dark:opacity-80' : 'bg-[#F8FAFC] dark:bg-gray-900/50'}`}>
                    {currentPosts.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                            <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 shadow-sm border border-gray-100 dark:border-gray-700/50">
                                <i className={`ph-fill ${activeChannelInfo.icon} text-5xl opacity-50`}></i>
                            </div>
                            <p className="font-bold text-sm">Belum ada aktivitas di channel ini.</p>
                        </div>
                    ) : (
                        <div className="max-w-4xl mx-auto">
                            {activeChannel === 'general' ? currentPosts.map(renderChatMessage) : currentPosts.map(renderFeedPost)}
                            <div ref={chatEndRef} />
                        </div>
                    )}
                </div>

                {/* Area Input / Mengetik */}
                {canPost(activeChannel) ? (
                    <div className="p-3 sm:p-4 bg-white/95 dark:bg-[#1a202c]/95 backdrop-blur-md border-t border-gray-200/80 dark:border-gray-800/80 shrink-0 z-10 relative shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
                        <form onSubmit={handlePost} className="max-w-4xl mx-auto relative">
                            {activeChannel === 'general' ? (
                                <div className="flex items-end gap-2 bg-gray-50 dark:bg-gray-900 border border-gray-200/80 dark:border-gray-700 rounded-2xl p-2 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all shadow-inner">
                                    <textarea rows="1" placeholder="Ketik pesan..." value={newContent} onChange={e => setNewContent(e.target.value)} className="flex-1 bg-transparent border-none outline-none px-4 py-2.5 text-sm font-medium resize-none min-h-[44px] max-h-[120px] custom-scrollbar text-gray-800 dark:text-gray-100 placeholder-gray-400" onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handlePost(e); } }} />
                                    <button type="submit" disabled={!newContent.trim()} className="w-11 h-11 flex items-center justify-center bg-indigo-600 text-white rounded-xl disabled:opacity-50 hover:bg-indigo-700 transition-colors shadow-sm shrink-0"><i className="ph-bold ph-paper-plane-right text-xl"></i></button>
                                </div>
                            ) : (
                                <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200/80 dark:border-gray-700 rounded-2xl p-3 sm:p-4 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all shadow-inner">
                                    <textarea rows="3" placeholder={`Ketik pengumuman baru di #${activeChannelInfo.name}...`} value={newContent} onChange={e => setNewContent(e.target.value)} className="w-full bg-transparent border-none outline-none resize-none text-sm font-medium custom-scrollbar mb-2 text-gray-800 dark:text-gray-100 placeholder-gray-400"></textarea>
                                    <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700/80">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-[10px] text-white ${getRoleStyle(authUser.role).avatarBg}`}>{authUser.name.charAt(0).toUpperCase()}</div>
                                            <div className="text-[9px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-widest hidden sm:block">Memposting sbg <span className={getRoleStyle(authUser.role).textColor}>{authUser.role}</span></div>
                                        </div>
                                        <button type="submit" disabled={!newContent.trim()} className="px-4 sm:px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center disabled:opacity-50 hover:bg-indigo-700 transition-all shadow-sm"><i className="ph-bold ph-paper-plane-right mr-1 sm:mr-2 text-sm sm:text-base"></i> <span className="hidden sm:inline">Kirim</span></button>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>
                ) : (
                    <div className="p-4 bg-gray-50/80 dark:bg-gray-800/80 border-t border-gray-200/80 dark:border-gray-800/80 text-center text-[10px] sm:text-xs text-gray-500 font-black uppercase tracking-widest shrink-0">
                        <i className="ph-bold ph-lock-key mr-1.5 text-sm"></i> Hanya Admin yang dapat memposting di channel ini.
                    </div>
                )}
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
                        <i className="ph-fill ph-squares-four text-indigo-500 animate-pulse"></i> Overview
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
    
    const initialForm = { id: '', tanggal: new Date().toISOString().split('T')[0], recruiter: '', channels: 'Instagram', email: '', wa: '', uid: '', username: '', results: 'Pending', grup: 'T0-SANDI' };
    const [formData, setFormData] = useState(initialForm);

    const isPrivileged = authUser && ['Superadmin', 'Admin'].includes(authUser.role);

    const getMondayStr = (dateInput) => { if (!dateInput) return ""; const d = new Date(dateInput); if (isNaN(d.getTime())) return ""; const localDay = d.getDay() || 7; const target = new Date(d.getTime()); target.setDate(d.getDate() - localDay + 1); return `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}-${String(target.getDate()).padStart(2, '0')}`; };
    const getOffsetMondayStr = (offsetWeeks = 0) => { const d = new Date(); const day = d.getDay() || 7; d.setHours(0,0,0,0); d.setDate(d.getDate() - day + 1 + (offsetWeeks * 7)); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
    const formatToDDMMYYYY = (dateStr) => { if (!dateStr) return '-'; const d = new Date(dateStr); return isNaN(d.getTime()) ? dateStr : `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`; };

    const thisWeekMonday = getOffsetMondayStr(0);
    const isThursday = new Date().getDay() === 4;

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const resUsers = await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action: 'getUsers' }) });
            const dataUsers = await resUsers.json();
            if (dataUsers.status === 'success') { setUsers(Array.isArray(dataUsers.data) ? dataUsers.data : []); }

            const resData = await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action: 'getDailyData', role: authUser ? authUser.role : null, username: authUser ? authUser.username : null, name: authUser ? authUser.name : null }) });
            const resultData = await resData.json();
            if (resultData.status === 'success') { setData(Array.isArray(resultData.data) ? resultData.data : []); }
        } catch (error) { console.error("Error fetching data:", error); }
        finally { setIsLoading(false); }
    };

    useEffect(() => { fetchData(); }, [authUser]);
    useEffect(() => { setCurrentPage(1); }, [activeTab, historyFilter, data.length]);

    const handleOpenAdd = () => { setModalMode('add'); setFormData({ ...initialForm, recruiter: (authUser && authUser.role === 'Staff') ? authUser.username : '' }); setIsModalOpen(true); };
    
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
                                                <option value="Instagram">Instagram</option>
                                                <option value="TikTok">TikTok</option>
                                                <option value="Facebook">Facebook</option>
                                                <option value="WhatsApp">WhatsApp</option>
                                                <option value="Telegram">Telegram</option>
                                                <option value="S Lemon App">S Lemon App</option>
                                                <option value="X">X</option>
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
    const [users, setUsers] = useState([]); 
    const [isLoading, setIsLoading] = useState(true);
    
    const isPrivileged = authUser && ['Superadmin', 'Admin'].includes(authUser.role);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(SCRIPT_URL, { 
                    method: 'POST', 
                    body: JSON.stringify({ action: 'getDailyData', role: authUser ? authUser.role : null, username: authUser ? authUser.username : null, name: authUser ? authUser.name : null }) 
                });
                const result = await res.json();
                
                const resUsers = await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action: 'getUsers' }) });
                const userResult = await resUsers.json();
                if (userResult.status === 'success') {
                    setUsers(Array.isArray(userResult.data) ? userResult.data : []);
                }

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

    const getRoleStyle = (role) => {
        const r = (role || 'staff').toLowerCase();
        if (r === 'superadmin') return { 
            avatarBg: 'bg-[#e73a4b]', 
            icon: 'ph-fill ph-crown text-[#e73a4b]', 
            badge: 'bg-[#e73a4b]/10 text-[#e73a4b] border-[#e73a4b]/20',
            borderGlow: 'border-[#e73a4b]/30'
        };
        if (r === 'admin') return { 
            avatarBg: 'bg-[#2563eb]', 
            icon: 'ph-fill ph-shield-check text-[#2563eb]', 
            badge: 'bg-[#2563eb]/10 text-[#2563eb] border-[#2563eb]/20',
            borderGlow: 'border-[#2563eb]/30'
        };
        return { 
            avatarBg: 'bg-[#f59e0b]', 
            icon: 'ph-fill ph-user text-[#f59e0b]', 
            badge: 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20',
            borderGlow: 'border-[#f59e0b]/30'
        };
    };

    const performanceMap = data.reduce((acc, curr) => {
        const rec = curr.recruiter || 'Unknown';
        if (!acc[rec]) acc[rec] = { total: 0, acc: 0 };
        acc[rec].total += 1;
        if (curr.results === 'Acc') acc[rec].acc += 1;
        return acc;
    }, {});

    const performanceArray = Object.keys(performanceMap).map(username => {
        const userDb = users.find(u => u.username === username);
        const fullName = userDb ? userDb.name : username;
        const role = userDb ? userDb.role : 'Staff';
        const stats = performanceMap[username];
        const convRate = stats.total > 0 ? Math.round((stats.acc / stats.total) * 100) : 0;
        return { username, fullName, role, ...stats, convRate };
    }).sort((a, b) => b.acc - a.acc || b.total - a.total); 

    return (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-12 w-full">
            
            {/* HEADER BANNER */}
            <div className="bg-white/60 dark:bg-gray-800/60 p-5 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-md shadow-sm w-full mx-auto">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                                <i className="ph-bold ph-medal text-xl sm:text-2xl"></i>
                            </div>
                            Kinerja Recruiter
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2 sm:mt-3 leading-relaxed max-w-2xl">
                            Analisis efektivitas konversi setiap anggota tim operasi. Data diurutkan berdasarkan jumlah kandidat ACC terbanyak ke terendah secara otomatis.
                        </p>
                    </div>
                    {!isLoading && performanceArray.length > 0 && (
                        <div className="flex gap-3 mt-2 md:mt-0">
                            <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800/50 px-4 py-2.5 rounded-xl">
                                <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-0.5">Total Staf Terdata</div>
                                <div className="text-lg font-black text-indigo-700 dark:text-indigo-400">{performanceArray.length} <span className="text-sm font-bold text-indigo-400 dark:text-indigo-500">Orang</span></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* STATE LOADING / KOSONG */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-indigo-500 w-full">
                    <i className="ph-bold ph-spinner ph-spin text-5xl mb-4 drop-shadow-md"></i>
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-gray-400">Mengkalkulasi Kinerja...</span>
                </div>
            ) : performanceArray.length === 0 ? (
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-3xl border border-dashed border-gray-300 dark:border-gray-700 p-12 flex flex-col items-center justify-center text-center shadow-sm w-full mx-auto">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center mb-4 text-gray-400">
                        <i className="ph-fill ph-users-three text-4xl"></i>
                    </div>
                    <h3 className="text-gray-900 dark:text-white font-black text-lg mb-1">Data Belum Tersedia</h3>
                    <p className="text-xs sm:text-sm text-gray-500 max-w-sm">Belum ada aktivitas konversi pelamar yang masuk ke sistem kami.</p>
                </div>
            ) : (
                /* PERBAIKAN: Mengatur Grid Responsif. 
                   Satu kolom (full width) di HP.
                   Dua kolom di layar menengah (Tablet).
                   Tiga kolom di Desktop.
                   Serta menambahkan p-2 (padding) agar shadow/bayangan kartu tidak terpotong. */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 p-2 w-full mx-auto">
                    {performanceArray.map((staff, i) => {
                        const rank = i + 1;
                        const isTopThree = rank <= 3;
                        const style = getRoleStyle(staff.role);
                        const initialLetter = (staff.fullName && staff.fullName.trim() !== '') ? staff.fullName.charAt(0).toUpperCase() : <i className="ph-bold ph-user"></i>;

                        return (
                            <div key={i} className={`bg-white dark:bg-[#151a23] backdrop-blur-xl border rounded-[24px] p-6 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden group ${isTopThree ? 'border-amber-200 dark:border-amber-900/40' : 'border-gray-200/80 dark:border-gray-700/60 hover:' + style.borderGlow}`}>
                                
                                <i className={`ph-fill ${isTopThree ? 'ph-crown' : 'ph-lightning'} absolute -top-4 -right-4 text-8xl opacity-[0.03] dark:opacity-[0.04] group-hover:scale-125 group-hover:rotate-12 transition-transform duration-700 pointer-events-none ${isTopThree ? 'text-amber-500' : 'text-indigo-500'}`}></i>

                                {isTopThree && (
                                    <div className={`absolute top-0 right-0 px-3 py-1.5 text-[10px] font-black text-white rounded-bl-2xl shadow-sm z-10 flex items-center ${rank === 1 ? 'bg-gradient-to-r from-amber-500 to-orange-400' : rank === 2 ? 'bg-gradient-to-r from-gray-400 to-slate-400' : 'bg-gradient-to-r from-amber-700 to-orange-800'}`}>
                                        <i className="ph-fill ph-medal mr-1"></i> Peringkat #{rank}
                                    </div>
                                )}

                                <div className="flex items-center gap-4 mb-6 relative z-10">
                                    <div className={`w-14 h-14 rounded-full flex items-center justify-center font-black text-2xl text-white shrink-0 shadow-sm border-2 ${isTopThree ? 'border-amber-100 dark:border-amber-500/30' : 'border-transparent'} ${style.avatarBg}`}>
                                        {initialLetter}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="font-black text-gray-900 dark:text-white text-base truncate flex items-center flex-wrap gap-1.5 mb-1">
                                            <i className={`${style.icon} text-sm`}></i>
                                            <span className="truncate max-w-[120px] sm:max-w-xs">{staff.fullName}</span>
                                            <span className={`px-2 py-0.5 text-[9px] rounded uppercase tracking-widest border ${style.badge} shrink-0`}>
                                                {staff.role}
                                            </span>
                                        </div>
                                        <div className="text-[11px] font-mono font-bold text-[#f23d5b] dark:text-[#f23d5b] truncate">
                                            @ {staff.username}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-5">
                                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800 flex flex-col justify-center">
                                        <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center"><i className="ph-bold ph-users mr-1"></i> Total Leads</div>
                                        <div className="text-2xl font-black text-gray-800 dark:text-gray-200">{staff.total}</div>
                                    </div>
                                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/40 flex flex-col justify-center shadow-sm">
                                        <div className="text-[9px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mb-1 flex items-center"><i className="ph-bold ph-check-circle mr-1"></i> Goal ACC</div>
                                        <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{staff.acc}</div>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-gray-100 dark:border-gray-700/50">
                                    <div className="flex justify-between items-end mb-2">
                                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Conversion Rate</div>
                                        <div className={`text-base font-black ${staff.convRate >= 30 ? 'text-emerald-500' : staff.convRate >= 10 ? 'text-indigo-500' : 'text-gray-500'}`}>
                                            {staff.convRate}%
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden shadow-inner p-[1px] border border-gray-200 dark:border-gray-700/50">
                                        <div 
                                            className={`h-full rounded-full relative overflow-hidden transition-all duration-1000 ease-out ${
                                                staff.convRate >= 30 ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 
                                                staff.convRate >= 10 ? 'bg-gradient-to-r from-indigo-500 to-violet-500' : 
                                                'bg-gradient-to-r from-gray-400 to-gray-500'
                                            }`} 
                                            style={{ width: `${staff.convRate}%` }}
                                        >
                                            <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]"></div>
                                        </div>
                                    </div>
                                    <div className="text-[9px] font-bold text-gray-400 text-right mt-2">
                                        Rasio (ACC / Leads)
                                    </div>
                                </div>

                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
const RecruitmentGoals = ({ authUser }) => {
    const [data, setData] = useState([]);
    const [users, setUsers] = useState([]); 
    const [isLoading, setIsLoading] = useState(true);
    
    const isPrivileged = authUser && ['Superadmin', 'Admin'].includes(authUser.role);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(SCRIPT_URL, { 
                    method: 'POST', 
                    body: JSON.stringify({ action: 'getDailyData', role: authUser?.role, username: authUser?.username, name: authUser?.name }) 
                });
                const result = await res.json();
                
                const resUsers = await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action: 'getUsers' }) });
                const userResult = await resUsers.json();
                if (userResult.status === 'success') {
                    setUsers(Array.isArray(userResult.data) ? userResult.data : []);
                }

                if (result.status === 'success') { 
                    let fetchedData = Array.isArray(result.data) ? result.data : [];
                    if (!isPrivileged) {
                        fetchedData = fetchedData.filter(d => d.recruiter === authUser?.username || d.recruiter === authUser?.name);
                    }
                    setData(fetchedData); 
                }
            } catch (error) {
                console.error(error);
            } finally { 
                setIsLoading(false); 
            }
        };
        fetchData();
    }, [authUser, isPrivileged]);

    // ========================================================
    // LOGIKA PERIODE AKTIF (Senin - Minggu, Reset Senin 16:00)
    // ========================================================
    const getActiveWeekDates = () => {
        const now = new Date();
        const currentDay = now.getDay(); 
        const currentHour = now.getHours();

        let referenceDate = new Date(now);
        referenceDate.setHours(0, 0, 0, 0);

        if (currentDay === 1 && currentHour < 16) {
            referenceDate.setDate(referenceDate.getDate() - 7);
        } else if (currentDay !== 1) {
            const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
            referenceDate.setDate(referenceDate.getDate() + diffToMonday);
        }

        const activeDates = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(referenceDate);
            d.setDate(d.getDate() + i);
            activeDates.push(new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0]);
        }
        return activeDates;
    };

    const activeDates = getActiveWeekDates();

    // ========================================================
    // LOGIKA TARGET BERSUMBER DARI USER ACCOUNT
    // ========================================================
    
    // 1. Ambil HANYA daftar staf dari Akun yang Aktif
    const activeStaffs = users.filter(u => u.role === 'Staff' && u.status === 'Aktif');
    
    // 2. Tentukan Target Tim (3/Hari * 7 Hari = 21 per Staf)
    const targetPerRecruiter = 21; 
    // FIX: Target murni berdasarkan jumlah staf aktif. Jika 0 staf = 0 target
    const targetCompany = activeStaffs.length * targetPerRecruiter; 

    // 3. Hanya ambil data berstatus 'Acc' dan masuk periode minggu ini
    const validData = data.filter(d => d.results === 'Acc' && activeDates.includes(d.tanggal));

    // 4. Siapkan Wadah (Map) berdasarkan Username Akun
    const progressMap = {};
    activeStaffs.forEach(u => {
        if (isPrivileged || u.username === authUser?.username || u.name === authUser?.name) {
            progressMap[u.username] = { 
                username: u.username,
                fullName: u.name, 
                role: u.role, 
                acc: 0 
            };
        }
    });

    // 5. Cocokkan data ACC dengan Akun
    validData.forEach(curr => { 
        const rec = (curr.recruiter || '').trim().toLowerCase(); 
        
        const matchedUser = activeStaffs.find(u => 
            (u.username && u.username.toLowerCase() === rec) || 
            (u.name && u.name.toLowerCase() === rec)
        );

        if (matchedUser) {
            if (progressMap[matchedUser.username]) {
                progressMap[matchedUser.username].acc += 1;
            }
        } else {
            const originalRec = curr.recruiter || 'Unknown';
            if (isPrivileged || originalRec === authUser?.username || originalRec === authUser?.name) {
                if (!progressMap[originalRec]) {
                    progressMap[originalRec] = { 
                        username: originalRec, 
                        fullName: originalRec, 
                        role: 'Non-Staff / Arsip', 
                        acc: 0 
                    };
                }
                progressMap[originalRec].acc += 1;
            }
        }
    });

    // 6. Urutkan berdasarkan pencapaian tertinggi
    const progressArray = Object.values(progressMap).sort((a, b) => b.acc - a.acc);

    // Kalkulasi Angka di Banner Utama
    const totalAcc = progressArray.reduce((sum, staff) => sum + staff.acc, 0);
    const activeTarget = isPrivileged ? targetCompany : targetPerRecruiter;
    // FIX: Cegah error pembagian oleh 0 (NaN) jika activeTarget adalah 0
    const companyProgress = activeTarget > 0 ? Math.min(Math.round((totalAcc / activeTarget) * 100), 100) : 0;

    // Fungsi Pengambilan Gaya Role
    const getRoleStyle = (role) => {
        const r = (role || 'staff').toLowerCase();
        if (r === 'superadmin') return { avatarBg: 'bg-[#e73a4b]', icon: 'ph-fill ph-crown text-[#e73a4b]', badge: 'bg-[#e73a4b]/10 text-[#e73a4b] border-[#e73a4b]/20' };
        if (r === 'admin') return { avatarBg: 'bg-[#2563eb]', icon: 'ph-fill ph-shield-check text-[#2563eb]', badge: 'bg-[#2563eb]/10 text-[#2563eb] border-[#2563eb]/20' };
        if (r === 'non-staff / arsip') return { avatarBg: 'bg-gray-500', icon: 'ph-fill ph-archive text-gray-500', badge: 'bg-gray-100 text-gray-500 border-gray-200' };
        return { avatarBg: 'bg-[#f59e0b]', icon: 'ph-fill ph-user text-[#f59e0b]', badge: 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20' };
    };

    return (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-12">
            
            {/* 1. MAIN BANNER (Premium Glassmorphism) */}
            <div className="bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#312e81] p-6 sm:p-8 lg:p-10 rounded-[32px] flex flex-col md:flex-row justify-between items-center shadow-2xl relative overflow-hidden gap-8 md:gap-12 border border-indigo-500/20">
                
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>
                <div className="absolute -left-20 -top-20 w-64 h-64 bg-indigo-500/30 rounded-full blur-[80px] pointer-events-none"></div>
                <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-purple-500/30 rounded-full blur-[80px] pointer-events-none"></div>
                <i className="ph-fill ph-target absolute -right-10 md:right-10 top-1/2 -translate-y-1/2 opacity-[0.03] text-[200px] md:text-[300px] pointer-events-none"></i>
                
                <div className="z-10 w-full md:w-auto text-center md:text-left flex flex-col items-center md:items-start">
                    <div className="inline-flex items-center gap-2 text-indigo-300 font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] mb-4 bg-indigo-950/50 px-3 py-1.5 rounded-full border border-indigo-800/50">
                        <i className="ph-bold ph-flag-banner text-sm"></i>
                        Target {isPrivileged ? 'Keseluruhan Tim' : 'Individu Pribadi'}
                    </div>
                    <div className="text-5xl sm:text-6xl md:text-7xl font-black text-white mb-2 md:mb-4 tracking-tight drop-shadow-lg flex items-baseline gap-2">
                        {totalAcc} <span className="text-2xl sm:text-3xl text-indigo-400 font-medium">/ {activeTarget}</span>
                    </div>
                    <div className={`inline-flex items-center px-4 py-2 rounded-xl text-xs sm:text-sm font-black uppercase tracking-widest border shadow-lg backdrop-blur-sm ${companyProgress >= 100 && activeTarget > 0 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-emerald-500/20' : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30 shadow-indigo-500/20'}`}>
                        <i className={`ph-bold ${companyProgress >= 100 && activeTarget > 0 ? 'ph-check-circle' : 'ph-trend-up'} mr-2 text-base sm:text-lg`}></i> 
                        {companyProgress >= 100 && activeTarget > 0 ? 'Target Terpenuhi!' : 'Sedang Berjalan'}
                    </div>
                </div>
                
                <div className="z-10 w-full md:w-1/2 bg-white/5 p-5 sm:p-6 rounded-3xl backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
                    <div className="flex justify-between items-end text-sm mb-3 font-black text-gray-300 uppercase tracking-widest">
                        <span>Pencapaian Mingguan</span>
                        <span className="text-xl sm:text-2xl text-white">{companyProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-900/80 rounded-full h-4 sm:h-5 overflow-hidden shadow-inner p-0.5 border border-white/5">
                        <div 
                            className={`h-full rounded-full relative overflow-hidden transition-all duration-1000 ease-out ${companyProgress >= 100 && activeTarget > 0 ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`} 
                            style={{ width: `${companyProgress}%` }}
                        >
                            <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]"></div>
                        </div>
                    </div>
                    <div className="flex justify-between text-[10px] sm:text-xs font-bold text-gray-400 mt-3">
                        <span>0 ACC</span>
                        <span>{activeTarget} ACC</span>
                    </div>
                    {isPrivileged && (
                        <div className="text-[9px] text-indigo-300 mt-3 pt-2 border-t border-white/10 text-right">
                            *Dihitung dari total {activeStaffs.length} Staf Aktif x 21 ACC
                        </div>
                    )}
                </div>
            </div>

            {/* 2. LOADING & KOSONG */}
            {isLoading && (
                <div className="flex flex-col items-center justify-center py-20 text-indigo-500">
                    <i className="ph-bold ph-spinner ph-spin text-5xl mb-4 drop-shadow-md"></i>
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-gray-400">Memuat Data Target...</span>
                </div>
            )}

            {!isLoading && progressArray.length === 0 && (
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-3xl border border-dashed border-gray-300 dark:border-gray-700 p-12 flex flex-col items-center justify-center text-center shadow-sm">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center mb-4 text-gray-400">
                        <i className="ph-fill ph-target text-4xl"></i>
                    </div>
                    <h3 className="text-gray-900 dark:text-white font-black text-lg mb-1">Belum Ada Staf/Data</h3>
                    <p className="text-xs sm:text-sm text-gray-500 max-w-sm">Daftar staf aktif masih kosong atau target belum tercapai minggu ini.</p>
                </div>
            )}

            {/* 3. GRID KARTU STAF */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {!isLoading && progressArray.map((staff, i) => {
                    const pct = Math.min(Math.round((staff.acc / targetPerRecruiter) * 100) || 0, 100);
                    const isDone = pct >= 100;
                    const style = getRoleStyle(staff.role);
                    
                    const initialLetter = (staff.fullName && staff.fullName.trim() !== '') ? staff.fullName.charAt(0).toUpperCase() : <i className="ph-bold ph-user"></i>;

                    return (
                        <div key={i} className="bg-white/90 dark:bg-[#151a23]/90 backdrop-blur-xl border border-gray-200/80 dark:border-gray-700/60 rounded-[24px] p-5 sm:p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group">
                            
                            {isDone && <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-bl-full blur-2xl pointer-events-none"></div>}

                            <div className="flex items-center gap-3 sm:gap-4 mb-6">
                                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center font-black text-xl sm:text-2xl text-white shrink-0 shadow-sm ${style.avatarBg} relative`}>
                                    {initialLetter}
                                    {isDone && (
                                        <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 rounded-full p-0.5">
                                            <div className="bg-emerald-500 text-white rounded-full p-1 shadow-sm">
                                                <i className="ph-bold ph-check text-[10px]"></i>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="min-w-0 flex-1">
                                    <div className="font-black text-gray-900 dark:text-white text-sm sm:text-base truncate flex items-center flex-wrap gap-1.5 mb-1">
                                        <i className={`${style.icon} text-sm`}></i>
                                        <span className="truncate">{staff.fullName}</span>
                                        <span className={`px-2 py-0.5 text-[8px] sm:text-[9px] rounded uppercase tracking-widest border ${style.badge} shrink-0`}>
                                            {staff.role}
                                        </span>
                                    </div>
                                    <div className="text-[10px] sm:text-[11px] font-mono font-bold text-[#f23d5b] dark:text-[#f23d5b] truncate">
                                        @ {staff.username}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-end mb-4 bg-gray-50/50 dark:bg-gray-900/30 p-3 sm:p-4 rounded-2xl border border-gray-100 dark:border-gray-800/50">
                                <div>
                                    <div className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                                        Total ACC
                                    </div>
                                    <div className="text-3xl sm:text-4xl font-black text-gray-800 dark:text-white flex items-baseline gap-1.5">
                                        {staff.acc} <span className="text-sm text-gray-400 font-bold">/ {targetPerRecruiter}</span>
                                    </div>
                                </div>
                                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-sm shrink-0 ${isDone ? 'bg-emerald-50 text-emerald-500 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50' : 'bg-white dark:bg-gray-800 text-gray-400 border border-gray-200 dark:border-gray-700'}`}>
                                    <i className={`ph-fill ${isDone ? 'ph-medal' : 'ph-target'} text-xl sm:text-2xl ${isDone ? 'animate-bounce' : ''}`}></i>
                                </div>
                            </div>

                            <div className="w-full">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                                    <span className={isDone ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}>
                                        {isDone ? 'Tercapai Penuh!' : 'Progress Target'}
                                    </span>
                                    <span className={isDone ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'}>
                                        {pct}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden shadow-inner p-[1px] border border-gray-200 dark:border-gray-700/50">
                                    <div 
                                        className={`h-full rounded-full relative overflow-hidden transition-all duration-1000 ease-out ${isDone ? 'bg-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-violet-500'}`} 
                                        style={{ width: `${pct}%` }}
                                    >
                                        <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    );
                })}
            </div>
        </div>
    );
};


const ChannelPerformance = ({ authUser }) => {
    const [data, setData] = useState([]);
    const [users, setUsers] = useState([]); 
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Instagram');

    const isPrivileged = authUser && ['Superadmin', 'Admin'].includes(authUser.role);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(SCRIPT_URL, { 
                    method: 'POST', 
                    body: JSON.stringify({ action: 'getDailyData', role: authUser ? authUser.role : null, username: authUser ? authUser.username : null, name: authUser ? authUser.name : null }) 
                });
                const result = await res.json();
                
                const resUsers = await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action: 'getUsers' }) });
                const userResult = await resUsers.json();
                if (userResult.status === 'success') {
                    setUsers(Array.isArray(userResult.data) ? userResult.data : []);
                }

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

    // Konfigurasi Tab Platform
    const TAB_CHANNELS = [
        { id: 'Instagram', name: 'Instagram', icon: 'ph-instagram-logo', grad: 'from-pink-500 to-rose-500', bgGlow: 'bg-pink-500/10' },
        { id: 'TikTok', name: 'TikTok', icon: 'ph-tiktok-logo', grad: 'from-gray-700 to-black dark:from-gray-400 dark:to-gray-500', bgGlow: 'bg-gray-500/10' },
        { id: 'Facebook', name: 'Facebook', icon: 'ph-facebook-logo', grad: 'from-blue-500 to-blue-700', bgGlow: 'bg-blue-500/10' },
        { id: 'WhatsApp', name: 'WhatsApp', icon: 'ph-whatsapp-logo', grad: 'from-emerald-500 to-teal-600', bgGlow: 'bg-emerald-500/10' },
        { id: 'Telegram', name: 'Telegram', icon: 'ph-telegram-logo', grad: 'from-sky-400 to-blue-500', bgGlow: 'bg-sky-500/10' },
        { id: 'S Lemon App', name: 'S Lemon App', icon: 'ph-lemon', grad: 'from-amber-400 to-orange-500', bgGlow: 'bg-amber-500/10' },
        { id: 'Other', name: 'X', icon: 'ph-x-logo', grad: 'from-gray-800 to-black', bgGlow: 'bg-gray-800/10' }
    ];

    // Fungsi Pengambilan Gaya Sesuai Role (Sesuai Screenshot User Account + Badge)
    const getRoleStyle = (role) => {
        const r = (role || 'staff').toLowerCase();
        if (r === 'superadmin') return { 
            avatarBg: 'bg-[#e73a4b]', 
            icon: 'ph-fill ph-crown text-[#e73a4b]', 
            cardBorder: 'border-[#e73a4b]/40 dark:border-[#e73a4b]/30',
            badge: 'bg-[#e73a4b]/10 text-[#e73a4b] border-[#e73a4b]/20'
        };
        if (r === 'admin') return { 
            avatarBg: 'bg-[#2563eb]', 
            icon: 'ph-fill ph-shield-check text-[#2563eb]', 
            cardBorder: 'border-[#2563eb]/40 dark:border-[#2563eb]/30',
            badge: 'bg-[#2563eb]/10 text-[#2563eb] border-[#2563eb]/20'
        };
        // Default untuk Staff / User
        return { 
            avatarBg: 'bg-[#f59e0b]', 
            icon: 'ph-fill ph-user text-[#f59e0b]', 
            cardBorder: 'border-[#f59e0b]/40 dark:border-[#f59e0b]/30',
            badge: 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20'
        };
    };

    const getLeaderboardData = (channelId) => {
        const filteredLeads = data.filter(d => {
            const ch = (d.channels || '').toLowerCase().trim();
            if (channelId === 'Instagram') return ch === 'instagram' || ch === 'ig';
            if (channelId === 'TikTok') return ch === 'tiktok' || ch === 'tt';
            if (channelId === 'Facebook') return ch === 'facebook' || ch === 'fb';
            if (channelId === 'WhatsApp') return ch === 'whatsapp' || ch === 'wa';
            if (channelId === 'Telegram') return ch === 'telegram' || ch === 'tele';
            if (channelId === 'S Lemon App') return ch === 's lemon app' || ch === 'lemon';
            if (channelId === 'Other') {
                const known = ['instagram', 'ig', 'tiktok', 'tt', 'facebook', 'fb', 'whatsapp', 'wa', 'telegram', 'tele', 's lemon app', 'lemon'];
                return !known.includes(ch);
            }
            return false;
        });

        const staffMap = {};
        filteredLeads.forEach(lead => {
            const rec = lead.recruiter || 'Unknown';
            if (!staffMap[rec]) staffMap[rec] = { count: 0, acc: 0 };
            staffMap[rec].count += 1;
            if (lead.results === 'Acc') staffMap[rec].acc += 1;
        });

        return Object.keys(staffMap).map(username => {
            const userDb = users.find(u => u.username === username);
            const fullName = userDb ? userDb.name : username;
            const role = userDb ? userDb.role : 'Staff'; 
            
            const sData = staffMap[username];
            const convRate = sData.count > 0 ? Math.round((sData.acc / sData.count) * 100) : 0;
            
            return { username, fullName, role, ...sData, convRate };
        }).sort((a, b) => b.acc - a.acc || b.count - a.count);
    };

    const leaderboard = getLeaderboardData(activeTab);
    const activeTabInfo = TAB_CHANNELS.find(t => t.id === activeTab);

    return (
        <div className="space-y-4 sm:space-y-6 lg:space-y-8 animate-in fade-in duration-500 pb-12">
            
            <div className="bg-white/60 dark:bg-gray-800/60 p-4 sm:p-5 lg:p-6 rounded-2xl sm:rounded-3xl border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-md shadow-sm">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2 lg:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shrink-0">
                        <i className="ph-bold ph-ranking text-base sm:text-xl"></i>
                    </div>
                    Platform Leaderboard
                </h2>
                <p className="text-[11px] sm:text-xs lg:text-sm text-gray-500 dark:text-gray-400 mt-1.5 sm:mt-2 leading-relaxed">
                    Peringkat efektivitas tim berdasarkan platform. Tampilan terhubung dengan data akun staf.
                </p>
            </div>

            <div className="flex bg-white/80 dark:bg-gray-800/80 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border border-gray-200/60 dark:border-gray-700/60 overflow-x-auto hide-scrollbar shadow-sm gap-1 w-full snap-x">
                {TAB_CHANNELS.map(tab => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[11px] sm:text-sm font-black whitespace-nowrap transition-all duration-300 snap-center ${
                                isActive 
                                    ? `bg-gradient-to-r ${tab.grad} text-white shadow-md transform scale-[1.02]` 
                                    : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100/50 dark:hover:bg-gray-700/40'
                            }`}
                        >
                            <i className={`ph-bold ${tab.icon} text-sm sm:text-lg`}></i>
                            {tab.name}
                        </button>
                    );
                })}
            </div>

            <div className="bg-white/90 dark:bg-[#151a23]/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-gray-700/50 shadow-xl overflow-hidden relative min-h-[400px]">
                <div className={`absolute top-0 right-0 w-48 h-48 sm:w-72 sm:h-72 ${activeTabInfo.bgGlow} rounded-full blur-3xl pointer-events-none transition-all duration-500`}></div>

                <div className="p-4 sm:p-5 lg:p-6 relative z-10">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-5 sm:mb-6 border-b border-gray-100 dark:border-gray-700/50 pb-3 sm:pb-4 gap-2">
                        <h3 className="font-black text-sm sm:text-base lg:text-lg flex items-center text-gray-800 dark:text-white uppercase tracking-wider">
                            <i className={`ph-fill ${activeTabInfo.icon} mr-2 text-lg sm:text-xl lg:text-2xl`}></i>
                            Jalur {activeTabInfo.name}
                        </h3>
                        <span className="px-2 sm:px-3 py-1 bg-gray-100 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest shadow-inner w-max">
                            {leaderboard.length} Staf Bersaing
                        </span>
                    </div>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <i className="ph-bold ph-spinner ph-spin text-4xl mb-3 text-indigo-500"></i>
                            <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest">Kalkulasi Peringkat...</p>
                        </div>
                    ) : leaderboard.length === 0 ? (
                        <div className="text-center py-16 text-gray-400">
                            <i className="ph-fill ph-ghost text-5xl mb-3 opacity-40"></i>
                            <p className="text-xs sm:text-sm font-bold px-4">Belum ada pergerakan / staf yang input data di jalur ini.</p>
                        </div>
                    ) : (
                        <div className="space-y-3 sm:space-y-4">
                            {leaderboard.map((staff, index) => {
                                const rank = index + 1;
                                const isTopThree = rank <= 3;
                                const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;
                                
                                const style = getRoleStyle(staff.role);

                                return (
                                    <div 
                                        key={staff.username} 
                                        className={`flex flex-col md:flex-row items-start md:items-center justify-between p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all duration-300 gap-3 sm:gap-4 relative overflow-hidden shadow-sm hover:-translate-y-0.5 bg-white dark:bg-[#1a202c]/50 ${style.cardBorder}`}
                                    >
                                        {/* BAGIAN KIRI: Rank & Profil */}
                                        <div className="flex items-center gap-2.5 sm:gap-4 w-full md:w-auto min-w-0">
                                            
                                            <div className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center shrink-0">
                                                {isTopThree ? (
                                                    <span className="text-xl sm:text-2xl drop-shadow-md select-none">{medal}</span>
                                                ) : (
                                                    <span className="text-[10px] sm:text-xs font-black text-gray-500 font-mono">#{rank}</span>
                                                )}
                                            </div>

                                            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-black text-lg sm:text-xl text-white shrink-0 shadow-sm ${style.avatarBg}`}>
                                                {staff.fullName ? staff.fullName.charAt(0).toUpperCase() : <i className="ph-bold ph-user"></i>}
                                            </div>

                                            <div className="min-w-0 flex-1 ml-1">
                                                <div className="font-black text-gray-900 dark:text-white text-xs sm:text-sm lg:text-base truncate flex items-center flex-wrap gap-1.5 mb-0.5">
                                                    <i className={`${style.icon} text-[14px]`}></i>
                                                    <span className="truncate">{staff.fullName}</span>
                                                    
                                                    {/* ================================== */}
                                                    {/* BADGE ROLE BARU DITAMBAHKAN DI SINI */}
                                                    {/* ================================== */}
                                                    <span className={`px-2 py-0.5 text-[8px] sm:text-[9px] rounded uppercase tracking-widest border ${style.badge} shrink-0`}>
                                                        {staff.role}
                                                    </span>
                                                </div>
                                                <div className="text-[10px] sm:text-xs font-mono font-bold text-[#f23d5b] dark:text-[#f23d5b] truncate mt-0.5">
                                                    @ {staff.username}
                                                </div>
                                            </div>
                                        </div>

                                        {/* BAGIAN KANAN: Statistik Responsif */}
                                        <div className="flex flex-row items-center justify-between w-full md:w-auto border-t md:border-0 border-gray-100 dark:border-gray-700/50 pt-2.5 md:pt-0 gap-3 sm:gap-6 lg:gap-8">
                                            
                                            <div className="hidden sm:block w-24 md:w-32 lg:w-48 text-left">
                                                <div className="flex justify-between text-[9px] sm:text-[10px] text-gray-400 font-bold mb-1 uppercase tracking-wider">
                                                    <span>Konversi</span>
                                                    <span className="font-black text-gray-700 dark:text-gray-300">{staff.convRate}%</span>
                                                </div>
                                                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1 sm:h-1.5 overflow-hidden shadow-inner">
                                                    <div className={`h-full bg-gradient-to-r ${activeTabInfo.grad} transition-all duration-1000`} style={{ width: `${staff.convRate}%` }}></div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 sm:gap-4 text-right w-full sm:w-auto justify-between sm:justify-end">
                                                <div className="flex flex-col items-start sm:items-end">
                                                    <div className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">Leads</div>
                                                    <div className="text-xs sm:text-sm font-black text-gray-700 dark:text-gray-300 mt-0.5">{staff.count}</div>
                                                </div>
                                                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/40 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-center shadow-sm">
                                                    <div className="text-[9px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest">Goal ACC</div>
                                                    <div className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{staff.acc}</div>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};



const SystemSettings = () => (
    <div className="max-w-3xl space-y-6 animate-in fade-in duration-500 pb-12">
        
        {/* Header Section */}
        <div className="mb-4">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                    <i className="ph-bold ph-gear text-xl"></i>
                </div>
                Pengaturan Sistem
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Konfigurasi parameter operasional dan notifikasi otomasi perusahaan.</p>
        </div>

        {/* Pengaturan Perusahaan */}
        <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="font-black text-lg mb-6 border-b border-gray-100 dark:border-gray-700 pb-4 flex items-center">
                <i className="ph-bold ph-buildings mr-3 text-indigo-500 text-2xl"></i> Pengaturan
            </h3>
            <div className="space-y-6">
                <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Target Rekrutmen Bulanan</label>
                    <input type="number" defaultValue="100" className="w-full sm:w-1/2 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-indigo-500 font-bold transition-all" />
                </div>
                <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Mata Uang Default</label>
                    <select className="w-full sm:w-1/2 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-indigo-500 font-bold transition-all">
                        <option>IDR (Rupiah)</option>
                        <option>USD (US Dollar)</option>
                    </select>
                </div>
            </div>
        </div>

        {/* Notifikasi Sistem */}
        <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="font-black text-lg mb-6 border-b border-gray-100 dark:border-gray-700 pb-4 flex items-center">
                <i className="ph-bold ph-bell-ringing mr-3 text-indigo-500 text-2xl"></i> Notifikasi Sistem
            </h3>
            <div className="space-y-2">
                {[ 
                    {t:'Daily Email Digest', d:'Kirim laporan harian ke email Admin.'}, 
                    {t:'SLA Warning Alert', d:'Beri tanda merah jika kandidat pending > 7 hari.'}, 
                    {t:'Payroll Auto-Draft', d:'Buat draft payroll otomatis di akhir minggu.'} 
                ].map((n, i) => (
                    <div key={i} className="flex justify-between items-center py-4 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                        <div className="pr-4">
                            <div className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">{n.t}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{n.d}</div>
                        </div>
                        {/* Toggle Switch Modern */}
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" defaultChecked={i!==2} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                        </label>
                    </div>
                ))}
            </div>
        </div>

        {/* Tombol Simpan */}
        <div className="flex justify-end pt-2">
            <button className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 flex items-center justify-center transition-all transform hover:-translate-y-0.5 uppercase tracking-widest text-sm">
                <i className="ph-bold ph-floppy-disk mr-2 text-lg"></i> Simpan Konfigurasi
            </button>
        </div>
    </div>
);


const Payroll = ({ authUser }) => {
    const [data, setData] = useState([]);
    const [users, setUsers] = useState([]);
    const [dailyData, setDailyData] = useState([]); // STATE BARU: Menyimpan data pelamar harian
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterPeriod, setFilterPeriod] = useState('');
    
    // Modal & Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [formData, setFormData] = useState({
        id: '', periode: '', username: '', uid: '', hariKerja: '', totalPostingan: '',
        deklarasiT0: '', sebenarnyaT0: '', t3: '', deklarasiV0: '', sebenarnyaV0: '',
        rasioPeningkatan: '', komisi: '', bonusT0: '', bonusT3: '', otherBonus: '', deduksi: '',
        status: 'Draft'
    });

    const isPrivileged = authUser && ['Superadmin', 'Admin'].includes(authUser.role);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // 1. Fetch Users
                const resUsers = await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action: 'getUsers' }) });
                const dataUsers = await resUsers.json();
                if (dataUsers.status === 'success') { setUsers(Array.isArray(dataUsers.data) ? dataUsers.data : []); }

                // 2. Fetch Payroll Data
                const resPayroll = await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action: 'getPayrollData' }) });
                const dataPayroll = await resPayroll.json();
                if (dataPayroll.status === 'success') {
                    let fetchedData = Array.isArray(dataPayroll.data) ? dataPayroll.data : [];
                    if (!isPrivileged) {
                        fetchedData = fetchedData.filter(d => d.username === authUser.username || d.username === authUser.name);
                    }
                    setData(fetchedData);
                    
                    if (fetchedData.length > 0) {
                        const periods = [...new Set(fetchedData.map(d => d.periode))].sort((a, b) => new Date(b) - new Date(a));
                        setFilterPeriod(periods[0]);
                    }
                }

                // 3. Fetch Daily Data (Untuk Sinkronisasi T0 & V0 ACC Otomatis)
                if (isPrivileged) {
                    const resDaily = await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action: 'getDailyData' }) });
                    const dailyResult = await resDaily.json();
                    if (dailyResult.status === 'success') {
                        setDailyData(Array.isArray(dailyResult.data) ? dailyResult.data : []);
                    }
                }

            } catch (error) {} finally { setIsLoading(false); }
        };
        fetchData();
    }, [authUser, isPrivileged]);

    // =========================================================================
    // FUNGSI BARU: AUTO-FILL SEBENARNYA T0 & V0 DARI DAILY DATA (STATUS ACC)
    // =========================================================================
    useEffect(() => {
        // Hanya jalan ketika form terbuka dan username & periode sudah dipilih
        if (isModalOpen && formData.username && formData.periode && dailyData.length > 0) {
            
            // Set rentang waktu (Senin - Minggu / 7 Hari) berdasarkan input Periode
            const startDate = new Date(formData.periode);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(startDate.getTime());
            endDate.setDate(endDate.getDate() + 6); // Ditambah 6 Hari = 7 Hari total
            endDate.setHours(23, 59, 59, 999);

            let autoT0 = 0;
            let autoV0 = 0;

            dailyData.forEach(d => {
                const rec = d.recruiter || d.username;
                // Hanya cari data milik staff terpilih dan yang hasilnya ACC
                if (rec === formData.username && d.results === 'Acc') {
                    const dDate = new Date(d.tanggal);
                    // Cek apakah tanggal input ACC tersebut masuk dalam rentang 1 minggu ini
                    if (dDate >= startDate && dDate <= endDate) {
                        if ((d.grup || '').toUpperCase().includes('V0')) {
                            autoV0++;
                        } else {
                            autoT0++;
                        }
                    }
                }
            });

            // Update ke formData hanya jika berbeda agar tidak terjadi infinite loop
            if (formData.sebenarnyaT0 !== autoT0.toString() || formData.sebenarnyaV0 !== autoV0.toString()) {
                setFormData(prev => ({
                    ...prev,
                    sebenarnyaT0: autoT0.toString(),
                    sebenarnyaV0: autoV0.toString()
                }));
            }
        }
    }, [formData.username, formData.periode, dailyData, isModalOpen]);

    const formatCurrency = (amount) => `Rp ${(Number(amount) || 0).toLocaleString('id-ID')}`;
    const formatToDDMMYYYY = (dateStr) => { if (!dateStr) return '-'; const d = new Date(dateStr); return isNaN(d.getTime()) ? dateStr : `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`; };
    
    const calculatePayrollMetrix = (input) => {
        const aktif = Number(input.sebenarnyaT0) || 0;
        const promosi = (Number(input.t3) || 0) + (Number(input.sebenarnyaV0) || 0);
        let level = 0; let pokok = 0;

        if (aktif >= 21 && promosi >= 12) { level = 3; pokok = 500000; }
        else if (aktif >= 14 && promosi >= 7) { level = 2; pokok = 400000; }
        else if (aktif >= 7 && promosi >= 3) { level = 1; pokok = 300000; }

        const komisi = Number(input.komisi) || 0; const bT0 = Number(input.bonusT0) || 0; const bT3 = Number(input.bonusT3) || 0; const bOther = Number(input.otherBonus) || 0; const deduksi = Number(input.deduksi) || 0;
        const total = pokok + komisi + bT0 + bT3 + bOther - deduksi;
        return { level, pokok, total, aktif, promosi };
    };

    const liveStats = calculatePayrollMetrix(formData);

    const handleSave = async (e) => {
        e.preventDefault();
        const payload = {
            ...formData, id: modalMode === 'add' ? Date.now() : formData.id,
            levelGaji: liveStats.level, gajiPokok: liveStats.pokok, totalGaji: liveStats.total,
            status: formData.status || 'Draft'
        };

        let newData = [...data];
        if (modalMode === 'add') newData.push(payload);
        else newData = newData.map(p => p.id === payload.id ? payload : p);
        setData(newData); setIsModalOpen(false);

        const action = modalMode === 'add' ? 'addPayrollData' : 'updatePayrollData'; 
        try { await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action: action, ...payload }) }); } catch(err) {}
    };

    const handleDelete = async (id) => {
        if(!window.confirm("Hapus data slip gaji ini?")) return;
        setData(data.filter(p => p.id !== id));
        try { await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action: 'deletePayrollData', id: id }) }); } catch(err) {}
    };

    const handleTogglePublish = async (id, currentStatus) => {
        const newStatus = currentStatus === 'Published' ? 'Draft' : 'Published';
        setData(data.map(p => p.id === id ? { ...p, status: newStatus } : p));
        try { await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action: 'updatePayrollData', id, status: newStatus }) }); } catch(err) {}
    };

    const handlePublishAll = () => {
        if(!window.confirm("Umumkan SEMUA slip gaji di layar ini kepada staf?")) return;
        const updatedData = data.map(d => currentData.find(c => c.id === d.id) ? { ...d, status: 'Published' } : d);
        setData(updatedData);
        currentData.forEach(async (d) => {
            if(d.status !== 'Published') {
                await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action: 'updatePayrollData', id: d.id, status: 'Published' }) }).catch(()=>{});
            }
        });
    };

    const handleUserSelect = (username) => {
        const u = users.find(x => x.username === username);
        setFormData({ ...formData, username: username, uid: u ? (u.uid || '') : '' });
    };

    const currentData = data.filter(d => {
        const matchPeriod = filterPeriod ? d.periode === filterPeriod : true;
        const matchSearch = d.username?.toLowerCase().includes(searchQuery.toLowerCase()) || d.uid?.includes(searchQuery);
        return matchPeriod && matchSearch;
    }).map(d => {
        const u = users.find(x => x.username === d.username);
        return { ...d, fullName: u?.name || d.username, role: u?.role || 'Staff' };
    }).sort((a, b) => b.totalGaji - a.totalGaji);

    const availablePeriods = [...new Set(data.map(d => d.periode))].sort((a, b) => new Date(b) - new Date(a));

    const getRoleStyle = (role) => {
        const r = (role || 'staff').toLowerCase();
        if (r === 'superadmin') return { bg: 'bg-[#e73a4b]', text: 'text-[#e73a4b]', icon: 'ph-crown' };
        if (r === 'admin') return { bg: 'bg-[#2563eb]', text: 'text-[#2563eb]', icon: 'ph-shield-check' };
        return { bg: 'bg-[#f59e0b]', text: 'text-[#f59e0b]', icon: 'ph-user' };
    };

    const InputCls = "w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder-gray-400";
    // ----------------------------------------------------------------------
    // TAMPILAN KHUSUS STAFF (DIGITAL PAYSLIP KEREN)
    // ----------------------------------------------------------------------
    if (!isPrivileged) {
        return (
            <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-12">
                {/* BANNER UTAMA */}
                <div className="bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#312e81] p-6 sm:p-8 lg:p-10 rounded-[32px] shadow-2xl relative overflow-hidden text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-6 border border-indigo-500/20">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                    <div className="absolute -left-20 -top-20 w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px]"></div>
                    <div className="z-10 relative">
                        <div className="inline-flex items-center gap-2 text-emerald-300 font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] mb-4 bg-emerald-950/50 px-3 py-1.5 rounded-full border border-emerald-800/50">
                            <i className="ph-bold ph-receipt text-sm"></i> Payslip Saya
                        </div>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-2 tracking-tight drop-shadow-lg">
                            Slip Gaji <span className="text-emerald-400">Digital</span>
                        </h2>
                        <p className="text-indigo-200 text-sm sm:text-base">Informasi pendapatan dan insentif Anda secara transparan.</p>
                    </div>
                </div>

                {isLoading ? (
                     <div className="flex justify-center py-20"><i className="ph-bold ph-spinner ph-spin text-5xl text-emerald-500 drop-shadow-md"></i></div>
                ) : currentData.length === 0 ? (
                     <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-3xl border border-dashed border-gray-300 dark:border-gray-700 p-12 text-center shadow-sm">
                         <i className="ph-fill ph-wallet text-6xl text-gray-300 mb-4 block"></i>
                         <h3 className="text-gray-900 dark:text-white font-black text-lg">Belum Ada Slip Gaji</h3>
                         <p className="text-sm text-gray-500">Anda belum memiliki catatan penggajian untuk saat ini.</p>
                     </div>
                ) : (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                         {currentData.map(d => {
                              const isPublished = d.status === 'Published';
                              const totalBonus = (Number(d.komisi)||0) + (Number(d.bonusT0)||0) + (Number(d.bonusT3)||0) + (Number(d.otherBonus)||0);
                              
                              if (!isPublished) {
                                  return (
                                      <div key={d.id} className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-3xl p-6 md:p-8 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden group">
                                         <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-500 mb-5 shadow-inner group-hover:scale-110 transition-transform">
                                             <i className="ph-fill ph-hourglass-high text-4xl animate-spin-slow"></i>
                                         </div>
                                         <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full mb-2 border border-indigo-100">Sedang Dikalkulasi</div>
                                         <h4 className="font-black text-gray-800 dark:text-gray-200 text-lg mb-2">Periode: {formatToDDMMYYYY(d.periode)}</h4>
                                         <p className="text-xs text-gray-500 font-medium px-4 leading-relaxed">Slip gaji Anda sedang dalam tahap rekapitulasi dan verifikasi. Harap bersabar menunggu rilis resmi dari Admin.</p>
                                      </div>
                                  )
                              }

                              return (
                                  <div key={d.id} className="bg-white dark:bg-[#1a202c] rounded-[32px] p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700/60 relative overflow-hidden group">
                                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-bl-full blur-2xl pointer-events-none"></div>
                                      <div className="absolute -left-6 -top-6 w-20 h-20 bg-emerald-500 flex items-end justify-end p-4 rounded-full shadow-lg transform -rotate-12">
                                          <i className="ph-fill ph-seal-check text-white text-xl"></i>
                                      </div>

                                      <div className="text-right mb-6 relative z-10">
                                          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Periode Pencairan</div>
                                          <div className="text-sm font-black text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 inline-block px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-700">{formatToDDMMYYYY(d.periode)}</div>
                                      </div>

                                      <div className="text-center mb-8 relative z-10">
                                          <div className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mb-2 flex items-center justify-center"><i className="ph-bold ph-money mr-1.5"></i> Total Take Home Pay</div>
                                          <div className="text-4xl sm:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-br from-emerald-500 to-teal-400 drop-shadow-sm">{formatCurrency(d.totalGaji)}</div>
                                          <div className="mt-3 inline-flex items-center text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-800/50">
                                             Level Kinerja: {d.levelGaji || 0}
                                          </div>
                                      </div>

                                      <div className="space-y-3 bg-gray-50/50 dark:bg-gray-900/30 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/50 relative z-10">
                                          <div className="flex justify-between items-center text-xs">
                                              <span className="font-bold text-gray-500">Gaji Pokok Dasar</span>
                                              <span className="font-black text-gray-800 dark:text-gray-200">{formatCurrency(d.gajiPokok)}</span>
                                          </div>
                                          <div className="flex justify-between items-center text-xs">
                                              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center"><i className="ph-bold ph-plus-circle mr-1"></i> Total Insentif / Bonus</span>
                                              <span className="font-black text-emerald-600 dark:text-emerald-400">+{formatCurrency(totalBonus)}</span>
                                          </div>
                                          {Number(d.deduksi) > 0 && (
                                              <div className="flex justify-between items-center text-xs pt-3 mt-1 border-t border-dashed border-gray-200 dark:border-gray-700">
                                                  <span className="font-bold text-rose-500 flex items-center"><i className="ph-bold ph-minus-circle mr-1"></i> Potongan / Deduksi</span>
                                                  <span className="font-black text-rose-500">-{formatCurrency(d.deduksi)}</span>
                                              </div>
                                          )}
                                      </div>

                                      <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-700 relative z-10">
                                          <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3 text-center">Metrik Pencapaian Anda</div>
                                          <div className="grid grid-cols-4 gap-2 text-center">
                                              <div className="bg-white dark:bg-gray-800 rounded-xl p-2 shadow-sm border border-gray-100 dark:border-gray-700"><div className="text-[8px] font-bold text-gray-400 uppercase mb-1">Hari</div><div className="text-xs font-black text-gray-800 dark:text-gray-200">{d.hariKerja||0}</div></div>
                                              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-2 shadow-sm border border-emerald-100 dark:border-emerald-800/30"><div className="text-[8px] font-bold text-emerald-600 uppercase mb-1">ACC T0</div><div className="text-xs font-black text-emerald-700 dark:text-emerald-400">{d.sebenarnyaT0||0}</div></div>
                                              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-2 shadow-sm border border-purple-100 dark:border-purple-800/30"><div className="text-[8px] font-bold text-purple-600 uppercase mb-1">Elit V0</div><div className="text-xs font-black text-purple-700 dark:text-purple-400">{d.sebenarnyaV0||0}</div></div>
                                              <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-2 shadow-sm border border-indigo-100 dark:border-indigo-800/30"><div className="text-[8px] font-bold text-indigo-600 uppercase mb-1">Ke T3</div><div className="text-xs font-black text-indigo-700 dark:text-indigo-400">{d.t3||0}</div></div>
                                          </div>
                                      </div>
                                  </div>
                              )
                         })}
                     </div>
                )}
            </div>
        );
    }
    return (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-12">
            
            {/* HEADER BANNER */}
            <div className="bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#312e81] p-6 sm:p-8 lg:p-10 rounded-[32px] flex flex-col md:flex-row justify-between items-center shadow-2xl relative overflow-hidden gap-6 md:gap-12 border border-indigo-500/20">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                <div className="absolute -left-20 -top-20 w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px]"></div>
                <i className="ph-fill ph-money absolute -right-10 md:right-10 top-1/2 -translate-y-1/2 opacity-[0.05] text-[200px] md:text-[250px] pointer-events-none transform -rotate-12"></i>
                
                <div className="z-10 w-full md:w-auto text-center md:text-left flex flex-col items-center md:items-start">
                    <div className="inline-flex items-center gap-2 text-emerald-300 font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] mb-4 bg-emerald-950/50 px-3 py-1.5 rounded-full border border-emerald-800/50">
                        <i className="ph-bold ph-wallet text-sm"></i> Payroll & Compensation
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-2 tracking-tight drop-shadow-lg">
                        Slip Gaji <span className="text-emerald-400">Tim</span>
                    </h2>
                    
                    <div className="mt-4 flex flex-col sm:flex-row items-center gap-3 bg-white/10 px-4 py-3 rounded-2xl border border-white/20 backdrop-blur-md shadow-lg">
                        <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 shrink-0">
                            <i className="ph-fill ph-calendar-check text-xl"></i>
                        </div>
                        <div className="text-left text-white text-xs sm:text-sm">
                            <span className="font-black text-emerald-400 block sm:inline mr-1">INFO PENCAIRAN:</span> 
                            Periode Kerja <span className="font-bold border-b border-dashed">Senin - Minggu</span> akan dicairkan pada <span className="font-black text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded">Hari Jumat</span> di minggu berikutnya.
                        </div>
                    </div>
                </div>
                
                {isPrivileged && (
                    <div className="z-10 w-full md:w-auto min-w-[250px] bg-white/5 p-5 sm:p-6 rounded-3xl backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.2)] text-center">
                        <div className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest mb-1">
                            Total Pengeluaran (Periode Ini)
                        </div>
                        <div className="text-3xl sm:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-br from-emerald-400 to-teal-200 drop-shadow-sm truncate">
                            {formatCurrency(currentData.reduce((acc, curr) => acc + (Number(curr.totalGaji) || 0), 0))}
                        </div>
                    </div>
                )}
            </div>

            {/* LEADERBOARD */}
            {!isLoading && currentData.length > 0 && isPrivileged && (
                <div>
                    <h3 className="text-sm font-black text-gray-800 dark:text-gray-200 uppercase tracking-widest mb-4 flex items-center"><i className="ph-fill ph-ranking mr-2 text-indigo-500 text-lg"></i> Top 3 Pencapaian Gaji Tertinggi</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {currentData.slice(0, 3).map((d, i) => {
                            const rank = i + 1; const uStyle = getRoleStyle(d.role);
                            return (
                                <div key={i} className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl p-4 sm:p-5 border relative overflow-hidden shadow-sm ${rank === 1 ? 'border-amber-300 dark:border-amber-700/50 shadow-amber-500/10' : 'border-gray-200/80 dark:border-gray-700/60'}`}>
                                    <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-black text-white rounded-bl-xl shadow-sm ${rank === 1 ? 'bg-gradient-to-r from-amber-500 to-orange-400' : rank === 2 ? 'bg-gray-400' : 'bg-amber-700'}`}>Rank #{rank}</div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl text-white shadow-sm border border-white/20 ${uStyle.bg}`}>{d.fullName.charAt(0).toUpperCase()}</div>
                                        <div className="min-w-0">
                                            <div className="font-black text-sm text-gray-900 dark:text-white truncate">{d.fullName}</div>
                                            <div className="text-[10px] font-bold text-gray-500">Tingkat Gaji: <span className="text-indigo-500 font-black">Level {d.levelGaji || 0}</span></div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* TOOLBAR */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-gray-200 dark:border-gray-700/80 rounded-2xl shadow-sm p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <div className="relative">
                        <i className="ph-bold ph-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                        <input type="text" placeholder="Cari User / UID..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} className="w-full sm:w-64 pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                    </div>
                    <div className="relative">
                        <select value={filterPeriod} onChange={e=>setFilterPeriod(e.target.value)} className="w-full sm:w-auto appearance-none bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl pl-4 pr-10 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 dark:text-gray-200">
                            <option value="">Semua Periode</option>
                            {availablePeriods.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                        <i className="ph-bold ph-caret-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                    </div>
                </div>
                
                <div className="flex gap-2 w-full sm:w-auto">
                    {isPrivileged && currentData.some(d => d.status !== 'Published') && (
                        <button onClick={handlePublishAll} className="w-full sm:w-auto px-4 py-2.5 bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800/50 dark:text-emerald-400 font-black text-xs rounded-xl shadow-sm hover:bg-emerald-100 flex justify-center items-center transition-all uppercase tracking-widest">
                            <i className="ph-bold ph-megaphone mr-2 text-sm"></i> Umumkan Semua
                        </button>
                    )}
                    
                    {isPrivileged && (
                        <button onClick={()=>{setModalMode('add'); setFormData({id:'', periode: new Date().toISOString().split('T')[0], username: '', uid: '', hariKerja: '', totalPostingan: '', deklarasiT0: '', sebenarnyaT0: '', t3: '', deklarasiV0: '', sebenarnyaV0: '', rasioPeningkatan: '', komisi: '', bonusT0: '', bonusT3: '', otherBonus: '', deduksi: '', status: 'Draft'}); setIsModalOpen(true);}} className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 text-white font-black text-sm rounded-xl shadow-[0_4px_14px_rgba(79,70,229,0.39)] hover:bg-indigo-700 flex justify-center items-center transition-all transform hover:-translate-y-0.5">
                            <i className="ph-bold ph-plus mr-2 text-lg"></i> Buat Slip Baru
                        </button>
                    )}
                </div>
            </div>

            {/* AREA TABEL / MOBILE CARDS */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-emerald-500"><i className="ph-bold ph-spinner ph-spin text-5xl mb-4 drop-shadow-md"></i><span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Memuat Data Keuangan...</span></div>
            ) : currentData.length === 0 ? (
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-3xl border border-dashed border-gray-300 dark:border-gray-700 p-12 flex flex-col items-center justify-center text-center shadow-sm">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center mb-4 text-gray-400"><i className="ph-fill ph-wallet text-4xl"></i></div>
                    <h3 className="text-gray-900 dark:text-white font-black text-lg mb-1">Data Kosong</h3>
                    <p className="text-xs sm:text-sm text-gray-500 max-w-sm">Belum ada catatan penggajian untuk periode atau pencarian ini.</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-[#1a202c] rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700/60 overflow-hidden">
                    
                    {/* TAMPILAN HP (MOBILE) */}
                    <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-700/50">
                        {currentData.map(d => {
                            const uStyle = getRoleStyle(d.role);
                            
                            if (!isPrivileged && d.status !== 'Published') {
                                return (
                                    <div key={d.id} className="p-6 bg-gray-50 dark:bg-gray-900/50 flex flex-col items-center justify-center text-center">
                                        <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-500 mb-4 shadow-inner">
                                            <i className="ph-fill ph-hourglass-high text-3xl animate-spin-slow"></i>
                                        </div>
                                        <h4 className="font-black text-gray-800 dark:text-gray-200 text-sm">Sedang Dikalkulasi</h4>
                                        <p className="text-[10px] text-gray-500 font-bold mt-1 px-4">Slip gaji untuk periode <span className="text-indigo-500 border-b border-indigo-200">{formatToDDMMYYYY(d.periode)}</span> sedang dalam proses verifikasi Admin. Harap tunggu pengumuman.</p>
                                    </div>
                                )
                            }

                            return (
                                <div key={d.id} className={`p-4 sm:p-5 transition-colors relative ${d.status === 'Draft' ? 'bg-amber-50/30 dark:bg-amber-900/5' : 'hover:bg-gray-50 dark:hover:bg-gray-900/30'}`}>
                                    {isPrivileged && (
                                        <div className="absolute top-4 right-4 flex items-center gap-2">
                                            <span className={`px-2 py-0.5 rounded flex items-center text-[8px] font-black uppercase tracking-widest border shadow-sm ${d.status === 'Published' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                                                <i className={`ph-bold ${d.status === 'Published' ? 'ph-check-circle' : 'ph-clock'} mr-1`}></i> {d.status === 'Published' ? 'Telah Rilis' : 'Belum Rilis'}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex items-start mb-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg text-white shadow-sm shrink-0 border border-white/10 ${uStyle.bg}`}>{d.fullName.charAt(0).toUpperCase()}</div>
                                        <div className="ml-3 mt-0.5">
                                            <div className="font-black text-sm text-gray-900 dark:text-white flex items-center gap-1.5"><i className={`${uStyle.icon} text-[10px] ${uStyle.text}`}></i> {d.fullName}</div>
                                            <div className="text-[10px] font-bold text-gray-500 flex items-center gap-1.5 mt-0.5"><i className="ph-bold ph-calendar-blank"></i> {formatToDDMMYYYY(d.periode)}</div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3 border border-gray-100 dark:border-gray-800 mb-4 grid grid-cols-4 gap-2 text-center divide-x divide-gray-200 dark:divide-gray-700 shadow-inner">
                                        <div><div className="text-[8px] font-black text-gray-400 uppercase mb-1">Hari</div><div className="text-xs font-black text-gray-700 dark:text-gray-300">{d.hariKerja||0}</div></div>
                                        <div><div className="text-[8px] font-black text-gray-400 uppercase mb-1">Aktif T0</div><div className="text-xs font-black text-emerald-600">{d.sebenarnyaT0||0}</div></div>
                                        <div><div className="text-[8px] font-black text-gray-400 uppercase mb-1">Elit V0</div><div className="text-xs font-black text-purple-600">{d.sebenarnyaV0||0}</div></div>
                                        <div><div className="text-[8px] font-black text-gray-400 uppercase mb-1">Ke T3</div><div className="text-xs font-black text-indigo-600">{d.t3||0}</div></div>
                                    </div>
                                    <div className="flex justify-between items-end mb-3">
                                        <div className="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800/50 shadow-sm">Level {d.levelGaji || 0}</div>
                                        <div className="text-right">
                                            <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Total Diterima</div>
                                            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(d.totalGaji)}</div>
                                        </div>
                                    </div>
                                    {isPrivileged && (
                                        <div className="flex gap-2 border-t border-gray-100 dark:border-gray-700 pt-3">
                                            <button onClick={() => handleTogglePublish(d.id, d.status)} className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center border shadow-sm transition-all ${d.status === 'Published' ? 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100' : 'bg-emerald-500 text-white border-emerald-600 hover:bg-emerald-600'}`}>
                                                <i className={`ph-bold ${d.status === 'Published' ? 'ph-eye-slash' : 'ph-megaphone'} mr-1.5 text-sm`}></i> {d.status === 'Published' ? 'Tarik (Draft)' : 'Rilis Sekarang'}
                                            </button>
                                            <button onClick={()=>{setModalMode('edit'); setFormData(d); setIsModalOpen(true);}} className="w-9 h-9 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-indigo-500 rounded-lg flex items-center justify-center shadow-sm"><i className="ph-bold ph-pencil-simple text-sm"></i></button>
                                            <button onClick={()=>handleDelete(d.id)} className="w-9 h-9 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-rose-500 rounded-lg flex items-center justify-center shadow-sm"><i className="ph-bold ph-trash text-sm"></i></button>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    {/* TAMPILAN DESKTOP (TABEL) */}
                    <div className="hidden md:block overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left whitespace-nowrap min-w-[1500px]">
                            <thead className="bg-gray-50/80 dark:bg-gray-900/50 text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-200 dark:border-gray-700/50 sticky top-0 z-10 backdrop-blur-md">
                                <tr>
                                    <th className="px-5 py-4">Informasi Staf & Periode</th>
                                    <th className="px-3 py-4 text-center border-l border-gray-200 dark:border-gray-700">Hari</th>
                                    <th className="px-3 py-4 text-center border-l border-gray-200 dark:border-gray-700">Pstgn</th>
                                    <th className="px-3 py-4 text-center border-l border-gray-200 dark:border-gray-700 bg-emerald-50/30 dark:bg-emerald-900/10" colSpan="2">T0 (Dek/Seb)</th>
                                    <th className="px-3 py-4 text-center border-l border-gray-200 dark:border-gray-700 bg-purple-50/30 dark:bg-purple-900/10" colSpan="2">V0 (Dek/Seb)</th>
                                    <th className="px-3 py-4 text-center border-l border-gray-200 dark:border-gray-700">T3</th>
                                    <th className="px-4 py-4 text-center border-l border-gray-200 dark:border-gray-700 text-indigo-600">Level</th>
                                    <th className="px-5 py-4 text-right border-l border-gray-200 dark:border-gray-700">Gaji Pokok</th>
                                    <th className="px-5 py-4 text-right border-l border-gray-200 dark:border-gray-700">Komisi/Bonus</th>
                                    <th className="px-5 py-4 text-right border-l border-gray-200 dark:border-gray-700 text-rose-500">Deduksi</th>
                                    <th className="px-5 py-4 text-right border-l border-gray-200 dark:border-gray-700 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 font-black">TOTAL GAJI</th>
                                    {isPrivileged && <th className="px-5 py-4 text-center border-l border-gray-200 dark:border-gray-700">Aksi Admin</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                                {currentData.map(d => {
                                    const uStyle = getRoleStyle(d.role);
                                    const totalBonus = (Number(d.komisi)||0) + (Number(d.bonusT0)||0) + (Number(d.bonusT3)||0) + (Number(d.otherBonus)||0);
                                    
                                    if (!isPrivileged && d.status !== 'Published') {
                                        return (
                                            <tr key={d.id}>
                                                <td colSpan="14" className="px-5 py-8 text-center bg-gray-50/50 dark:bg-gray-800/30">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-500 mb-3 shadow-inner">
                                                            <i className="ph-fill ph-hourglass-high text-xl animate-spin-slow"></i>
                                                        </div>
                                                        <div className="font-black text-sm text-gray-800 dark:text-gray-200">Gaji Sedang Dikalkulasi</div>
                                                        <div className="text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-widest">Periode <span className="text-indigo-500 border-b border-indigo-200">{formatToDDMMYYYY(d.periode)}</span> dalam tahap verifikasi</div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    }

                                    return (
                                        <tr key={d.id} className={`hover:bg-indigo-50/20 dark:hover:bg-indigo-900/10 transition-colors group ${d.status === 'Draft' ? 'bg-amber-50/20 dark:bg-amber-900/5' : ''}`}>
                                            <td className="px-5 py-3 relative">
                                                {isPrivileged && d.status === 'Draft' && <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>}
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm text-white shadow-sm shrink-0 ${uStyle.bg}`}>{d.fullName.charAt(0).toUpperCase()}</div>
                                                    <div>
                                                        <div className="font-black text-sm text-gray-900 dark:text-white flex items-center gap-1.5"><i className={`${uStyle.icon} text-[10px] ${uStyle.text}`}></i> {d.fullName}</div>
                                                        <div className="text-[10px] text-gray-400 font-mono mt-0.5">{d.uid} | {formatToDDMMYYYY(d.periode)}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-3 text-center font-bold border-l border-gray-100 dark:border-gray-700/50">{d.hariKerja||0}</td>
                                            <td className="px-3 py-3 text-center font-bold border-l border-gray-100 dark:border-gray-700/50">{d.totalPostingan||0}</td>
                                            <td className="px-3 py-3 text-center font-bold text-gray-400 border-l border-gray-100 dark:border-gray-700/50 bg-emerald-50/10 dark:bg-emerald-900/5">{d.deklarasiT0||0}</td>
                                            <td className="px-3 py-3 text-center font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-900/10">{d.sebenarnyaT0||0}</td>
                                            <td className="px-3 py-3 text-center font-bold text-gray-400 border-l border-gray-100 dark:border-gray-700/50 bg-purple-50/10 dark:bg-purple-900/5">{d.deklarasiV0||0}</td>
                                            <td className="px-3 py-3 text-center font-black text-purple-600 dark:text-purple-400 bg-purple-50/30 dark:bg-purple-900/10">{d.sebenarnyaV0||0}</td>
                                            <td className="px-3 py-3 text-center font-black text-indigo-600 dark:text-indigo-400 border-l border-gray-100 dark:border-gray-700/50">{d.t3||0}</td>
                                            <td className="px-4 py-3 text-center border-l border-gray-100 dark:border-gray-700/50"><span className="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 px-2 py-0.5 rounded text-[10px] font-black uppercase border border-indigo-100 dark:border-indigo-800/50">LVL {d.levelGaji||0}</span></td>
                                            <td className="px-5 py-3 text-right font-black text-gray-700 dark:text-gray-300 border-l border-gray-100 dark:border-gray-700/50">{formatCurrency(d.gajiPokok)}</td>
                                            <td className="px-5 py-3 text-right font-black text-emerald-500 border-l border-gray-100 dark:border-gray-700/50">+{formatCurrency(totalBonus)}</td>
                                            <td className="px-5 py-3 text-right font-black text-rose-500 border-l border-gray-100 dark:border-gray-700/50">-{formatCurrency(d.deduksi)}</td>
                                            <td className="px-5 py-3 text-right font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/20 text-base shadow-[inset_4px_0_0_rgba(16,185,129,0.5)] border-l border-gray-100 dark:border-gray-700/50">{formatCurrency(d.totalGaji)}</td>
                                            
                                            {isPrivileged && (
                                                <td className="px-5 py-3 text-center border-l border-gray-100 dark:border-gray-700/50">
                                                    <div className="flex justify-center items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => handleTogglePublish(d.id, d.status)} className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest flex items-center border shadow-sm transition-colors ${d.status === 'Published' ? 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'}`} title={d.status === 'Published' ? 'Ubah ke Draft' : 'Umumkan ke Staff'}>
                                                            <i className={`ph-bold ${d.status === 'Published' ? 'ph-eye-slash' : 'ph-megaphone'} mr-1 text-sm`}></i> {d.status === 'Published' ? 'Tarik' : 'Rilis'}
                                                        </button>
                                                        <button onClick={()=>{setModalMode('edit'); setFormData(d); setIsModalOpen(true);}} className="w-6 h-6 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-500 hover:text-indigo-500 rounded flex items-center justify-center shadow-sm"><i className="ph-bold ph-pencil-simple text-xs"></i></button>
                                                        <button onClick={()=>handleDelete(d.id)} className="w-6 h-6 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-500 hover:text-rose-500 rounded flex items-center justify-center shadow-sm"><i className="ph-bold ph-trash text-xs"></i></button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* MODAL FORMULIR INPUT DATA */}
            {isModalOpen && isPrivileged && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
                    <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm" onClick={()=>setIsModalOpen(false)}></div>
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col relative z-10 animate-in zoom-in-95 duration-200 border-t-[6px] border-t-emerald-500">
                        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700/60 flex justify-between bg-white/50 dark:bg-gray-800/50 items-center">
                            <h2 className="font-black flex items-center text-lg sm:text-xl text-gray-900 dark:text-white tracking-tight">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mr-3 border border-emerald-100 dark:border-emerald-800/50"><i className={`ph-bold ${modalMode === 'add' ? 'ph-plus' : 'ph-pencil-simple'} text-xl`}></i></div>
                                {modalMode === 'add' ? 'Buat Slip Gaji Baru' : 'Edit Slip Gaji'}
                            </h2>
                            <button onClick={()=>setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-rose-100 hover:text-rose-600 transition-colors"><i className="ph-bold ph-x text-lg"></i></button>
                        </div>
                        <form onSubmit={handleSave} className="p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-[85vh] custom-scrollbar bg-gray-50/30 dark:bg-gray-900/30 flex flex-col lg:flex-row gap-6 lg:gap-8">
                            
                            {/* BAGIAN KIRI: INPUT METRIK */}
                            <div className="flex-1 space-y-6">
                                {/* Section 1: Info Dasar */}
                                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 shadow-sm">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-4 flex items-center"><i className="ph-fill ph-identification-card mr-1.5 text-sm"></i> 1. Identitas & Periode</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div><label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase ml-1">Periode (Tanggal)</label><input type="date" required className={InputCls} value={formData.periode} onChange={e=>setFormData({...formData, periode: e.target.value})} disabled={modalMode === 'edit'} /></div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase ml-1">Pilih Anggota Staff</label>
                                            <select required className={InputCls} value={formData.username} onChange={e=>handleUserSelect(e.target.value)} disabled={modalMode === 'edit'}>
                                                <option value="" disabled>-- Pilih Akun --</option>
                                                {users.filter(u=>u.role==='Staff' && u.status==='Aktif').map((u, i) => <option key={i} value={u.username}>{u.name} (@{u.username})</option>)}
                                            </select>
                                        </div>
                                        <div><label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase ml-1">UID Akun</label><input type="text" readOnly placeholder="Otomatis" className={`${InputCls} bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed`} value={formData.uid} /></div>
                                        <div><label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase ml-1">Hari Kerja</label><input type="number" min="0" required placeholder="0" className={InputCls} value={formData.hariKerja} onChange={e=>setFormData({...formData, hariKerja: e.target.value})} /></div>
                                    </div>
                                </div>

                                {/* Section 2: Kinerja Konversi & Sinkronisasi Daily Data */}
                                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 shadow-sm relative">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-4 flex items-center"><i className="ph-fill ph-chart-line-up mr-1.5 text-sm"></i> 2. Kinerja Rekrutmen (Penentu Level Gaji)</h4>
                                    
                                    <div className="mb-4 bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-xl border border-emerald-100 dark:border-emerald-800/40">
                                        <label className="block text-[10px] font-bold text-emerald-700 dark:text-emerald-400 mb-1.5 uppercase ml-1">Total Postingan Selama Periode</label>
                                        <input type="number" min="0" required placeholder="0" className={`${InputCls} !bg-white dark:!bg-gray-800 border-emerald-200 dark:border-emerald-700 focus:ring-emerald-500`} value={formData.totalPostingan} onChange={e=>setFormData({...formData, totalPostingan: e.target.value})} />
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {/* T0 - Auto-Filled from Daily Data */}
                                        <div className="sm:col-span-1 border-r border-gray-100 dark:border-gray-700 pr-2 relative">
                                            <div className="text-[10px] font-black text-gray-700 dark:text-gray-300 mb-2 border-b border-gray-100 dark:border-gray-700 pb-1">KANDIDAT AKTIF (T0)</div>
                                            <div className="space-y-3">
                                                <div><label className="block text-[9px] font-bold text-gray-400 mb-1 uppercase">Deklarasi (Manual)</label><input type="number" min="0" placeholder="0" className={InputCls} value={formData.deklarasiT0} onChange={e=>setFormData({...formData, deklarasiT0: e.target.value})} /></div>
                                                <div>
                                                    <label className="block text-[9px] font-black text-emerald-600 mb-1 uppercase flex items-center justify-between">Sebenarnya (Auto) <i className="ph-fill ph-lightning text-amber-500"></i></label>
                                                    <input type="number" readOnly placeholder="0" className={`${InputCls} border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 cursor-not-allowed`} value={formData.sebenarnyaT0} />
                                                </div>
                                            </div>
                                        </div>
                                        {/* V0 - Auto-Filled from Daily Data */}
                                        <div className="sm:col-span-1 border-r border-gray-100 dark:border-gray-700 pr-2 pl-2 relative">
                                            <div className="text-[10px] font-black text-gray-700 dark:text-gray-300 mb-2 border-b border-gray-100 dark:border-gray-700 pb-1">KANDIDAT ELIT (V0)</div>
                                            <div className="space-y-3">
                                                <div><label className="block text-[9px] font-bold text-gray-400 mb-1 uppercase">Deklarasi (Manual)</label><input type="number" min="0" placeholder="0" className={InputCls} value={formData.deklarasiV0} onChange={e=>setFormData({...formData, deklarasiV0: e.target.value})} /></div>
                                                <div>
                                                    <label className="block text-[9px] font-black text-purple-600 mb-1 uppercase flex items-center justify-between">Sebenarnya (Auto) <i className="ph-fill ph-lightning text-amber-500"></i></label>
                                                    <input type="number" readOnly placeholder="0" className={`${InputCls} border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 cursor-not-allowed`} value={formData.sebenarnyaV0} />
                                                </div>
                                            </div>
                                        </div>
                                        {/* T3 - Manual */}
                                        <div className="sm:col-span-1 pl-2">
                                            <div className="text-[10px] font-black text-gray-700 dark:text-gray-300 mb-2 border-b border-gray-100 dark:border-gray-700 pb-1">PROMOSI T3</div>
                                            <div className="space-y-3">
                                                <div><label className="block text-[9px] font-black text-indigo-600 mb-1 uppercase">Dipromosikan (Mnl) <span className="text-rose-500">*</span></label><input type="number" min="0" required placeholder="0" className={`${InputCls} border-indigo-200 dark:border-indigo-800 focus:ring-indigo-500`} value={formData.t3} onChange={e=>setFormData({...formData, t3: e.target.value})} /></div>
                                                <div><label className="block text-[9px] font-bold text-gray-400 mb-1 uppercase">Rasio Peningkatan</label><input type="text" placeholder="Misal: 10%" className={InputCls} value={formData.rasioPeningkatan} onChange={e=>setFormData({...formData, rasioPeningkatan: e.target.value})} /></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-3 text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-800/40 flex items-center">
                                        <i className="ph-bold ph-info mr-1.5 text-sm"></i> Nilai "Sebenarnya T0 & V0" diisi otomatis berdasarkan data pelamar ACC di sistem (Daily Data) selama 7 hari sejak tanggal periode yang Anda pilih.
                                    </div>
                                </div>

                                {/* Section 3: Finansial Manual */}
                                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 shadow-sm">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-4 flex items-center"><i className="ph-fill ph-coins mr-1.5 text-sm"></i> 3. Komisi, Bonus & Deduksi</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase ml-1">Komisi</label><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">Rp</span><input type="number" min="0" placeholder="0" className={`${InputCls} pl-8`} value={formData.komisi} onChange={e=>setFormData({...formData, komisi: e.target.value})} /></div></div>
                                        <div><label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase ml-1">Other Bonus</label><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">Rp</span><input type="number" min="0" placeholder="0" className={`${InputCls} pl-8`} value={formData.otherBonus} onChange={e=>setFormData({...formData, otherBonus: e.target.value})} /></div></div>
                                        <div><label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase ml-1">Bonus T0</label><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">Rp</span><input type="number" min="0" placeholder="0" className={`${InputCls} pl-8`} value={formData.bonusT0} onChange={e=>setFormData({...formData, bonusT0: e.target.value})} /></div></div>
                                        <div><label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase ml-1">Bonus T3</label><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">Rp</span><input type="number" min="0" placeholder="0" className={`${InputCls} pl-8`} value={formData.bonusT3} onChange={e=>setFormData({...formData, bonusT3: e.target.value})} /></div></div>
                                        <div className="col-span-2"><label className="block text-[10px] font-black text-rose-500 mb-1.5 uppercase ml-1">Potongan / Deduksi (-)</label><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-400 font-bold text-xs">Rp</span><input type="number" min="0" placeholder="0" className={`${InputCls} pl-8 border-rose-200 dark:border-rose-800 focus:ring-rose-500 text-rose-600`} value={formData.deduksi} onChange={e=>setFormData({...formData, deduksi: e.target.value})} /></div></div>
                                    </div>
                                </div>
                            </div>

                            {/* BAGIAN KANAN: PREVIEW OTOMATIS */}
                            <div className="lg:w-80 shrink-0">
                                <div className="sticky top-0 bg-gradient-to-b from-[#111827] to-[#1f2937] rounded-3xl p-6 shadow-2xl border border-gray-700 text-white relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-bl-full blur-2xl"></div>
                                    
                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center border-b border-gray-700 pb-3">
                                        <i className="ph-fill ph-calculator mr-2 text-emerald-500 text-lg"></i> Kalkulator Sistem
                                    </div>

                                    <div className="space-y-5">
                                        <div className="grid grid-cols-2 gap-3 bg-gray-800/50 p-3 rounded-xl border border-gray-700/50 text-center">
                                            <div><div className="text-[9px] text-gray-400 font-bold uppercase mb-1">Anggota Aktif</div><div className="text-xl font-black text-emerald-400">{liveStats.aktif}</div></div>
                                            <div><div className="text-[9px] text-gray-400 font-bold uppercase mb-1">Anggota Promosi</div><div className="text-xl font-black text-purple-400">{liveStats.promosi}</div></div>
                                        </div>

                                        <div>
                                            <div className="text-[10px] text-gray-400 uppercase font-bold mb-1.5">Tingkat Penerimaan (Level)</div>
                                            <div className={`px-4 py-2 rounded-xl border flex items-center justify-center text-sm font-black uppercase tracking-widest ${liveStats.level > 0 ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300' : 'bg-gray-800 border-gray-700 text-gray-500'}`}>
                                                {liveStats.level > 0 ? `Level ${liveStats.level}` : 'Belum Memenuhi Syarat'}
                                            </div>
                                            {liveStats.level === 0 && <div className="text-[9px] text-rose-400 mt-1.5 text-center">*Minimal 7 Aktif & 3 Promosi untuk Gaji Pokok.</div>}
                                        </div>

                                        <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-2.5">
                                            <div className="flex justify-between text-xs"><span className="text-gray-400 font-medium">Gaji Pokok (Auto)</span><span className="font-bold text-emerald-400">{formatCurrency(liveStats.pokok)}</span></div>
                                            <div className="flex justify-between text-xs"><span className="text-gray-400 font-medium">Total Komisi & Bonus</span><span className="font-bold text-gray-200">+{formatCurrency(liveStats.total - liveStats.pokok + (Number(formData.deduksi)||0))}</span></div>
                                            <div className="flex justify-between text-xs border-b border-gray-700/50 pb-2.5"><span className="text-rose-400 font-medium">Deduksi</span><span className="font-bold text-rose-500">-{formatCurrency(formData.deduksi)}</span></div>
                                            <div className="pt-2">
                                                <div className="text-[9px] text-gray-400 uppercase font-black tracking-widest mb-1">Total Dibayarkan</div>
                                                <div className="text-2xl font-black text-emerald-400 drop-shadow-md">{formatCurrency(liveStats.total)}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* STATUS PREVIEW & TOMBOL SIMPAN */}
                                    <div className="mt-8 pt-5 border-t border-gray-700 flex flex-col gap-3">
                                        <label className="flex items-center gap-3 bg-gray-800/80 p-3 rounded-xl border border-gray-600/50 cursor-pointer group hover:bg-gray-800 transition-colors">
                                            <input type="checkbox" className="w-5 h-5 text-emerald-500 rounded bg-gray-700 border-gray-500 focus:ring-emerald-500 focus:ring-offset-gray-800" checked={formData.status === 'Published'} onChange={(e) => setFormData({...formData, status: e.target.checked ? 'Published' : 'Draft'})} />
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-gray-200 group-hover:text-white transition-colors">Langsung Rilis ke Staff</span>
                                                <span className="text-[9px] text-gray-400 mt-0.5">Hilangkan centang untuk simpan sbg Draft.</span>
                                            </div>
                                        </label>
                                        <button type="submit" disabled={!formData.username} className="w-full px-5 py-3.5 bg-emerald-600 text-white font-black rounded-xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 transition-colors flex justify-center items-center uppercase tracking-widest text-xs disabled:opacity-50">
                                            <i className="ph-bold ph-floppy-disk mr-2 text-base"></i> Simpan Slip Gaji
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

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

    const formatToDDMMYYYY = (dateStr) => {
        if (!dateStr) return '-'; const d = new Date(dateStr); return isNaN(d.getTime()) ? dateStr : `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`; };

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
            if (c.recruiter !== username || c.results !== 'Acc')
                return false;
            let dStr = "";
            try { if (c.tanggal) {
                const d = new Date(c.tanggal);
                if (!isNaN(d.getTime())) {
                    dStr = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
                }
            }
        } catch(e){}
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
                const currentEvalDate = new Date(dateStr); currentEvalDate.setHours(0,0,0,0);
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

    const handleDelete = (id) => { 
    if(!window.confirm("Hapus data stats ini?")) return; 
    const newData = perfData.filter(p => p.id !== id); 
    setPerfData(newData); 
    localStorage.setItem('recruitOps_perfData', JSON.stringify(newData)); 
    
    // Perintah untuk menghapus data di Google Spreadsheet
    fetch(SCRIPT_URL, { 
        method: 'POST', 
        body: JSON.stringify({ action: 'deletePerfData', id: id }) 
    }).catch(()=>{}); 
};
    
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
    const InputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all";

    // -------------------------------------------------------------
    // RENDER: Kartu Tabel Harian (Sama Responsifnya)
    // -------------------------------------------------------------
    const renderHarianCard = (s) => (
        <div key={s.username} className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm flex flex-col gap-4 hover:shadow-md transition-all group">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center font-black text-gray-600 dark:text-gray-300 shadow-inner shrink-0 border border-gray-300 dark:border-gray-600">
                        {s.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <div className="font-black text-sm text-gray-900 dark:text-white truncate">{s.username}</div>
                        <div className="text-[10px] text-gray-400 font-mono mt-0.5">@ {s.username}</div>
                    </div>
                </div>
                <div className="shrink-0 ml-2">
                    {s.statusHarian === 'Sesuai Target' && <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50 px-2.5 py-1 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest shadow-sm flex items-center"><i className="ph-bold ph-check mr-1 text-emerald-500"></i> Aman</span>}
                    {s.statusHarian === 'Kurang Target' && <span className="bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800/50 px-2.5 py-1 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest shadow-sm flex items-center" title={`Butuh ${s.reqPosting} post`}><i className="ph-bold ph-warning mr-1 text-rose-500"></i> Denda 5K</span>}
                    {s.statusHarian === 'Belum Lapor' && <span className="bg-gray-50 text-gray-500 border border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 px-2.5 py-1 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest shadow-sm flex items-center"><i className="ph-bold ph-clock mr-1 text-gray-400"></i> Kosong</span>}
                </div>
            </div>
            <div className="grid grid-cols-3 gap-2 bg-gray-50/50 dark:bg-gray-900/50 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800/50">
                <div className="text-center border-r border-gray-200 dark:border-gray-700"><div className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">Rekrut</div><div className="font-black text-indigo-600 dark:text-indigo-400 text-lg">{s.totalHarian}</div></div>
                <div className="text-center border-r border-gray-200 dark:border-gray-700"><div className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">Posts</div><div className="font-black text-gray-700 dark:text-gray-300 text-lg">{s.posts}</div></div>
                <div className="text-center"><div className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">T0 / V0</div><div className="font-black text-gray-700 dark:text-gray-300 text-lg">{s.t0} <span className="text-gray-300 text-sm">/</span> {s.v0}</div></div>
            </div>
        </div>
    );

    // -------------------------------------------------------------
    // RENDER: Kartu Tabel Mingguan/Arsip Khusus Mobile (HP)
    // -------------------------------------------------------------
    const renderMobileWeeklyCard = (s, isArsip) => (
        <div key={s.username} className="bg-white dark:bg-gray-800/90 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 shadow-sm relative overflow-hidden flex flex-col gap-4">
            {/* Rank Label di Pojok Kanan Atas */}
            <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-black text-white rounded-bl-xl shadow-sm ${s.rank === 1 ? 'bg-amber-500' : s.rank === 2 ? 'bg-gray-400' : s.rank === 3 ? 'bg-amber-700' : 'bg-gray-300 dark:bg-gray-600'}`}>
                Rank #{s.rank}
            </div>
            
            <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center font-black text-lg border-2 shadow-inner shrink-0 ${
                    s.rank === 1 ? 'bg-amber-50 text-amber-500 border-amber-200' : 
                    s.rank === 2 ? 'bg-gray-50 text-gray-500 border-gray-200' : 
                    s.rank === 3 ? 'bg-amber-900/10 text-amber-700 border-amber-700/30' : 
                    'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-900/30 dark:border-purple-800/50'
                }`}>
                    {s.username.charAt(0).toUpperCase()}
                </div>
                <div>
                    <div className="font-black text-sm text-gray-900 dark:text-white flex items-center gap-1">
                        {s.rank === 1 ? '🥇' : s.rank === 2 ? '🥈' : s.rank === 3 ? '🥉' : ''} {s.username}
                    </div>
                    <div className="text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800/50 px-2 py-0.5 rounded-md w-max mt-1">
                        Total Leads: {s.totalHarian}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-2 bg-gray-50 dark:bg-gray-900/50 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800/50">
                <div className="text-center"><div className="text-[9px] text-gray-400 font-bold mb-1 uppercase">PST</div><div className="text-sm font-black">{s.posts}</div></div>
                <div className="text-center"><div className="text-[9px] text-gray-400 font-bold mb-1 uppercase">KNJ</div><div className="text-sm font-black">{s.kunjungan}</div></div>
                <div className="text-center"><div className="text-[9px] text-gray-400 font-bold mb-1 uppercase">PLM</div><div className="text-sm font-black">{s.pelamar}</div></div>
                <div className="text-center"><div className="text-[9px] text-gray-400 font-bold mb-1 uppercase">UJI</div><div className="text-sm font-black">{s.pengujian}</div></div>
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700/50 pt-3">
                <div className="flex flex-col gap-1.5">
                    <span className="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 px-2 py-1 rounded text-[10px] font-black border border-emerald-100 dark:border-emerald-800/50">T0 (Acc): {s.t0}</span>
                    <span className="bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400 px-2 py-1 rounded text-[10px] font-black border border-purple-100 dark:border-purple-800/50">V0 (ELIT): {s.v0}</span>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                    {s.denda > 0 ? (
                        <span className="text-[10px] font-black text-rose-600 bg-rose-50 dark:bg-rose-900/20 px-2 py-1 rounded shadow-sm border border-rose-100 dark:border-rose-800/50">Denda: Rp {(s.denda).toLocaleString('id-ID')}</span>
                    ) : (
                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded shadow-sm border border-emerald-100 dark:border-emerald-800/50">Bebas Denda</span>
                    )}
                    {s.dapatBonus && <span className="text-[9px] font-black text-amber-600 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 px-2 py-1 rounded flex items-center shadow-sm"><i className="ph-fill ph-star mr-1"></i> Bonus 50K Cair</span>}
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-12">
            
            {/* 1. KARTU KPI UTAMA (Responsive Grid) */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
                {[ 
                    { l:'Total Posts', v: totalWeekly.posts, i:'ph-file-text', c:'blue', grad:'from-blue-500 to-indigo-600' }, 
                    { l:'Pelamar', v: totalWeekly.pelamar, i:'ph-users', c:'indigo', grad:'from-indigo-500 to-violet-600' }, 
                    { l:'Pengujian', v: totalWeekly.pengujian, i:'ph-exam', c:'amber', grad:'from-amber-400 to-orange-500' }, 
                    { l:'T0 (Acc)', v: totalWeekly.t0, i:'ph-check-circle', c:'emerald', grad:'from-emerald-400 to-teal-500' }, 
                    { l:'V0 (VIP)', v: totalWeekly.v0, i:'ph-star', c:'purple', grad:'from-purple-400 to-fuchsia-500' }, 
                    { l:'Denda', v: `Rp ${(totalWeekly.denda).toLocaleString('id-ID')}`, i:'ph-warning-circle', c:'rose', grad:'from-rose-400 to-red-500' } 
                ].map((k,idx)=>(
                    <div key={idx} className="relative group overflow-hidden bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-gray-200/60 dark:border-gray-700/60 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        {isLoading && <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm z-20 flex justify-center items-center"><i className={`ph-bold ph-spinner ph-spin text-2xl text-${k.c}-500`}></i></div>}
                        <div className={`absolute top-0 left-0 w-full h-1 sm:h-1.5 bg-gradient-to-r ${k.grad}`}></div>
                        <div className="p-4 sm:p-5 flex flex-col justify-between h-full relative z-10">
                            <div className="flex justify-between items-start mb-3 sm:mb-4">
                                <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 font-bold leading-tight break-words max-w-[70%]">{k.l}</span>
                                <div className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-${k.c}-50 dark:bg-${k.c}-900/20 text-${k.c}-500 dark:text-${k.c}-400 group-hover:scale-110 transition-transform duration-300 shadow-inner`}>
                                    <i className={`ph-fill ${k.i} text-lg sm:text-xl`}></i>
                                </div>
                            </div>
                            <div className="flex items-end justify-between">
                                <span className={`text-xl sm:text-2xl lg:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-br ${k.grad} drop-shadow-sm`}>
                                    {isLoading ? '-' : k.v}
                                </span>
                                <i className={`ph-fill ${k.i} absolute -bottom-3 -right-2 text-5xl sm:text-6xl opacity-[0.04] dark:opacity-[0.03] group-hover:scale-125 transition-transform duration-500 pointer-events-none`}></i>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* 2. TOP PERFORMERS BANNER */}
            <div className="bg-gradient-to-br from-[#1e1b4b] via-indigo-900 to-purple-900 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-white border border-indigo-500/30">
                <i className="ph-fill ph-ranking absolute -right-10 -bottom-10 text-[180px] sm:text-[250px] opacity-10 pointer-events-none transform -rotate-12"></i>
                <h3 className="font-black text-lg sm:text-xl mb-6 flex items-center relative z-10">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center mr-3 border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                        <i className="ph-fill ph-trophy text-amber-400 text-xl"></i>
                    </div>
                    {isPrivileged ? 'Top Performers (Minggu Ini)' : 'Peringkat Saya (Minggu Ini)'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 relative z-10">
                    {isPrivileged ? (
                        globalWeeklySummary.slice(0, 3).map((staff, i) => (
                            <div key={i} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-5 flex items-center hover:bg-white/20 transition-colors shadow-lg">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 flex items-center justify-center text-2xl sm:text-3xl mr-4 shadow-inner border border-white/10 shrink-0 relative">
                                    {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                                    <span className="absolute -bottom-1 -right-1 bg-indigo-600 text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-indigo-900 shadow-sm">{i+1}</span>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="font-black text-sm sm:text-base truncate drop-shadow-sm">{staff.username}</div>
                                    <div className="text-[10px] sm:text-xs text-indigo-200 mt-1 uppercase tracking-widest font-bold">Total ACC: <span className="font-black text-amber-300 text-sm">{staff.totalHarian}</span></div>
                                </div>
                            </div>
                        ))
                    ) : (
                        displayWeekly.map((staff, i) => (
                            <div key={i} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 flex items-center md:col-span-1 shadow-lg">
                                <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-3xl mr-4 shadow-inner border border-white/10 shrink-0 relative">
                                    {staff.rank === 1 ? '🥇' : staff.rank === 2 ? '🥈' : staff.rank === 3 ? '🥉' : '🎖️'}
                                    <span className="absolute -bottom-1 -right-1 bg-indigo-600 text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-indigo-900 shadow-sm">{staff.rank}</span>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="font-black text-base truncate drop-shadow-sm">{staff.username}</div>
                                    <div className="text-[10px] text-indigo-200 mt-1 uppercase tracking-widest font-bold">Peringkat <span className="font-black text-amber-300 text-sm">{staff.rank}</span> dari {globalStaffList.length}</div>
                                </div>
                            </div>
                        ))
                    )}
                    {globalWeeklySummary.length === 0 && <div className="col-span-3 text-sm text-indigo-300 font-medium">Belum ada data performa minggu ini.</div>}
                </div>
            </div>

            {/* 3. TABS NAVIGASI & AKSI (Responsif Horizontal Scroll) */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-3xl shadow-xl overflow-hidden flex flex-col">
                <div className="flex border-b border-gray-200 dark:border-gray-700/50 bg-gray-50/80 dark:bg-gray-900/30 overflow-x-auto hide-scrollbar snap-x">
                    {isPrivileged && (
                        <button onClick={() => setActiveTab('input')} className={`px-5 sm:px-6 py-4 font-black text-xs sm:text-sm flex items-center whitespace-nowrap transition-all duration-300 border-b-[3px] snap-center ${activeTab === 'input' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-800' : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}>
                            <i className="ph-bold ph-pencil-simple-line mr-2 text-lg"></i> Input Data
                        </button>
                    )}
                    <button onClick={() => setActiveTab('harian')} className={`px-5 sm:px-6 py-4 font-black text-xs sm:text-sm flex items-center whitespace-nowrap transition-all duration-300 border-b-[3px] snap-center ${activeTab === 'harian' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-800' : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}>
                        <i className="ph-bold ph-calendar-check mr-2 text-lg"></i> Rekap Harian
                    </button>
                    <button onClick={() => setActiveTab('mingguan')} className={`px-5 sm:px-6 py-4 font-black text-xs sm:text-sm flex items-center whitespace-nowrap transition-all duration-300 border-b-[3px] snap-center ${activeTab === 'mingguan' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-800' : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}>
                        <i className="ph-bold ph-calendar-blank mr-2 text-lg"></i> Rekap Mingguan
                    </button>
                    {isPrivileged && (
                        <button onClick={() => setActiveTab('arsip')} className={`px-5 sm:px-6 py-4 font-black text-xs sm:text-sm flex items-center whitespace-nowrap transition-all duration-300 border-b-[3px] snap-center ${activeTab === 'arsip' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-800' : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}>
                            <i className="ph-bold ph-archive mr-2 text-lg"></i> Arsip Mingguan
                        </button>
                    )}
                </div>
                
                <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-gray-800">
                    <div className="w-full md:w-auto">
                        {activeTab === 'input' && (
                            <div className="relative group">
                                <i className="ph-bold ph-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors"></i>
                                <input type="text" placeholder="Cari username..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} className="w-full md:w-72 pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow" />
                            </div>
                        )}
                        {activeTab === 'harian' && (
                            <div className="flex items-center gap-2 w-full overflow-x-auto hide-scrollbar pb-1 sm:pb-0">
                                <input type="date" value={harianDate} onChange={e=>setHarianDate(e.target.value)} className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm font-black outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm shrink-0" />
                                <button onClick={()=>{const d=new Date(); d.setHours(0,0,0,0); setHarianDate(new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0])}} className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 dark:text-indigo-400 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest whitespace-nowrap transition-colors border border-indigo-100 dark:border-indigo-800/50 shadow-sm shrink-0">Hari Ini</button>
                                <button onClick={()=>{const d=new Date(); d.setDate(d.getDate()-1); d.setHours(0,0,0,0); setHarianDate(new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0])}} className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest whitespace-nowrap transition-colors border border-gray-200 dark:border-gray-700 shadow-sm shrink-0">Kemarin</button>
                            </div>
                        )}
                        {activeTab === 'arsip' && (
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 bg-gray-50 dark:bg-gray-900 p-2 sm:p-1.5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm shrink-0">
                                <label className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest pl-2">Pilih Minggu:</label>
                                <select value={arsipOffset} onChange={e => setArsipOffset(Number(e.target.value))} className="bg-white dark:bg-gray-800 border-none rounded-lg px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none w-full sm:w-auto shadow-sm">
                                    <option value={-1}>Minggu Lalu (H-1 Mgg)</option>
                                    <option value={-2}>2 Minggu Lalu (H-2 Mgg)</option>
                                    <option value={-3}>3 Minggu Lalu (H-3 Mgg)</option>
                                    <option value={-4}>4 Minggu Lalu (H-4 Mgg)</option>
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto shrink-0 justify-end">
                        <button onClick={()=>fetchData()} className="w-10 h-10 flex items-center justify-center text-gray-500 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl transition-all shadow-sm" title="Refresh Data"><i className="ph-bold ph-arrows-clockwise text-lg"></i></button>
                        {['harian', 'mingguan', 'arsip'].includes(activeTab) && (
                            <>
                                <button onClick={() => exportCSV(activeTab === 'harian' ? [['Username','Posts','Kunjungan','Pelamar','Pengujian','T0','V0','Total Harian','Denda'], ...displayHarian.map(s => [s.username, s.posts, s.kunjungan, s.pelamar, s.pengujian, s.t0, s.v0, s.totalHarian, s.denda])] : [['Rank', 'Username','Posts','Kunjungan','Pelamar','Pengujian','T0','V0','Total Harian','Miss Target','Total Denda', 'Bonus 50K'], ...(activeTab === 'arsip' ? arsipSummary : displayWeekly).map(s => [s.rank, s.username, s.posts, s.kunjungan, s.pelamar, s.pengujian, s.t0, s.v0, s.totalHarian, s.missCount, s.denda, s.dapatBonus ? 'Dapat' : 'Tidak'])], `Export_${activeTab}_${new Date().getTime()}.csv`)} className="px-4 py-2 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-100 dark:border-emerald-800/50 rounded-xl transition-colors font-black text-xs sm:text-sm flex items-center shadow-sm"><i className="ph-bold ph-file-csv mr-1.5 text-lg"></i> CSV</button>
                                <button onClick={handlePrint} className="px-4 py-2 text-rose-600 bg-rose-50 dark:bg-rose-900/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-100 dark:border-rose-800/50 rounded-xl transition-colors font-black text-xs sm:text-sm flex items-center shadow-sm"><i className="ph-bold ph-printer mr-1.5 text-lg"></i> Print</button>
                            </>
                        )}
                        {activeTab === 'input' && (
                            <button onClick={()=>{setModalMode('add'); setFormData({id:'', tanggal: new Date().toISOString().split('T')[0], username: isPrivileged ? '' : authUser.username, postingan:'', kunjungan:'', pelamar:'', pengujian:''}); setIsModalOpen(true);}} className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 text-white font-black text-sm rounded-xl shadow-[0_4px_14px_rgba(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] hover:bg-indigo-700 flex items-center justify-center transition-all transform hover:-translate-y-0.5"><i className="ph-bold ph-plus mr-2 text-lg"></i> Input Data</button>
                        )}
                    </div>
                </div>

                {/* AREA KONTEN (Tabel vs Kartu HP) */}
                <div className="bg-white dark:bg-gray-800 min-h-[400px]">
                    
                    {/* TAB: INPUT DATA */}
                    {activeTab === 'input' && isPrivileged && (
                        <div>
                            {/* Desktop/Tab View (Tabel Lebar) */}
                            <div className="hidden md:block overflow-x-auto custom-scrollbar">
                                <table className="w-full text-left whitespace-nowrap min-w-[800px]">
                                    <thead className="bg-gray-50/80 dark:bg-gray-900/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200 dark:border-gray-700/50 sticky top-0 z-10 backdrop-blur-md">
                                        <tr><th className="px-5 py-4">Informasi Staf</th><th className="px-5 py-4 text-center">Postingan</th><th className="px-5 py-4 text-center">Visitor</th><th className="px-5 py-4 text-center">Pelamar</th><th className="px-5 py-4 text-center">Diuji</th><th className="px-5 py-4 text-center">Auto (T0/V0)</th><th className="px-5 py-4 text-center">Total & Status</th><th className="px-5 py-4 text-right">Tindakan</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                                        {isLoading ? [...Array(3)].map((_,i)=><tr key={i}><td colSpan="8" className="px-5 py-6"><div className="h-6 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md w-full"></div></td></tr>) : 
                                         perfData.filter(p => p.username.toLowerCase().includes(searchQuery.toLowerCase()) || p.tanggal.includes(searchQuery)).length === 0 ? <tr><td colSpan="8" className="text-center py-16 text-gray-400 font-bold"><i className="ph-fill ph-folder-open text-5xl mb-2 opacity-50 block"></i>Belum ada data pelaporan.</td></tr> :
                                         perfData.filter(p => p.username.toLowerCase().includes(searchQuery.toLowerCase()) || p.tanggal.includes(searchQuery)).sort((a,b)=>new Date(b.tanggal)-new Date(a.tanggal)).map((p, i) => {
                                            const auto = computeT0V0(p.username, p.tanggal); const evalP = evaluateTarget(auto.totalHarian, p.postingan);
                                            return (
                                                <tr key={i} className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors group">
                                                    <td className="px-5 py-4"><div className="font-black text-sm text-gray-900 dark:text-white flex items-center"><i className="ph-fill ph-user-circle mr-2 text-gray-400 text-lg"></i>{p.username}</div><div className="text-[10px] text-gray-500 mt-1 font-bold bg-gray-100 dark:bg-gray-800 w-max px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700"><i className="ph-bold ph-calendar-blank mr-1"></i>{formatToDDMMYYYY(p.tanggal)}</div></td>
                                                    <td className="px-5 py-4 text-center font-black text-sm text-gray-700 dark:text-gray-300">{p.postingan || 0}</td>
                                                    <td className="px-5 py-4 text-center font-black text-sm text-gray-700 dark:text-gray-300">{p.kunjungan || 0}</td>
                                                    <td className="px-5 py-4 text-center font-black text-sm text-gray-700 dark:text-gray-300">{p.pelamar || 0}</td>
                                                    <td className="px-5 py-4 text-center font-black text-sm text-gray-700 dark:text-gray-300">{p.pengujian || 0}</td>
                                                    <td className="px-5 py-4 text-center text-[10px] font-black"><div className="flex items-center justify-center gap-2"><span className="bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-900/30 px-2 py-1 rounded shadow-sm">T0: {auto.t0}</span><span className="bg-purple-50 text-purple-600 border border-purple-200 dark:bg-purple-900/30 px-2 py-1 rounded shadow-sm">V0: {auto.v0}</span></div></td>
                                                    <td className="px-5 py-4 text-center"><div className="text-base font-black text-indigo-600 dark:text-indigo-400 mb-1.5">{auto.totalHarian} Leads</div>{evalP.denda > 0 ? <span className="bg-rose-100 text-rose-600 px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest shadow-sm">Denda Rp 5K</span> : <span className="bg-emerald-100 text-emerald-600 px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest shadow-sm">Aman Sesuai</span>}</td>
                                                    <td className="px-5 py-4 text-right"><div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={()=>{setModalMode('edit'); setFormData(p); setIsModalOpen(true);}} className="w-8 h-8 flex items-center justify-center text-gray-500 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg shadow-sm transition-all"><i className="ph-bold ph-pencil-simple"></i></button><button onClick={()=>handleDelete(p.id)} className="w-8 h-8 flex items-center justify-center text-gray-500 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg shadow-sm transition-all"><i className="ph-bold ph-trash"></i></button></div></td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            
                            {/* Mobile View (Kartu Tumpuk) */}
                            <div className="md:hidden p-4 space-y-4 bg-gray-50/50 dark:bg-gray-900/30">
                                {isLoading ? <div className="flex justify-center p-6"><i className="ph-bold ph-spinner ph-spin text-3xl text-indigo-500"></i></div> :
                                 perfData.filter(p => p.username.toLowerCase().includes(searchQuery.toLowerCase()) || p.tanggal.includes(searchQuery)).length === 0 ? <div className="text-center py-10 text-gray-400 font-bold"><i className="ph-fill ph-folder-open text-4xl mb-2 opacity-50 block"></i>Kosong</div> :
                                 perfData.filter(p => p.username.toLowerCase().includes(searchQuery.toLowerCase()) || p.tanggal.includes(searchQuery)).sort((a,b)=>new Date(b.tanggal)-new Date(a.tanggal)).map((p, i) => {
                                    const auto = computeT0V0(p.username, p.tanggal); const evalP = evaluateTarget(auto.totalHarian, p.postingan);
                                    return (
                                        <div key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm relative">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <div className="font-black text-sm text-gray-900 dark:text-white flex items-center gap-1.5"><i className="ph-fill ph-user-circle text-gray-400 text-lg"></i>{p.username}</div>
                                                    <div className="text-[10px] text-gray-500 mt-1 font-bold bg-gray-100 dark:bg-gray-700 w-max px-2 py-0.5 rounded border border-gray-200 dark:border-gray-600">{formatToDDMMYYYY(p.tanggal)}</div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={()=>{setModalMode('edit'); setFormData(p); setIsModalOpen(true);}} className="w-8 h-8 flex items-center justify-center text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg"><i className="ph-bold ph-pencil-simple text-lg"></i></button>
                                                    <button onClick={()=>handleDelete(p.id)} className="w-8 h-8 flex items-center justify-center text-rose-500 bg-rose-50 dark:bg-rose-900/30 rounded-lg"><i className="ph-bold ph-trash text-lg"></i></button>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-4 gap-2 mb-3 bg-gray-50 dark:bg-gray-900/50 p-2 rounded-xl border border-gray-100 dark:border-gray-700/50 text-center">
                                                <div><div className="text-[9px] text-gray-400 font-bold uppercase mb-0.5">Posts</div><div className="font-black text-sm">{p.postingan || 0}</div></div>
                                                <div><div className="text-[9px] text-gray-400 font-bold uppercase mb-0.5">Kunj</div><div className="font-black text-sm">{p.kunjungan || 0}</div></div>
                                                <div><div className="text-[9px] text-gray-400 font-bold uppercase mb-0.5">Plmr</div><div className="font-black text-sm">{p.pelamar || 0}</div></div>
                                                <div><div className="text-[9px] text-gray-400 font-bold uppercase mb-0.5">Uji</div><div className="font-black text-sm">{p.pengujian || 0}</div></div>
                                            </div>
                                            <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700/50 pt-3">
                                                <div className="flex gap-1">
                                                    <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded text-[10px] font-black border border-emerald-100">T0: {auto.t0}</span>
                                                    <span className="bg-purple-50 text-purple-600 px-2 py-1 rounded text-[10px] font-black border border-purple-100">V0: {auto.v0}</span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xs font-black text-indigo-600 dark:text-indigo-400">{auto.totalHarian} Leads</div>
                                                    {evalP.denda > 0 ? <span className="text-[9px] font-black text-rose-600">Denda Rp 5K</span> : <span className="text-[9px] font-black text-emerald-600">Aman</span>}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* TAB: REKAP HARIAN (Sudah berupa Kartu sejak awal) */}
                    {activeTab === 'harian' && (
                        <div className="p-4 sm:p-6 lg:p-8 bg-gray-50/30 dark:bg-gray-900/20">
                            <h2 className="hidden print:block text-2xl font-black mb-6 text-center border-b pb-4">Rekap Harian - {formatToDDMMYYYY(harianDate)}</h2>
                            {isLoading ? <div className="flex flex-col items-center justify-center py-20 text-indigo-500"><i className="ph-bold ph-spinner ph-spin text-5xl mb-3 drop-shadow-md"></i></div> : (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="bg-gradient-to-b from-emerald-50/80 to-white dark:from-emerald-950/20 dark:to-gray-800 rounded-3xl p-5 border border-emerald-100 dark:border-emerald-800/40 shadow-sm flex flex-col">
                                        <h4 className="font-black text-emerald-700 dark:text-emerald-400 mb-5 flex items-center justify-between border-b border-emerald-200/60 dark:border-emerald-800/60 pb-4"><span className="flex items-center text-base"><i className="ph-fill ph-check-circle mr-2 text-xl drop-shadow-sm"></i> Target Tercapai</span><span className="bg-emerald-500 text-white dark:bg-emerald-600 px-2.5 py-0.5 rounded-md text-[10px] font-black shadow-sm">{displayHarian.filter(s => s.statusHarian === 'Sesuai Target').length} Orang</span></h4>
                                        <div className="space-y-4 flex-1">{displayHarian.filter(s => s.statusHarian === 'Sesuai Target').map(renderHarianCard)}{displayHarian.filter(s => s.statusHarian === 'Sesuai Target').length === 0 && <div className="text-xs font-bold text-gray-400 text-center py-10 opacity-50"><i className="ph-fill ph-empty text-3xl mb-2 block"></i>Nihil</div>}</div>
                                    </div>
                                    <div className="bg-gradient-to-b from-rose-50/80 to-white dark:from-rose-950/20 dark:to-gray-800 rounded-3xl p-5 border border-rose-100 dark:border-rose-800/40 shadow-sm flex flex-col">
                                        <h4 className="font-black text-rose-700 dark:text-rose-400 mb-5 flex items-center justify-between border-b border-rose-200/60 dark:border-rose-800/60 pb-4"><span className="flex items-center text-base"><i className="ph-fill ph-warning-circle mr-2 text-xl drop-shadow-sm"></i> Kena Denda</span><span className="bg-rose-500 text-white dark:bg-rose-600 px-2.5 py-0.5 rounded-md text-[10px] font-black shadow-sm">{displayHarian.filter(s => s.statusHarian === 'Kurang Target').length} Orang</span></h4>
                                        <div className="space-y-4 flex-1">{displayHarian.filter(s => s.statusHarian === 'Kurang Target').map(renderHarianCard)}{displayHarian.filter(s => s.statusHarian === 'Kurang Target').length === 0 && <div className="text-xs font-bold text-gray-400 text-center py-10 opacity-50"><i className="ph-fill ph-empty text-3xl mb-2 block"></i>Nihil</div>}</div>
                                    </div>
                                    <div className="bg-gradient-to-b from-gray-50/80 to-white dark:from-gray-900/30 dark:to-gray-800 rounded-3xl p-5 border border-gray-200 dark:border-gray-700/60 shadow-sm flex flex-col">
                                        <h4 className="font-black text-gray-700 dark:text-gray-300 mb-5 flex items-center justify-between border-b border-gray-200 dark:border-gray-700/80 pb-4"><span className="flex items-center text-base"><i className="ph-fill ph-prohibit mr-2 text-xl drop-shadow-sm"></i> Belum Lapor</span><span className="bg-gray-500 text-white dark:bg-gray-600 px-2.5 py-0.5 rounded-md text-[10px] font-black shadow-sm">{displayHarian.filter(s => s.statusHarian === 'Belum Lapor').length} Orang</span></h4>
                                        <div className="space-y-4 flex-1">{displayHarian.filter(s => s.statusHarian === 'Belum Lapor').map(renderHarianCard)}{displayHarian.filter(s => s.statusHarian === 'Belum Lapor').length === 0 && <div className="text-xs font-bold text-gray-400 text-center py-10 opacity-50"><i className="ph-fill ph-empty text-3xl mb-2 block"></i>Nihil</div>}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB: REKAP MINGGUAN */}
                    {activeTab === 'mingguan' && (
                        <div>
                            {/* Desktop View */}
                            <div className="hidden md:block overflow-x-auto print:p-0 custom-scrollbar">
                                <h2 className="hidden print:block text-2xl font-black mb-6 text-center border-b pb-4">Rekap Mingguan - Mulai {formatToDDMMYYYY(getOffsetMondayStr(0))}</h2>
                                <table className="w-full text-left whitespace-nowrap min-w-[1000px]">
                                    <thead className="bg-purple-50/80 dark:bg-purple-900/30 text-[10px] font-black text-purple-800 dark:text-purple-300 uppercase tracking-widest border-b-2 border-purple-200 dark:border-purple-800/50 sticky top-0 z-10 backdrop-blur-md">
                                        <tr>
                                            <th className="px-5 py-4 text-center w-16">Rank</th><th className="px-5 py-4 border-l border-purple-200 dark:border-purple-800/50">Anggota Tim</th><th className="px-3 py-4 text-center border-l border-purple-200 dark:border-purple-800/50">PST</th><th className="px-3 py-4 text-center border-l border-purple-200 dark:border-purple-800/50">KNJ</th><th className="px-3 py-4 text-center border-l border-purple-200 dark:border-purple-800/50">PLM</th><th className="px-3 py-4 text-center border-l border-purple-200 dark:border-purple-800/50">UJI</th><th className="px-4 py-4 text-center border-l border-purple-200 dark:border-purple-800/50 bg-emerald-50/50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400">T0</th><th className="px-4 py-4 text-center border-l border-purple-200 dark:border-purple-800/50 bg-purple-100/50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400">V0</th><th className="px-5 py-4 text-center border-l border-purple-200 dark:border-purple-800/50 bg-indigo-100/50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400">Total Leads</th><th className="px-4 py-4 text-center border-l border-purple-200 dark:border-purple-800/50 text-rose-700 dark:text-rose-400">Miss</th><th className="px-5 py-4 text-right border-l border-purple-200 dark:border-purple-800/50">Denda</th><th className="px-5 py-4 text-center border-l border-purple-200 dark:border-purple-800/50"><i className="ph-fill ph-gift text-amber-500 mr-1 text-sm"></i> Bonus (50K)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                                        {isLoading ? [...Array(5)].map((_,i)=><tr key={i}><td colSpan="12" className="px-5 py-6"><div className="h-6 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md w-full"></div></td></tr>) : 
                                         displayWeekly.length === 0 ? <tr><td colSpan="12" className="text-center py-16 text-gray-400 font-bold"><i className="ph-fill ph-ghost text-5xl mb-2 opacity-50 block"></i>Data mingguan masih kosong.</td></tr> :
                                         displayWeekly.map((s, i) => (
                                            <tr key={i} className="hover:bg-purple-50/30 dark:hover:bg-purple-900/10 transition-colors">
                                                <td className="px-5 py-4 text-center font-black text-gray-500 bg-gray-50/50 dark:bg-gray-900/30">#{s.rank}</td>
                                                <td className="px-5 py-4 font-black text-sm text-gray-900 dark:text-white border-l border-gray-100 dark:border-gray-700/50 flex items-center gap-2">{s.rank === 1 ? <span className="text-xl drop-shadow-md">🥇</span> : s.rank === 2 ? <span className="text-xl drop-shadow-md">🥈</span> : s.rank === 3 ? <span className="text-xl drop-shadow-md">🥉</span> : <div className="w-5"></div>}{s.username}</td>
                                                <td className="px-3 py-4 text-center font-bold text-gray-600 dark:text-gray-300 border-l border-gray-100 dark:border-gray-700/50">{s.posts}</td><td className="px-3 py-4 text-center font-bold text-gray-600 dark:text-gray-300 border-l border-gray-100 dark:border-gray-700/50">{s.kunjungan}</td><td className="px-3 py-4 text-center font-bold text-gray-600 dark:text-gray-300 border-l border-gray-100 dark:border-gray-700/50">{s.pelamar}</td><td className="px-3 py-4 text-center font-bold text-gray-600 dark:text-gray-300 border-l border-gray-100 dark:border-gray-700/50">{s.pengujian}</td>
                                                <td className="px-4 py-4 text-center font-black text-emerald-600 dark:text-emerald-400 border-l border-gray-100 dark:border-gray-700/50 bg-emerald-50/30 dark:bg-emerald-900/10">{s.t0}</td><td className="px-4 py-4 text-center font-black text-purple-600 dark:text-purple-400 border-l border-gray-100 dark:border-gray-700/50 bg-purple-50/50 dark:bg-purple-900/20">{s.v0}</td>
                                                <td className="px-5 py-4 text-center font-black text-indigo-600 dark:text-indigo-400 border-l border-gray-100 dark:border-gray-700/50 text-base sm:text-lg bg-indigo-50/50 dark:bg-indigo-900/20 shadow-[inset_4px_0_0_rgba(79,70,229,0.5)]">{s.totalHarian}</td>
                                                <td className="px-4 py-4 text-center font-black border-l border-gray-100 dark:border-gray-700/50">{s.missCount > 0 ? <span className="text-rose-600 dark:text-rose-400">{s.missCount} Hari</span> : <span className="text-gray-300 dark:text-gray-600">-</span>}</td>
                                                <td className="px-5 py-4 text-right font-black border-l border-gray-100 dark:border-gray-700/50">{s.denda > 0 ? <span className="text-rose-600 bg-rose-50 border border-rose-200 dark:bg-rose-900/30 dark:border-rose-800/50 px-2.5 py-1 rounded-md shadow-sm">Rp {(s.denda).toLocaleString('id-ID')}</span> : <span className="text-emerald-500 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-md">Rp 0</span>}</td>
                                                <td className="px-5 py-4 text-center font-black border-l border-gray-100 dark:border-gray-700/50">{s.dapatBonus ? <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 px-2.5 py-1 rounded-md text-[10px] shadow-sm uppercase tracking-widest flex items-center justify-center w-max mx-auto"><i className="ph-fill ph-star mr-1.5"></i> Cair</span> : <span className="text-gray-300 dark:text-gray-600">-</span>}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            
                            {/* Mobile View (Kartu Tumpuk untuk Mingguan) */}
                            <div className="md:hidden p-4 space-y-4 bg-gray-50/50 dark:bg-gray-900/30">
                                <h3 className="text-xs text-indigo-600 font-black uppercase tracking-widest text-center mb-2 bg-indigo-50 py-1.5 rounded-lg border border-indigo-100">Minggu Ini</h3>
                                {isLoading ? <div className="flex justify-center py-10"><i className="ph-bold ph-spinner ph-spin text-3xl text-indigo-500"></i></div> :
                                 displayWeekly.length === 0 ? <div className="text-center py-10 text-gray-400 font-bold">Data kosong.</div> :
                                 displayWeekly.map((s, i) => renderMobileWeeklyCard(s, false))}
                            </div>
                        </div>
                    )}

                    {/* TAB: ARSIP MINGGUAN */}
                    {activeTab === 'arsip' && isPrivileged && (
                        <div>
                            {/* Desktop View */}
                            <div className="hidden md:block overflow-x-auto print:p-0 custom-scrollbar">
                                <div className="p-6 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900/50 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center">
                                    <h2 className="text-xl sm:text-2xl font-black text-gray-800 dark:text-white mb-2 flex items-center"><i className="ph-fill ph-archive-box mr-3 text-indigo-500"></i> Data Historis Mingguan</h2>
                                    <h3 className="text-[10px] sm:text-xs text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/30 px-4 py-1.5 rounded-full border border-indigo-100 dark:border-indigo-800/50">Periode: {formatToDDMMYYYY(getOffsetMondayStr(arsipOffset))} s/d {formatToDDMMYYYY(new Date(new Date(getOffsetMondayStr(arsipOffset)).getTime() + 6*24*60*60*1000).toISOString())}</h3>
                                </div>
                                <table className="w-full text-left whitespace-nowrap min-w-[1000px]">
                                    <thead className="bg-purple-50/80 dark:bg-purple-900/30 text-[10px] font-black text-purple-800 dark:text-purple-300 uppercase tracking-widest border-b-2 border-purple-200 dark:border-purple-800/50 sticky top-0 z-10 backdrop-blur-md">
                                        <tr><th className="px-5 py-4 text-center w-16">Rank</th><th className="px-5 py-4 border-l border-purple-200 dark:border-purple-800/50">Anggota Tim</th><th className="px-3 py-4 text-center border-l border-purple-200 dark:border-purple-800/50">PST</th><th className="px-3 py-4 text-center border-l border-purple-200 dark:border-purple-800/50">KNJ</th><th className="px-3 py-4 text-center border-l border-purple-200 dark:border-purple-800/50">PLM</th><th className="px-3 py-4 text-center border-l border-purple-200 dark:border-purple-800/50">UJI</th><th className="px-4 py-4 text-center border-l border-purple-200 dark:border-purple-800/50 bg-emerald-50/50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400">T0</th><th className="px-4 py-4 text-center border-l border-purple-200 dark:border-purple-800/50 bg-purple-100/50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400">V0</th><th className="px-5 py-4 text-center border-l border-purple-200 dark:border-purple-800/50 bg-indigo-100/50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400">Total Leads</th><th className="px-4 py-4 text-center border-l border-purple-200 dark:border-purple-800/50 text-rose-700 dark:text-rose-400">Miss</th><th className="px-5 py-4 text-right border-l border-purple-200 dark:border-purple-800/50">Denda</th><th className="px-5 py-4 text-center border-l border-purple-200 dark:border-purple-800/50"><i className="ph-fill ph-gift text-amber-500 mr-1 text-sm"></i> Bonus (50K)</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                                        {isLoading ? [...Array(3)].map((_,i)=><tr key={i}><td colSpan="12" className="px-5 py-6"><div className="h-6 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md w-full"></div></td></tr>) : 
                                         arsipSummary.length === 0 ? <tr><td colSpan="12" className="text-center py-16 text-gray-400 font-bold"><i className="ph-fill ph-ghost text-5xl mb-2 opacity-50 block"></i>Tidak ada data historis.</td></tr> :
                                         arsipSummary.map((s, i) => (
                                            <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                                <td className="px-5 py-4 text-center font-black text-gray-500 bg-gray-50/50 dark:bg-gray-900/30">#{s.rank}</td>
                                                <td className="px-5 py-4 font-black text-sm text-gray-900 dark:text-white border-l border-gray-100 dark:border-gray-700/50 flex items-center gap-2">{s.rank === 1 ? <span className="text-xl drop-shadow-md">🥇</span> : s.rank === 2 ? <span className="text-xl drop-shadow-md">🥈</span> : s.rank === 3 ? <span className="text-xl drop-shadow-md">🥉</span> : <div className="w-5"></div>}{s.username}</td>
                                                <td className="px-3 py-4 text-center font-bold text-gray-600 dark:text-gray-300 border-l border-gray-100 dark:border-gray-700/50">{s.posts}</td><td className="px-3 py-4 text-center font-bold text-gray-600 dark:text-gray-300 border-l border-gray-100 dark:border-gray-700/50">{s.kunjungan}</td><td className="px-3 py-4 text-center font-bold text-gray-600 dark:text-gray-300 border-l border-gray-100 dark:border-gray-700/50">{s.pelamar}</td><td className="px-3 py-4 text-center font-bold text-gray-600 dark:text-gray-300 border-l border-gray-100 dark:border-gray-700/50">{s.pengujian}</td>
                                                <td className="px-4 py-4 text-center font-black text-emerald-600 dark:text-emerald-400 border-l border-gray-100 dark:border-gray-700/50 bg-emerald-50/30 dark:bg-emerald-900/10">{s.t0}</td><td className="px-4 py-4 text-center font-black text-purple-600 dark:text-purple-400 border-l border-gray-100 dark:border-gray-700/50 bg-purple-50/50 dark:bg-purple-900/20">{s.v0}</td>
                                                <td className="px-5 py-4 text-center font-black text-indigo-600 dark:text-indigo-400 border-l border-gray-100 dark:border-gray-700/50 text-base sm:text-lg bg-indigo-50/50 dark:bg-indigo-900/20 shadow-[inset_4px_0_0_rgba(79,70,229,0.5)]">{s.totalHarian}</td>
                                                <td className="px-4 py-4 text-center font-black border-l border-gray-100 dark:border-gray-700/50">{s.missCount > 0 ? <span className="text-rose-600 dark:text-rose-400">{s.missCount} Hari</span> : <span className="text-gray-300 dark:text-gray-600">-</span>}</td>
                                                <td className="px-5 py-4 text-right font-black border-l border-gray-100 dark:border-gray-700/50">{s.denda > 0 ? <span className="text-rose-600 bg-rose-50 border border-rose-200 dark:bg-rose-900/30 dark:border-rose-800/50 px-2.5 py-1 rounded-md shadow-sm">Rp {(s.denda).toLocaleString('id-ID')}</span> : <span className="text-emerald-500 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-md">Rp 0</span>}</td>
                                                <td className="px-5 py-4 text-center font-black border-l border-gray-100 dark:border-gray-700/50">{s.dapatBonus ? <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 px-2.5 py-1 rounded-md text-[10px] shadow-sm uppercase tracking-widest flex items-center justify-center w-max mx-auto"><i className="ph-fill ph-star mr-1.5"></i> Cair</span> : <span className="text-gray-300 dark:text-gray-600">-</span>}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            
                            {/* Mobile View (Kartu Tumpuk untuk Arsip Mingguan) */}
                            <div className="md:hidden p-4 space-y-4 bg-gray-50/50 dark:bg-gray-900/30">
                                <h3 className="text-[10px] text-gray-500 font-black uppercase tracking-widest text-center mb-2">{formatToDDMMYYYY(getOffsetMondayStr(arsipOffset))} - {formatToDDMMYYYY(new Date(new Date(getOffsetMondayStr(arsipOffset)).getTime() + 6*24*60*60*1000).toISOString())}</h3>
                                {isLoading ? <div className="flex justify-center py-10"><i className="ph-bold ph-spinner ph-spin text-3xl text-indigo-500"></i></div> :
                                 arsipSummary.length === 0 ? <div className="text-center py-10 text-gray-400 font-bold">Data historis kosong.</div> :
                                 arsipSummary.map((s, i) => renderMobileWeeklyCard(s, true))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL INPUT/EDIT (Sudah Dioptimalkan Responsifnya) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
                    <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm" onClick={()=>setIsModalOpen(false)}></div>
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col relative z-10 animate-in zoom-in-95 duration-200 border-t-[6px] border-t-indigo-600">
                        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700/60 flex justify-between bg-white/50 dark:bg-gray-800/50 items-center">
                            <h2 className="font-black flex items-center text-lg sm:text-xl text-gray-900 dark:text-white tracking-tight">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mr-3 border border-indigo-100 dark:border-indigo-800/50"><i className={`ph-bold ${modalMode === 'add' ? 'ph-plus' : 'ph-pencil-simple'} text-xl`}></i></div>
                                {modalMode === 'add' ? 'Lapor Kinerja Harian' : 'Edit Kinerja Harian'}
                            </h2>
                            <button onClick={()=>setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-rose-100 hover:text-rose-600 transition-colors"><i className="ph-bold ph-x text-lg"></i></button>
                        </div>
                        <form onSubmit={handleSavePerf} className="p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-[85vh] custom-scrollbar bg-gray-50/30 dark:bg-gray-900/30">
                            
                            {/* Info Target Banner */}
                            <div className="mb-8 bg-gradient-to-r from-indigo-50 to-white dark:from-indigo-950/30 dark:to-gray-800 border border-indigo-100 dark:border-indigo-800/40 rounded-2xl p-5 flex flex-col sm:flex-row items-start gap-4 shadow-sm relative overflow-hidden">
                                <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
                                <div className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 p-2.5 rounded-xl shrink-0"><i className="ph-fill ph-info text-2xl"></i></div>
                                <div className="w-full relative z-10">
                                    <h4 className="font-black text-indigo-900 dark:text-white text-sm uppercase tracking-widest mb-3">Aturan Target Rekrutmen</h4>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                        <div className="bg-white/80 dark:bg-gray-800/80 p-3 rounded-xl border border-indigo-100 dark:border-indigo-800/40 text-center shadow-sm"><div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Target 1</div><div className="font-black text-indigo-600 dark:text-indigo-400">3+ Leads</div><div className="text-xs font-bold text-gray-600 dark:text-gray-300 mt-1">Bebas Post</div></div>
                                        <div className="bg-white/80 dark:bg-gray-800/80 p-3 rounded-xl border border-indigo-100 dark:border-indigo-800/40 text-center shadow-sm"><div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Target 2</div><div className="font-black text-indigo-600 dark:text-indigo-400">2 Leads</div><div className="text-xs font-bold text-gray-600 dark:text-gray-300 mt-1">Min 30 Post</div></div>
                                        <div className="bg-white/80 dark:bg-gray-800/80 p-3 rounded-xl border border-indigo-100 dark:border-indigo-800/40 text-center shadow-sm"><div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Target 3</div><div className="font-black text-indigo-600 dark:text-indigo-400">1 Leads</div><div className="text-xs font-bold text-gray-600 dark:text-gray-300 mt-1">Min 60 Post</div></div>
                                        <div className="bg-white/80 dark:bg-gray-800/80 p-3 rounded-xl border border-rose-100 dark:border-rose-900/30 text-center shadow-sm relative overflow-hidden"><div className="absolute top-0 right-0 w-8 h-8 bg-rose-500/10 rounded-bl-full"></div><div className="text-[10px] text-rose-500 uppercase font-bold mb-1">Terburuk</div><div className="font-black text-rose-600 dark:text-rose-400">0 Leads</div><div className="text-xs font-bold text-rose-600/80 mt-1">Min 90 Post</div></div>
                                    </div>
                                    <p className="text-[10px] font-bold text-rose-500 mt-3 flex items-center bg-rose-50 dark:bg-rose-900/20 w-max px-3 py-1.5 rounded-lg border border-rose-100 dark:border-rose-800/40"><i className="ph-bold ph-warning-circle mr-1.5 text-sm"></i> Gagal memenuhi target di atas dikenakan denda Rp 5.000 / Hari.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                                <div className="space-y-4 bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm"><h4 className="font-black text-xs text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700 pb-2 flex items-center mb-4"><i className="ph-bold ph-identification-card mr-2 text-indigo-500"></i> Informasi Laporan</h4><div><label className="block text-[10px] font-black text-gray-500 mb-1.5 uppercase tracking-widest ml-1">Tanggal Kinerja</label><input type="date" required className={InputClass} value={formData.tanggal} onChange={e=>setFormData({...formData, tanggal: e.target.value})} disabled={modalMode === 'edit'} /></div><div><label className="block text-[10px] font-black text-gray-500 mb-1.5 uppercase tracking-widest ml-1">Anggota Operasional</label><select required className={InputClass} value={formData.username} onChange={e=>setFormData({...formData, username: e.target.value})} disabled={modalMode === 'edit' || !isPrivileged}><option value="" disabled>-- Pilih Akun Anda --</option>{globalStaffList.map((u, i) => <option key={i} value={u.username}>{u.name} (@{u.username})</option>)}</select></div></div>
                                <div className="space-y-4 bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm"><h4 className="font-black text-xs text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700 pb-2 flex items-center mb-4"><i className="ph-bold ph-chart-line-up mr-2 text-indigo-500"></i> Metrik Aktivitas Hari Ini</h4><div className="grid grid-cols-2 gap-4"><div><label className="block text-[10px] font-black text-gray-500 mb-1.5 uppercase tracking-widest ml-1">Total Postingan</label><input type="number" min="0" required placeholder="0" className={InputClass} value={formData.postingan} onChange={e=>setFormData({...formData, postingan: e.target.value})} /></div><div><label className="block text-[10px] font-black text-gray-500 mb-1.5 uppercase tracking-widest ml-1">Jumlah Kunjungan</label><input type="number" min="0" required placeholder="0" className={InputClass} value={formData.kunjungan} onChange={e=>setFormData({...formData, kunjungan: e.target.value})} /></div><div><label className="block text-[10px] font-black text-gray-500 mb-1.5 uppercase tracking-widest ml-1">Kandidat Melamar</label><input type="number" min="0" required placeholder="0" className={InputClass} value={formData.pelamar} onChange={e=>setFormData({...formData, pelamar: e.target.value})} /></div><div><label className="block text-[10px] font-black text-gray-500 mb-1.5 uppercase tracking-widest ml-1">Selesai Diuji</label><input type="number" min="0" required placeholder="0" className={InputClass} value={formData.pengujian} onChange={e=>setFormData({...formData, pengujian: e.target.value})} /></div></div></div>
                                <div className="md:col-span-2 mt-2"><label className="block text-xs font-black text-indigo-600 dark:text-indigo-400 mb-3 uppercase tracking-widest flex items-center"><i className="ph-fill ph-magic-wand mr-2 text-lg"></i> Preview Hasil Akhir Sistem</label><div className="flex bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-blue-900/20 border border-indigo-100 dark:border-indigo-800/50 rounded-2xl overflow-hidden shadow-inner divide-x divide-indigo-100 dark:divide-indigo-800/50"><div className="flex-1 p-4 sm:p-5 text-center"><div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Auto ACC (T0)</div><div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 drop-shadow-sm">{formData.username ? activeFormStats.t0 : '-'}</div></div><div className="flex-1 p-4 sm:p-5 text-center"><div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Auto VIP (V0)</div><div className="text-2xl font-black text-purple-600 dark:text-purple-400 drop-shadow-sm">{formData.username ? activeFormStats.v0 : '-'}</div></div><div className="flex-1 p-4 sm:p-5 text-center bg-indigo-100/50 dark:bg-indigo-900/50 relative"><div className="absolute top-0 left-0 w-full h-1 bg-indigo-400"></div><div className="text-[10px] font-black text-indigo-600 dark:text-indigo-300 uppercase tracking-widest mb-1.5">Total Diterima</div><div className="text-3xl font-black text-indigo-700 dark:text-indigo-400 drop-shadow-sm">{formData.username ? activeFormStats.totalHarian : '-'}</div></div><div className="flex-[1.5] p-4 sm:p-5 text-center flex flex-col justify-center items-center bg-white/80 dark:bg-gray-800/80"><div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Evaluasi Denda</div>{formData.username ? (evalForm.denda > 0 ? <span className="bg-rose-500 text-white text-xs sm:text-sm px-4 py-1.5 rounded-full font-black shadow-lg shadow-rose-500/40 animate-pulse border-2 border-rose-400">Kena Rp 5.000</span> : <span className="bg-emerald-500 text-white text-xs sm:text-sm px-4 py-1.5 rounded-full font-black shadow-lg shadow-emerald-500/40 border-2 border-emerald-400 flex items-center"><i className="ph-bold ph-check-circle mr-1"></i> Aman (Bebas)</span>) : <span className="text-gray-300 dark:text-gray-600 text-sm font-bold bg-gray-100 dark:bg-gray-900 px-4 py-1.5 rounded-full border border-gray-200 dark:border-gray-700">Pilih Staf Dahulu</span>}</div></div></div>
                            </div>
                            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 px-4 sm:px-6 lg:px-8 pb-4"><button type="button" onClick={()=>setIsModalOpen(false)} className="w-full sm:w-auto px-6 py-3.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Batal</button><button type="submit" disabled={!formData.username} className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 text-white font-black rounded-xl shadow-lg hover:shadow-indigo-500/30 hover:bg-indigo-700 flex justify-center items-center transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"><i className="ph-bold ph-floppy-disk mr-2 text-xl"></i> {modalMode === 'add' ? 'Kirim Laporan' : 'Simpan Perubahan'}</button></div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const UserManagement = ({ authUser }) => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({ 
        name: '', username: '', uid: '', password: '', role: 'Staff', status: 'Aktif', 
        photo: '', photoBase64: null, photoMimeType: null, previewUrl: null 
    });
    
    const [originalUsername, setOriginalUsername] = useState('');
    const [expandedUser, setExpandedUser] = useState(null);

    const [adminPage, setAdminPage] = useState(1);
    const [staffPage, setStaffPage] = useState(1);
    const itemsPerPage = 10;

    const isSuperadmin = authUser && authUser.role === 'Superadmin';
    const isAdmin = authUser && authUser.role === 'Admin';
    // Mengecek apakah yang login memiliki akses istimewa (Admin/Superadmin)
    const isPrivileged = isSuperadmin || isAdmin;

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

    const handleOpenAdd = () => { 
        setModalMode('add'); 
        setFormData({ name: '', username: '', uid: '', password: '', role: 'Staff', status: 'Aktif', photo: '', photoBase64: null, photoMimeType: null, previewUrl: null }); 
        setIsModalOpen(true); 
    };
    
    const handleOpenEdit = (user) => { 
        setModalMode('edit'); 
        setOriginalUsername(user.username); 
        setFormData({ 
            name: user.name || '', username: user.username || '', uid: user.uid || '', password: '', 
            role: user.role || 'Staff', status: user.status || 'Aktif', 
            photo: user.photo || user.photoUrl || '', photoBase64: null, photoMimeType: null, previewUrl: null 
        }); 
        setIsModalOpen(true); 
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) { alert('Ukuran foto maksimal 2MB!'); return; }
        
        const reader = new FileReader();
        reader.onloadend = () => { 
            const base64String = reader.result.split(',')[1];
            setFormData({ 
                ...formData, 
                photoBase64: base64String, 
                photoMimeType: file.type, 
                previewUrl: reader.result 
            }); 
        };
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
        e.preventDefault(); setIsSubmitting(true); 
        const action = modalMode === 'add' ? 'addUser' : 'updateUser';
        try {
            const payload = { action, ...formData }; 
            if (modalMode === 'edit') payload.oldUsername = originalUsername;
            
            const response = await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify(payload) });
            const result = await response.json();
            
            if (result.status === 'success') { 
                await fetchUsers(); 
                setIsModalOpen(false); 
            } else alert(result.message);
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

    const formatDate = (dateStr) => {
        if (!dateStr || dateStr === '-') return '-';
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr.split('T')[0];
            return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
        } catch(e) { return '-'; }
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
                
                const displayPhoto = (formData.username === u.username && formData.previewUrl) ? formData.previewUrl : (u.photo || u.photoUrl);
                const newlyJoined = isNewUser(u.tanggalBergabung); 

                // LOGIKA PRIVASI UID: Tampilkan UID jika yang login adalah Admin/Superadmin ATAU jika staf mengklik akunnya sendiri
                const canSeeUid = isPrivileged || (authUser && authUser.username === u.username);

                return (
                    <div key={i} className={`rounded-2xl border transition-all duration-300 overflow-hidden shadow-sm ${st.card}`}>
                        
                        <div onClick={() => toggleExpand(u.username)} className={`flex items-center justify-between p-3 sm:p-4 cursor-pointer transition-colors select-none ${st.header}`}>
                            
                            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                                {displayPhoto ? (
                                    <img src={displayPhoto} alt={u.name} className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shrink-0 shadow-sm border-2 ${st.imgBorder}`} />
                                ) : (
                                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-black text-lg sm:text-xl shrink-0 shadow-inner ${st.avatar}`}>
                                        {u.name ? u.name.charAt(0).toUpperCase() : '?'}
                                    </div>
                                )}
                                
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
                                        
                                        <span className="truncate max-w-[120px] sm:max-w-xs">{u.name || 'Unknown'}</span>

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

                        {isExpanded && (
                            <div className={`p-4 sm:p-5 border-t animate-in slide-in-from-top-2 duration-200 ${st.detail}`}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 items-start">
                                    
                                    <div>
                                        <span className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 sm:mb-2.5">Otoritas Sistem</span>
                                        <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-white text-[10px] font-black uppercase tracking-widest border ${st.badge}`}>
                                            <i className={`ph-fill ${st.badgeIcon} mr-1.5 text-sm drop-shadow-md`}></i> {st.badgeText}
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <span className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 sm:mb-2.5">Informasi Data</span>
                                        <div className="space-y-1.5 sm:space-y-2 text-xs text-gray-700 dark:text-gray-300">
                                            {/* PENGKONDISIAN UID */}
                                            {canSeeUid && (
                                                <div className="flex items-center"><span className="w-20 text-gray-400 flex items-center"><i className="ph-bold ph-hash mr-1.5"></i> UID</span><span className="font-mono font-bold bg-white/60 dark:bg-gray-800/60 px-2 py-0.5 rounded border border-gray-100 dark:border-gray-700 truncate max-w-[120px] sm:max-w-[200px]">{u.uid || '-'}</span></div>
                                            )}
                                            <div className="flex items-center"><span className="w-20 text-gray-400 flex items-center"><i className="ph-bold ph-calendar-blank mr-1.5"></i> Gabung</span><span className="font-bold">{formatDate(u.tanggalBergabung)}</span></div>
                                        </div>
                                    </div>
                                    
                                    <div className="sm:col-span-2 lg:col-span-1 lg:text-right flex flex-col lg:items-end justify-start mt-2 sm:mt-0">
                                        <span className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 lg:mb-2.5">Tindakan</span>
                                        <div className="flex flex-col sm:flex-row lg:flex-row flex-wrap gap-2 w-full lg:w-auto">
                                            {isPending && isPrivileged && (
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
                    
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4 border-b border-gray-100 dark:border-gray-700/50 pb-4 sm:pb-5">
                        <h3 className="font-black text-lg sm:text-xl flex items-center text-gray-900 dark:text-white tracking-tight">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 mr-3"><i className="ph-bold ph-users text-lg sm:text-xl"></i></div>
                            User Management
                        </h3>
                        {/* PENGKONDISIAN TOMBOL TAMBAH USER: Hanya tampil untuk Admin/Superadmin */}
                        {isPrivileged && (
                            <button onClick={handleOpenAdd} className="w-full sm:w-auto px-5 py-3 sm:py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_20px_rgba(79,70,229,0.5)] hover:bg-indigo-500 transition-all transform hover:-translate-y-0.5">
                                <i className="ph-bold ph-user-plus mr-2 text-lg"></i> Tambah User
                            </button>
                        )}
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
                                        {(formData.previewUrl || formData.photo || formData.photoUrl) ? (
                                            <img src={formData.previewUrl || formData.photo || formData.photoUrl} alt="Preview" className="w-full h-full object-cover" />
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
                                <button type="submit" className="w-full sm:w-2/3 py-3 sm:py-3.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:bg-indigo-700 flex justify-center items-center transition-all transform sm:hover:-translate-y-0.5 disabled:opacity-70 disabled:transform-none" disabled={isSubmitting}>{isSubmitting ? <><i className="ph-bold ph-spinner ph-spin mr-2 text-lg sm:text-xl"></i> Menyimpan...</> : <><i className="ph-bold ph-floppy-disk mr-2 text-lg sm:text-xl"></i> Simpan Data</>}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const App = () => {
    const [authUser, setAuthUser] = useState(() => { try { const saved = localStorage.getItem('recruitOps_session'); return saved ? JSON.parse(saved) : null; } catch (error) { return null; } });
    const [authView, setAuthView] = useState('login');
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isDark, setIsDark] = useState(() => localStorage.getItem('recruitOps_theme') === 'dark');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isCheckingSession, setIsCheckingSession] = useState(true);
    const [unreadAnnouncements, setUnreadAnnouncements] = useState(0);

    useEffect(() => { const handleResize = () => setIsMobile(window.innerWidth < 768); window.addEventListener('resize', handleResize); setTimeout(() => setIsCheckingSession(false), 300); return () => window.removeEventListener('resize', handleResize); }, []);
    
    useEffect(() => { if (isDark) { document.documentElement.classList.add('dark'); localStorage.setItem('recruitOps_theme', 'dark'); } else { document.documentElement.classList.remove('dark'); localStorage.setItem('recruitOps_theme', 'light'); } }, [isDark]);

    useEffect(() => { if (authUser) setActiveTab(authUser.role === 'Staff' ? 'daily_stats' : 'dashboard'); }, [authUser]);
    
    useEffect(() => {

    const changeTab = (tab) => () => setActiveTab(tab);

    const listeners = {
        openDashboard: changeTab("dashboard"),
        openAnnouncement: changeTab("announcement"),
        openFollowUp: changeTab("follow_up"),
        openPerformance: changeTab("performance"),
        openGoals: changeTab("goals"),
        openChannels: changeTab("channels"),
        openDailyData: changeTab("daily_data"),
        openDailyStats: changeTab("daily_stats"),
        openPayroll: changeTab("payroll"),
        openUsers: changeTab("users"),
        openSettings: changeTab("settings")
    };

    Object.entries(listeners).forEach(([event, handler]) => {
        window.addEventListener(event, handler);
    });

    return () => {
        Object.entries(listeners).forEach(([event, handler]) => {
            window.removeEventListener(event, handler);
        });
    };

}, []);
    // =========================================================================
    // LOGIKA NOTIFIKASI BARU: SINKRON DENGAN PESAN YANG SUDAH DIBACA
    // =========================================================================
    useEffect(() => {
        const checkUnread = () => {
            if (!authUser) return;
            try {
                const savedPosts = localStorage.getItem('recruitOps_announcements');
                const savedReads = localStorage.getItem(`recruitOps_read_${authUser.username}`);
                
                if (savedPosts) {
                    const posts = JSON.parse(savedPosts);
                    const readPosts = savedReads ? JSON.parse(savedReads) : [];
                    
                    // Hitung pesan yang ID-nya TIDAK ADA di dalam memori 'readPosts'
                    const unreadCount = posts.filter(p => !readPosts.includes(p.id)).length;
                    setUnreadAnnouncements(unreadCount);
                }
            } catch (e) {}
        };
        
        checkUnread(); 
        // Cek setiap 1 detik agar badge merah langsung hilang saat menu diklik
        const intv = setInterval(checkUnread, 1000); 
        return () => clearInterval(intv);
    }, [authUser]);

    const login = (user) => { let validRole = user.role ? user.role.toString().trim() : 'Staff'; validRole = validRole.charAt(0).toUpperCase() + validRole.slice(1).toLowerCase(); if (!['Superadmin', 'Admin', 'Staff'].includes(validRole)) validRole = 'Staff'; const finalUser = { ...user, role: validRole }; setAuthUser(finalUser); localStorage.setItem('recruitOps_session', JSON.stringify(finalUser)); };
    
    const logout = () => { setAuthUser(null); localStorage.removeItem('recruitOps_session'); setAuthView('login'); };
    
    const changeTab = (id) => { setActiveTab(id); if(isMobile) setSidebarOpen(false); };

    if (isCheckingSession) return (<div className={`h-dvh flex items-center justify-center ${isDark ? 'dark bg-gray-900' : 'bg-[#F8FAFC]'}`}><div className="flex flex-col items-center"><i className="ph-bold ph-spinner ph-spin text-4xl text-indigo-600 dark:text-indigo-400 mb-4"></i><span className="text-gray-500 dark:text-gray-400 font-bold text-sm">Memuat ruang kerja...</span></div></div>);
    
    if (!authUser) return (<div className={isDark ? 'dark' : ''}>{authView === 'login' ? <Login onLogin={login} onNavigateRegister={()=>setAuthView('register')} /> : <Register onRegister={login} onNavigateLogin={()=>setAuthView('login')} />}<button onClick={()=>setIsDark(!isDark)} className="fixed top-4 right-4 p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg text-gray-500 z-50 transition-transform active:scale-95"><i className={`ph-bold ${isDark?'ph-sun':'ph-moon'} text-xl`}></i></button></div>);

    const NAVIGATION = [
        { s: 'Overview', allowed: ['Superadmin', 'Admin', 'Staff'], items: [{ id: 'dashboard', l: 'Dashboard', i: 'ph-squares-four', roles: ['Superadmin', 'Admin', 'Staff'] }, { id: 'announcement', l: 'Pemberitahuan Dan Chat', i: 'ph-megaphone', roles: ['Superadmin', 'Admin', 'Staff'], badge: unreadAnnouncements }, { id: 'follow_up', l: 'Follow Up', i: 'ph-bell-ringing', roles: ['Superadmin', 'Admin', 'Staff'] }] },
        { s: 'Performance', allowed: ['Superadmin', 'Admin', 'Staff'], items: [{ id: 'performance', l: 'Recruiter Performance', i: 'ph-medal', roles: ['Superadmin', 'Admin', 'Staff'] }, { id: 'goals', l: 'Recruitment Goals', i: 'ph-target', roles: ['Superadmin', 'Admin', 'Staff'] }, { id: 'channels', l: 'Channel Performance', i: 'ph-megaphone', roles: ['Superadmin', 'Admin', 'Staff'] }] },
        { s: 'Management', allowed: ['Superadmin', 'Admin', 'Staff'], items: [{ id: 'daily_data', l: 'Daily Data', i: 'ph-address-book', roles: ['Superadmin', 'Admin', 'Staff'] }, { id: 'daily_stats', l: 'Daily Stats', i: 'ph-chart-bar', roles: ['Superadmin', 'Admin', 'Staff'] }, { id: 'payroll', l: 'Payroll', i: 'ph-currency-circle-dollar', roles: ['Superadmin', 'Admin', 'Staff'] }, { id: 'users', l: 'User Accounts', i: 'ph-user-gear', roles: ['Superadmin', 'Admin', 'Staff'] }] },
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
            case 'payroll': return <Payroll authUser={authUser} />;
            case 'users': return <UserManagement authUser={authUser} />;
            case 'settings': return <SystemSettings />;
            default: return <ExecutiveDashboard authUser={authUser} />;
        }
    };

    const bottomNavItems = [...(authUser.role !== 'Staff' ? [{ id: 'dashboard', label: 'Home', icon: 'ph-house' }] : []), { id: 'announcement', label: 'Comm', icon: 'ph-megaphone', badge: unreadAnnouncements }, { id: 'daily_data', label: 'Input', icon: 'ph-address-book' }, { id: 'daily_stats', label: 'Stats', icon: 'ph-chart-bar' }, { id: 'follow_up', label: 'Follow', icon: 'ph-bell-ringing' }];

    // Warna Avatar di Menu Bawah (Sesuai Role UserManagement)
    const getRoleStyle = (role) => {
        const r = (role || 'staff').toLowerCase();
        if (r === 'superadmin') return { avatarBg: 'bg-[#e73a4b]', textRole: 'text-[#e73a4b]' };
        if (r === 'admin') return { avatarBg: 'bg-[#2563eb]', textRole: 'text-[#2563eb]' };
        return { avatarBg: 'bg-[#f59e0b]', textRole: 'text-[#f59e0b]' };
    };
    
    const roleStyle = getRoleStyle(authUser.role);

    return (
        <div className={`${isDark ? 'dark' : ''} h-dvh overflow-hidden flex flex-col bg-[#F8FAFC] dark:bg-[#0B0F19] transition-colors selection:bg-indigo-500/30`}>
            {/* Background Ambient Orbs */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="flex flex-1 overflow-hidden relative z-10">
                
                {/* Mobile Sidebar Overlay */}
                {isMobile && isSidebarOpen && (
                    <div className="fixed inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm z-40 transition-opacity animate-in fade-in duration-300" onClick={() => setSidebarOpen(false)} />
                )}
            
                {/* MODERN SIDEBAR (Desktop & Tablet) */}
                <aside className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-white/80 dark:bg-[#111827]/80 backdrop-blur-2xl border-r border-gray-200/50 dark:border-gray-800/50 transform transition-transform duration-500 ease-out flex flex-col shadow-[20px_0_40px_rgba(0,0,0,0.05)] md:shadow-none ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                    
                    {/* Header Logo Sidebar */}
                    <div className="h-20 flex items-center px-6 border-b border-gray-200/50 dark:border-gray-800/50 shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mr-3 shadow-lg shadow-indigo-500/30 shrink-0 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                            <svg className="w-6 h-6 text-white relative z-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2L3 21H7.5L12 11L16.5 21H21L12 2Z" fill="currentColor"/>
                                <path d="M9.5 15H14.5L12 9.5L9.5 15Z" fill="currentColor" fillOpacity="0.4"/>
                            </svg>
                        </div>
                        <span className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
                            Team<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">AzurLize</span>
                        </span>
                        {isMobile && (
                            <button onClick={()=>setSidebarOpen(false)} className="ml-auto w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 hover:text-rose-500 transition-colors">
                                <i className="ph-bold ph-x"></i>
                            </button>
                        )}
                    </div>
                    
                    {/* Menu Items */}
                    <div className="flex-1 overflow-y-auto py-6 px-4 custom-scrollbar pb-24 md:pb-6">
                        {NAVIGATION.map((group, idx) => (
                            <div key={idx} className="mb-8">
                                <h4 className="px-2 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-3">
                                    {group.s}
                                    <div className="flex-1 h-px bg-gray-200/50 dark:bg-gray-800/50"></div>
                                </h4>
                                <nav className="space-y-1.5">
                                    {group.items.map(item => {
                                        const isActive = activeTab === item.id;
                                        return (
                                            <button key={item.id} onClick={()=>changeTab(item.id)} 
                                                className={`w-full relative flex items-center px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 group overflow-hidden ${
                                                    isActive 
                                                    ? 'text-white shadow-md shadow-indigo-500/20 transform scale-[1.02]' 
                                                    : 'text-gray-500 hover:bg-gray-100/80 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'
                                                }`}>
                                                
                                                {/* Active Background Component */}
                                                {isActive && <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 opacity-95"></div>}
                                                {isActive && <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>}
                                                
                                                <div className="relative flex items-center w-full z-10">
                                                    <i className={`${isActive ? 'ph-fill' : 'ph-bold'} ${item.i} text-[22px] mr-3 transition-transform duration-300 ${isActive ? 'scale-110 text-white drop-shadow-sm' : 'group-hover:scale-110 group-hover:text-indigo-500 dark:group-hover:text-indigo-400'}`}></i>
                                                    <span className="tracking-wide text-[13px]">{item.l}</span>
                                                </div>
                                                
                                                {/* Badges */}
                                                {item.badge > 0 && (
                                                    <span className={`absolute right-3 z-10 text-[10px] px-2 py-0.5 rounded-full font-black shadow-sm flex items-center justify-center min-w-[20px] ${
                                                        isActive 
                                                        ? 'bg-white text-indigo-600' 
                                                        : 'bg-rose-500 text-white animate-pulse'
                                                    }`}>
                                                        {item.badge > 99 ? '99+' : item.badge}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </nav>
                            </div>
                        ))}
                    </div>
                    
                    {/* Profil Bawah Sidebar Card */}
                    <div className="p-4 mx-4 mb-4 mt-2 border border-gray-200/80 dark:border-gray-700/80 rounded-2xl bg-white/50 dark:bg-[#1a202c]/50 backdrop-blur-md shadow-sm flex items-center justify-between group hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-colors">
                        <div className="flex items-center min-w-0 flex-1">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg text-white shrink-0 shadow-md ${roleStyle.avatarBg} relative`}>
                                {authUser.name ? authUser.name.charAt(0).toUpperCase() : 'U'}
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                            </div>
                            <div className="ml-3 min-w-0 pr-2">
                                <p className="text-sm font-black text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{authUser.name || 'User'}</p>
                                <p className={`text-[9px] uppercase font-black tracking-widest truncate ${roleStyle.textRole}`}>{authUser.role || 'Staff'}</p>
                            </div>
                        </div>
                        <button onClick={logout} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-all shadow-sm shrink-0 bg-gray-50 dark:bg-gray-800">
                            <i className="ph-bold ph-sign-out text-lg"></i>
                        </button>
                    </div>
                </aside>

                <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative pb-24 md:pb-0">
                    {/* Modern Top Header */}
                    <header className="h-20 bg-white/70 dark:bg-[#0B0F19]/70 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 flex items-center justify-between px-6 lg:px-10 z-10 shrink-0 sticky top-0">
                        <div className="flex items-center">
                            {isMobile && (
                                <button onClick={()=>setSidebarOpen(true)} className="mr-4 text-gray-500 hover:text-indigo-600 bg-gray-100 dark:bg-gray-800 w-10 h-10 rounded-xl flex items-center justify-center transition-colors shadow-sm">
                                    <i className="ph-bold ph-list text-xl"></i>
                                </button>
                            )}
                            <div>
                                <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">{pageTitle}</h1>
                                <p className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-widest hidden sm:block mt-0.5">AzurLize Management System</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={()=>setIsDark(!isDark)} className="w-11 h-11 flex items-center justify-center text-gray-500 bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700/80 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-500/50 rounded-2xl transition-all shadow-sm group">
                                <i className={`ph-fill ${isDark ? 'ph-moon text-indigo-400' : 'ph-sun text-amber-500'} text-xl group-hover:rotate-12 transition-transform`}></i>
                            </button>
                        </div>
                    </header>
                    
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
                        <div className="max-w-[1400px] mx-auto pb-6 print:pb-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {renderPageContent()}
                        </div>
                    </div>
                </main>
            </div>

            {/* FLOATING BOTTOM NAV (Modern iOS Style for Mobile) */}
            {isMobile && (
                <div className="fixed bottom-5 left-4 right-4 z-50 animate-in slide-in-from-bottom-6 duration-500">
                    <nav className="bg-white/95 dark:bg-[#1a202c]/95 backdrop-blur-2xl border border-gray-200/50 dark:border-gray-700/50 rounded-[28px] flex justify-around items-center h-[72px] px-2 shadow-[0_20px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
                        {bottomNavItems.map((item) => {
                            const isActive = activeTab === item.id;
                            return (
                                <button key={item.id} onClick={() => changeTab(item.id)} 
                                    className="relative flex flex-col items-center justify-center w-full h-full group">
                                    
                                    {/* Active Pill Indicator */}
                                    {isActive && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/30 rounded-[20px] transition-all duration-300 scale-100"></div>
                                        </div>
                                    )}

                                    <div className="relative z-10 flex flex-col items-center transition-transform duration-300 group-active:scale-95">
                                        <div className="relative">
                                            <i className={`${isActive ? 'ph-fill text-indigo-600 dark:text-indigo-400 scale-110 drop-shadow-sm' : 'ph-bold text-gray-400 dark:text-gray-500'} ${item.icon} text-[22px] transition-all duration-300`}></i>
                                            {item.badge > 0 && (
                                                <span className="absolute -top-1.5 -right-2.5 bg-rose-500 text-white text-[9px] w-[18px] h-[18px] flex items-center justify-center rounded-full border-2 border-white dark:border-[#1a202c] shadow-sm animate-bounce">
                                                    {item.badge > 99 ? '!' : item.badge}
                                                </span>
                                            )}
                                        </div>
                                        <span className={`text-[9px] font-black uppercase tracking-widest mt-1 transition-colors duration-300 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`}>
                                            {item.label}
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                        <button onClick={() => setSidebarOpen(true)} className="relative flex flex-col items-center justify-center w-full h-full group">
                            <div className="relative z-10 flex flex-col items-center transition-transform duration-300 group-active:scale-95">
                                <i className="ph-bold ph-list text-[22px] text-gray-400 dark:text-gray-500 group-hover:text-indigo-500 transition-colors"></i>
                                <span className="text-[9px] font-black uppercase tracking-widest mt-1 text-gray-400 dark:text-gray-500 group-hover:text-indigo-500 transition-colors">Menu</span>
                            </div>
                        </button>
                    </nav>
                </div>
            )}
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
