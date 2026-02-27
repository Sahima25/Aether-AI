import { Search, History, MessageSquare, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MemoryPanel({ meetings }) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredMeetings = meetings.filter(m =>
        m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.date.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="glass-morphism p-8 flex flex-col h-full group">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                    <History className="text-indigo-400" size={20} />
                </div>
                <div>
                    <h2 className="text-xl font-bold tracking-tight">Past Memories</h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Digital Cortex</p>
                </div>
            </div>

            <div className="relative mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                    type="text"
                    placeholder="Search memories..."
                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:bg-white/[0.05] transition-all text-sm placeholder:text-slate-600"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                    {filteredMeetings.map((meeting, index) => (
                        <motion.div
                            key={meeting.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="group/item p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all cursor-pointer relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-3 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                <ExternalLink size={12} className="text-indigo-400" />
                            </div>
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-slate-200 group-hover/item:text-indigo-300 transition-colors text-sm">{meeting.title}</h3>
                            </div>
                            <p className="text-xs font-light text-slate-500 line-clamp-2 leading-relaxed italic">
                                "{meeting.summary}"
                            </p>
                            <div className="mt-4 flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">{meeting.date}</span>
                                <div className="flex -space-x-2">
                                    {[1, 2].map(i => (
                                        <div key={i} className="w-5 h-5 rounded-full border border-slate-900 bg-slate-800 flex items-center justify-center text-[8px] font-bold">A{i}</div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
