export interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: 'low' | 'medium' | 'high' | 'urgent'
  due_date?: string
  project_id: string
  user_id: string
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  name: string
  color: string
  user_id: string
  created_at: string
}

export interface User {
  id: string
  email: string
  displayName?: string
}