import type { AIModel } from "@/lib/models-data";
import { cn } from "@/lib/utils";

interface ModelCardProps {
  model: AIModel;
  className?: string;
}

export function ModelCard({ model, className }: ModelCardProps) {
  return (
    <div className={cn("rounded-lg border bg-card p-4 text-card-foreground shadow-sm", className)}>
      <div className="mb-2 flex items-start justify-between">
        <div>
          <h3 className="font-semibold">{model.name}</h3>
          <p className="text-xs text-muted-foreground">{model.lab}</p>
        </div>
        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium capitalize">
          {model.category}
        </span>
      </div>
      <p className="mb-3 text-sm text-muted-foreground line-clamp-2">{model.description}</p>
      <div className="flex flex-wrap gap-1">
        {model.useCases.map((tag) => (
          <span key={tag} className="rounded-md bg-muted px-2 py-0.5 text-xs">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
