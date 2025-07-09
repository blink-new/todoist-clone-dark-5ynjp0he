import { CheckCircle2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  onAddTask?: () => void
}

export function EmptyState({ onAddTask }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 p-4 bg-muted/50 rounded-full">
        <CheckCircle2 className="h-12 w-12 text-muted-foreground" />
      </div>
      
      <h3 className="text-lg font-semibold mb-2">No tasks yet</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">
        Start your productivity journey by adding your first task. Break down your goals into manageable steps.
      </p>
      
      {onAddTask && (
        <Button onClick={onAddTask} className="gap-2">
          <Plus className="h-4 w-4" />
          Add your first task
        </Button>
      )}
    </div>
  )
}