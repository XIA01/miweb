// Proyectos reales publicados en el portafolio (misma fuente que clasico.html y el CV).
// El orden define la posición inicial en la órbita (el primero arranca al frente).

export const projects = [
  {
    id: 'vigia',
    title: 'VIGÍA WEB',
    category: 'Videovigilancia P2P · WebRTC',
    icon: 'cctv',
    color: '#22d3ee',
    summary:
      'Sistema de videovigilancia distribuida que reutiliza celulares en desuso como cámaras, sin servidores intermedios.',
    highlights: [
      'Streaming WebRTC P2P puro con PeerJS: el video viaja directo entre dispositivos.',
      'Demonio Python con Cloudflare Quick Tunnels: expone cámaras RTSP/HTTP a HTTPS sin abrir puertos.',
      'Detección de movimiento por Canvas cuadro a cuadro con umbral dinámico y alarmas.',
      'Conectores híbridos .bat/Python para Windows y Android (Termux) sincronizados con Firestore.',
    ],
    stack: ['WebRTC', 'PeerJS', 'Python', 'Cloudflare Tunnels', 'Canvas API', 'Firebase'],
    live: 'https://vigiaweb.vercel.app',
    repo: 'https://github.com/XIA01/vigia',
    code: `const call = peer.call(camId, localStream);
call.on('stream', (remote) => {
  video.srcObject = remote;
  motion.watch(video, { threshold: 0.18 });
});
motion.on('alert', () => siren.play());`,
  },
  {
    id: 'diario',
    title: 'DIARIO CLÍNICO IA',
    category: 'Computer Vision · IA Médica',
    icon: 'scan',
    color: '#a78bfa',
    summary:
      'Digitalizador médico familiar: endereza fotos de recetas con homografía proyectiva propia y las explica con IA.',
    highlights: [
      'Motor de homografía proyectiva 2D en JS puro (Heckbert + bilinear) en menos de 35 ms.',
      'Malla táctil con 4 anclajes magnéticos y lupa flotante 2.5x.',
      'Asistente clínico con Google Gemini: diagnósticos en lenguaje simple y preguntas para el médico.',
      'Auto-borrador en segundo plano tolerante al cierre de pestañas.',
    ],
    stack: ['JavaScript', 'Canvas', 'Homografía 2D', 'Google Gemini', 'PWA'],
    live: 'https://diarioclinico.vercel.app',
    repo: 'https://github.com/XIA01/diarioclinico',
    code: `const H = homography(corners, target);
for (let y = 0; y < h; y++)
  for (let x = 0; x < w; x++) {
    const [u, v] = project(H, x, y);
    out.set(x, y, bilinear(src, u, v));
  }`,
  },
  {
    id: 'wifimdp',
    title: 'WIFI MDP',
    category: 'PWA Offline-First · GPS',
    icon: 'radar',
    color: '#34d399',
    summary:
      'Radar táctico y brújula HUD para encontrar WiFi gratuito en Mar del Plata incluso sin datos móviles.',
    highlights: [
      'PWA 100% offline: Service Workers guardan la app y la base de datos en el teléfono.',
      'Navegación por GPS satelital puro con Haversine y Bearing en tiempo real.',
      'Brújula táctica con DeviceOrientation API (giroscopio y magnetómetro).',
      'Dataset oficial Conexión MGP sobre OpenStreetMap nocturno.',
    ],
    stack: ['PWA', 'Service Workers', 'Geolocation', 'Leaflet.js', 'OpenStreetMap'],
    live: 'https://wifimdp.vercel.app',
    repo: 'https://github.com/XIA01/wifimdp',
    code: `const d = haversine(me, antenna);
const brg = bearing(me, antenna);
compass.rotate(brg - heading);
hud.show(\`\${d.toFixed(0)} m · \${brg}°\`);`,
  },
  {
    id: 'guiamdp',
    title: 'GUÍA MDP',
    category: 'Turismo · Geolocalización',
    icon: 'pin',
    color: '#38bdf8',
    summary:
      'Guía visual de Mar del Plata con 940 puntos auditados y destino listo para pegar en Uber o Didi.',
    highlights: [
      '1-click: formatea la dirección exacta y la copia al portapapeles para apps de movilidad.',
      '140 actividades recreativas y 803 locales gastronómicos auditados (incluye Sin TACC).',
      'Filtro "Cerca Mío" con distancia esférica Haversine en tiempo real.',
      'Carga instantánea offline-first con Service Workers.',
    ],
    stack: ['PWA', 'JavaScript', 'Geolocation', 'Clipboard API', 'Tailwind'],
    live: 'https://guiamdp.vercel.app',
    repo: 'https://github.com/XIA01/guiamdp',
    code: `const dest = \`\${calle} \${altura}, \${barrio}, Mar del Plata\`;
await navigator.clipboard.writeText(dest);
toast('Destino copiado · pegalo en Uber');
spots.sort((a, b) => dist(a) - dist(b));`,
  },
  {
    id: 'mdpdata',
    title: 'MDP DATA ENGINE',
    category: 'Datos Cívicos · GIS · MCP',
    icon: 'database',
    color: '#c084fc',
    summary:
      'Infraestructura privada de datos urbanos: auditoría, normalización geoespacial y contexto para agentes IA.',
    highlights: [
      'Crawler concurrente sobre 424 conjuntos de datos de datos.mardelplata.gob.ar.',
      'Normalización Latin-1 → UTF-8 estricto en 51 capas GeoJSON.',
      '209.000+ geometrías indexadas: paradas, semáforos, radares, salud e infraestructura.',
      'Capa de contexto para agentes vía Model Context Protocol (MCP) y API REST.',
    ],
    stack: ['Python', 'FastAPI', 'GeoJSON', 'PostgreSQL', 'MCP'],
    live: 'https://mdp-data-engine.vercel.app/api/v1/status',
    liveLabel: 'Estado de la API',
    repo: null,
    code: `for ds in catalog.crawl(concurrency=16):
    layer = geo.load(ds, fix_encoding=True)
    index.upsert(layer.features)
mcp.expose("mdp.context", index)`,
  },
  {
    id: 'abuelito',
    title: 'MI ABUELITO',
    category: 'Flutter 3 · Salud Familiar',
    icon: 'heart',
    color: '#60a5fa',
    summary:
      'App colaborativa para que la familia registre signos vitales y genere planillas médicas en PDF.',
    highlights: [
      'Multiplataforma con Flutter 3 y sincronización en tiempo real con Firestore.',
      'Sin logins tediosos: pensada para adultos mayores.',
      'Exportación vectorial de planillas de glucosa, presión y medicación en formato hospitalario.',
    ],
    stack: ['Flutter 3', 'Dart', 'Firebase', 'PDF'],
    live: 'https://mi-abuelito.netlify.app',
    repo: 'https://github.com/XIA01/mi-abuelito',
    code: `final pdf = pw.Document();
pdf.addPage(vitalsSheet(readings));
await Printing.sharePdf(
  bytes: await pdf.save(),
  filename: 'planilla.pdf');`,
  },
  {
    id: 'lazo',
    title: 'LAZO CUÁNTICO',
    category: 'Transferencia Efímera · Zero-Trace',
    icon: 'atom',
    color: '#fbbf24',
    summary:
      'Transferí enlaces, notas y archivos entre PC y celular con un código de 4 dígitos que se autodestruye.',
    highlights: [
      'Emparejamiento efímero por código temporal de 4 dígitos o QR instantáneo.',
      'Autodestrucción inmediata tras la transferencia.',
      'Evita iniciar sesión en WhatsApp Web o Gmail en computadoras ajenas.',
    ],
    stack: ['JavaScript', 'Realtime', 'QR', 'Netlify'],
    live: 'https://lazocuantico.netlify.app',
    repo: 'https://github.com/XIA01/orion',
    code: `const code = pairing.create({ ttl: 90 });
qr.render(code);
link.on('payload', (p) => {
  deliver(p);
  pairing.destroy(code);
});`,
  },
]

export const profile = {
  name: 'Soria Matias',
  role: 'DEVELOPER',
  fullName: 'Pedro Matías Soria',
  location: 'Mar del Plata, Argentina',
  avatar: 'https://github.com/XIA01.png?size=120',
  github: 'https://github.com/XIA01',
  linkedin: 'https://linkedin.com/in/desarrolladorsoria',
}

export const services = [
  {
    title: 'Apps Móviles & PWAs',
    text: 'Aplicaciones instalables, rápidas y offline-first con Service Workers o Flutter 3.',
  },
  {
    title: 'Sistemas en la Nube',
    text: 'Arquitecturas serverless y P2P de costo mínimo: WebRTC, Cloudflare, Firebase, Vercel.',
  },
  {
    title: 'Visión Artificial & IA',
    text: 'Computer vision en el navegador, asistentes con Gemini y agentes con LangGraph.',
  },
  {
    title: 'Herramientas a Medida',
    text: 'Automatizaciones, scrapers, APIs REST con FastAPI y pipelines de datos geoespaciales.',
  },
]
