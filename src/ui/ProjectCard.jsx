import { ProjectIcon } from './icons'
import CodeTicker from './CodeTicker'
import { CARD_PX, FEATURED_PX } from '../three/layout'

function Preview({ project, className = '' }) {
  return (
    <div className={`holo-preview relative overflow-hidden rounded-md border border-white/10 ${className}`} style={{ '--c': project.color }}>
      <div className="absolute inset-0 holo-grid" />
      <div className="absolute inset-0 grid place-items-center">
        <div className="holo-icon">
          <ProjectIcon name={project.icon} strokeWidth={1.3} className="h-full w-full" />
        </div>
      </div>
      <div className="holo-scan" />
    </div>
  )
}

function ViewButton({ project, onOpen, className = '' }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onOpen(project.id)
      }}
      className={`view-btn rounded-md px-4 py-1.5 font-bold tracking-[0.12em] text-[#031018] ${className}`}
    >
      VIEW PROJECT
    </button>
  )
}

/**
 * Tarjeta holográfica compartida entre la escena 3D (<Html transform>) y el carrusel móvil.
 * variant: 'side' | 'featured' | 'mobile'
 */
export default function ProjectCard({ project, variant = 'side', index = 0, active, onHover, onOpen }) {
  const common = {
    role: 'button',
    tabIndex: 0,
    'aria-label': `Abrir ${project.title}`,
    onClick: () => onOpen(project.id),
    onKeyDown: (e) => (e.key === 'Enter' || e.key === ' ') && onOpen(project.id),
    onPointerEnter: () => onHover?.(project.id),
    onPointerLeave: () => onHover?.(null),
    style: { '--c': project.color },
  }

  if (variant === 'featured') {
    return (
      <article
        {...common}
        className={`holo-card featured ${active ? 'is-active' : ''} flex gap-3 p-3 text-left`}
        style={{ ...common.style, width: FEATURED_PX.w, height: FEATURED_PX.h }}
      >
        <div className="flex w-[46%] flex-col">
          <h3 className="card-title text-[17px] leading-none">{project.title}</h3>
          <p className="card-cat mt-1 text-[9px]">{project.category}</p>
          <Preview project={project} className="mt-2 h-[74px]" />
          <p className="mt-2 text-[9.5px] leading-snug text-slate-300 line-clamp-3">{project.summary}</p>
          <ViewButton project={project} onOpen={onOpen} className="mt-auto text-[10px]" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="code-window flex-1">
            <div className="code-bar">
              <i className="bg-rose-400" />
              <i className="bg-amber-300" />
              <i className="bg-emerald-400" />
              <span className="ml-2 truncate">{project.id}.src — live</span>
            </div>
            <CodeTicker code={project.code} lines={7} className="px-2 py-1 text-[8px] text-slate-200" />
          </div>
          <div className="code-window h-[46px] px-2 py-1 text-[7.5px] font-mono text-emerald-300/90">
            <div>$ deploy --prod</div>
            <div className="text-slate-400">✓ {project.live.replace(/^https:\/\//, '').split('/')[0]}</div>
          </div>
          <p className="text-[9px] tracking-wider text-slate-400">
            {project.title} — Proyecto {String(index + 1).padStart(2, '0')}
          </p>
        </div>
      </article>
    )
  }

  if (variant === 'mobile') {
    return (
      <article {...common} className="holo-card mobile flex h-full flex-col p-3 text-left">
        <div className="flex gap-3">
          <Preview project={project} className="h-[72px] w-[84px] shrink-0" />
          <div className="min-w-0">
            <h3 className="card-title text-[19px] leading-none">{project.title}</h3>
            <p className="card-cat mt-1 text-[10px]">{project.category}</p>
            <p className="mt-1.5 text-[11px] leading-snug text-slate-300 line-clamp-2">{project.summary}</p>
          </div>
        </div>
        <div className="code-window mt-2.5 h-[58px]">
          <CodeTicker code={project.code} lines={3} className="px-2 py-1 text-[9.5px] text-slate-200" />
        </div>
        <ViewButton project={project} onOpen={onOpen} className="mt-2.5 w-full text-[12px]" />
      </article>
    )
  }

  return (
    <article
      {...common}
      className={`holo-card ${active ? 'is-active' : ''} flex flex-col p-2.5 text-left`}
      style={{ ...common.style, width: CARD_PX.w, height: CARD_PX.h }}
    >
      <div className="flex h-[92px] gap-2">
        <Preview project={project} className="h-full w-[92px] shrink-0" />
        <div className="code-window min-w-0 flex-1">
          <CodeTicker code={project.code} lines={6} showNumbers={false} delay={index * 400} className="px-1.5 py-1 text-[6.5px] text-slate-200" />
        </div>
      </div>
      <h3 className="card-title mt-2 text-[17px] leading-none">{project.title}</h3>
      <p className="card-cat mt-1 text-[9.5px]">{project.category}</p>
      <ViewButton project={project} onOpen={onOpen} className="mt-auto text-[10px]" />
    </article>
  )
}
