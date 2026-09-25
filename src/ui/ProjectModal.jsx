import { useEffect, useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { GithubIcon, ProjectIcon } from './icons'

/** Panel futurista con el detalle del proyecto. Entra con GSAP tras el viaje de cámara. */
export default function ProjectModal({ project, index, isMobile, onClose }) {
  const panel = useRef()

  useLayoutEffect(() => {
    const el = panel.current
    const items = el.querySelectorAll('[data-reveal]')
    const tl = gsap.timeline({ delay: isMobile ? 0.5 : 0.9 })
    tl.fromTo(
      el,
      isMobile ? { yPercent: 100, opacity: 0 } : { x: 60, opacity: 0, clipPath: 'inset(0 0 100% 0)' },
      isMobile
        ? { yPercent: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }
        : { x: 0, opacity: 1, clipPath: 'inset(0 0 0% 0)', duration: 0.8, ease: 'power3.out' },
    ).fromTo(items, { y: 14, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.06, duration: 0.45, ease: 'power2.out' }, '-=0.35')
    return () => tl.kill()
  }, [project.id, isMobile])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <aside
      ref={panel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-title"
      style={{ '--c': project.color, opacity: 0 }}
      className={
        isMobile
          ? 'holo-panel fixed inset-x-0 bottom-0 z-[60] max-h-[62vh] overflow-y-auto rounded-t-2xl p-5 pb-8'
          : 'holo-panel fixed right-[4vw] top-1/2 z-[60] max-h-[78vh] w-[min(460px,40vw)] -translate-y-1/2 overflow-y-auto rounded-2xl p-7'
      }
    >
      <button type="button" onClick={onClose} className="back-btn mb-5 flex items-center gap-2 text-[13px] font-semibold tracking-[0.18em]" data-reveal>
        <ArrowLeft size={16} /> VOLVER A LA CIUDAD
      </button>

      <div className="flex items-start gap-4" data-reveal>
        <div className="holo-icon-sm grid h-14 w-14 shrink-0 place-items-center rounded-xl">
          <ProjectIcon name={project.icon} size={28} strokeWidth={1.4} />
        </div>
        <div>
          <p className="text-[11px] tracking-[0.25em] text-slate-400">PROYECTO {String(index + 1).padStart(2, '0')}</p>
          <h2 id="project-title" className="card-title text-3xl leading-none">{project.title}</h2>
          <p className="card-cat mt-1 text-[13px]">{project.category}</p>
        </div>
      </div>

      <p className="mt-5 text-[15px] leading-relaxed text-slate-200" data-reveal>{project.summary}</p>

      <h3 className="section-label mt-6" data-reveal>// DETALLES TÉCNICOS</h3>
      <ul className="mt-2 space-y-2">
        {project.highlights.map((h) => (
          <li key={h} className="flex gap-2 text-[14px] leading-snug text-slate-300" data-reveal>
            <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rotate-45 bg-[var(--c)] shadow-[0_0_6px_var(--c)]" />
            {h}
          </li>
        ))}
      </ul>

      <h3 className="section-label mt-6" data-reveal>// STACK</h3>
      <div className="mt-2 flex flex-wrap gap-2" data-reveal>
        {project.stack.map((s) => (
          <span key={s} className="chip">{s}</span>
        ))}
      </div>

      <div className="mt-7 flex flex-wrap gap-3" data-reveal>
        <a href={project.live} target="_blank" rel="noreferrer" className="view-btn flex items-center gap-2 rounded-lg px-5 py-2.5 text-[13px] font-bold tracking-[0.12em] text-[#031018]">
          <ExternalLink size={16} /> {project.liveLabel?.toUpperCase() ?? 'VER EN VIVO'}
        </a>
        {project.repo ? (
          <a href={project.repo} target="_blank" rel="noreferrer" className="ghost-btn flex items-center gap-2 rounded-lg px-5 py-2.5 text-[13px] font-semibold tracking-[0.12em]">
            <GithubIcon className="h-4 w-4" /> CÓDIGO
          </a>
        ) : (
          <span className="ghost-btn flex items-center rounded-lg px-4 py-2.5 text-[12px] tracking-[0.1em] opacity-70">INFRAESTRUCTURA PRIVADA</span>
        )}
      </div>
    </aside>
  )
}
