import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import * as Icon from 'lucide-react';

// HELPER COMPONENT: REAL-TIME COUNTDOWN
const CountdownTimer = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!targetDate) return;

    const calculate = () => {
      const difference = new Date(targetDate) - new Date();
      if (difference <= 0) {
        setTimeLeft('EXPIRED');
        return;
      }

      const d = Math.floor(difference / (1000 * 60 * 60 * 24));
      const h = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const m = Math.floor((difference / 1000 / 60) % 60);
      const s = Math.floor((difference / 1000) % 60);

      setTimeLeft(`${d}D ${h}H ${m}M ${s}S`);
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="flex items-center gap-1.5 mt-4">
      <Icon.Clock size={10} className={timeLeft === 'EXPIRED' ? "text-red-500" : "text-blue-500"} />
      <span className={`text-[10px] font-black tracking-widest uppercase font-mono ${timeLeft === 'EXPIRED' ? "text-red-500" : "text-slate-400"}`}>
        {timeLeft || 'STABLE'}
      </span>
    </div>
  );
};

const Projects = ({ user: propUser }) => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeUser, setActiveUser] = useState(propUser || null);
  // UPDATED STATE TO INCLUDE DUE_DATE
  const [newProj, setNewProj] = useState({ name: '', description: '', due_date: '' });

  // Time Validation Helper
  const getMinDateTime = () => new Date().toISOString().slice(0, 16);

  useEffect(() => {
    const checkUser = async () => {
      if (!propUser) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) setActiveUser(session.user);
      } else setActiveUser(propUser);
    };
    checkUser();
  }, [propUser]);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    const { data: projs } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
    const { data: tsks } = await supabase.from('tasks').select('project, status');

    const projectsWithProgress = (projs || []).map(p => {
      const projectTasks = tsks?.filter(t => t.project === p.name) || [];
      const completed = projectTasks.filter(t => t.status === 'Deployed').length;
      const total = projectTasks.length;
      return { 
        ...p, 
        completedCount: completed, 
        totalCount: total, 
        progress: total === 0 ? 0 : Math.round((completed / total) * 100) 
      };
    });

    setProjects(projectsWithProgress);
    setLoading(false);
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const handleCreate = async (e) => {
    e.preventDefault();
    const userToUse = activeUser || propUser;
    if (!userToUse || !newProj.name.trim()) return;

    // Temporal Validation Logic
    if (newProj.due_date && new Date(newProj.due_date) < new Date()) {
      alert("TEMPORAL ERROR: Project deadline cannot exist in the past.");
      return;
    }

    const { error } = await supabase.from('projects').insert([{ 
      name: newProj.name.trim(), 
      description: newProj.description, 
      due_date: newProj.due_date || null,
      user_id: userToUse.id 
    }]);

    if (!error) { 
      setNewProj({ name: '', description: '', due_date: '' }); 
      fetchProjects(); 
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10 bg-transparent">
      <header className="border-l-4 border-blue-600 pl-6 py-2">
        <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">Project Registry</h1>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">System Environment Manager</p>
      </header>

      {/* UPDATED REGISTRATION FORM */}
      <form onSubmit={handleCreate} className="bg-slate-900/60 border border-slate-800 p-8 rounded-[2.5rem] grid grid-cols-1 md:grid-cols-12 gap-4 items-end shadow-2xl">
        <div className="md:col-span-3">
          <label className="text-[9px] font-black text-slate-500 uppercase ml-1 mb-1 block">Project ID</label>
          <input required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-blue-500 text-sm" placeholder="e.g. ALPHA_V1" value={newProj.name} onChange={e => setNewProj({...newProj, name: e.target.value})} />
        </div>
        <div className="md:col-span-4">
          <label className="text-[9px] font-black text-slate-500 uppercase ml-1 mb-1 block">Description</label>
          <input className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-blue-500 text-sm" placeholder="System briefing..." value={newProj.description} onChange={e => setNewProj({...newProj, description: e.target.value})} />
        </div>
        <div className="md:col-span-3">
          <label className="text-[9px] font-black text-slate-500 uppercase ml-1 mb-1 block">Target Deadline</label>
          <input 
            type="datetime-local" 
            min={getMinDateTime()} // Blocks selection of past dates
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-blue-500 text-sm" 
            value={newProj.due_date} 
            onChange={e => setNewProj({...newProj, due_date: e.target.value})} 
          />
        </div>
        <button className="md:col-span-2 bg-white text-black font-black py-[0.85rem] rounded-xl hover:bg-blue-600 hover:text-white uppercase tracking-widest text-[10px] transition-all border border-transparent">
          Register
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {projects.map(p => (
          <div key={p.id} onClick={() => navigate(`/tasks?project=${p.name}`)} className="bg-slate-900/20 border border-slate-800 p-6 rounded-[2rem] hover:border-blue-500 hover:bg-slate-900/40 cursor-pointer transition-all group shadow-xl relative overflow-hidden">
            
            {/* CARD TOP DECORATION */}
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-30 transition-opacity">
              <Icon.Database size={40} className="text-blue-500" />
            </div>

            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                <Icon.Folder size={20} />
              </div>
              <div className="text-right z-10">
                <span className="text-[10px] font-black text-slate-500 uppercase block leading-none mb-1">{p.completedCount}/{p.totalCount} Ops</span>
                <span className="text-lg font-black text-white italic">{p.progress}%</span>
              </div>
            </div>

            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2 group-hover:text-blue-400 transition-colors">{p.name}</h3>
            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wide line-clamp-1 mb-4">{p.description || "No mission brief."}</p>

            {/* PROGRESS BAR */}
            <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800 mb-2">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                style={{ width: `${p.progress}%` }}
              />
            </div>

            {/* THE NEW COUNTDOWN TIMER */}
            {p.due_date && <CountdownTimer targetDate={p.due_date} />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Projects;