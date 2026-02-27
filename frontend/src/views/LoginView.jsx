import { useState } from 'react';
import { Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';

export default function LoginView({ setToken }) {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            if (isLogin) {
                const formData = new URLSearchParams();
                formData.append('username', username);
                formData.append('password', password);

                const response = await axios.post('http://localhost:8005/api/login', formData, {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                });
                setToken(response.data.access_token);
                localStorage.setItem('aether_token', response.data.access_token);
            } else {
                await axios.post('http://localhost:8005/api/signup', {
                    username,
                    password
                });
                alert('Signup successful! Please log in.');
                setIsLogin(true);
            }
        } catch (err) {
            setError(err.response?.data?.detail || 'Authentication failed');
        }
    };

    return (
        <div className="flex h-screen w-full items-center justify-center bg-slate-950 font-['Plus_Jakarta_Sans'] text-slate-200 overflow-hidden relative">
            <div className="absolute top-[10%] left-[20%] w-96 h-96 bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-[10%] right-[20%] w-96 h-96 bg-emerald-500/20 blur-[120px] rounded-full pointer-events-none"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-morphism p-10 rounded-[2.5rem] w-full max-w-md relative z-10 border border-white/5"
            >
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-white/[0.03] border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-500/20">
                        <ShieldCheck size={32} className="text-indigo-400" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight mb-2 text-white">TechSolvers</h2>
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-4">
                        Welcome to the Digital Cortex
                    </p>
                    <p className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold">
                        {isLogin ? 'Authenticate to Access' : 'Register Secure Identity'}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all"
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 group mt-8 shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]"
                    >
                        {isLogin ? 'Initialise Session' : 'Create Identity'}
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>

                <div className="mt-8 text-center mt-10">
                    <button
                        type="button"
                        onClick={() => { setIsLogin(!isLogin); setError(''); }}
                        className="text-[10px] text-slate-500 hover:text-indigo-400 transition-colors uppercase font-bold tracking-[0.2em]"
                    >
                        {isLogin ? 'Configure New Identity →' : '← Return to Authentication'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
