import { lazy, Suspense, useCallback, useMemo, useState } from 'react'
import { projects } from './data/projects'
import { useIsMobile, useReducedMotion } from './hooks/useMediaQuery'
import Header from './ui/Header'
import Footer from './ui/Footer'
import SideDots from './ui/SideDots'
import MobileCarousel from './ui/MobileCarousel'
import ProjectModal from './ui/ProjectModal'
import InfoPanel from './ui/InfoPanel'
import ProjectCard from './ui/ProjectCard'

const Experience = lazy(() => import('./three/Experience'))

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

  const open = useCallback((id) => {
    setSection(null)
    setHovered(null)
    setSelected(id)
  }, [])
  const close = useCallback(() => setSelected(null), [])
  const navigate = useCallback((id) => {
    setSelected(null)
    setSection(id === 'portfolio' ? null : id)
  }, [])

  const selectedIndex = projects.findIndex((p) => p.id === selected)
  const selectedProject = projects[selectedIndex]

  return (
    <main className="relative h-[100dvh] w-full overflow-hidden bg-[#040811] text-slate-200">
      <h1 className="sr-only">Soria Matias — Developer. Portafolio interactivo 3D.</h1>

      {webgl ? (
        <div className="absolute inset-0">
          <Suspense fallback={<Loader />}>
            <Experience
              projects={projects}
              isMobile={isMobile}
              hovered={hovered}
              selected={selected}
              onHover={setHovered}
              onOpen={open}
              reducedMotion={reducedMotion}
            />
          </Suspense>
        </div>
      ) : (
        <div className="absolute inset-0 overflow-y-auto px-4 pb-16 pt-24">
          <div className="mx-auto grid max-w-3xl gap-4">
            {projects.map((p, i) => (
              <ProjectCard key={p.id} project={p} variant="mobile" index={i} onOpen={open} />
            ))}
          </div>
        </div>
      )}

      <div className="vignette pointer-events-none absolute inset-0" />

      <Header isMobile={isMobile} active={section ?? 'portfolio'} onNavigate={navigate} />

      {webgl && isMobile && (
        <MobileCarousel projects={projects} onOpen={open} onHover={setHovered} hidden={Boolean(selected || section)} />
      )}
      {webgl && !isMobile && (
        <SideDots projects={projects} hovered={hovered} selected={selected} onHover={setHovered} onOpen={open} />
      )}

      {selectedProject && (
        <ProjectModal key={selectedProject.id} project={selectedProject} index={selectedIndex} isMobile={isMobile} onClose={close} />
      )}
      {section && <InfoPanel section={section} onClose={() => setSection(null)} />}

      <Footer />
    </main>
  )
}
