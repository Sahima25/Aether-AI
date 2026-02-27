import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Calendar, Clock, ChevronRight, Archive } from 'lucide-react';
import api from '../api';

export default function VaultView() {
    const [memories, setMemories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const scrollRef = useRef(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchMemories(searchQuery);
        }, 500); // 500ms debounce
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchMemories = async (query = '') => {
        setLoading(true);
        const q = query.trim() || 'all';
        try {
            const response = await api.get(`/flashbacks?query=${encodeURIComponent(q)}`);
            if (response.data && response.data.flashbacks) {
                setMemories(response.data.flashbacks);
            }
        } catch (error) {
            console.error('Error fetching memories:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Recent Meeting';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (e) {
            return dateString;
        }
    };

    return (
        <div className="p-8 space-y-8 h-full overflow-y-auto custom-scrollbar">
            {/* Top Bar with Search */}
            <div className="flex justify-between items-center gap-6 sticky top-0 bg-slate-950/80 backdrop-blur-md z-20 py-2 border-b border-white/5">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search meeting archives..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all"
                    />
                </div>
                <button
                    onClick={fetchMemories}
                    className="px-6 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20 active:scale-95 whitespace-nowrap"
                >
                    Refresh Vault
                </button>
            </div>

            {/* Grid of Memory Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
                <AnimatePresence mode="popLayout">
                    {loading ? (
                        [...Array(6)].map((_, i) => (
                            <div key={i} className="glass-morphism h-48 animate-pulse border-white/5 bg-white/[0.01] rounded-3xl"></div>
                        ))
                    ) : memories.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="col-span-full h-96 flex flex-col items-center justify-center text-slate-600"
                        >
                            <Archive size={48} className="mb-4 opacity-10" />
                            <p className="font-bold uppercase tracking-widest text-[10px]">No memories found</p>
                            <p className="text-[10px] mt-2 opacity-30 italic">Try recording a meeting on the dashboard</p>
                        </motion.div>
                    ) : (
                        memories.map((memory, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="glass-morphism p-6 flex flex-col h-full group hover:border-indigo-500/30 transition-all cursor-pointer relative overflow-hidden rounded-3xl"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-2 text-indigo-400">
                                        <Calendar size={14} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">
                                            {formatDate(memory.metadata?.timestamp)}
                                        </span>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                                        <ChevronRight size={14} />
                                    </div>
                                </div>

                                <p className="text-sm font-light leading-relaxed text-slate-400 line-clamp-4 group-hover:text-slate-200 transition-colors">
                                    {memory.text}
                                </p>

                                <div className="mt-auto pt-6 flex items-center gap-4 border-t border-white/5 opacity-40 group-hover:opacity-100 transition-opacity">
                                    <div className="flex items-center gap-1.5 text-slate-500">
                                        <Clock size={12} />
                                        <span className="text-[10px] uppercase font-bold tracking-tighter">Archived</span>
                                    </div>
                                    <div className="text-[10px] uppercase font-bold text-indigo-500/50">
                                        {memory.metadata?.meeting_id}
                                    </div>
                                </div>

                                {/* Hover Glow */}
                                <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-indigo-500/0 blur-[40px] rounded-full group-hover:bg-indigo-500/10 transition-all duration-700"></div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
