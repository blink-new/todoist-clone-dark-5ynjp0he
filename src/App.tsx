import { useState, useEffect } from 'react'
import { ThemeProvider } from './components/theme-provider'
import { Header } from './components/header'
import { Sidebar } from './components/sidebar'
import { TaskList } from './components/task-list'
import { TaskDialog } from './components/task-dialog'
import { ProjectDialog } from './components/project-dialog'
import { blink } from './lib/blink'
import { Task, Project } from './types'
import { Toaster } from 'react-hot-toast'
import toast from 'react-hot-toast'
import { isToday, isAfter, startOfDay } from 'date-fns'

function AppContent() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<string | null>('inbox')
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [projectDialogOpen, setProjectDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Initialize data
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check auth and get user
        const currentUser = await blink.auth.me()
        setUser(currentUser)

        // Load projects and tasks
        await Promise.all([loadProjects(), loadTasks()])
      } catch (error) {
        console.error('Initialization error:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeApp()
  }, [])

  const loadTasks = async () => {
    try {
      const tasksData = await blink.db.tasks.list({
        orderBy: { created_at: 'desc' }
      })
      // Ensure we always set an array
      setTasks(Array.isArray(tasksData) ? tasksData : [])
    } catch (error) {
      console.error('Error loading tasks:', error)
      // Set empty array on error
      setTasks([])
      
      // Create table if it doesn't exist
      try {
        await blink.db.sql(`
          CREATE TABLE IF NOT EXISTS tasks (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            completed BOOLEAN DEFAULT FALSE,
            priority TEXT DEFAULT 'medium',
            due_date TEXT,
            project_id TEXT DEFAULT 'inbox',
            user_id TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
          )
        `)
        // Try loading again after creating table
        const retryData = await blink.db.tasks.list({
          orderBy: { created_at: 'desc' }
        })
        setTasks(Array.isArray(retryData) ? retryData : [])
      } catch (sqlError) {
        console.error('Error creating tasks table:', sqlError)
      }
    }
  }

  const loadProjects = async () => {
    try {
      const projectsData = await blink.db.projects.list({
        orderBy: { created_at: 'asc' }
      })
      // Ensure we always set an array
      setProjects(Array.isArray(projectsData) ? projectsData : [])
    } catch (error) {
      console.error('Error loading projects:', error)
      // Set empty array on error
      setProjects([])
      
      // Create table if it doesn't exist
      try {
        await blink.db.sql(`
          CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            color TEXT DEFAULT '#3b82f6',
            user_id TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
          )
        `)
        // Try loading again after creating table
        const retryData = await blink.db.projects.list({
          orderBy: { created_at: 'asc' }
        })
        setProjects(Array.isArray(retryData) ? retryData : [])
      } catch (sqlError) {
        console.error('Error creating projects table:', sqlError)
      }
    }
  }

  const filteredTasks = () => {
    // Ensure tasks is always an array
    const taskArray = Array.isArray(tasks) ? tasks : []
    
    switch (selectedProject) {
      case 'inbox':
        return taskArray.filter(task => Number(task.completed) === 0 && task.project_id === 'inbox')
      case 'today':
        return taskArray.filter(task => 
          Number(task.completed) === 0 && 
          task.due_date && 
          isToday(new Date(task.due_date))
        )
      case 'upcoming':
        return taskArray.filter(task => 
          Number(task.completed) === 0 && 
          task.due_date && 
          isAfter(new Date(task.due_date), startOfDay(new Date()))
        )
      case 'completed':
        return taskArray.filter(task => Number(task.completed) === 1)
      default: {
        return taskArray.filter(task => 
          Number(task.completed) === 0 && 
          task.project_id === selectedProject
        )
      }
    }
  }

  const getTaskCounts = () => {
    // Ensure tasks is always an array
    const taskArray = Array.isArray(tasks) ? tasks : []
    const projectArray = Array.isArray(projects) ? projects : []
    
    const counts: Record<string, number> = {
      inbox: taskArray.filter(t => Number(t.completed) === 0 && t.project_id === 'inbox').length,
      today: taskArray.filter(t => Number(t.completed) === 0 && t.due_date && isToday(new Date(t.due_date))).length,
      upcoming: taskArray.filter(t => Number(t.completed) === 0 && t.due_date && isAfter(new Date(t.due_date), startOfDay(new Date()))).length,
      completed: taskArray.filter(t => Number(t.completed) === 1).length,
    }

    projectArray.forEach(project => {
      counts[project.id] = taskArray.filter(t => Number(t.completed) === 0 && t.project_id === project.id).length
    })

    return counts
  }

  const getViewTitle = () => {
    switch (selectedProject) {
      case 'inbox': return 'Inbox'
      case 'today': return 'Today'
      case 'upcoming': return 'Upcoming'
      case 'completed': return 'Completed'
      default: {
        const project = projects.find(p => p.id === selectedProject)
        return project?.name || 'Tasks'
      }
    }
  }

  const handleSaveTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    try {
      if (editingTask) {
        // Update existing task
        await blink.db.tasks.update(editingTask.id, {
          ...taskData,
          updated_at: new Date().toISOString()
        })
        setTasks(tasks.map(t => t.id === editingTask.id ? { ...t, ...taskData } : t))
        toast.success('Task updated!')
      } else {
        // Create new task
        const newTask = await blink.db.tasks.create({
          ...taskData,
          id: crypto.randomUUID(),
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        setTasks([newTask, ...tasks])
        toast.success('Task added!')
      }
      setEditingTask(null)
    } catch (error) {
      console.error('Error saving task:', error)
      toast.error('Failed to save task')
    }
  }

  const handleToggleTask = async (taskId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId)
      if (!task) return

      const updatedTask = { ...task, completed: Number(task.completed) === 1 ? 0 : 1 }
      await blink.db.tasks.update(taskId, updatedTask)
      setTasks(tasks.map(t => t.id === taskId ? updatedTask : t))
      toast.success(Number(updatedTask.completed) === 1 ? 'Task completed!' : 'Task reopened!')
    } catch (error) {
      console.error('Error toggling task:', error)
      toast.error('Failed to update task')
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      await blink.db.tasks.delete(taskId)
      setTasks(tasks.filter(t => t.id !== taskId))
      toast.success('Task deleted!')
    } catch (error) {
      console.error('Error deleting task:', error)
      toast.error('Failed to delete task')
    }
  }

  const handleSaveProject = async (projectData: Omit<Project, 'id' | 'created_at' | 'user_id'>) => {
    try {
      const newProject = await blink.db.projects.create({
        ...projectData,
        id: crypto.randomUUID(),
        user_id: user.id,
        created_at: new Date().toISOString()
      })
      setProjects([...projects, newProject])
      toast.success('Project created!')
    } catch (error) {
      console.error('Error creating project:', error)
      toast.error('Failed to create project')
    }
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setTaskDialogOpen(true)
  }

  const handleNewTask = () => {
    setEditingTask(null)
    setTaskDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your tasks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onNewTask={handleNewTask} />
      
      <div className="flex">
        <Sidebar
          projects={projects}
          selectedProject={selectedProject}
          onProjectSelect={setSelectedProject}
          onNewProject={() => setProjectDialogOpen(true)}
          taskCounts={getTaskCounts()}
        />
        
        <TaskList
          tasks={filteredTasks()}
          projects={projects}
          onToggleTask={handleToggleTask}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          title={getViewTitle()}
          description={selectedProject === 'today' ? "Focus on today's priorities" : undefined}
        />
      </div>

      <TaskDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        task={editingTask}
        projects={projects}
        onSave={handleSaveTask}
      />

      <ProjectDialog
        open={projectDialogOpen}
        onOpenChange={setProjectDialogOpen}
        onSave={handleSaveProject}
      />
    </div>
  )
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      <AppContent />
      <Toaster position="top-right" />
    </ThemeProvider>
  )
}

export default App