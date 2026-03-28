import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const Kanban = () => {
  const [tasks, setTasks] = useState([]);
  const columns = ['To Do', 'In Progress', 'Done'];

  useEffect(() => {
    fetch('http://localhost:5000/api/tasks').then(res => res.json()).then(setTasks);
  }, []);

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    // 1. Update UI instantly (Optimistic UI)
    const newTasks = Array.from(tasks);
    const draggedTask = newTasks.find(t => t.id === draggableId);
    draggedTask.status = destination.droppableId;
    setTasks(newTasks);

    // 2. Update Backend/Supabase
    await fetch(`http://localhost:5000/api/tasks/${draggableId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: destination.droppableId })
    });
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-3 gap-6 p-6">
        {columns.map(col => (
          <Droppable droppableId={col} key={col}>
            {(provided) => (
              <div {...provided.droppableId} ref={provided.innerRef} className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 min-h-[600px]">
                <h3 className="text-slate-500 font-bold mb-6 text-xs uppercase tracking-widest flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${col === 'Done' ? 'bg-green-500' : 'bg-blue-500'}`}></span>
                  {col}
                </h3>
                
                {tasks.filter(t => t.status === col).map((task, index) => (
                  <Draggable draggableId={task.id} index={index} key={task.id}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="bg-slate-800 p-4 rounded-lg mb-4 border border-slate-700 shadow-lg hover:border-blue-500 transition-all group"
                      >
                        <p className="text-sm font-medium text-slate-200">{task.title}</p>
                        <div className="mt-4 flex justify-between items-center">
                          <span className="text-[10px] bg-slate-700 px-2 py-1 rounded text-slate-400">#{task.github_id?.slice(0,6)}</span>
                          <span className="text-[10px] text-slate-500">👤 {task.author}</span>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
};

export default Kanban;