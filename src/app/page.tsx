"use client";
import { useEffect, useState } from "react";

interface Task {
  id: number;
  title: string;
  status: string;
  priority: string;
}

export default function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const res = await fetch("/api/tasks");
    const data = await res.json();
    setTasks(data);
  };

  const addTask = async () => {
    if (!newTask) return;
    await fetch("/api/tasks", {
      method: "POST",
      body: JSON.stringify({ title: newTask }),
    });
    setNewTask("");
    fetchTasks(); // Refresh board
  };

  const updateStatus = async (id: number, newStatus: string) => {
    // Optimistic update (makes UI feel instant)
    setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));

    await fetch("/api/tasks", {
      method: "PATCH",
      body: JSON.stringify({ id, status: newStatus }),
    });
  };

  const deleteTask = async (id: number) => {
    setTasks(tasks.filter(t => t.id !== id));
    await fetch("/api/tasks", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    });
  };

  // Helper to filter tasks by column
  const getTasksByStatus = (status: string) => tasks.filter((t) => t.status === status);

  return (
    <div className="min-h-screen bg-gray-100 p-10 font-sans text-gray-800">
      
      {/* Header & Input */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Project Board</h1>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="New Task..."
            className="p-2 rounded border border-gray-300"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
          />
          <button onClick={addTask} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
            + Add
          </button>
        </div>
      </div>

      {/* KANBAN COLUMNS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Column 1: TO DO */}
        <Column 
          title="To Do" 
          color="bg-orange-500" 
          tasks={getTasksByStatus('todo')} 
          onMove={(id) => updateStatus(id, 'in-progress')}
          onDelete={deleteTask}
        />

        {/* Column 2: IN PROGRESS */}
        <Column 
          title="In Progress" 
          color="bg-blue-500" 
          tasks={getTasksByStatus('in-progress')} 
          onMove={(id) => updateStatus(id, 'done')}
          onDelete={deleteTask}
        />

        {/* Column 3: DONE */}
        <Column 
          title="Done" 
          color="bg-green-500" 
          tasks={getTasksByStatus('done')} 
          onMove={(id) => updateStatus(id, 'todo')} // Loop back to start
          onDelete={deleteTask}
        />

      </div>
    </div>
  );
}

// A reusable component for the columns
function Column({ title, color, tasks, onMove, onDelete }: any) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 shadow-sm">
      <div className={`flex justify-between items-center mb-4 pb-2 border-b-4 ${color.replace('bg-', 'border-')}`}>
        <h2 className="font-bold text-lg">{title}</h2>
        <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-1 rounded-full">{tasks.length}</span>
      </div>

      <div className="space-y-3">
        {tasks.map((task: any) => (
          <div key={task.id} className="bg-white p-4 rounded-lg shadow hover:shadow-md transition border-l-4 border-gray-300">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-gray-800">{task.title}</h3>
              <button onClick={() => onDelete(task.id)} className="text-gray-400 hover:text-red-500">×</button>
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <span className={`text-xs px-2 py-1 rounded ${task.priority === 'high' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                {task.priority}
              </span>
              <button 
                onClick={() => onMove(task.id)} 
                className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
              >
                Move Next →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}