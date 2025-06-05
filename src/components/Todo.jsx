import React, { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiEdit2, FiSun, FiMoon } from 'react-icons/fi';
import { MdOutlinePlaylistAddCheck, MdOutlinePendingActions, MdOutlineCheckCircle } from 'react-icons/md';
import './Todo.css';

const PRIORITY_DEFAULT_COLORS = {
  Low: '#38bdf8',
  Medium: '#fbbf24',
  High: '#ef4444',
};

const STATUS_OPTIONS = [
  { value: 'todo', label: 'To Do', icon: <MdOutlinePlaylistAddCheck /> },
  { value: 'inprogress', label: 'In Progress', icon: <MdOutlinePendingActions /> },
  { value: 'completed', label: 'Completed', icon: <MdOutlineCheckCircle /> },
];

const getInitialTheme = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('theme');
    if (stored) return stored;
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  }
  return 'light';
};

const emptyTask = {
  title: '',
  description: '',
  dueDate: '',
  category: 'Personal',
  priority: 'Medium',
  priorityColor: PRIORITY_DEFAULT_COLORS['Medium'],
  status: 'todo',
  completed: false,
  subtasks: []
};

const Todo = () => {
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });
  const [newTask, setNewTask] = useState(emptyTask);
  const [showForm, setShowForm] = useState(false);
  const [theme, setTheme] = useState(getInitialTheme());
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [priorityColors, setPriorityColors] = useState(() => {
    const stored = localStorage.getItem('priorityColors');
    return stored ? JSON.parse(stored) : { ...PRIORITY_DEFAULT_COLORS };
  });

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('priorityColors', JSON.stringify(priorityColors));
  }, [priorityColors]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const openAddModal = () => {
    setNewTask({ ...emptyTask, priorityColor: priorityColors['Medium'] });
    setIsEdit(false);
    setEditId(null);
    setShowForm(true);
  };

  const openEditModal = (task) => {
    setNewTask({ ...task, priorityColor: task.priorityColor || priorityColors[task.priority] || PRIORITY_DEFAULT_COLORS[task.priority] });
    setIsEdit(true);
    setEditId(task.id);
    setShowForm(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    if (isEdit) {
      setTasks(tasks.map(task => task.id === editId ? { ...task, ...newTask } : task));
    } else {
      setTasks([...tasks, { ...newTask, id: Date.now() }]);
    }
    setShowForm(false);
    setNewTask(emptyTask);
    setIsEdit(false);
    setEditId(null);
  };

  const deleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const changeStatus = (taskId, status) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, status, completed: status === 'completed' } : task
    ));
  };

  const handlePriorityChange = (e) => {
    const priority = e.target.value;
    setNewTask({
      ...newTask,
      priority,
      priorityColor: priorityColors[priority] || PRIORITY_DEFAULT_COLORS[priority],
    });
  };

  const handlePriorityColorChange = (e) => {
    const color = e.target.value;
    setPriorityColors({ ...priorityColors, [newTask.priority]: color });
    setNewTask({ ...newTask, priorityColor: color });
  };

  // Board columns
  const columns = [
    { key: 'todo', label: 'To Do' },
    { key: 'inprogress', label: 'In Progress' },
    { key: 'completed', label: 'Completed' },
  ];

  return (
    <div className="board-app-container">
      <header className="board-header">
        <h2>Task Board</h2>
        <div className="header-actions">
          <button className="add-task-btn" onClick={openAddModal} title="Add Task">
            <FiPlus style={{ marginRight: 6, verticalAlign: 'middle' }} /> Add Task
          </button>
          <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle Theme">
            {theme === 'light' ? <FiMoon /> : <FiSun />}
          </button>
        </div>
      </header>

      {/* Add/Edit Task Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{isEdit ? 'Edit Task' : 'Add New Task'}</h3>
            <form onSubmit={handleFormSubmit} className="add-task-form">
              <input
                type="text"
                placeholder="Task title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                required
              />
              <textarea
                placeholder="Description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              />
              <input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              />
              <select
                value={newTask.category}
                onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
              >
                <option value="Personal">Personal</option>
                <option value="Work">Work</option>
                <option value="School">School</option>
              </select>
              <div className="priority-row">
                <select
                  value={newTask.priority}
                  onChange={handlePriorityChange}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
                <label className="priority-color-label">
                  Color:
                  <input
                    type="color"
                    value={priorityColors[newTask.priority] || PRIORITY_DEFAULT_COLORS[newTask.priority]}
                    onChange={handlePriorityColorChange}
                  />
                </label>
              </div>
              <div className="status-select-row">
                <label>Status:</label>
                <select
                  value={newTask.status}
                  onChange={e => setNewTask({ ...newTask, status: e.target.value })}
                >
                  {STATUS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <span className="status-icon">
                  {STATUS_OPTIONS.find(opt => opt.value === newTask.status)?.icon}
                </span>
              </div>
              <button type="submit">
                {isEdit ? <FiEdit2 style={{ marginRight: 6, verticalAlign: 'middle' }} /> : <FiPlus style={{ marginRight: 6, verticalAlign: 'middle' }} />}
                {isEdit ? 'Update Task' : 'Add Task'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Board Columns */}
      <div className="board-columns">
        {columns.map(col => {
          const colTasks = tasks.filter(task => task.status === col.key);
          return (
            <div className="board-column" key={col.key}>
              <h3>{col.label} <span>({colTasks.length})</span></h3>
              <div className="column-tasks">
                {colTasks.length === 0 ? (
                  <div className="empty-col">No tasks</div>
                ) : (
                  colTasks.map(task => (
                    <div
                      key={task.id}
                      className={`task-card ${task.priority.toLowerCase()}`}
                      style={{ borderLeft: `5px solid ${task.priorityColor || priorityColors[task.priority] || PRIORITY_DEFAULT_COLORS[task.priority]}` }}
                    >
                      <div className="task-card-header">
                        <div className="task-title">{task.title}</div>
                        <div className="task-actions">
                          <button className="icon-btn" title="Edit Task" onClick={() => openEditModal(task)}>
                            <FiEdit2 />
                          </button>
                          <button className="icon-btn" onClick={() => deleteTask(task.id)} title="Delete Task">
                            <FiTrash2 />
                          </button>
                        </div>
                      </div>
                      <div className="task-desc">{task.description}</div>
                      <div className="task-meta">
                        <span
                          className="priority"
                          style={{ background: (task.priorityColor || priorityColors[task.priority] || PRIORITY_DEFAULT_COLORS[task.priority]) + '22', color: (task.priorityColor || priorityColors[task.priority] || PRIORITY_DEFAULT_COLORS[task.priority]) }}
                        >
                          {task.priority}
                        </span>
                        <span className="category">{task.category}</span>
                        {task.dueDate && <span className="due-date">Due: {task.dueDate}</span>}
                      </div>
                      <div className="task-status-row">
                        <select
                          value={task.status}
                          onChange={e => changeStatus(task.id, e.target.value)}
                        >
                          {STATUS_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                        <span className="status-icon">
                          {STATUS_OPTIONS.find(opt => opt.value === task.status)?.icon}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Todo; 