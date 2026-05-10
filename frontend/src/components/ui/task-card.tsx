import { SURFACE_INSET } from "@/lib/shell-layout";
import { cn } from "@/lib/utils";
import { Badge } from "./badge";
import { Button } from "./button";

type Task = {
  id: string;
  title: string;
  estimatedMinutes: number;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  dueDate?: string;
};

export function TaskCard({
  task,
  disabled,
  onStart,
  onDone,
}: {
  task: Task;
  disabled?: boolean;
  onStart: () => void;
  onDone: () => void;
}) {
  const statusVariant =
    task.status === "done" ? "success" : task.status === "in_progress" ? "info" : "warning";
  return (
    <div
      className={cn(
        SURFACE_INSET,
        "border-violet-400/12 p-4 transition-all hover:-translate-y-0.5 hover:border-teal-400/25 hover:shadow-lg hover:shadow-teal-950/20",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-50">{task.title}</p>
          <p className="mt-1 text-xs text-slate-400">
            {task.estimatedMinutes}m estimate{" "}
            {task.dueDate ? `· ${new Date(task.dueDate).toLocaleDateString()}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={statusVariant}>{task.status.replace("_", " ")}</Badge>
          <Badge>{task.priority}</Badge>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <Button variant="outline" disabled={disabled || task.status === "done"} onClick={onStart}>
          Start
        </Button>
        <Button variant="ghost" disabled={task.status === "done"} onClick={onDone}>
          Done
        </Button>
      </div>
    </div>
  );
}
