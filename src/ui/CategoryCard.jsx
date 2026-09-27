import { ChevronRight } from 'lucide-react'
import { Preview } from './ProjectCard'
import { CARD_PX } from '../three/layout'
import { projectsOf } from '../data/projects'

/**
 * Tarjeta holográfica de categoría (misma estética que ProjectCard).
 * variant: 'side' (órbita 3D) | 'mobile' (carrusel)
 */
export default function CategoryCard({ category, variant = 'side', active, onHover, onOpen }) {
  const items = projectsOf(category)
  const count = `${items.length} ${items.length === 1 ? 'PROYECTO' : 'PROYECTOS'}`
  const common = {
    role: 'button',
    tabIndex: 0,
    'aria-label': `Ver ${category.title}: ${count.toLowerCase()}`,
    onClick: () => onOpen(category.id),
    onKeyDown: (e) => (e.key === 'Enter' || e.key === ' ') && onOpen(category.id),
    onPointerEnter: () => onHover?.(category.id),
    onPointerLeave: () => onHover?.(null),
    style: { '--c': category.color },
  }
  const button = (className) => (
    <span className={`view-btn flex items-center justify-center gap-1 rounded-md px-4 py-1.5 font-bold tracking-[0.12em] text-[#031018] ${className}`}>
      EXPLORAR <ChevronRight size={14} strokeWidth={2.5} />
    </span>
  )

  if (variant === 'mobile') {
    return (
      <article {...common} className="holo-card mobile flex h-full flex-col p-3 text-left">
        <div className="flex gap-3">
          <Preview project={category} className="h-[84px] w-[84px] shrink-0" />
          <div className="min-w-0">
            <p className="card-cat text-[10px]">{count}</p>
            <h3 className="card-title mt-1 text-[22px] leading-none">{category.title}</h3>
            <p className="mt-1.5 text-[12px] leading-snug text-slate-300 line-clamp-2">{category.tagline}</p>
          </div>
        </div>
        <ul className="mt-2.5 flex flex-wrap gap-1.5">
          {items.map((p) => (
            <li key={p.id} className="cat-chip text-[10px]" style={{ '--c': p.color }}>
              {p.title}
            </li>
          ))}
        </ul>
        {button('mt-auto w-full text-[12px]')}
      </article>
    )
  }

  return (
    <article
      {...common}
      className={`holo-card ${active ? 'is-active' : ''} flex flex-col p-2.5 text-left`}
      style={{ ...common.style, width: CARD_PX.w, height: CARD_PX.h }}
    >
      <div className="flex h-[78px] gap-2.5">
        <Preview project={category} className="h-full w-[78px] shrink-0" />
        <div className="min-w-0 self-center">
          <p className="card-cat text-[8.5px]">{count}</p>
          <h3 className="card-title mt-1 text-[19px] leading-none">{category.title}</h3>
        </div>
      </div>
      <p className="mt-2 text-[10px] leading-snug text-slate-300">{category.tagline}</p>
      <ul className="mt-1.5 flex flex-wrap gap-1">
        {items.slice(0, 4).map((p) => (
          <li key={p.id} className="cat-chip text-[7.5px]" style={{ '--c': p.color }}>
            {p.title}
          </li>
        ))}
        {items.length > 4 && <li className="cat-chip text-[7.5px]">+{items.length - 4}</li>}
      </ul>
      {button('mt-auto text-[10px]')}
    </article>
  )
}
