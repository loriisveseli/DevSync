import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import * as Icon from 'lucide-react';

const CommandPalette = ({ isOpen, onClose, tasks }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // --- SEARCH LOGIC ---
  const filteredTasks = query 
    ? tasks.filter(t => t.title.toLowerCase().includes(query.toLowerCase())).slice(0, 5)
    : [];

  const filteredProjects = query
    ? [...new Set(tasks.map(t => t.project))]
        .filter(p => p && p.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 3)
    : [];

  const totalResults = filteredTasks.length + filteredProjects.length;

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (query ? totalResults : 3));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + (query ? totalResults : 3)) % (query ? totalResults : 3));
    } else if (e.key === 'Enter') {
      if (query) {
        if (selectedIndex < filteredTasks.length) {
          handleAction('view-task', filteredTasks[selectedIndex].id);
        } else {
          const projectIdx = selectedIndex - filteredTasks.length;
          handleAction('view-project-sector', filteredProjects[projectIdx]);
        }
      } else {
        const actions = ['new-task', 'view-dashboard', 'view-projects'];
        handleAction(actions[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleAction = (type, payload = null) => {
    onClose();
    const routes = {
      'new-task': '/tasks?action=new',
      'view-task': `/tasks?id=${payload}`,
      'view-dashboard': '/dashboard',
      'view-projects': '/projects',
      'view-project-sector': `/tasks?project=${payload}`
    };
    if (routes[type]) navigate(routes[type]);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-start justify-center pt-[15vh] px-4 overflow-hidden">
          {/* DEPTH BACKDROP */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#020408]/80 backdrop-blur-xl"
          />

          <motion.div 
            initial={{ scale: 0.9, opacity: 0, rotateX: -20 }}
            animate={{ scale: 1, opacity: 1, rotateX: 0 }}
            exit={{ scale: 0.9, opacity: 0, rotateX: 10 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            onKeyDown={handleKeyDown}
            className="relative w-full max-w-xl bg-[#0D0F14]/90 border border-white/10 rounded-[2rem] shadow-[0_0_80px_rgba(0,0,0,1)] overflow-hidden backdrop-blur-3xl"
          >
            {/* AMBIENT LIGHTING TOP */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

            {/* SEARCH HEADER */}
            <div className="p-5 border-b border-white/5 flex items-center gap-4 bg-white/[0.02]">
              <div className="relative">
                <Icon.Terminal size={18} className="text-indigo-500 relative z-10" />
                <div className="absolute inset-0 blur-md bg-indigo-500/40 animate-pulse" />
              </div>
              <input 
                autoFocus
                placeholder="EXECUTE COMMAND OR SEARCH SECTOR..."
                className="bg-transparent border-none outline-none text-white text-[11px] w-full placeholder:text-slate-700 font-black tracking-widest uppercase"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
              />
              <div className="flex gap-1">
                <kbd className="px-2 py-1 bg-black rounded-lg text-[8px] text-slate-500 font-black border border-white/10">CTRL</kbd>
                <kbd className="px-2 py-1 bg-black rounded-lg text-[8px] text-slate-500 font-black border border-white/10">K</kbd>
              </div>
            </div>

            {/* CONTENT */}
            <div className="max-h-[50vh] overflow-y-auto p-3 custom-scrollbar">
              {query ? (
                <div className="space-y-1">
                  <SectionLabel label="Infiltrated Data" />
                  {filteredTasks.map((task, i) => (
                    <PaletteItem 
                      key={task.id}
                      isActive={selectedIndex === i}
                      onClick={() => handleAction('view-task', task.id)}
                      icon={<Icon.Target size={14} />}
                      label={task.title}
                      meta={task.difficulty}
                    />
                  ))}
                  
                  {filteredProjects.length > 0 && <SectionLabel label="Sector Networks" />}
                  {filteredProjects.map((proj, i) => (
                    <PaletteItem 
                      key={proj}
                      isActive={selectedIndex === i + filteredTasks.length}
                      onClick={() => handleAction('view-project-sector', proj)}
                      icon={<Icon.Globe size={14} />}
                      label={proj}
                      meta="ENTRY"
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-1">
                  <SectionLabel label="Quick Access Protocols" />
                  {[
                    { icon: <Icon.PlusCircle size={16}/>, label: "New Task Entry", type: 'new-task' },
                    { icon: <Icon.Layout size={16}/>, label: "Command Dashboard", type: 'view-dashboard' },
                    { icon: <Icon.Database size={16}/>, label: "Project Registry", type: 'view-projects' }
                  ].map((act, i) => (
                    <PaletteItem 
                      key={act.type}
                      isActive={selectedIndex === i}
                      onClick={() => handleAction(act.type)}
                      icon={act.icon}
                      label={act.label}
                    />
                  ))}
                </div>
              )}
            </div>
            
            {/* HOLOGRAPHIC FOOTER */}
            <div className="px-5 py-3 bg-black/40 border-t border-white/5 flex justify-between items-center">
              <div className="flex gap-6">
                <FooterKey icon={<Icon.ArrowDownUp size={10} />} label="NAV" />
                <FooterKey icon={<Icon.CornerDownLeft size={10} />} label="EXEC" />
              </div>
              <div className="text-[8px] font-black text-indigo-900 tracking-[0.2em] italic">SYNCING_CORE...</div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// --- STYLED SUB-COMPONENTS ---

const SectionLabel = ({ label }) => (
  <p className="px-4 py-3 text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">{label}</p>
);

const PaletteItem = ({ isActive, onClick, icon, label, meta }) => (
  <motion.button 
    onClick={onClick}
    animate={isActive ? { x: 5 } : { x: 0 }}
    className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all relative group border ${
      isActive 
      ? 'bg-indigo-500/10 border-indigo-500/30 text-white shadow-[inset_0_0_20px_rgba(99,102,241,0.1)]' 
      : 'text-slate-500 border-transparent hover:text-slate-400'
    }`}
  >
    {isActive && (
      <motion.div 
        layoutId="active-glow"
        className="absolute left-0 w-1 h-1/2 bg-indigo-500 rounded-full blur-[2px]" 
      />
    )}
    <span className={isActive ? "text-indigo-400" : "text-slate-700"}>{icon}</span>
    <span className="text-[11px] font-bold uppercase tracking-widest">{label}</span>
    {meta && (
      <span className={`ml-auto text-[8px] font-black px-2 py-0.5 rounded-md border ${
        isActive ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300' : 'bg-black border-white/5 text-slate-700'
      }`}>
        {meta}
      </span>
    )}
  </motion.button>
);

const FooterKey = ({ icon, label }) => (
  <div className="flex items-center gap-2 text-[8px] text-slate-600 font-black">
    <span className="p-1 bg-white/5 rounded border border-white/5">{icon}</span> {label}
  </div>
);

export default CommandPalette;