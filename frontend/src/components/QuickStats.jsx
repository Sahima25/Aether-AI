import { Activity, MessageSquare, Zap, Ghost } from 'lucide-react';
import { motion } from 'framer-motion';

export default function QuickStats({ transcriptCount, actionCount, ghostMode }) {
    const stats = [
        {
            label: 'Transcripts',
            value: transcriptCount,
            icon: MessageSquare,
            color: 'text-indigo-400',
            bg: 'bg-indigo-500/10',
            border: 'border-indigo-500/20'
        },
        {
            label: 'Action Items',
            value: actionCount,
            icon: Zap,
            color: 'text-yellow-400',
            bg: 'bg-yellow-500/10',
            border: 'border-yellow-500/20'
        },
        {
            label: 'Ghost Mode',
            value: ghostMode ? 'Active' : 'Off',
            icon: Ghost,
            color: ghostMode ? 'text-emerald-400' : 'text-slate-500',
            bg: ghostMode ? 'bg-emerald-500/10' : 'bg-slate-500/10',
            border: ghostMode ? 'border-emerald-500/20' : 'border-slate-500/20'
        }
    ];

    return (
        <>
            {stats.map((stat, i) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`glass-morphism p-6 rounded-3xl border ${stat.border} ${stat.bg} flex items-center gap-6 group hover:scale-[1.02] transition-all`}
                >
                    <div className={`w-12 h-12 rounded-2xl ${stat.bg} border ${stat.border} flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform shadow-lg`}>
                        <stat.icon size={22} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">{stat.label}</p>
                        <h3 className="text-2xl font-bold text-white tracking-tight">{stat.value}</h3>
                    </div>
                </motion.div>
            ))}
        </>
    );
}
