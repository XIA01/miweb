import { useEffect, useRef, useState } from 'react'
import ProjectCard from './ProjectCard'

/** Carrusel táctil con scroll-snap para móviles, superpuesto sobre la escena. */
export default function MobileCarousel({ projects, onOpen, onHover, hidden }) {
  const track = useRef()
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const el = track.current
    if (!el) return
    const onScroll = () => {
      const w = el.firstElementChild?.getBoundingClientRect().width ?? 1
      setCurrent(Math.round(el.scrollLeft / (w + 12)))
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    onHover(projects[current]?.id ?? null)
  }, [current, projects, onHover])

  const goTo = (i) => {
    const el = track.current
    const w = el.firstElementChild.getBoundingClientRect().width
    el.scrollTo({ left: i * (w + 12), behavior: 'smooth' })
  }

  return (
    <section
      aria-label="Proyectos"
      className={`fixed inset-x-0 bottom-9 z-30 transition-all duration-500 ${hidden ? 'pointer-events-none translate-y-8 opacity-0' : ''}`}
    >
      <div
        ref={track}
        className="carousel flex snap-x snap-mandatory gap-3 overflow-x-auto px-[9vw] pb-3"
      >
        {projects.map((p, i) => (
          <div key={p.id} className="h-[236px] w-[82vw] max-w-[380px] shrink-0 snap-center">
            <ProjectCard project={p} variant="mobile" index={i} onOpen={onOpen} />
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-2">
        {projects.map((p, i) => (
          <button
            key={p.id}
            type="button"
            aria-label={`Ir a ${p.title}`}
            onClick={() => goTo(i)}
            className={`h-1.5 rounded-full transition-all ${i === current ? 'w-6 bg-cyan-300 shadow-[0_0_8px_#22d3ee]' : 'w-1.5 bg-slate-500/60'}`}
          />
        ))}
      </div>
    </section>
  )
}
