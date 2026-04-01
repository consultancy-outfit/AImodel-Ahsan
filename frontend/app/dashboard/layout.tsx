export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-muted/40 p-4">
        <nav className="space-y-2">
          <a href="/dashboard" className="block px-3 py-2 rounded-md hover:bg-accent text-sm font-medium">
            Overview
          </a>
          <a href="/dashboard/agents" className="block px-3 py-2 rounded-md hover:bg-accent text-sm font-medium">
            Agents
          </a>
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
