import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icon from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- SUB-COMPONENT: TEMPORAL HEATMAP ---
const Heatmap = ({ data }) => {
  const days = Array.from({ length: 28 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (27 - i));
    return d.toISOString().split('T')[0];
  });

  return (
    <div className="bg-[#0B0F14] border border-slate-800/60 p-6 rounded-[2rem] shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[50px] pointer-events-none" />
      
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
          <Icon.Activity size={12} className="text-indigo-500" /> 
          Temporal Matrix // 28-Day Cycle
        </h3>
        <div className="flex gap-1.5 text-[8px] font-bold text-slate-600 uppercase tracking-tighter">
           <span className="flex items-center gap-1"><div className="w-2 h-2 bg-green-500/20 border border-green-500/50 rounded-sm" /> Win</span>
           <span className="flex items-center gap-1"><div className="w-2 h-2 bg-orange-500/20 border border-orange-500/50 rounded-sm" /> Loss</span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day, i) => {
          const status = data[day];
          const isToday = i === 27;
          
          let colorClass = "bg-slate-900/40 border-slate-800/40";
          if (status === 'Deployed') colorClass = "bg-green-500/20 border-green-500/40 shadow-[0_0_10px_rgba(34,197,94,0.1)]";
          if (status === 'FAILED') colorClass = "bg-orange-600/20 border-orange-500/40 shadow-[0_0_10px_rgba(234,88,12,0.1)]";

          return (
            <div 
              key={day}
              className={`aspect-square rounded-md border transition-all duration-300 relative group/tile ${colorClass} ${isToday ? 'ring-1 ring-indigo-500 ring-offset-2 ring-offset-[#0B0F14]' : ''} hover:scale-110 hover:z-10 cursor-crosshair`}
            >
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 border border-slate-700 text-[8px] text-white rounded opacity-0 group-hover/tile:opacity-100 pointer-events-none whitespace-nowrap z-50">
                {day}: {status || 'Idle'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Dashboard = ({ user }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ active: 0, deployed: 0, highPriority: 0, failed: 0 });
  const [recentLogs, setRecentLogs] = useState([]);
  const [imminentTasks, setImminentTasks] = useState([]);
  const [heatmapData, setHeatmapData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      
      // 1. THE REAPER (Automated Cleanup)
      const nowISO = new Date().toISOString();
      const { data: expired } = await supabase
        .from('tasks')
        .select('id, title, due_date')
        .lt('due_date', nowISO)
        .not('status', 'in', '("Deployed","FAILED")');

      if (expired?.length > 0) {
        for (const task of expired) {
          await supabase.from('tasks').update({ status: 'FAILED' }).eq('id', task.id);
          await supabase.from('task_logs').insert([{
            task_id: task.id, user_id: user.id,
            action: 'MISSION_FAILURE', details: `Reaper: Deadline Breach.`
          }]);
        }
      }

      // 2. FETCH DATA
      const { data: tasks } = await supabase.from('tasks').select('*');
      if (tasks) {
        setStats({
          active: tasks.filter(t => t.status === 'Ongoing').length,
          deployed: tasks.filter(t => t.status === 'Deployed').length,
          highPriority: tasks.filter(t => t.difficulty === 'Hard' && t.status === 'Ongoing').length,
          failed: tasks.filter(t => t.status === 'FAILED').length
        });

        const hData = {};
        tasks.forEach(t => {
          const dateKey = new Date(t.updated_at || t.created_at).toISOString().split('T')[0];
          if (t.status === 'Deployed' || t.status === 'FAILED') {
             if (!hData[dateKey] || t.status === 'Deployed') hData[dateKey] = t.status;
          }
        });
        setHeatmapData(hData);

        const now = new Date();
        const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
        setImminentTasks(tasks.filter(t => {
          if (t.status !== 'Ongoing' || !t.due_date) return false;
          const d = new Date(t.due_date);
          return d > now && d <= oneHourFromNow;
        }));
      }

      const { data: logs } = await supabase
        .from('task_logs').select('*, tasks(title)')
        .order('created_at', { ascending: false }).limit(5);
      setRecentLogs(logs || []);
      setLoading(false);
    };

    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 60000);
    return () => clearInterval(interval);
  }, [user.id]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 bg-[#06080B] min-h-screen text-slate-200">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">Overview</h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">
            System status: <span className="text-green-500">Nominal</span> // Session: {user?.email?.split('@')[0]}
          </p>
        </div>
        <div className="flex gap-2">
            <button onClick={() => navigate('/tasks')} className="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase px-4 py-2 rounded-lg transition-all">New Task</button>
        </div>
      </header>

      {/* URGENT BREACH ALERTS */}
      <AnimatePresence>
        {imminentTasks.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 overflow-hidden">
            <div className="flex items-center gap-2 mb-3 text-red-500 text-[10px] font-black uppercase tracking-widest">
              <Icon.AlertTriangle size={14} className="animate-pulse" /> Critical Deadlines Imminent
            </div>
            <div className="flex flex-wrap gap-3">
              {imminentTasks.map(task => (
                <div key={task.id} className="bg-slate-950/50 border border-red-500/30 px-3 py-2 rounded-xl flex items-center gap-3">
                  <span className="text-white text-[10px] font-bold">{task.title}</span>
                  <span className="text-red-500 text-[9px] font-mono">T-MINUS {Math.round((new Date(task.due_date) - new Date()) / 60000)}m</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'In Progress', value: stats.active, icon: Icon.Activity, color: 'text-indigo-500' },
          { label: 'Critical', value: stats.highPriority, icon: Icon.Zap, color: 'text-amber-500' },
          { label: 'Failures', value: stats.failed, icon: Icon.XCircle, color: 'text-red-500' },
          { label: 'Deployed', value: stats.deployed, icon: Icon.CheckCircle, color: 'text-green-500' },
        ].map((stat) => (
          <div key={stat.label} className="bg-slate-900/20 border border-slate-800/40 p-5 rounded-2xl relative overflow-hidden hover:border-slate-700 transition-all">
            <stat.icon className={`absolute -right-2 -bottom-2 size-16 opacity-5 ${stat.color}`} />
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
            <p className="text-3xl font-black text-white tracking-tighter mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LOG FEED */}
        <section className="bg-slate-900/20 border border-slate-800/40 rounded-[2rem] p-6">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
            <Icon.ListTree size={14} className="text-indigo-500" /> Operational Logs
          </h2>
          <div className="space-y-4">
            {recentLogs.map((log) => (
              <div key={log.id} className="flex gap-4 items-start">
                <div className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${log.action === 'MISSION_FAILURE' ? 'bg-red-500' : 'bg-indigo-500'}`} />
                <div>
                  <p className="text-[11px] font-bold text-slate-200 uppercase leading-tight">
                    <span className="text-slate-500 mr-2">{new Date(log.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    {log.tasks?.title || 'System'} <span className={log.action === 'MISSION_FAILURE' ? 'text-red-500' : 'text-indigo-400'}>[{log.action}]</span>
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1 italic">{log.details}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ANALYTICS SECTION */}
        <section className="space-y-6">
          <Heatmap data={heatmapData} />
          <div className="bg-indigo-600/5 border border-indigo-500/20 rounded-[2rem] p-6 relative overflow-hidden group">
            <Icon.Target size={60} className="absolute -right-4 -bottom-4 text-indigo-500/10" />
            <h2 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2">Efficiency Rating</h2>
            <p className="text-slate-300 text-xs leading-relaxed font-medium">
              Overall project completion is trending <span className="text-green-400 font-bold">+12%</span> this week.
            </p>
            <div className="mt-4 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
               <motion.div initial={{ width: 0 }} animate={{ width: '75%' }} className="h-full bg-indigo-500" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;