# Pedro Matías Soria
**Desarrollador de software a medida · IA, datos y aplicaciones en tiempo real**
📍 Mar del Plata, Argentina · 🌐 [soriam.vercel.app](https://soriam.vercel.app) · 💻 [github.com/XIA01](https://github.com/XIA01) · 💼 [linkedin.com/in/desarrolladorsoria](https://linkedin.com/in/desarrolladorsoria)
✉️ [99xz01@gmail.com](mailto:99xz01@gmail.com) · WhatsApp desde el botón **Contacto** del portafolio

---

## Perfil

Programo desde 2007 y construyo productos completos de punta a punta: desde la idea y el prototipo
hasta la app publicada, con pagos, usuarios y datos en la nube. En 2015 recibí una distinción municipal
por crear la primera app de seguridad turística de Mar del Plata, y durante diez años trabajé en la
policía haciendo pericias informáticas y análisis forense digital.

Hoy me dedico a desarrollar de forma independiente. Soy un experimentador: pruebo tecnologías nuevas
en proyectos propios —simulación física, visión por computadora, agentes de IA, video en tiempo real—
y llevo lo que funciona a productos que resuelven problemas concretos. Trabajo con asistentes de IA
como parte de mi flujo de desarrollo, lo que me permite entregar rápido sin resignar pruebas ni seguridad.

**Lo que puedo hacer por vos:**
- **Apps y sistemas a medida** para comercios y profesionales: web, PWA instalable o Android.
- **Integraciones con IA:** asistentes, lectura de fotos y documentos, chat con respaldo entre proveedores.
- **Cobros online** con Mercado Pago y login con Google, verificados del lado del servidor.
- **Datos y mapas:** tableros, datos abiertos, geolocalización y simulaciones.
- **Revisión de seguridad y privacidad** de apps existentes (bases de datos expuestas, accesos, datos sensibles).

---

## Proyectos seleccionados

Todos están publicados y funcionando; los links llevan a la versión en vivo.

### Productos en uso

**Vigía Web** — Videovigilancia con celulares viejos y cámaras Wi-Fi, vista desde 4G · [vigiaweb.vercel.app](https://vigiaweb.vercel.app)
- Video directo entre dispositivos (WebRTC) y un puente en Python que publica cámaras Wi-Fi por túneles de Cloudflare, con reconexión automática si el túnel o la cámara se caen.
- Acceso familiar con PIN, reglas de seguridad en Firestore y video protegido con clave privada.
- *WebRTC · PeerJS · Python · Cloudflare Tunnels · Firebase*

**Diario Clínico IA** — Historial médico familiar que lee recetas y órdenes con IA · [diarioclinico.vercel.app](https://diarioclinico.vercel.app)
- Endereza fotos de recetas tomadas en ángulo con un motor de homografía propio en JavaScript (menos de 35 ms).
- Explica diagnósticos en lenguaje simple con Google Gemini; cada usuario ve solo sus datos y la cuota de IA se controla en el servidor.
- *JavaScript · Canvas · Google Gemini · Firebase · Vercel Functions*

**Mi Abuelito** — Seguimiento familiar de glucosa, presión y medicación · [mi-abuelito.vercel.app](https://mi-abuelito.vercel.app)
- App Flutter (Android y web) para que toda la familia cargue mediciones sin crear cuentas; publicada en Amazon Appstore.
- Genera planillas en PDF en formato hospitalario para llevar al médico. Funciona sin conexión y sincroniza al volver.
- *Flutter · Dart · Firebase · PDF*

**PFIA — Penal Federal para Inteligencias Artificiales** — Experiencia web interactiva con IA · [pfia.vercel.app](https://pfia.vercel.app)
- Reclusos que conversan con IA y recuerdan cada visita, con respaldo automático entre proveedores (Gemini, Gemma, Groq) y un motor propio si fallan todos.
- Login con Google y compra de créditos con Mercado Pago, acreditados una sola vez en el servidor aunque el pago llegue por webhook.
- *Next.js · Firebase · Gemini · Groq · Mercado Pago · Web Audio*

**Lazo Cuántico** — Pasar enlaces, notas y archivos entre PC y celular sin iniciar sesión · [lazocuantico.netlify.app](https://lazocuantico.netlify.app)
- Emparejamiento con código temporal o QR; la conexión se destruye al terminar la transferencia.

### Mar del Plata

**WiFi MDP** — Encontrar WiFi público gratuito incluso sin datos móviles · [wifimdp.vercel.app](https://wifimdp.vercel.app)
- Funciona completamente sin conexión (PWA) y guía con GPS y brújula hasta la antena más cercana, usando el dataset oficial de la Municipalidad.

**Guía MDP** — Qué hacer y dónde comer · [guiamdp.vercel.app](https://guiamdp.vercel.app)
- 940 lugares revisados (803 gastronómicos, incluidos Sin TACC, y 140 actividades), filtro "cerca mío" y dirección lista para pegar en Uber o Didi.

**MDP Data Engine** — Datos abiertos de la ciudad listos para apps y agentes de IA · [estado de la API](https://mdp-data-engine.vercel.app/api/v1/status)
- Relevamiento de los 424 conjuntos de datos de datos.mardelplata.gob.ar, corrección de codificación en 51 capas geográficas y más de 209.000 geometrías indexadas (paradas, semáforos, salud, infraestructura).
- *Python · FastAPI · PostgreSQL · GeoJSON · MCP*

### Investigación y experimentación

**MDP Disaster Engine** — Simulador de tsunamis para Mar del Plata · [mdpdisaster.vercel.app](https://mdpdisaster.vercel.app)
- Gemelo digital de la ciudad con terreno real, edificios de OpenStreetMap, batimetría NOAA y población del censo INDEC 2022; estima daño, exposición y evacuación peatonal.
- Modelo regional del Atlántico Sur contrastado con el tsunami real de las Islas Sandwich del Sur (2021) en 8 mareógrafos del IOC. Simulación determinista y reproducible, con pruebas automatizadas.
- *TypeScript · React · Vite · MapLibre (mapa 3D) · Web Workers · modelos de aguas someras*

**Cerejax** — Simulación del control motor humano
- Plataforma de simulación neuro-biomecánica que combina modelos de neuronas en GPU (JAX) con física de cuerpos (MuJoCo), avanzando por hitos con criterios numéricos verificables y experimentos preregistrados.
- *Python · JAX · MuJoCo*

**AINS** — Framework para empresas operadas por agentes de IA
- Orquestación de agentes (LangGraph), modelos de visión y generación de imágenes locales en GPU, aprobación humana de decisiones y publicación en MercadoLibre, con registro auditable de cada acción. Probado con una tienda de stickers de prueba.
- *Python · LangGraph · Docker · PostgreSQL · Redis · Next.js*

**Otros prototipos:** avatares 3D conversacionales con sincronización de labios, agentes de prospección comercial, pipelines de fotos de producto con IA generativa y arquitecturas neuronales experimentales.

---

## Experiencia

**Desarrollador independiente** · 2023 – actualidad · Mar del Plata
- Desarrollo y publicación de los productos de arriba, con foco en costo de infraestructura mínimo (planes gratuitos de Vercel, Firebase y Cloudflare) y en proteger los datos de los usuarios.

**Policía de la Provincia de Buenos Aires / Policía Local** · 2012 – 2023 · Mar del Plata
- Pericias informáticas y análisis forense de dispositivos móviles: extracción, preservación de evidencia, cadena de custodia e informes técnicos para fiscalías y juzgados.
- **2015 — Distinción municipal** por crear la primera app Android de seguridad turística de Mar del Plata, presentada en el Centro de Operaciones y Monitoreo junto al Ente de Turismo ([nota oficial](https://www.mardelplata.gob.ar/Noticias/mar-del-plata-cuenta-con-herramienta-de-innovacion-para-la-seguridad-del-visitante)).

**Plataforma de streaming de video** (emprendimiento propio) · 2007 – 2010
- Desarrollo y operación de una de las primeras plataformas de streaming de la región, con picos de 2.000 visitas diarias.

---

## Tecnologías

- **Web y mobile:** JavaScript/TypeScript, React, Next.js, Vite, Tailwind, PWA, Flutter (Dart), Three.js, MapLibre, Leaflet.
- **Backend y nube:** Node.js, Python (FastAPI), Firebase (Firestore, Auth), PostgreSQL, Redis, Docker, Vercel, Cloudflare.
- **IA:** Google Gemini/Gemma, Groq, Claude, Vertex AI, LangGraph, modelos locales (Ollama), visión por computadora.
- **Tiempo real y hardware:** WebRTC, RTSP/MJPEG, GPS, sensores del teléfono.
- **Pagos y seguridad:** Mercado Pago (Checkout Pro, webhooks firmados), reglas de seguridad de Firestore, análisis forense digital.

---

## Formación

- **Ingeniería en Informática** — Universidad Nacional de Mar del Plata (en curso)
- **Tecnicatura Universitaria en Protección de Datos** — Facultad de Derecho, UNMDP (en curso)

---
*Septiembre 2026 · Mar del Plata, Argentina*
