import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { categories, projects, projectsOf } from './data/projects'
import { useIsMobile, useReducedMotion } from './hooks/useMediaQuery'
import { frontBaseAngle } from './three/layout'
import Header from './ui/Header'
import Footer from './ui/Footer'
import NavDock from './ui/NavDock'
import MobileCarousel from './ui/MobileCarousel'
import ProjectModal from './ui/ProjectModal'
import InfoPanel from './ui/InfoPanel'
import ProjectCard from './ui/ProjectCard'
import CategoryCard from './ui/CategoryCard'

const Experience = lazy(() => import('./three/Experience'))

// Tras navegar con flechas/puntos, la órbita espera este tiempo antes de volver a girar sola.
const HOLD_MS = 6000

function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

function Loader() {
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-[#040811]">
      <div className="text-center">
        <div className="loader-ring mx-auto" />
        <p className="mt-4 text-[13px] tracking-[0.4em] text-cyan-300/80">INICIALIZANDO CITY 01</p>
      </div>
    </div>
  )
}

export default function App() {
  const isMobile = useIsMobile()
  const reducedMotion = useReducedMotion()
  const webgl = useMemo(hasWebGL, [])
  const [hovered, setHovered] = useState(null)
  const [selected, setSelected] = useState(null)
  const [section, setSection] = useState(null)
  const [categoryId, setCategoryId] = useState(null)
  const [front, setFront] = useState(0)

  // Lo que orbita: las categorías o, dentro de una, sus proyectos.
  const category = categories.find((c) => c.id === categoryId) ?? null
  const items = useMemo(() => (category ? projectsOf(category) : categories), [category])

  // Estado orbital compartido (mutable, fuera de React) entre la escena 3D y la barra de navegación.
  const orbit = useMemo(() => ({ angle: 0, speed: 1, locked: false, holdUntil: 0 }), [])
  const spin = useRef(null)

  const open = useCallback((id) => {
    setSection(null)
    setHovered(null)
    setSelected(id)
  }, [])
  const close = useCallback(() => setSelected(null), [])
  const navigate = useCallback((id) => {
    setSelected(null)
    setSection(id === 'portfolio' ? null : id)
    if (id === 'portfolio') setCategoryId(null)
  }, [])
  const enterCategory = useCallback((id) => {
    setSelected(null)
    setHovered(null)
    setCategoryId(id)
  }, [])
  const backToCategories = useCallback(() => enterCategory(null), [enterCategory])
  const openContact = useCallback(() => navigate('contact'), [navigate])

  // Al cambiar de nivel, la primera tarjeta arranca al frente.
  useEffect(() => {
    spin.current?.kill()
    orbit.angle = 0
    orbit.locked = false
    setFront(0)
  }, [categoryId, orbit])

  /** Gira la órbita hasta dejar la tarjeta `index` al frente. */
  const rotateTo = useCallback(
    (index) => {
      if (!items.length) return
      spin.current?.kill()
      orbit.locked = true
      orbit.holdUntil = performance.now() + HOLD_MS
      spin.current = gsap.to(orbit, {
        angle: frontBaseAngle(index, items.length, orbit.angle),
        duration: reducedMotion ? 0.01 : 0.7,
        ease: 'power2.inOut',
        onComplete: () => {
          orbit.locked = false
          orbit.holdUntil = performance.now() + HOLD_MS
        },
      })
      setFront(index)
    },
    [items.length, orbit, reducedMotion],
  )
  const step = useCallback((dir) => rotateTo((front + dir + items.length) % items.length), [front, items.length, rotateTo])
  const openItem = useCallback((id) => (category ? open(id) : enterCategory(id)), [category, open, enterCategory])

  // Flechas del teclado: recorren la órbita (escritorio, sin paneles abiertos).
  useEffect(() => {
    if (isMobile || selected || section) return
    const onKey = (e) => {
      if (e.key === 'ArrowRight') step(1)
      else if (e.key === 'ArrowLeft') step(-1)
      else if (e.key === 'Escape' && category) backToCategories()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isMobile, selected, section, step, category, backToCategories])

  const renderCard = useCallback(
    (item, index, active) =>
      category ? (
        <ProjectCard project={item} index={index} active={active} onHover={setHovered} onOpen={open} />
      ) : (
        <CategoryCard category={item} active={active} onHover={setHovered} onOpen={enterCategory} />
      ),
    [category, open, enterCategory],
  )
  const renderMobileCard = useCallback(
    (item, index) =>
      category ? (
        <ProjectCard project={item} variant="mobile" index={index} onOpen={open} />
      ) : (
        <CategoryCard category={item} variant="mobile" onOpen={enterCategory} />
      ),
    [category, open, enterCategory],
  )

  const selectedProject = projects.find((p) => p.id === selected)
  const busy = Boolean(selected || section)

  return (
    <main className="relative h-[100dvh] w-full overflow-hidden bg-[#040811] text-slate-200">
      <h1 className="sr-only">Desarrollador Soria — Software a medida. Portafolio interactivo 3D.</h1>

      {webgl ? (
        <div className="absolute inset-0">
          <Suspense fallback={<Loader />}>
            <Experience
              items={items}
              orbit={orbit}
              isMobile={isMobile}
              hovered={hovered}
              selected={selected}
              renderCard={renderCard}
              onFront={setFront}
              showTitle={!busy}
              onContact={openContact}
              reducedMotion={reducedMotion}
            />
          </Suspense>
        </div>
      ) : (
        <div className="absolute inset-0 overflow-y-auto px-4 pb-16 pt-24">
          <div className="mx-auto grid max-w-3xl gap-8">
            {categories.map((c) => (
              <section key={c.id} className="grid gap-4">
                <h2 className="card-title text-2xl" style={{ '--c': c.color }}>
                  {c.title}
                </h2>
                {projectsOf(c).map((p, i) => (
                  <ProjectCard key={p.id} project={p} variant="mobile" index={i} onOpen={open} />
                ))}
              </section>
            ))}
          </div>
        </div>
      )}

      <div className="vignette pointer-events-none absolute inset-0" />

      <Header isMobile={isMobile} active={section ?? 'portfolio'} onNavigate={navigate} />

      {webgl && isMobile && (
        <MobileCarousel
          key={categoryId ?? 'categorias'}
          items={items}
          category={category}
          renderCard={renderMobileCard}
          onHover={setHovered}
          onBack={backToCategories}
          hidden={busy}
        />
      )}
      {webgl && !isMobile && (
        <NavDock
          items={items}
          category={category}
          front={front}
          hovered={hovered}
          hidden={busy}
          onStep={step}
          onRotateTo={rotateTo}
          onHover={setHovered}
          onOpen={openItem}
          onBack={backToCategories}
        />
      )}

      {selectedProject && (
        <ProjectModal
          key={selectedProject.id}
          project={selectedProject}
          index={projects.indexOf(selectedProject)}
          isMobile={isMobile}
          onClose={close}
        />
      )}
      {section && <InfoPanel section={section} onClose={() => setSection(null)} />}

      <Footer />
    </main>
  )
}
