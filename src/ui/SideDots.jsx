// Indicador vertical de proyectos (lado derecho): hover resalta, click abre.
export default function SideDots({ projects, hovered, selected, onHover, onOpen }) {
  return (
    <nav aria-label="Proyectos" className="fixed right-5 top-1/2 z-40 flex -translate-y-1/2 flex-col gap-4">
      {projects.map((p) => {
        const on = hovered === p.id || selected === p.id
        return (
          <button
            key={p.id}
            type="button"
            title={p.title}
            aria-label={p.title}
            onPointerEnter={() => onHover(p.id)}
            onPointerLeave={() => onHover(null)}
            onClick={() => onOpen(p.id)}
            className={`side-dot ${on ? 'is-on' : ''}`}
            style={{ '--c': p.color }}
          />
        )
      })}
    </nav>
  )
}
