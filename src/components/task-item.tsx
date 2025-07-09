import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  MoreHorizontal, 
  Calendar, 
  Edit3, 
  Trash2,
  Flag,
  Circle
} from "lucide-react"
import { Task, Project } from "@/types"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { format, isToday, isTomorrow, isPast } from "date-fns"

interface TaskItemProps {
  task: Task
  project?: Project
  onToggle: (taskId: string) => void
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
}

const priorityColors = {
  urgent: "text-red-500",
  high: "text-orange-500", 
  medium: "text-yellow-500",
  low: "text-green-500"
}

export function TaskItem({ task, project, onToggle, onEdit, onDelete }: TaskItemProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString)
    if (isToday(date)) return "Today"
    if (isTomorrow(date)) return "Tomorrow"
    return format(date, "MMM d")
  }

  const getDueDateColor = (dateString: string) => {
    const date = new Date(dateString)
    if (isPast(date) && !isToday(date)) return "text-red-500"
    if (isToday(date)) return "text-orange-500"
    return "text-muted-foreground"
  }

  return (
    <div
      className={cn(
        "group flex items-start gap-3 p-3 rounded-lg border transition-all duration-200 hover:shadow-sm",
        Number(task.completed) === 1 && "opacity-60",
        isHovered && "bg-muted/50"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Checkbox
        checked={Number(task.completed) === 1}
        onCheckedChange={() => onToggle(task.id)}
        className="mt-0.5"
      />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {task.priority !== 'low' && (
            <Flag 
              className={cn("h-3 w-3", priorityColors[task.priority])}
              fill="currentColor"
            />
          )}
          <h3 
            className={cn(
              "font-medium text-sm",
              Number(task.completed) === 1 && "line-through text-muted-foreground"
            )}
          >
            {task.title}
          </h3>
        </div>
        
        {task.description && (
          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
            {task.description}
          </p>
        )}
        
        <div className="flex items-center gap-2 flex-wrap">
          {project && (
            <div className="flex items-center gap-1">
              <Circle 
                className="h-2 w-2 fill-current" 
                style={{ color: project.color }}
              />
              <span className="text-xs text-muted-foreground">{project.name}</span>
            </div>
          )}
          
          {task.due_date && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span className={cn("text-xs", getDueDateColor(task.due_date))}>
                {formatDueDate(task.due_date)}
              </span>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(task)}
          className="h-7 w-7 p-0"
        >
          <Edit3 className="h-3 w-3" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(task)}>
              <Edit3 className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete(task.id)}
              className="text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}