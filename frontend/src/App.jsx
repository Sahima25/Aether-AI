import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import DashboardView from './views/DashboardView';
import VaultView from './views/VaultView';
import AnalyticsView from './views/AnalyticsView';


function App() {
    const [activeView, setActiveView] = useState('dashboard');

    const handleLogout = () => {
        localStorage.removeItem('aether_token');
    };

    const renderView = () => {
        switch (activeView) {
            case 'dashboard':
                return <DashboardView key="dashboard" token={token} />;
            case 'vault':
                return <VaultView key="vault" />;
            case 'analytics':
                return <AnalyticsView key="analytics" />;
            default:
                return <DashboardView key="dashboard" token={token} />;
        }
    };

    return (
        <div className="flex h-screen w-full bg-slate-950 font-['Plus_Jakarta_Sans'] text-slate-200 overflow-hidden">
            {/* Sidebar */}
            <Sidebar activeView={activeView} setActiveView={setActiveView} />

            <div className="flex-1 flex flex-col relative overflow-hidden">
                {/* Background Blobs */}
                <div className="absolute top-[-10%] left-[-10%] blob opacity-20 pointer-events-none"></div>
                <div className="absolute bottom-[-10%] right-[-10%] blob blob-teal opacity-20 pointer-events-none"></div>

                {/* Header */}
                <header className="h-16 flex justify-between items-center px-8 border-b border-white/5 z-10 shrink-0">
                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-slate-500">
                            {activeView}
                        </h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-indigo-500/50 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-[10px] font-bold uppercase tracking-widest">
                            v1.2.4-stable
                        </span>
                        <button
                            onClick={handleLogout}
                            className="text-[10px] text-red-400 hover:text-red-300 transition-colors uppercase font-bold tracking-widest px-3 py-1 rounded-full border border-red-500/20 bg-red-500/10"
                        >
                            End Session
                        </button>
                    </div>
                </header>

                {/* View Content */}
                <main className="flex-1 relative overflow-auto">
                    <AnimatePresence mode="wait">
                        {renderView()}
                    </AnimatePresence>
                </main>

                {/* Status Footer */}
                <footer className="h-10 px-8 flex justify-between items-center text-[10px] text-slate-600 font-bold uppercase tracking-widest border-t border-white/5 z-10 shrink-0">
                    <p>© 2026 AETHER AI</p>
                    <div className="flex gap-6 items-center">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
                            <span>Engine Active</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                            <span>Cloud Synced</span>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}

export default App;
