import { CheckCircle2, Calendar, Circle, Zap, ArrowRight, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';

export default function ActionPanel({ actions, calendarStatus }) {
    return (
        <div className="glass-morphism p-8 flex flex-col h-full group">
            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                        <Zap className="text-yellow-400" size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">Action Items</h2>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Next Steps</p>
                    </div>
                </div>
                <button className="p-2 rounded-xl bg-white/5 border border-white/5 text-slate-500 hover:text-white hover:bg-white/10 transition-all">
                    <Share2 size={16} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                    {actions.length === 0 ? (
                        <div className="h-40 flex flex-col items-center justify-center text-center px-4">
                            <Circle size={32} className="text-slate-800 mb-4" />
                            <p className="text-xs font-medium text-slate-600 leading-relaxed uppercase tracking-[0.1em]">
                                No items detected yet.<br />Start talking to generate actions.
                            </p>
                        </div>
                    ) : (
                        actions.map((action, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30, delay: i * 0.1 }}
                                className="flex gap-4 group/action p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all cursor-pointer"
                            >
                                <div className="mt-0.5">
                                    {action.completed ? (
                                        <CheckCircle2 size={18} className="text-emerald-400" />
                                    ) : (
                                        <div className="w-[18px] h-[18px] rounded-full border-2 border-slate-700 group-hover/action:border-indigo-500 transition-colors"></div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className={`text-sm font-medium leading-snug ${action.completed ? 'text-slate-500 line-through' : 'text-slate-200 group-hover/action:text-white transition-colors'}`}>
                                        {action.text || action.title}
                                    </p>
                                    {action.date && (
                                        <div className="mt-2 flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-[10px] text-indigo-400 font-bold uppercase">
                                                <Calendar size={10} />
                                                {action.date} @ {action.time}
                                            </div>
                                            <button
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    try {
                                                        const response = await api.post('/api/sync-calendar', action);
                                                        const data = await response.json();
                                                        if (data.status === 'success') {
                                                            alert('Synced to Google Calendar!');
                                                        } else {
                                                            alert('Sync failed: ' + (data.message || 'Check credentials.json'));
                                                        }
                                                    } catch (err) {
                                                        console.error(err);
                                                        alert('Sync Error: Failed to reach backend');
                                                    }
                                                }}
                                                className="px-2 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-bold text-indigo-400 hover:bg-indigo-500/20 transition-all uppercase tracking-widest"
                                            >
                                                Sync to Google
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <ArrowRight size={14} className="text-slate-700 opacity-0 group-hover/action:opacity-100 -translate-x-2 group-hover/action:translate-x-0 transition-all" />
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5">
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center justify-between p-5 rounded-[20px] bg-indigo-500/[0.03] border border-indigo-500/10 backdrop-blur-sm cursor-pointer hover:bg-indigo-500/[0.05] transition-all shadow-lg shadow-black/20"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                            <Calendar className="text-indigo-400" size={18} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Calendar Sync</p>
                            <p className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.2em] mt-0.5">Google Workspace</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${calendarStatus === 'Synced' ? 'text-emerald-500/80' : 'text-yellow-500/80'}`}>
                            {calendarStatus}
                        </span>
                        <div className="relative">
                            <div className={`w-1.5 h-1.5 rounded-full ${calendarStatus === 'Synced' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-yellow-500'}`}></div>
                            {calendarStatus !== 'Synced' && <div className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-yellow-400 animate-ping"></div>}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
