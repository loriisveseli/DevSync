import React, { useState } from 'react';
import * as Icon from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TopNav = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Mock data for system alerts
  const notifications = [
    { id: 1, title: 'System Update', message: 'Mainframe core updated to v2.4', time: '5m ago', urgent: false },
    { id: 2, title: 'Security Alert', message: 'Unrecognized login from Sector 4', time: '1h ago', urgent: true },
  ];

  return (
    <nav className="h-16 border-b border-white/5 bg-[#06080B]/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-40">
      {/* LEFT: SYSTEM BREADCRUMBS */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">System / Active</span>
        </div>
      </div>

      {/* RIGHT: NOTIFICATION HUB */}
      <div className="flex items-center">
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="text-slate-400 hover:text-white transition-all relative p-2 rounded-lg hover:bg-white/5"
          >
            <Icon.Bell size={18} />
            {/* The Notification Dot */}
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-[#06080B]" />
          </button>

          <AnimatePresence>
            {showNotifications && (
              <>
                {/* Click overlay to close */}
                <div className="fixed inset-0 z-[-1]" onClick={() => setShowNotifications(false)} />
                
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-4 w-80 bg-[#0D0F14] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                >
                  <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Incoming Data</span>
                    <Icon.Zap size={12} className="text-indigo-500" />
                  </div>

                  <div className="max-h-64 overflow-y-auto no-scrollbar">
                    {notifications.length > 0 ? (
                      notifications.map(n => (
                        <div key={n.id} className="p-4 border-b border-white/5 hover:bg-white/[0.02] cursor-pointer transition-colors group">
                          <div className="flex justify-between items-start mb-1">
                            <span className={`text-[10px] font-bold uppercase tracking-tight ${n.urgent ? 'text-red-500' : 'text-indigo-400'}`}>
                              {n.title}
                            </span>
                            <span className="text-[9px] text-slate-600 font-black">{n.time}</span>
                          </div>
                          <p className="text-xs text-slate-400 group-hover:text-slate-200 leading-snug transition-colors">{n.message}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <p className="text-[10px] font-black text-slate-600 uppercase">No active alerts</p>
                      </div>
                    )}
                  </div>
                  
                  <button className="w-full py-3 bg-white/[0.02] text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-slate-300 transition-colors">
                    Clear Log History
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
};

export default TopNav;