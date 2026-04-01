import { FEATURED_MODELS, NEW_MODELS } from "@/lib/models-data";
import { Compass, Sparkles, TrendingUp } from "lucide-react";

export default function DiscoverPage() {
  return (
    <div className="page-transition container py-8">
      <div className="mb-6 flex items-center gap-3">
        <Compass className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Discover</h1>
      </div>

      <section className="mb-10">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-500" />
          <h2 className="text-lg font-semibold">New Models</h2>
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {NEW_MODELS.map((model) => (
            <div key={model.id} className="rounded-lg border bg-card p-4 shadow-sm">
              <p className="font-semibold">{model.name}</p>
              <p className="text-xs text-muted-foreground">{model.lab}</p>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{model.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-500" />
          <h2 className="text-lg font-semibold">Featured Models</h2>
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURED_MODELS.map((model) => (
            <div key={model.id} className="rounded-lg border bg-card p-4 shadow-sm">
              <p className="font-semibold">{model.name}</p>
              <p className="text-xs text-muted-foreground">{model.lab}</p>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{model.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
