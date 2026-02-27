import { Home, FolderOpen, PieChart } from 'lucide-react';

const Sidebar = ({ activeView, setActiveView }) => {
    const menuItems = [
        { id: 'dashboard', icon: Home, label: 'Home' },
        { id: 'vault', icon: FolderOpen, label: 'Vault' },
        { id: 'analytics', icon: PieChart, label: 'Analytics' },
    ];

    return (
        <aside className="w-20 lg:w-64 h-full glass border-r border-white/5 flex flex-col items-center lg:items-start py-8 px-4 gap-8">
            <div className="px-2 mb-4">
                <h1 className="text-2xl font-black tracking-tighter bg-gradient-to-br from-indigo-400 to-purple-500 bg-clip-text text-transparent hidden lg:block">
                    AETHER
                </h1>
                <div className="w-8 h-8 rounded-lg bg-indigo-500 lg:hidden focus:outline-none" />
            </div>

            <nav className="flex-1 w-full space-y-2">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveView(item.id)}
                        className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 group ${activeView === item.id
                                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                : 'text-slate-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <item.icon size={22} className={activeView === item.id ? 'stroke-[2.5px]' : 'stroke-2'} />
                        <span className="font-semibold hidden lg:block">{item.label}</span>
                    </button>
                ))}
            </nav>

            <div className="w-full pt-8 border-t border-white/5">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center font-bold text-xs">
                        VS
                    </div>
                    <div className="hidden lg:block">
                        <p className="text-xs font-bold text-slate-200">Vivin S.</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Pro</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
