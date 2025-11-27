"use client";
import { useEffect, useState } from "react";

// 1. Define what a "Task" looks like
interface Task {
  id: number;
  title: string;
  status: string;
  priority: string;
}

// 2. Define what the "Column" component needs (Fixes the 'any' error)
interface ColumnProps {
  title: string;
  color: string;
  tasks: Task[];
  onMove: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");

  // Fetch tasks on load
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      console.error("Failed to fetch tasks", error);
    }
  };

  const addTask = async () => {
    if (!newTask) return;
    
    // Send to backend
    await fetch("/api/tasks", {
      method: "POST",
      body: JSON.stringify({ title: newTask }),
    });

    setNewTask("");
    fetchTasks(); // Refresh board to show the new ID
  };

  const updateStatus = async (id: number, newStatus: string) => {
    // Optimistic update (makes UI feel instant)
    setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));

    // Send to backend
    await fetch("/api/tasks", {
      method: "PATCH",
      body: JSON.stringify({ id, status: newStatus }),
    });
  };

  const deleteTask = async (id: number) => {
    // Optimistic delete
    setTasks(tasks.filter(t => t.id !== id));

    // Send to backend
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
            className="p-2 rounded border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
          />
          <button onClick={addTask} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition shadow-sm">
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
// We now use the 'ColumnProps' interface here to make TypeScript happy
function Column({ title, color, tasks, onMove, onDelete }: ColumnProps) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 shadow-sm border border-gray-200">
      <div className={`flex justify-between items-center mb-4 pb-2 border-b-4 ${color.replace('bg-', 'border-')}`}>
        <h2 className="font-bold text-lg text-gray-700">{title}</h2>
        <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-1 rounded-full">{tasks.length}</span>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <div key={task.id} className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition border border-gray-100 relative group">
            
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-gray-800">{task.title}</h3>
              <button 
                onClick={() => onDelete(task.id)} 
                className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete Task"
              >
                ×
              </button>
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <span className={`text-xs px-2 py-1 rounded font-medium ${task.priority === 'high' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                {task.priority.toUpperCase()}
              </span>
              <button 
                onClick={() => onMove(task.id)} 
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded transition-colors"
              >
                Move Next →
              </button>
            </div>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
            No tasks
          </div>
        )}
      </div>
    </div>
  );
}