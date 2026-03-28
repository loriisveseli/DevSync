import React from 'react';
import * as Icon from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProjectCard = ({ project }) => {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate(`/tasks?project=${project.name}`)}
      className="bg-slate-900/20 border border-slate-800 p-6 rounded-[2rem] hover:border-blue-500 hover:bg-slate-900/40 cursor-pointer transition-all group shadow-xl relative overflow-hidden"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
          <Icon.Folder size={20} />
        </div>
        <div className="text-right">
          <span className="text-[10px] font-black text-slate-500 uppercase block">
            {project.completedCount}/{project.totalCount} Tasks
          </span>
          <span className="text-lg font-black text-white italic">{project.progress}%</span>
        </div>
      </div>

      <h3 className="text-xl font-black text-white uppercase tracking-tight mb-4 group-hover:text-blue-400 transition-colors">
        {project.name}
      </h3>

      {/* Fuel Gauge Progress Bar */}
      <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
        <div 
          className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-500 transition-all duration-1000 ease-out"
          style={{ width: `${project.progress}%` }}
        />
      </div>
      
      <div className="mt-4 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">Open Environment</span>
        <Icon.ChevronRight size={14} className="text-blue-500" />
      </div>
    </div>
  );
};

export default ProjectCard;