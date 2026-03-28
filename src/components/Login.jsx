import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icon from 'lucide-react';
import '../index.css'; // Adjust the path if your component is in a subfolder

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isSignUp = location.pathname === '/signup';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Icon handling
  const GithubIcon = Icon.Github || Icon.GitHub || Icon.GitBranch;
  const MailIcon = Icon.Mail || Icon.Inbox;
  const LockIcon = Icon.Lock || Icon.Key;
  const ZapIcon = Icon.Zap || Icon.Activity;

  const handleGitHubLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: window.location.origin + '/dashboard' }
    });
    if (error) setErrorMsg(error.message);
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const { error } = isSignUp 
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#020408] flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* 1. THE "ALIVE" BACKGROUND: Moving Grid + Glowing Orbs */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
        <motion.div 
          animate={{ x: [0, 100, 0], y: [0, -50, 0] }} 
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 left-1/4 w-[40vw] h-[40vh] bg-indigo-500/20 rounded-full blur-[120px]" 
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* LOGO SECTION */}
        <div className="flex flex-col items-center mb-10 text-center">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(79,70,229,0.5)] relative group"
          >
            <ZapIcon size={32} className="text-white fill-current relative z-10" />
            <div className="absolute inset-0 bg-white/20 rounded-2xl animate-ping" />
          </motion.div>
          
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">
            {isSignUp ? 'New Entry' : 'Clearance'}
            <span className="block text-indigo-500 text-xs tracking-[0.5em] mt-2 not-italic font-bold">Protocol Alpha-01</span>
          </h2>
        </div>

        {/* AUTH CARD */}
        <div className="bg-[#0D0F14]/80 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-3xl shadow-[0_40px_100px_rgba(0,0,0,0.8)] relative">
          
          {/* Subtle Scanline Animation */}
          <div className="absolute inset-x-0 top-0 h-[2px] bg-indigo-500/30 blur-[1px] animate-scanline pointer-events-none" />

          <motion.button 
            whileHover={{ scale: 1.02, backgroundColor: '#f8fafc' }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGitHubLogin}
            className="w-full flex items-center justify-center gap-3 bg-white text-black py-4 rounded-2xl font-black transition-all shadow-xl mb-8 uppercase text-xs tracking-widest"
          >
            <GithubIcon size={18} />
            Authorize via GitHub
          </motion.button>

          <div className="relative flex items-center justify-center mb-8">
            <div className="w-full border-t border-white/5" />
            <span className="bg-[#0D0F14] px-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] absolute">Manual Override</span>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-6">
            <AnimatePresence mode='wait'>
              {errorMsg && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  className="text-rose-400 text-[10px] font-black text-center bg-rose-500/10 p-3 rounded-xl border border-rose-500/20 uppercase tracking-widest"
                >
                  {errorMsg}
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Secure ID</label>
              <div className="relative group">
                <MailIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
                <input 
                  type="email" required placeholder="name@sector.com"
                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-indigo-500/50 focus:bg-black/60 outline-none transition-all font-bold placeholder:text-slate-800" 
                  value={email} onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Access Key</label>
              <div className="relative group">
                <LockIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
                <input 
                  type="password" required placeholder="••••••••"
                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-indigo-500/50 focus:bg-black/60 outline-none transition-all font-bold placeholder:text-slate-800" 
                  value={password} onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <motion.button 
              disabled={loading}
              whileHover={{ boxShadow: "0 0 20px rgba(79,70,229,0.4)" }}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl font-black transition-all shadow-lg uppercase tracking-[0.2em] text-xs disabled:opacity-50 relative overflow-hidden group"
            >
              <span className="relative z-10">{loading ? 'Processing...' : (isSignUp ? 'Initialize' : 'Authenticate')}</span>
              {loading && <div className="absolute inset-0 bg-white/10 animate-pulse" />}
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            <button 
              onClick={() => navigate(isSignUp ? '/login' : '/signup')} 
              className="text-[10px] font-black text-slate-600 uppercase tracking-widest hover:text-indigo-400 transition-colors"
            >
              {isSignUp ? "Already Registered? " : "New Operative? "}
              <span className="text-indigo-500 underline underline-offset-4 decoration-2">
                {isSignUp ? 'Sign In' : 'Enlist'}
              </span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;