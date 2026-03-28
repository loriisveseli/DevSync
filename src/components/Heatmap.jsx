import React from 'react';
import { motion } from 'framer-motion';

const Heatmap = ({ data }) => {
  // Generates last 28 days
  const days = Array.from({ length: 28 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (27 - i));
    return d.toISOString().split('T')[0];
  });

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="relative bg-[#0D0F14]/40 backdrop-blur-xl border border-white/5 p-6 rounded-[2rem] overflow-hidden group">
      {/* AMBIENT BACKGROUND GLOW */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/5 blur-[50px] pointer-events-none transition-opacity group-hover:opacity-100 opacity-50" />

      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] flex items-center gap-2">
          <div className="w-1 h-1 bg-indigo-500 rounded-full animate-pulse" />
          Temporal Consistency // Cycles_28
        </h3>
        <span className="text-[8px] font-mono text-slate-700 uppercase">Status: Syncing</span>
      </div>

      <div className="grid grid-cols-7 gap-2.5 relative">
        {days.map((day, index) => {
          const dayData = data[day] || { status: 'none' };
          const isToday = day === today;
          
          // Color Logic with 2026 "Neon-Glass" styling
          let style = "bg-white/[0.03] border-white/5"; // Default Empty
          
          if (dayData.status === 'Deployed') {
            style = "bg-emerald-500/20 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]";
          }
          if (dayData.status === 'FAILED') {
            style = "bg-rose-500/20 border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.15)]";
          }

          return (
            <motion.div 
              key={day}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.01 }}
              whileHover={{ 
                scale: 1.2, 
                zIndex: 20, 
                backgroundColor: "rgba(255,255,255,0.1)",
                borderColor: "rgba(255,255,255,0.2)" 
              }}
              title={`${day}: ${dayData.status}`}
              className={`relative aspect-square rounded-[4px] border transition-all cursor-crosshair ${style}`}
            >
              {/* Today's Active Indicator */}
              {isToday && (
                <div className="absolute inset-0 border border-indigo-500 animate-[ping_2s_infinite] rounded-[4px] opacity-40" />
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="flex justify-between mt-6 px-1">
        <div className="flex flex-col gap-1">
          <span className="text-[7px] font-black text-slate-700 uppercase tracking-widest">Origin</span>
          <span className="text-[9px] font-bold text-slate-500 uppercase tabular-nums">T-28D</span>
        </div>
        <div className="flex flex-col gap-1 items-end">
          <span className="text-[7px] font-black text-slate-700 uppercase tracking-widest">Current_State</span>
          <span className="text-[9px] font-bold text-indigo-400 uppercase tabular-nums tracking-tighter">Live_00</span>
        </div>
      </div>
    </div>
  );
};

export default Heatmap;