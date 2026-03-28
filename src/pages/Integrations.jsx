import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import * as LucideIcons from 'lucide-react';
import { motion } from 'framer-motion';

const Integrations = ({ user }) => {
  const [connected, setConnected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const Icon = ({ name, ...props }) => {
    const LucideIcon = LucideIcons[name] || LucideIcons['HelpCircle'];
    return <LucideIcon {...props} />;
  };

  const services = [
    { id: 'github', name: 'GitHub', desc: 'Connect repositories and track commits.', icon: 'Github', category: 'Development', type: 'oauth' },
    { id: 'slack', name: 'Slack', desc: 'Sync channels and automate notifications.', icon: 'Slack', category: 'Communication', type: 'oauth' },
    { id: 'google', name: 'Google Drive', desc: 'Access and share encrypted cloud files.', icon: 'Cloud', category: 'Storage', type: 'oauth' },
    { id: 'vercel', name: 'Vercel', desc: 'Monitor deployments and domain health.', icon: 'Triangle', category: 'Development', type: 'manual' },
    { id: 'notion', name: 'Notion', desc: 'Sync documentation and mission notes.', icon: 'FileText', category: 'Documentation', type: 'manual' },
    { id: 'figma', name: 'Figma', desc: 'Import design assets and wireframes.', icon: 'Figma', category: 'Design', type: 'manual' },
  ];

  useEffect(() => {
    const syncOnReturn = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const provider = session.user.app_metadata.provider;
        if (provider && provider !== 'email') {
          await supabase.from('user_integrations').upsert({ 
            user_id: user.id, provider, status: 'active' 
          }, { onConflict: 'user_id, provider' });
        }
      }
      fetchIntegrations();
    };
    syncOnReturn();
  }, [user.id]);

  const fetchIntegrations = async () => {
    const { data } = await supabase.from('user_integrations').select('*').eq('user_id', user.id);
    if (data) setConnected(data.map(i => i.provider));
    setLoading(false);
  };

  const handleConnect = async (service) => {
    if (service.type === 'oauth') {
      await supabase.auth.signInWithOAuth({
        provider: service.id,
        options: { 
          redirectTo: window.location.origin + '/integrations',
          queryParams: { prompt: 'consent' } 
        }
      });
    } else {
      navigate(`/vault?target=${service.id}`);
    }
  };

  const disconnectIntegration = async (provider) => {
    await supabase.from('user_integrations').delete().eq('user_id', user.id).eq('provider', provider);
    fetchIntegrations();
  };

  const connectedServices = services.filter(s => connected.includes(s.id));
  const availableServices = services.filter(s => 
    !connected.includes(s.id) && s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="p-10 text-indigo-500 font-black animate-pulse text-xs uppercase tracking-[0.3em]">Syncing Uplinks...</div>;

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-12 bg-[#06080B] min-h-screen text-white">
      {/* HEADER */}
      <header className="flex items-center gap-3">
        <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500 border border-indigo-500/20">
          <Icon name="Puzzle" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight italic">Integrations</h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Connect your favorite tools to ShadowOps</p>
        </div>
      </header>

      {/* CONNECTED SECTION (TOP) */}
      {connectedServices.length > 0 && (
        <section className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
          <h2 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] border-b border-slate-800 pb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Connected
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {connectedServices.map(s => (
              <div key={s.id} className="bg-[#0D0F14] border border-slate-800 p-5 rounded-2xl flex items-center justify-between group hover:border-emerald-500/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center border border-slate-800 text-indigo-400 group-hover:scale-105 transition-transform">
                    <Icon name={s.icon} size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black uppercase tracking-tighter text-white">{s.name}</span>
                      <Icon name="CheckCircle2" className="text-emerald-500" size={14} />
                    </div>
                    <p className="text-[9px] text-slate-500 font-black uppercase">{s.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-500 hover:text-white transition-all"><Icon name="Settings" size={18} /></button>
                  <button 
                    onClick={() => disconnectIntegration(s.id)}
                    className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-500 hover:text-red-500 transition-all"
                  >
                    <Icon name="Trash2" size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SEARCH BAR */}
      <div className="relative group">
        <Icon name="Search" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
        <input 
          type="text" 
          placeholder="SEARCH INTEGRATIONS..."
          className="w-full bg-[#0D0F14] border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold uppercase tracking-widest outline-none focus:border-indigo-500 transition-all placeholder:text-slate-700"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* AVAILABLE SECTION (BOTTOM) */}
      <section className="space-y-6">
        <h2 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] border-b border-slate-800 pb-2">Available</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableServices.map(s => (
            <motion.div 
              key={s.id} 
              whileHover={{ y: -4, borderColor: '#6366f1' }}
              className="bg-[#0D0F14]/40 border border-slate-800 p-8 rounded-[2rem] flex flex-col justify-between h-[280px] group transition-all"
            >
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-slate-500 group-hover:text-white transition-colors shadow-2xl">
                    <Icon name={s.icon} size={28} />
                  </div>
                  <span className="text-[8px] font-black bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full uppercase tracking-widest">Available</span>
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2">{s.name}</h3>
                <p className="text-[11px] text-slate-500 font-bold leading-relaxed">{s.desc}</p>
              </div>
              
              <button 
                onClick={() => handleConnect(s)}
                className="w-full bg-white text-black py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-600 hover:text-white transition-all active:scale-95 shadow-lg shadow-black"
              >
                Connect
              </button>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Integrations;