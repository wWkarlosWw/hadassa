export default function PanelLoading() {
  return (
    <div className="animate-pulse space-y-6" aria-busy="true" aria-label="Cargando">
      <div className="space-y-2">
        <div className="h-9 w-64 rounded-lg bg-borde/70" />
        <div className="h-4 w-96 max-w-full rounded bg-borde/50" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-[var(--radius-card)] bg-papel ring-1 ring-borde" />
        ))}
      </div>
      <div className="h-72 rounded-[var(--radius-card)] bg-papel ring-1 ring-borde" />
    </div>
  );
}
