import { TaskItem } from "./task-item"
import { Task, Project } from "@/types"
import { EmptyState } from "./empty-state"

interface TaskListProps {
  tasks: Task[]
  projects: Project[]
  onToggleTask: (taskId: string) => void
  onEditTask: (task: Task) => void
  onDeleteTask: (taskId: string) => void
  title: string
  description?: string
}

export function TaskList({ 
  tasks, 
  projects, 
  onToggleTask, 
  onEditTask, 
  onDeleteTask, 
  title,
  description
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex-1 p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">{title}</h2>
          {description && (
            <p className="text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <EmptyState />
      </div>
    )
  }

  return (
    <div className="flex-1 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">{title}</h2>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      
      <div className="space-y-2">
        {tasks.map((task) => {
          const project = projects.find(p => p.id === task.project_id)
          return (
            <TaskItem
              key={task.id}
              task={task}
              project={project}
              onToggle={onToggleTask}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          )
        })}
      </div>
    </div>
  )
}