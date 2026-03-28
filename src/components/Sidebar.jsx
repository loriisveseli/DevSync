import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import * as Icon from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ user }) => {
  const location = useLocation();
  const [failCount, setFailCount] = useState(0);
  const [projects, setProjects] = useState([]);
  const [isProjectsOpen, setIsProjectsOpen] = useState(true);
  
  // --- WORKSPACE STATE ---
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const [workspaces, setWorkspaces] = useState([
    { id: 1, name: 'Acme Corp', role: 'Command Center', icon: 'A', color: 'bg-indigo-600' },
    { id: 2, name: 'Neural Link', role: 'Sub-Sector', icon: 'N', color: 'bg-purple-600' },
  ]);
  const [activeWorkspace, setActiveWorkspace] = useState(workspaces[0]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleSwitchWorkspace = (ws) => {
    setActiveWorkspace(ws);
    setIsWorkspaceOpen(false);
  };

  const createNewWorkspace = () => {
    const name = prompt("Enter New Workspace Designation:");
    if (name) {
      const newWs = {
        id: Date.now(),
        name,
        role: 'Auxiliary',
        icon: name.charAt(0).toUpperCase(),
        color: 'bg-emerald-600'
      };
      setWorkspaces([...workspaces, newWs]);
      setActiveWorkspace(newWs);
    }
    setIsWorkspaceOpen(false);
  };

  // --- REFRESH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      setProjects([]);
      setFailCount(0);
      
      const { count } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'FAILED')
        .eq('workspace', activeWorkspace.name);
      
      setFailCount(count || 0);

      const { data: taskData } = await supabase
        .from('tasks')
        .select('project, status')
        .eq('workspace', activeWorkspace.name);

      if (taskData) {
        const projectMap = {};
        taskData.forEach(t => {
          if (!t.project) return;
          if (!projectMap[t.project]) projectMap[t.project] = { total: 0, failed: 0 };
          projectMap[t.project].total += 1;
          if (t.status === 'FAILED') projectMap[t.project].failed += 1;
        });

        setProjects(Object.keys(projectMap).map(name => ({
          name,
          isCritical: projectMap[name].failed >= 3,
        })));
      }
    };
    fetchData();
  }, [activeWorkspace]);

  return (
    <div className="w-64 bg-[#06080B] border-r border-slate-800/40 h-screen sticky top-0 flex flex-col font-sans select-none p-4 z-30">
      
      {/* 1. WORKSPACE SWITCHER */}
      <div className="relative mb-6">
        <button 
          onClick={() => setIsWorkspaceOpen(!isWorkspaceOpen)}
          className={`w-full flex items-center justify-between p-2 rounded-xl border transition-all ${
            isWorkspaceOpen ? 'bg-slate-800/60 border-indigo-500/50' : 'bg-slate-900/40 border-slate-800/40 hover:bg-slate-900/60'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 ${activeWorkspace.color} rounded-lg flex items-center justify-center font-black text-white text-xs shadow-lg shadow-indigo-900/20`}>
              {activeWorkspace.icon}
            </div>
            <div className="text-left">
              <p className="text-[11px] font-black text-white uppercase tracking-tight">{activeWorkspace.name}</p>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">{activeWorkspace.role}</p>
            </div>
          </div>
          <Icon.ChevronsUpDown size={14} className="text-slate-500" />
        </button>

        <AnimatePresence>
          {isWorkspaceOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsWorkspaceOpen(false)} />
              <motion.div 
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute top-full left-0 w-full mt-2 bg-[#0D0F14] border border-white/10 rounded-2xl shadow-2xl p-2 z-50 backdrop-blur-xl"
              >
                <p className="px-3 py-2 text-[8px] font-black text-slate-600 uppercase tracking-widest">Active Sectors</p>
                <div className="space-y-1">
                  {workspaces.map((ws) => (
                    <button
                      key={ws.id}
                      onClick={() => handleSwitchWorkspace(ws)}
                      className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all ${activeWorkspace.id === ws.id ? 'bg-indigo-600/10 border border-indigo-500/20' : 'hover:bg-white/5 border border-transparent'}`}
                    >
                      <div className={`w-6 h-6 ${ws.color} rounded flex items-center justify-center text-[10px] font-black text-white`}>{ws.icon}</div>
                      <span className="text-[11px] font-bold text-slate-300">{ws.name}</span>
                      {activeWorkspace.id === ws.id && <Icon.Check size={12} className="ml-auto text-indigo-500" />}
                    </button>
                  ))}
                </div>
                <div className="h-[1px] bg-white/5 my-2" />
                <button onClick={createNewWorkspace} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-emerald-500/10 text-emerald-500 transition-all border border-transparent">
                  <Icon.Plus size={14} />
                  <span className="text-[11px] font-bold uppercase tracking-tighter">New Workspace</span>
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* 2. MAIN NAVIGATION (SETTINGS MOVED HERE) */}
      <nav className="space-y-1 mb-6">
        {[
          { label: 'Dashboard', path: '/dashboard', icon: Icon.LayoutGrid },
          { label: 'Tactical Comms', path: '/comms', icon: Icon.MessageSquare },
          { label: 'Tasks', path: '/tasks', icon: Icon.CheckSquare, badge: failCount },
          { label: 'Sectors', path: '/projects', icon: Icon.Folder },
          { label: 'The Vault', path: '/vault', icon: Icon.Lock },
          { label: 'Integrations', path: '/integrations', icon: Icon.Puzzle },
          { label: 'Settings', path: '/settings', icon: Icon.Settings }, // <--- PRIMARY NAV POSITION
        ].map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.label} 
              to={item.path} 
              className={`flex items-center justify-between p-2.5 rounded-xl transition-all group ${isActive ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-900/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'}`}
            >
              <div className="flex items-center gap-3">
                <item.icon size={18} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'} />
                <span className="text-[12px] font-medium">{item.label}</span>
              </div>
              {item.badge > 0 && (
                <span className="bg-orange-600 text-[8px] font-black px-1.5 py-0.5 rounded-full text-white">{item.badge}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* 3. SECTOR CHANNELS */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-1">
        <div className="flex items-center justify-between mb-4 px-2 cursor-pointer" onClick={() => setIsProjectsOpen(!isProjectsOpen)}>
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.15em]">{activeWorkspace.name} Sectors</span>
          <Icon.ChevronRight size={12} className={`text-slate-600 transition-transform ${isProjectsOpen ? 'rotate-90' : ''}`} />
        </div>

        <AnimatePresence>
          {isProjectsOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1">
              {projects.length > 0 ? projects.map((proj) => (
                <Link 
                  key={proj.name} 
                  to={`/comms?room=${proj.name}`}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-900/50 transition-all group"
                >
                  <div className="flex items-center gap-2">
                    <Icon.Hash size={12} className="text-slate-700 group-hover:text-indigo-500" />
                    <span className={`text-[11px] font-bold uppercase tracking-tight truncate ${proj.isCritical ? 'text-red-500' : 'text-slate-500 group-hover:text-slate-300'}`}>
                      {proj.name}
                    </span>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40 group-hover:bg-emerald-500 animate-pulse" />
                </Link>
              )) : (
                <p className="text-[9px] text-slate-700 px-2 italic uppercase">No active sectors</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 4. USER FOOTER */}
      <div className="pt-4 border-t border-slate-900 mt-2">
        <div className="flex items-center gap-3 p-2 bg-slate-900/20 rounded-xl border border-slate-800/30">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-[10px] font-black text-white capitalize">
            {user?.email?.charAt(0)}
          </div>
          <div className="flex-1 truncate">
            <p className="text-[10px] font-black text-white uppercase truncate tracking-tight">{user?.email?.split('@')[0]}</p>
          </div>
          <button onClick={handleLogout} className="text-slate-600 hover:text-red-500 transition-colors p-1">
            <Icon.LogOut size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;