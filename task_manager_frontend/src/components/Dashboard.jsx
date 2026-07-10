import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { LogOut, Plus, Trash2, CheckCircle2, Circle, Edit, Check, X } from 'lucide-react';

export default function Dashboard({ onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Editing state
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Stats
  const username = localStorage.getItem('username') || 'User';

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await api.getTasks();
      setTasks(data);
    } catch (err) {
      setError('Failed to fetch tasks.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setError('');

    try {
      const newTask = await api.createTask(title, description);
      setTasks([newTask, ...tasks]);
      setTitle('');
      setDescription('');
    } catch (err) {
      setError('Failed to create task.');
    }
  };

  const handleToggle = async (task) => {
    setError('');
    const updatedStatus = !task.completed;
    try {
      // Optimistic update
      setTasks(tasks.map(t => t.id === task.id ? { ...t, completed: updatedStatus } : t));
      await api.updateTask(task.id, { completed: updatedStatus });
    } catch (err) {
      setError('Failed to update task.');
      // Revert status
      setTasks(tasks.map(t => t.id === task.id ? { ...t, completed: !updatedStatus } : t));
    }
  };

  const handleDelete = async (id) => {
    setError('');
    const previousTasks = [...tasks];
    try {
      // Optimistic update
      setTasks(tasks.filter(t => t.id !== id));
      await api.deleteTask(id);
    } catch (err) {
      setError('Failed to delete task.');
      setTasks(previousTasks);
    }
  };

  const startEdit = (task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description);
  };

  const saveEdit = async (id) => {
    if (!editTitle.trim()) return;
    setError('');

    try {
      const updatedTask = await api.updateTask(id, {
        title: editTitle,
        description: editDescription,
      });
      setTasks(tasks.map(t => t.id === id ? updatedTask : t));
      setEditingId(null);
    } catch (err) {
      setError('Failed to update task.');
    }
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div style={styles.container} className="animate-fade-in">
      {/* Header */}
      <header style={styles.header} className="glass-panel">
        <div style={styles.headerLeft}>
          <h2 style={styles.welcomeText}>Welcome, <span style={styles.highlightText}>{username}</span>!</h2>
          <p style={styles.headerSubtitle}>Manage and track your tasks effectively</p>
        </div>
        <button onClick={onLogout} style={styles.logoutButton}>
          <LogOut size={18} style={{ marginRight: 8 }} /> Logout
        </button>
      </header>

      {/* Main Grid */}
      <div style={styles.mainGrid}>
        
        {/* Left Side: Create Task & Stats */}
        <div style={styles.sidebarColumn}>
          
          {/* Create Task Form */}
          <div style={styles.sidebarCard} className="glass-panel">
            <h3 style={styles.cardTitle}>Create New Task</h3>
            <form onSubmit={handleCreate} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Task Title</label>
                <input
                  type="text"
                  placeholder="What needs to be done?"
                  style={styles.input}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Description (Optional)</label>
                <textarea
                  placeholder="Add details about this task..."
                  style={styles.textarea}
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <button type="submit" style={styles.addButton} className="pulse-glow-hover">
                <Plus size={18} style={{ marginRight: 6 }} /> Add Task
              </button>
            </form>
          </div>

          {/* Stats Card */}
          <div style={styles.sidebarCard} className="glass-panel">
            <h3 style={styles.cardTitle}>Your Statistics</h3>
            <div style={styles.statsContainer}>
              <div style={styles.statBox}>
                <span style={styles.statNum}>{totalTasks}</span>
                <span style={styles.statLabel}>Total Tasks</span>
              </div>
              <div style={styles.statBox}>
                <span style={styles.statNum}>{completedTasks}</span>
                <span style={styles.statLabel}>Completed</span>
              </div>
            </div>
            
            {/* Progress bar */}
            <div style={styles.progressSection}>
              <div style={styles.progressInfo}>
                <span>Progress</span>
                <span>{completionPercentage}%</span>
              </div>
              <div style={styles.progressBarBg}>
                <div style={{ ...styles.progressBarFill, width: `${completionPercentage}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Task List */}
        <div style={styles.contentColumn}>
          <div style={styles.taskListCard} className="glass-panel">
            <div style={styles.taskListHeader}>
              <h3 style={styles.cardTitle}>Your Tasks</h3>
              <span style={styles.taskCountBadge}>{tasks.length} tasks</span>
            </div>

            {error && <div style={styles.errorAlert}>{error}</div>}

            {loading && tasks.length === 0 ? (
              <div style={styles.emptyState}>Loading tasks...</div>
            ) : tasks.length === 0 ? (
              <div style={styles.emptyState}>
                <CheckCircle2 size={48} style={{ color: 'var(--text-muted)', marginBottom: 16 }} />
                <p>No tasks found. Create a task to get started!</p>
              </div>
            ) : (
              <div style={styles.taskList}>
                {tasks.map(task => (
                  <div key={task.id} style={{
                    ...styles.taskItem,
                    borderColor: task.completed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.06)'
                  }} className="glass-panel">
                    
                    {editingId === task.id ? (
                      /* Editing Mode */
                      <div style={styles.editModeContainer}>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          style={styles.editInput}
                          placeholder="Task title"
                          required
                        />
                        <textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          style={styles.editTextarea}
                          placeholder="Task description"
                          rows={2}
                        />
                        <div style={styles.editActions}>
                          <button onClick={() => saveEdit(task.id)} style={styles.saveBtn}>
                            <Check size={16} style={{ marginRight: 4 }} /> Save
                          </button>
                          <button onClick={() => setEditingId(null)} style={styles.cancelBtn}>
                            <X size={16} style={{ marginRight: 4 }} /> Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Read Mode */
                      <>
                        <div style={styles.taskMain}>
                          <button onClick={() => handleToggle(task)} style={styles.checkbox}>
                            {task.completed ? (
                              <CheckCircle2 size={22} style={{ color: 'var(--success)' }} />
                            ) : (
                              <Circle size={22} style={{ color: 'var(--text-secondary)' }} />
                            )}
                          </button>

                          <div style={styles.taskDetails}>
                            <h4 style={{
                              ...styles.taskTitle,
                              textDecoration: task.completed ? 'line-through' : 'none',
                              color: task.completed ? 'var(--text-muted)' : 'var(--text-primary)'
                            }}>
                              {task.title}
                            </h4>
                            {task.description && (
                              <p style={{
                                ...styles.taskDesc,
                                textDecoration: task.completed ? 'line-through' : 'none',
                                color: 'var(--text-secondary)',
                                marginTop: '4px'
                              }}>
                                {task.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div style={styles.taskRight}>
                          {/* Done Badge: show true if done, false if not done */}
                          <div style={{
                            ...styles.statusBadge,
                            backgroundColor: task.completed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.12)',
                            color: task.completed ? 'var(--success)' : 'var(--danger)',
                            border: task.completed ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.25)',
                          }}>
                            Done: {task.completed ? 'true' : 'false'}
                          </div>

                          <div style={styles.actions}>
                            <button onClick={() => startEdit(task)} style={styles.actionBtn} title="Edit Task">
                              <Edit size={16} />
                            </button>
                            <button onClick={() => handleDelete(task.id)} style={styles.actionBtnDelete} title="Delete Task">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    width: '100%',
    margin: '0 auto',
    padding: '40px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
    flex: 1,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px 32px',
    width: '100%',
  },
  headerLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  welcomeText: {
    fontSize: '22px',
    fontWeight: '700',
  },
  highlightText: {
    color: 'var(--primary)',
    background: 'linear-gradient(to right, #a78bfa, #f472b6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  headerSubtitle: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
  },
  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 18px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    fontWeight: '600',
    fontSize: '14px',
  },
  mainGrid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: '32px',
  },
  sidebarColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    width: '320px',
    flexGrow: 0,
    flexShrink: 0,
  },
  sidebarCard: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--text-primary)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    background: 'var(--input-bg)',
    border: '1px solid var(--input-border)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    fontSize: '14px',
  },
  textarea: {
    width: '100%',
    padding: '12px 14px',
    background: 'var(--input-bg)',
    border: '1px solid var(--input-border)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    fontSize: '14px',
    resize: 'vertical',
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: '12px',
    background: 'var(--primary)',
    color: '#fff',
    borderRadius: 'var(--radius-md)',
    fontWeight: '700',
    fontSize: '14px',
    boxShadow: '0 4px 12px 0 rgba(139, 92, 246, 0.3)',
  },
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  statBox: {
    background: 'rgba(15, 23, 42, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.03)',
    borderRadius: 'var(--radius-md)',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
  statNum: {
    fontSize: '24px',
    fontWeight: '800',
    color: 'var(--text-primary)',
  },
  statLabel: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    fontWeight: '500',
  },
  progressSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '4px',
  },
  progressInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: 'var(--text-secondary)',
    fontWeight: '500',
  },
  progressBarBg: {
    width: '100%',
    height: '6px',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    background: 'linear-gradient(to right, var(--primary), #a78bfa)',
    borderRadius: '3px',
    transition: 'width 0.4s ease-out',
  },
  contentColumn: {
    flex: 1,
    minWidth: '320px',
  },
  taskListCard: {
    padding: '28px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  taskListHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskCountBadge: {
    fontSize: '12px',
    fontWeight: '600',
    padding: '4px 10px',
    background: 'rgba(139, 92, 246, 0.15)',
    color: 'var(--primary)',
    borderRadius: '20px',
    border: '1px solid rgba(139, 92, 246, 0.2)',
  },
  errorAlert: {
    padding: '12px 16px',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--danger)',
    fontSize: '14px',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    textAlign: 'center',
    color: 'var(--text-secondary)',
    fontSize: '15px',
    gap: '8px',
  },
  taskList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  taskItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderRadius: 'var(--radius-md)',
    background: 'rgba(30, 41, 59, 0.4)',
    gap: '16px',
    flexWrap: 'wrap',
  },
  taskMain: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    flex: 1,
    minWidth: '240px',
  },
  checkbox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px',
    marginTop: '2px',
  },
  taskDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  taskTitle: {
    fontSize: '16px',
    fontWeight: '600',
    wordBreak: 'break-word',
  },
  taskDesc: {
    fontSize: '14px',
    wordBreak: 'break-word',
  },
  taskRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
  },
  statusBadge: {
    fontSize: '12px',
    fontWeight: '700',
    padding: '6px 12px',
    borderRadius: '12px',
    textTransform: 'lowercase',
    fontFamily: 'monospace',
    letterSpacing: '0.5px',
  },
  actions: {
    display: 'flex',
    gap: '8px',
  },
  actionBtn: {
    padding: '8px',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-secondary)',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'var(--transition)',
  },
  actionBtnDelete: {
    padding: '8px',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-secondary)',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'var(--transition)',
  },
  editModeContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    width: '100%',
  },
  editInput: {
    width: '100%',
    padding: '10px 12px',
    background: 'var(--input-bg)',
    border: '1px solid var(--input-border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-primary)',
    fontSize: '14px',
  },
  editTextarea: {
    width: '100%',
    padding: '10px 12px',
    background: 'var(--input-bg)',
    border: '1px solid var(--input-border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-primary)',
    fontSize: '14px',
    resize: 'vertical',
  },
  editActions: {
    display: 'flex',
    gap: '10px',
  },
  saveBtn: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 16px',
    background: 'var(--success)',
    color: '#fff',
    borderRadius: 'var(--radius-sm)',
    fontWeight: '600',
    fontSize: '13px',
  },
  cancelBtn: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 16px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: 'var(--text-primary)',
    borderRadius: 'var(--radius-sm)',
    fontWeight: '600',
    fontSize: '13px',
  },
};
