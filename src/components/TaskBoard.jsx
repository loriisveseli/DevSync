import React from 'react';
import * as Icon from 'lucide-react';

const TaskBoard = ({ tasks, onToggle, onDelete }) => {
  // Split tasks into Active and Completed
  const activeTasks = tasks.filter(t => t.status !== 'Deployed');
  const completedTasks = tasks.filter(t => t.status === 'Deployed');

  return (
    <div className="space-y-12">
      {/* --- ACTIVE SECTION --- */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 px-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Active Operations</h2>
        </div>

        {activeTasks.length === 0 ? (
          <div className="py-10 text-center border border-dashed border-slate-800 rounded-3xl text-slate-700 text-[10px] font-black uppercase tracking-widest">
            No Active Objectives Localized
          </div>
        ) : (
          activeTasks.map(task => (
            <div key={task.id} className="group bg-slate-900/10 border border-slate-800 p-6 rounded-3xl hover:border-blue-500/50 transition-all flex justify-between items-start">
              <div className="flex gap-6 items-start w-full">
                {/* CHECKBOX TOGGLE */}
                <button 
                  onClick={() => onToggle(task.id, task.status)}
                  className="mt-1 w-6 h-6 rounded-lg border border-slate-700 hover:border-blue-500 transition-all flex items-center justify-center text-transparent hover:text-blue-500 shrink-0"
                >
                  <Icon.Check size={14} />
                </button>

                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-white font-black text-lg uppercase tracking-tight">{task.title}</h3>
                    {/* STATUS TAG */}
                    <span className="text-[8px] bg-blue-500/10 text-blue-500 border border-blue-500/20 px-2 py-0.5 rounded font-black uppercase">
                      {task.status || 'Ongoing'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 mt-1 mb-3">
                    <div className={`text-[8px] font-black px-2 py-0.5 rounded border uppercase ${task.difficulty === 'Hard' ? 'text-red-500 border-red-500/20' : 'text-cyan-500 border-cyan-500/20'}`}>
                      {task.difficulty || 'Medium'}
                    </div>
                  </div>

                  {/* DESCRIPTION / EXPLANATION BOX */}
                  {task.description && (
                    <div className="mt-4 bg-slate-950/80 border border-slate-800/50 p-4 rounded-2xl relative overflow-hidden group-hover:border-blue-500/30 transition-all">
                      <div className="absolute top-0 right-4 text-[7px] font-black text-slate-800 uppercase tracking-widest py-1">Operational Briefing</div>
                      <p className="text-slate-400 text-sm font-medium leading-relaxed italic pr-4">
                        {task.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <button 
                onClick={() => onDelete(task.id)} 
                className="opacity-0 group-hover:opacity-100 text-slate-800 hover:text-red-500 p-2 transition-all shrink-0"
              >
                <Icon.Trash2 size={18}/>
              </button>
            </div>
          ))
        )}
      </section>

      {/* --- TIMELINE SECTION (COMPLETED) --- */}
      {completedTasks.length > 0 && (
        <section className="pt-8 border-t border-slate-900">
          <div className="flex items-center gap-3 px-2 mb-8">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
            <h2 className="text-[10px] font-black text-green-500/50 uppercase tracking-[0.3em]">Deployment Timeline</h2>
          </div>
          
          <div className="relative border-l border-slate-800 ml-4 space-y-6 pl-8">
            {completedTasks.map(task => (
              <div key={task.id} className="relative">
                <div className="absolute -left-[37px] top-1 w-4 h-4 rounded-full bg-slate-950 border-2 border-green-500" />
                <div className="bg-slate-900/40 border border-green-500/10 p-4 rounded-2xl flex justify-between items-center group">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-600 line-through uppercase">{task.title}</h3>
                      <span className="text-[8px] bg-green-500/10 text-green-500 border border-green-500/20 px-2 py-0.5 rounded font-black uppercase">
                        COMPLETED
                      </span>
                    </div>
                    {/* Show description even when completed but make it faint */}
                    {task.description && (
                      <p className="text-[10px] text-slate-700 italic mt-1 line-clamp-1">{task.description}</p>
                    )}
                  </div>
                  <button 
                    onClick={() => onToggle(task.id, task.status)} 
                    className="text-[9px] font-black text-slate-700 hover:text-blue-500 uppercase"
                  >
                    Re-Initialize
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default TaskBoard;