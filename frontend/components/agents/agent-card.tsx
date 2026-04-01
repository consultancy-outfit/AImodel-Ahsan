import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";

interface AgentCardProps {
  name: string;
  description: string;
  status: "active" | "idle" | "error";
  className?: string;
}

const STATUS_STYLES: Record<AgentCardProps["status"], string> = {
  active: "bg-green-100 text-green-700",
  idle: "bg-muted text-muted-foreground",
  error: "bg-destructive/10 text-destructive",
};

export function AgentCard({ name, description, status, className }: AgentCardProps) {
  return (
    <div className={cn("rounded-lg border bg-card p-4 shadow-sm", className)}>
      <div className="mb-2 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
          <Bot className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <p className="font-semibold">{name}</p>
          <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium capitalize", STATUS_STYLES[status])}>
            {status}
          </span>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
