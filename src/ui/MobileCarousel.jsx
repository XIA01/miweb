import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * Carrusel táctil con scroll-snap para móviles, superpuesto sobre la escena.
 * Muestra categorías o, dentro de una, sus proyectos (con botón para volver).
 */
export default function MobileCarousel({ items, category, renderCard, onHover, onBack, hidden }) {
  const track = useRef()
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const el = track.current
    if (!el) return
    const onScroll = () => {
      const w = el.firstElementChild?.getBoundingClientRect().width ?? 1
      setCurrent(Math.min(items.length - 1, Math.round(el.scrollLeft / (w + 12))))
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [items.length])

  useEffect(() => {
    onHover(items[current]?.id ?? null)
  }, [current, items, onHover])

  const goTo = (i) => {
    const el = track.current
    const w = el.firstElementChild.getBoundingClientRect().width
    el.scrollTo({ left: i * (w + 12), behavior: 'smooth' })
  }
  const many = items.length > 1

  return (
    <section
      aria-label={category ? `Proyectos de ${category.title}` : 'Categorías'}
      className={`fixed inset-x-0 bottom-8 z-30 transition-all duration-500 ${hidden ? 'pointer-events-none translate-y-8 opacity-0' : ''}`}
    >
      <div className="mb-2 flex items-center justify-center px-4">
        {category ? (
          <button type="button" onClick={onBack} className="dock-back glass flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.14em]">
            <ArrowLeft size={14} /> CATEGORÍAS <span className="text-slate-500">/</span>
            <span style={{ color: category.color }}>{category.title}</span>
          </button>
        ) : (
          <p className="glass rounded-full px-3.5 py-1.5 text-[10.5px] font-semibold tracking-[0.3em] text-cyan-200">ELEGÍ UNA CATEGORÍA</p>
        )}
      </div>

      <div ref={track} className="carousel flex snap-x snap-mandatory gap-3 overflow-x-auto px-[9vw] pb-3">
        {items.map((it, i) => (
          <div key={it.id} className="h-[236px] w-[82vw] max-w-[380px] shrink-0 snap-center">
            {renderCard(it, i)}
          </div>
        ))}
      </div>

      {many && (
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            aria-label="Anterior"
            onClick={() => goTo(Math.max(0, current - 1))}
            disabled={current === 0}
            className="dock-arrow grid h-9 w-9 place-items-center rounded-full disabled:opacity-30"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            {items.map((it, i) => (
              <button
                key={it.id}
                type="button"
                aria-label={`Ir a ${it.title}`}
                aria-current={i === current}
                onClick={() => goTo(i)}
                className={`dock-dot ${i === current ? 'is-on is-wide' : ''}`}
                style={{ '--c': it.color }}
              />
            ))}
          </div>
          <button
            type="button"
            aria-label="Siguiente"
            onClick={() => goTo(Math.min(items.length - 1, current + 1))}
            disabled={current === items.length - 1}
            className="dock-arrow grid h-9 w-9 place-items-center rounded-full disabled:opacity-30"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </section>
  )
}
