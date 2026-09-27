import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * Barra de navegación de la órbita (escritorio): flechas, un punto por tarjeta y la tarjeta del frente.
 * Va abajo a la izquierda para no tapar la tarjeta del frente (que pasa por abajo al centro).
 */
export default function NavDock({ items, category, front, hovered, hidden, onStep, onRotateTo, onHover, onOpen, onBack }) {
  const current = items[front] ?? items[0]
  if (!current) return null
  const many = items.length > 1

  return (
    <nav
      aria-label={category ? `Proyectos de ${category.title}` : 'Categorías'}
      className={`nav-dock glass fixed bottom-8 left-8 z-40 flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-all duration-500 ${
        hidden ? 'pointer-events-none translate-y-6 opacity-0' : ''
      }`}
      style={{ '--c': current.color }}
    >
      {category && (
        <button type="button" onClick={onBack} className="dock-back flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-semibold tracking-[0.14em]">
          <ArrowLeft size={15} /> CATEGORÍAS
        </button>
      )}

      {many && (
        <button type="button" onClick={() => onStep(-1)} aria-label="Anterior" className="dock-arrow grid h-10 w-10 place-items-center rounded-full">
          <ChevronLeft size={22} />
        </button>
      )}

      <div className="flex min-w-0 flex-col items-center gap-1.5 px-1">
        <p className="text-[10px] tracking-[0.3em] text-slate-400">{category ? category.title : 'CATEGORÍAS'}</p>
        {many && (
          <div className="flex items-center gap-2">
            {items.map((it, i) => (
              <button
                key={it.id}
                type="button"
                title={it.title}
                aria-label={it.title}
                aria-current={i === front}
                onClick={() => onRotateTo(i)}
                onPointerEnter={() => onHover(it.id)}
                onPointerLeave={() => onHover(null)}
                className={`dock-dot ${i === front || hovered === it.id ? 'is-on' : ''}`}
                style={{ '--c': it.color }}
              />
            ))}
          </div>
        )}
      </div>

      {many && (
        <button type="button" onClick={() => onStep(1)} aria-label="Siguiente" className="dock-arrow grid h-10 w-10 place-items-center rounded-full">
          <ChevronRight size={22} />
        </button>
      )}

      <button
        type="button"
        onClick={() => onOpen(current.id)}
        onPointerEnter={() => onHover(current.id)}
        onPointerLeave={() => onHover(null)}
        className="view-btn flex max-w-[260px] items-center gap-1.5 truncate rounded-lg px-4 py-2 text-[13px] font-bold tracking-[0.1em] text-[#031018]"
      >
        <span className="truncate">{current.title}</span>
        <ChevronRight size={16} strokeWidth={2.5} className="shrink-0" />
      </button>
    </nav>
  )
}
