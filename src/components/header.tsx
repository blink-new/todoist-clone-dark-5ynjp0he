import { Button } from "@/components/ui/button"
import { Moon, Sun, Plus, Search, Settings } from "lucide-react"
import { useTheme } from "next-themes"
import { Input } from "@/components/ui/input"

interface HeaderProps {
  onNewTask: () => void
}

export function Header({ onNewTask }: HeaderProps) {
  const { theme, setTheme } = useTheme()

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
            Todoist
          </h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              className="w-64 pl-10 bg-muted/50"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button onClick={onNewTask} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
          
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </header>
  )
}