import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import * as Icon from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner'; // Ensure you've run: npm install sonner

const Settings = ({ user }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('Acme Corp');

  const tabs = [
    { id: 'profile', label: 'User Profile', icon: Icon.User },
    { id: 'workspace', label: 'Workspace', icon: Icon.Network },
    { id: 'security', label: 'Security', icon: Icon.ShieldCheck },
    { id: 'notifications', label: 'Alert Systems', icon: Icon.BellRing },
  ];

  // HANDLE SAVE ACTION WITH TOAST ALERT
  const handleSaveWorkspace = async () => {
    setLoading(true);
    
    // Simulate a tactical sync delay
    setTimeout(() => {
      setLoading(false);
      toast.success('Mainframe Synchronized', {
        description: `Workspace designated as "${workspaceName}" has been updated.`,
        className: 'bg-[#0D0F14] border border-emerald-500/20 text-white rounded-xl font-sans',
      });
    }, 800);
  };

  return (
    <div className="flex-1 bg-[#06080B] min-h-screen p-8 font-sans text-slate-300">
      {/* HEADER */}
      <header className="mb-10">
        <h1 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
          <Icon.Settings className="text-indigo-500" size={28} />
          System Settings
        </h1>
        <p className="text-slate-500 text-sm mt-1 font-medium tracking-tight">Configure your tactical environment and user credentials.</p>
      </header>

      <div className="flex gap-10">
        {/* SETTINGS NAV */}
        <aside className="w-48 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${
                activeTab === tab.id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40' 
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/50'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </aside>

        {/* SETTINGS CONTENT */}
        <main className="flex-1 max-w-2xl">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0D0F14] border border-slate-800/40 rounded-2xl p-8 shadow-2xl relative overflow-hidden"
          >
            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <section className="space-y-6">
                <h3 className="text-lg font-bold text-white">Identity Overview</h3>
                <div className="flex items-center gap-6 p-5 bg-slate-900/30 rounded-2xl border border-slate-800/50">
                  <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center text-3xl font-black text-white uppercase shadow-inner">
                    {user?.email?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Authorized Personnel</p>
                    <p className="text-white font-bold text-lg">{user?.email}</p>
                    <button className="text-indigo-500 text-[10px] font-black uppercase mt-2 hover:text-indigo-400 transition-colors">Change Avatar</button>
                  </div>
                </div>
              </section>
            )}

            {/* WORKSPACE TAB */}
            {activeTab === 'workspace' && (
              <section className="space-y-6">
                <h3 className="text-lg font-bold text-white">Workspace Configuration</h3>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Workspace Name</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={workspaceName}
                      onChange={(e) => setWorkspaceName(e.target.value)}
                      className="flex-1 bg-[#06080B] border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all font-medium text-white"
                    />
                    <button 
                      onClick={handleSaveWorkspace}
                      disabled={loading}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl text-[11px] font-black uppercase transition-all disabled:opacity-50"
                    >
                      {loading ? 'SYNCING...' : 'SAVE'}
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl mt-12">
                  <h4 className="text-red-500 text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Icon.AlertTriangle size={12} /> Danger Zone
                  </h4>
                  <p className="text-[11px] text-slate-500 mb-4 font-medium leading-relaxed">Terminating a workspace will purge all data streams, tasks, and sectors permanently.</p>
                  <button className="text-red-500 border border-red-500/30 hover:bg-red-500 hover:text-white px-4 py-2 rounded-lg text-[10px] font-black transition-all">
                    PURGE WORKSPACE
                  </button>
                </div>
              </section>
            )}

            {/* ALERTS TAB */}
            {activeTab === 'notifications' && (
              <section className="space-y-6">
                <h3 className="text-lg font-bold text-white">Alert Systems</h3>
                <div className="space-y-4">
                  {[
                    { title: 'Critical Task Failures', desc: 'Notify when sector tasks enter FAILED status', active: true },
                    { title: 'System Heartbeat', desc: 'Daily tactical summary of all workspace activity', active: false },
                    { title: 'Security Breach Alerts', desc: 'Immediate notification on unauthorized login attempts', active: true }
                  ].map((notif, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-900/20 border border-slate-800/40 rounded-xl">
                      <div>
                        <p className="text-sm font-bold text-slate-200">{notif.title}</p>
                        <p className="text-[11px] text-slate-500 font-medium">{notif.desc}</p>
                      </div>
                      <div className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${notif.active ? 'bg-indigo-600' : 'bg-slate-800'}`}>
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${notif.active ? 'left-6' : 'left-1'}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* SECURITY TAB */}
            {activeTab === 'security' && (
              <section className="space-y-6">
                <h3 className="text-lg font-bold text-white">Access Control</h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-between p-4 bg-slate-900/30 border border-slate-800/50 rounded-xl hover:border-indigo-500/50 transition-all group">
                    <div className="text-left">
                      <p className="text-sm font-bold text-white group-hover:text-indigo-400">Update Password</p>
                      <p className="text-[10px] text-slate-500 uppercase font-black tracking-tighter">Encrypted sequence last modified 34 days ago</p>
                    </div>
                    <Icon.ChevronRight size={16} className="text-slate-600" />
                  </button>
                  <button className="w-full flex items-center justify-between p-4 bg-slate-900/30 border border-slate-800/50 rounded-xl border-l-emerald-500/50 border-l-4 transition-all">
                    <div className="text-left">
                      <p className="text-sm font-bold text-white">Multi-Factor Authentication</p>
                      <p className="text-[10px] text-emerald-500 uppercase font-black">Shield Status: ACTIVE</p>
                    </div>
                    <Icon.ShieldCheck size={18} className="text-emerald-500" />
                  </button>
                </div>
              </section>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Settings;