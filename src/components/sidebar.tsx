import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { 
  Inbox, 
  Calendar, 
  Star, 
  CheckSquare, 
  Plus,
  FolderOpen,
  Circle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Project } from "@/types"

interface SidebarProps {
  projects: Project[]
  selectedProject: string | null
  onProjectSelect: (projectId: string | null) => void
  onNewProject: () => void
  taskCounts: Record<string, number>
}

export function Sidebar({ 
  projects, 
  selectedProject, 
  onProjectSelect, 
  onNewProject,
  taskCounts 
}: SidebarProps) {
  const views = [
    { id: 'inbox', label: 'Inbox', icon: Inbox, count: taskCounts.inbox || 0 },
    { id: 'today', label: 'Today', icon: Calendar, count: taskCounts.today || 0 },
    { id: 'upcoming', label: 'Upcoming', icon: Star, count: taskCounts.upcoming || 0 },
    { id: 'completed', label: 'Completed', icon: CheckSquare, count: taskCounts.completed || 0 },
  ]

  return (
    <div className="w-72 border-r bg-muted/10 flex flex-col">
      <div className="p-4">
        <nav className="space-y-1">
          {views.map((view) => {
            const Icon = view.icon
            return (
              <Button
                key={view.id}
                variant={selectedProject === view.id ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-10",
                  selectedProject === view.id && "bg-primary/10 text-primary"
                )}
                onClick={() => onProjectSelect(view.id)}
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1 text-left">{view.label}</span>
                {view.count > 0 && (
                  <Badge variant="secondary" className="h-5 text-xs">
                    {view.count}
                  </Badge>
                )}
              </Button>
            )
          })}
        </nav>
      </div>

      <div className="px-4 pb-2">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            Projects
          </h3>
          <Button variant="ghost" size="sm" onClick={onNewProject}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 px-4">
        <div className="space-y-1 pb-4">
          {projects.map((project) => (
            <Button
              key={project.id}
              variant={selectedProject === project.id ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 h-9",
                selectedProject === project.id && "bg-primary/10 text-primary"
              )}
              onClick={() => onProjectSelect(project.id)}
            >
              <Circle 
                className="h-3 w-3 fill-current" 
                style={{ color: project.color }}
              />
              <span className="flex-1 text-left text-sm">{project.name}</span>
              {taskCounts[project.id] > 0 && (
                <Badge variant="secondary" className="h-4 text-xs">
                  {taskCounts[project.id]}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}