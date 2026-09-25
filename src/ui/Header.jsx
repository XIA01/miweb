import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Logo } from './icons'
import { profile } from '../data/projects'

export const NAV = [
  { id: 'portfolio', label: 'PORTFOLIO' },
  { id: 'services', label: 'SERVICES' },
  { id: 'about', label: 'ABOUT' },
  { id: 'contact', label: 'CONTACT' },
]

function Profile({ compact }) {
  const [broken, setBroken] = useState(false)
  return (
    <a href={profile.github} target="_blank" rel="noreferrer" className="flex items-center gap-3">
      <span className="avatar-ring grid h-11 w-11 place-items-center overflow-hidden rounded-full">
        {broken ? (
          <span className="text-sm font-bold text-cyan-200">SM</span>
        ) : (
          <img src={profile.avatar} alt={profile.name} className="h-full w-full object-cover" onError={() => setBroken(true)} />
        )}
      </span>
      {!compact && (
        <span className="leading-tight">
          <span className="block text-[17px] font-semibold text-white">{profile.name}</span>
          <span className="block text-[11px] tracking-[0.2em] text-slate-400">{profile.role}</span>
        </span>
      )}
    </a>
  )
}

export default function Header({ isMobile, active, onNavigate }) {
  const [open, setOpen] = useState(false)
  const go = (id) => {
    setOpen(false)
    onNavigate(id)
  }

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex items-center justify-between px-4 py-4 sm:px-8 sm:py-6">
      <div className="pointer-events-auto flex items-center gap-6 lg:gap-10">
        {isMobile ? (
          <button
            type="button"
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className="glass grid h-11 w-11 place-items-center rounded-lg text-cyan-300"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        ) : (
          <button type="button" onClick={() => go('portfolio')} aria-label="Inicio" className="text-cyan-300">
            <Logo className="h-9 w-9 drop-shadow-[0_0_8px_rgba(34,211,238,.8)]" />
          </button>
        )}
        {!isMobile && (
          <nav className="flex items-center gap-7 lg:gap-9">
            {NAV.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => go(n.id)}
                className={`nav-link text-[17px] font-semibold tracking-[0.08em] ${active === n.id ? 'is-active' : ''}`}
              >
                {n.label}
              </button>
            ))}
          </nav>
        )}
      </div>

      <div className="pointer-events-auto">
        <Profile compact={isMobile} />
      </div>

      {isMobile && open && (
        <nav className="glass pointer-events-auto absolute left-4 top-[72px] w-[min(78vw,280px)] rounded-xl p-2 menu-pop">
          {NAV.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => go(n.id)}
              className={`block w-full rounded-lg px-4 py-3 text-left text-[16px] font-semibold tracking-[0.1em] ${
                active === n.id ? 'bg-cyan-400/10 text-cyan-300' : 'text-slate-300'
              }`}
            >
              {n.label}
            </button>
          ))}
        </nav>
      )}
    </header>
  )
}
