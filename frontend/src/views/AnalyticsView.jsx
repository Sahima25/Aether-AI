import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Activity, Award, RefreshCcw, Ghost } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';

export default function AnalyticsView() {
    const [data, setData] = useState({ themes: [], totalMeetings: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/analytics');
            if (response.data) {
                setData({
                    themes: response.data.themes || [],
                    totalMeetings: response.data.totalMeetings || 0
                });
            }
        } catch (error) {
            console.error('Error fetching analytics:', error);
            setData({ themes: [], totalMeetings: 0 });
        } finally {
            setLoading(false);
        }
    };

    const maxImportance = Math.max(...(data.themes?.map(t => t.value || 0) || [10]));

    return (
        <div className="p-8 space-y-8 h-full overflow-y-auto custom-scrollbar">
            {/* Header / Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-morphism p-6 rounded-3xl border-indigo-500/20 bg-indigo-500/5 relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400">
                            <Activity size={20} />
                        </div>
                        <button onClick={fetchAnalytics} className="text-slate-500 hover:text-indigo-400 transition-colors">
                            <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Total Meetings Processed</p>
                    <h3 className="text-2xl font-bold mt-1 text-white">{data.totalMeetings}</h3>
                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-indigo-500/10 blur-[40px] rounded-full group-hover:bg-indigo-500/20 transition-all"></div>
                </div>

                <div className="glass-morphism p-6 rounded-3xl border-emerald-500/20 bg-emerald-500/5 relative overflow-hidden group">
                    <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400 w-fit mb-4">
                        <Award size={20} />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Top Theme</p>
                    <h3 className="text-xl font-bold mt-1 text-white truncate">
                        {data.themes?.[0]?.name || "Extracting..."}
                    </h3>
                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-emerald-500/10 blur-[40px] rounded-full group-hover:bg-emerald-500/20 transition-all"></div>
                </div>

                <div className="glass-morphism p-6 rounded-3xl border-slate-700/50 bg-white/[0.02] relative overflow-hidden group">
                    <div className="p-2 bg-slate-700/20 rounded-xl text-slate-400 w-fit mb-4">
                        <TrendingUp size={20} />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Thematic Intensity</p>
                    <h3 className="text-2xl font-bold mt-1 text-white">Aggregated</h3>
                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-slate-500/5 blur-[40px] rounded-full group-hover:bg-slate-500/10 transition-all"></div>
                </div>
            </div>

            {/* Simple Bar Chart Section */}
            <div className="glass-morphism p-8 rounded-[2.5rem] relative overflow-hidden">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-3">
                            <BarChart3 className="text-indigo-500" />
                            Theme Distribution
                        </h2>
                        <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">Top 5 Recurring Patterns</p>
                    </div>
                </div>

                <div className="space-y-8 min-h-[300px] flex flex-col justify-center">
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <div className="space-y-6">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="h-8 w-full bg-white/[0.02] rounded-full animate-pulse border border-white/5"></div>
                                ))}
                            </div>
                        ) : data.themes?.length === 0 ? (
                            <div className="flex flex-col items-center justify-center text-slate-700 h-64">
                                <Ghost size={48} className="mb-4 opacity-10" />
                                <p className="font-bold uppercase tracking-widest text-[10px]">No themes extracted yet</p>
                                <p className="text-[10px] mt-2 opacity-30 italic">Record more meetings to build insights</p>
                            </div>
                        ) : (
                            data.themes?.map((theme, i) => (
                                <div key={i} className="group">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">
                                            {theme.name}
                                        </span>
                                        <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-md border border-indigo-500/20">
                                            Value: {theme.value}
                                        </span>
                                    </div>
                                    <div className="h-4 w-full bg-white/[0.03] rounded-full overflow-hidden border border-white/5">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(theme.value / maxImportance) * 100}%` }}
                                            transition={{ delay: i * 0.1, duration: 1, ease: "easeOut" }}
                                            className="h-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-teal-400 shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                                        />
                                    </div>
                                </div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
