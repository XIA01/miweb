import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ExternalLink, Mail, MessageCircle, X } from 'lucide-react'
import { GithubIcon } from './icons'
import { profile, services } from '../data/projects'

// Contacto protegido contra scrapers: se reconstruye sólo al hacer click (igual que la versión clásica).
const _p = ['NTQ5', 'MjIzNTQ4OTQ3Ng==']
const _m = ['OTl4ejAz', 'QGdtYWlsLmNvbQ==']
const openWhatsApp = () => {
  const msg = encodeURIComponent('Hola Pedro! Vi tu portafolio 3D y me gustaría consultarte por un proyecto.')
  window.open(`https://wa.me/${atob(_p.join(''))}?text=${msg}`, '_blank')
}
const openMail = () => {
  window.location.href = `mailto:${atob(_m.join(''))}?subject=${encodeURIComponent('Consulta sobre proyecto de software')}`
}

function Services() {
  return (
    <>
      <h2 className="card-title text-3xl">SERVICES</h2>
      <p className="mt-2 text-slate-300">Software a medida, rápido y con costo de infraestructura mínimo.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {services.map((s) => (
          <div key={s.title} className="rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-4" data-reveal>
            <h3 className="text-[17px] font-bold text-cyan-200">{s.title}</h3>
            <p className="mt-1 text-[14px] leading-snug text-slate-300">{s.text}</p>
          </div>
        ))}
      </div>
    </>
  )
}

function About() {
  return (
    <>
      <h2 className="card-title text-3xl">ABOUT</h2>
      <p className="card-cat mt-1">{profile.fullName} · {profile.location}</p>
      <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-slate-300">
        <p data-reveal>
          Desarrollador con más de 10 años construyendo productos reales: arquitecturas web distribuidas, WebRTC P2P,
          visión por computadora en el cliente y PWAs 100% offline-first con costo de infraestructura cercano a cero.
        </p>
        <p data-reveal>
          Una década en seguridad pública y pericias forenses digitales (2012–2023) me dio una mirada única sobre
          trazabilidad, privacidad de datos y resiliencia. Estudio Ingeniería en Informática y la Tecnicatura en
          Protección de Datos en la UNMDP.
        </p>
        <div data-reveal className="mt-4 rounded-xl border border-amber-400/25 bg-amber-400/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base">🏆</span>
              <span className="text-[12px] font-bold uppercase tracking-wider text-amber-300">
                Reconocimiento Municipal Oficial (2015)
              </span>
            </div>
            <p className="mt-1 text-[13px] text-slate-300 leading-snug">
              Diploma de Honor por crear la primera app móvil de seguridad turística de Mar del Plata, presentada en el COM.
            </p>
          </div>
          <a
            href="https://www.mardelplata.gob.ar/Noticias/mar-del-plata-cuenta-con-herramienta-de-innovacion-para-la-seguridad-del-visitante"
            target="_blank"
            rel="noreferrer"
            className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-amber-400/30 bg-amber-400/10 hover:bg-amber-400/20 px-3 py-1.5 text-[12px] font-semibold text-amber-200 transition"
          >
            <span>Ver Nota Oficial</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </div>
    </>
  )
}

function Contact() {
  return (
    <>
      <h2 className="card-title text-3xl">CONTACT</h2>
      <p className="mt-2 text-slate-300">Respondo generalmente en el día. Presupuestos claros y sin compromiso.</p>
      <div className="mt-5 grid gap-3">
        <button type="button" onClick={openWhatsApp} className="view-btn flex items-center justify-center gap-2 rounded-lg px-5 py-3 font-bold tracking-[0.12em] text-[#031018]" data-reveal>
          <MessageCircle size={18} /> WHATSAPP
        </button>
        <button type="button" onClick={openMail} className="ghost-btn flex items-center justify-center gap-2 rounded-lg px-5 py-3 font-semibold tracking-[0.12em]" data-reveal>
          <Mail size={18} /> EMAIL
        </button>
        <div className="flex gap-3" data-reveal>
          <a href={profile.github} target="_blank" rel="noreferrer" className="ghost-btn flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-[14px] tracking-[0.1em]">
            <GithubIcon className="h-4 w-4" /> GITHUB
          </a>
          <a href={profile.linkedin} target="_blank" rel="noreferrer" className="ghost-btn flex flex-1 items-center justify-center rounded-lg px-4 py-3 text-[14px] tracking-[0.1em]">
            LINKEDIN
          </a>
        </div>
      </div>
    </>
  )
}

const CONTENT = { services: Services, about: About, contact: Contact }

export default function InfoPanel({ section, onClose }) {
  const ref = useRef()
  const Body = CONTENT[section]
  useLayoutEffect(() => {
    const tl = gsap.timeline()
    tl.fromTo(ref.current, { opacity: 0, y: 24, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power3.out' })
      .fromTo(ref.current.querySelectorAll('[data-reveal]'), { opacity: 0, y: 10 }, { opacity: 1, y: 0, stagger: 0.06, duration: 0.35 }, '-=0.2')
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      tl.kill()
      window.removeEventListener('keydown', onKey)
    }
  }, [section, onClose])
  if (!Body) return null
  return (
    <div className="fixed inset-0 z-[55] grid place-items-center bg-[#02060d]/55 p-4 backdrop-blur-[2px]" onClick={onClose}>
      <section
        ref={ref}
        role="dialog"
        aria-modal="true"
        className="holo-panel relative max-h-[82vh] w-[min(640px,100%)] overflow-y-auto rounded-2xl p-6 sm:p-8"
        style={{ '--c': '#22d3ee' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" onClick={onClose} aria-label="Cerrar" className="absolute right-4 top-4 text-slate-400 hover:text-cyan-300">
          <X size={22} />
        </button>
        <Body />
      </section>
    </div>
  )
}
