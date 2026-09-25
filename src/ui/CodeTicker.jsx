import { useEffect, useState } from 'react'

const TOKEN = /(\/\/.*$|#.*$|'[^']*'|"[^"]*"|`[^`]*`|\b(?:const|let|for|await|async|return|final|def|in|if|new|true|false)\b|\b[a-zA-Z_]\w*(?=\()|\d+(?:\.\d+)?)/gm

function highlight(line) {
  const out = []
  let last = 0
  line.replace(TOKEN, (m, _g, idx) => {
    if (idx > last) out.push(line.slice(last, idx))
    let cls = 'text-cyan-300'
    if (/^(\/\/|#)/.test(m)) cls = 'text-slate-500'
    else if (/^['"`]/.test(m)) cls = 'text-amber-300'
    else if (/^\d/.test(m)) cls = 'text-fuchsia-300'
    else if (/^(const|let|for|await|async|return|final|def|in|if|new|true|false)$/.test(m)) cls = 'text-pink-400'
    out.push(<span key={idx} className={cls}>{m}</span>)
    last = idx + m.length
    return m
  })
  if (last < line.length) out.push(line.slice(last))
  return out
}

/** Visor de código "en tiempo real": tipea el snippet del proyecto y vuelve a empezar. */
export default function CodeTicker({ code, speed = 32, lines, className = '', showNumbers = true, delay = 0 }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    let i = 0
    let pause = 0
    let id
    const start = setTimeout(() => {
      id = setInterval(() => {
        if (i >= code.length) {
          if (++pause > 60) {
            i = 0
            pause = 0
          }
        } else i += 1 + Math.floor(Math.random() * 2)
        setN(Math.min(i, code.length))
      }, speed)
    }, delay)
    return () => {
      clearTimeout(start)
      clearInterval(id)
    }
  }, [code, speed, delay])

  const shown = code.slice(0, n).split('\n')
  const visible = lines ? shown.slice(-lines) : shown
  const offset = shown.length - visible.length
  return (
    <pre className={`font-mono leading-[1.45] whitespace-pre overflow-hidden ${className}`}>
      {visible.map((l, i) => (
        <div key={i + offset} className="flex">
          {showNumbers && <span className="mr-2 w-4 shrink-0 text-right text-slate-600 select-none">{i + offset + 1}</span>}
          <span>
            {highlight(l)}
            {i === visible.length - 1 && <span className="caret">▍</span>}
          </span>
        </div>
      ))}
    </pre>
  )
}
