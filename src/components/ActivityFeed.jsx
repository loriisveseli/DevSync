import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icon from 'lucide-react';

const ActivityFeed = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState([]);

  const fetchLogs = async () => {
    const { data } = await supabase
      .from('task_logs')
      .select('*, tasks(title)')
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) setLogs(data);
  };

  useEffect(() => {
    fetchLogs();

    const channel = supabase.channel('global-activity')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'task_logs' }, () => {
        fetchLogs();
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* BACKDROP: Subtle blur for depth */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[40]"
          />
          
          {/* DRAWER: Advanced Glassmorphism */}
          <motion.div 
            initial={{ x: '100%' }} 
            animate={{ x: 0 }} 
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed right-0 top-0 h-screen w-85 bg-[#06080B]/90 backdrop-blur-2xl border-l border-white/5 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] z-[50] flex flex-col overflow-hidden"
          >
            {/* SCANLINE EFFECT: Makes it look like a screen */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

            {/* HEADER */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center relative z-10 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="relative">
                   <Icon.Zap size={16} className="text-indigo-400 fill-indigo-400/20" />
                   <div className="absolute inset-0 blur-md bg-indigo-500/50 animate-pulse" />
                </div>
                <h2 className="text-[10px] font-black text-white uppercase tracking-[0.4em] drop-shadow-lg">
                  Intelligence <span className="text-indigo-500 text-[8px]">v4.0</span>
                </h2>
              </div>
              <button 
                onClick={onClose} 
                className="group p-2 rounded-full hover:bg-white/5 transition-all"
              >
                <Icon.X size={18} className="text-slate-500 group-hover:text-white transition-colors" />
              </button>
            </div>

            {/* LOGS LIST */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar relative z-10">
              {logs.length > 0 ? logs.map((log, i) => (
                <motion.div 
                  key={log.id}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, ease: "easeOut" }}
                  className="relative pl-6 group"
                >
                  {/* Timeline Line with Gradient */}
                  <div className="absolute left-0 top-0 bottom-[-24px] w-[1px] bg-gradient-to-b from-indigo-500/50 to-transparent group-last:bg-transparent" />
                  
                  {/* Dynamic Glowing Dot */}
                  <div className={`absolute -left-[3.5px] top-1 w-2 h-2 rounded-full z-10 transition-all duration-500 group-hover:scale-150 ${
                    log.action === 'DEPLOYED' ? 'bg-emerald-400 shadow-[0_0_10px_#10b981]' : 
                    log.action === 'CREATED' ? 'bg-indigo-400 shadow-[0_0_10px_#818cf8]' : 'bg-slate-500'
                  }`} />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <p className="text-[11px] font-bold text-slate-100 tracking-tight group-hover:text-indigo-300 transition-colors">
                        {log.tasks?.title || 'System Protocol'}
                      </p>
                      <span className="text-[8px] text-slate-600 font-mono">
                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[7px] font-black px-1.5 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10 uppercase tracking-widest group-hover:border-indigo-500/30 transition-colors">
                        {log.action}
                      </span>
                      <p className="text-[10px] text-slate-500 font-medium truncate max-w-[160px]">
                        {log.details}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )) : (
                <div className="h-full flex flex-col items-center justify-center opacity-20">
                  <Icon.Database size={32} className="mb-2" />
                  <p className="text-[10px] uppercase font-black tracking-widest">No Signals Detected</p>
                </div>
              )}
            </div>

            {/* FOOTER */}
            <div className="p-6 bg-white/[0.02] border-t border-white/5 text-center relative z-10">
              <div className="flex items-center justify-center gap-2 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] italic group cursor-default">
                <div className="w-1 h-1 rounded-full bg-slate-800 group-hover:bg-indigo-500 transition-colors" />
                Live Monitoring Active
                <div className="w-1 h-1 rounded-full bg-slate-800 group-hover:bg-indigo-500 transition-colors" />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ActivityFeed;