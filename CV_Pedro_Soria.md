# Pedro Matías Soria
**Desarrollador de Software & Creador de Productos Digitales**  
📍 Mar del Plata, Argentina  
🌐 **Portafolio en Vivo:** [soriam.vercel.app](https://soriam.vercel.app)  
💻 **GitHub:** [github.com/XIA01](https://github.com/XIA01)  
💼 **LinkedIn:** [linkedin.com/in/desarrolladorsoria](https://linkedin.com/in/desarrolladorsoria)  
✉️ Contacto directo disponible en portafolio (protegido contra scrapers)

---

## Perfil Profesional

Desarrollador con más de 10 años de experiencia construyendo productos tecnológicos reales, rápidos y a medida. Especializado en arquitecturas web distribuidas, WebRTC Peer-to-Peer, visión por computadora en el cliente, Progressive Web Apps (PWA) 100% offline-first y automatización eficiente de bajo costo ($0 en infraestructura).

Combino una década de servicio en seguridad pública y pericias forenses digitales (**ex-policía, 2012–2023**) con formación universitaria en **Ingeniería en Informática (UNMDP)**, lo que me otorga una perspectiva única sobre trazabilidad legal, privacidad de datos, resiliencia operativa y robustez ante fallos. Desarrollador activo de soluciones cívicas de código abierto sobre datos abiertos municipales.

---

## 🏆 Distinción Oficial & Reconocimientos

* **Diploma de Honor Municipal — Creador de la 1° App Móvil de Seguridad Turística (Diciembre 2015)**  
  Desarrollé y presenté la primera aplicación móvil para la Policía Local y el Ente de Turismo de Mar del Plata (plataforma Android), presentada oficialmente en el Centro de Operaciones y Monitoreo (COM). Distinguido con Diploma de Reconocimiento por el Jefe de la Policía Local (Fernando Telpuk) y el Presidente de Turismo Mar del Plata (Emiliano Giri).  
  🔗 **Publicación Oficial Verificable:** [mardelplata.gob.ar — Nota Municipal](https://www.mardelplata.gob.ar/Noticias/mar-del-plata-cuenta-con-herramienta-de-innovacion-para-la-seguridad-del-visitante)

---

## 🚀 Productos en Producción (Software Real en Uso)

### 1. Vigía Web (v5.9) — Sistema de Videovigilancia P2P & Cloudflare
*Plataforma de seguridad hogareña distribuida para reutilizar celulares en desuso como cámaras de vigilancia.*  
🌐 **En Vivo:** [vigiaweb.vercel.app](https://vigiaweb.vercel.app) | 💻 **Repo:** [github.com/XIA01/vigia](https://github.com/XIA01/vigia)
* **Streaming WebRTC P2P puro (PeerJS):** El video viaja directamente entre dispositivos sin tocar servidores ni consumir ancho de banda de terceros.
* **Túneles Cloudflare Quick Tunnels:** Demonio Python en segundo plano que auto-descarga `cloudflared` y expone cámaras RTSP/HTTP locales a HTTPS público sin cuentas ni apertura de puertos NAT.
* **Detección de Movimiento por Canvas:** Procesamiento cuadro a cuadro en el navegador con umbral dinámico, alarmas sonoras sincronizadas y notificaciones.
* **Conectores Híbridos Multiplataforma:** Script autoejecutable híbrido `.bat`/Python para Windows y cliente Python para Android (Termux) sincronizados en tiempo real mediante Firebase Firestore.
* **Bento Grid & Pantalla Completa:** Modal cinematográfico táctil propio con control de linterna remota, captura de fotos y audio bidireccional.

### 2. Diario Clínico IA — Digitalizador Médico con Homografía Proyectiva & Asistente IA
*Plataforma médica familiar para terminar con las órdenes perdidas y el olvido de indicaciones.*  
🌐 **En Vivo:** [diario-clinico.netlify.app](https://diario-clinico.netlify.app) | 💻 **Repo:** [github.com/XIA01/diarioclinico](https://github.com/XIA01/diarioclinico)
* **Computer Vision en JS Puro (Zero-Dependencies):** Motor matemático de homografía proyectiva 2D (algoritmo de Paul Heckbert con interpolación bilineal pixel a pixel) que endereza fotos de recetas tomadas en ángulo oblicuo a 90°, recorta fondos y blanquea el papel en <35 ms sin WebAssembly pesado.
* **Malla Táctil con Lupa Flotante 2.5x:** 4 anclajes magnéticos arrastrables con zoom dinámico para ajuste milimétrico sobre el dedo.
* **Asistente Clínico Inteligente:** Integración con Google Gemini para traducción de diagnósticos a lenguaje simple, preguntas sugeridas para el doctor y persistencia en caché local.
* **Resiliencia Móvil:** Sistema de auto-borrador en segundo plano tolerante al cierre accidental de pestañas del sistema operativo.

### 3. WiFi MDP — Radar de Conexión Libre (Servicios Mar del Plata)
*Radar táctico, brújula satelital y mapa de puntos de WiFi gratuito en Mar del Plata.*  
🌐 **En Vivo:** [wifimdp.vercel.app](https://wifimdp.vercel.app) | 💻 **Repo:** [github.com/XIA01/wifimdp](https://github.com/XIA01/wifimdp)
* **PWA 100% Offline-First:** Resuelve la paradoja de buscar internet cuando ya no se tienen datos móviles. Service Workers almacenan toda la app y la base de datos en la memoria local del teléfono.
* **Navegación por GPS Satelital Puro:** El receptor GPS satelital del celular funciona sin chip ni datos. Cálculos de navegación matemática (Haversine & Bearing) en tiempo real para determinar rumbo y distancia exacta a la antena más cercana.
* **Brújula Táctica HUD:** Orientación física mediante DeviceOrientation API (giroscopio y compás magnético).
* **Datos Abiertos:** Integración del dataset oficial de Conexión MGP (Municipalidad de General Pueyrredon) con mapeo sobre OpenStreetMap nocturno táctico.

### 4. MDP Data Engine — Motor Cívico de Datos Abiertos & GIS (Mar del Plata)
*Infraestructura de datos cívicos, auditoría automatizada y pipeline geoespacial para la información pública del Municipio de General Pueyrredon.*  
💻 **Repo:** [github.com/XIA01/mdp-data-engine](https://github.com/XIA01/mdp-data-engine)
* **Auditoría Integral del Catálogo:** Crawler concurrente sobre los 424 conjuntos de datos únicos de `datos.mardelplata.gob.ar` con semáforo de recencia y análisis de formatos (1.866 CSV, 467 PDF).
* **Pipeline de Normalización Geoespacial UTF-8:** Descarga y corrección automática de codificación `Latin-1 / CP1252` a `UTF-8` estricto en 51 capas vectoriales (GeoJSON).
* **209.000+ Geometrías e Incidentes Urbanos:** Indexación limpia de 10.081 paradas de colectivo, 1.335 semáforos, cinemómetros/radares viales, redes de infraestructura y establecimientos de salud.
* **Incidencia en Transparencia Pública:** Elaboración del Informe Técnico de Calidad MGP 2026 y solicitud formal de credenciales para el Web Service GIS municipal (`ws.php`).

### 5. Mi Abuelito — Control de Salud Familiar & Planilla Médica Digital
*Aplicación móvil y web colaborativa para el seguimiento familiar de signos vitales.*  
🌐 **En Vivo:** [mi-abuelito.netlify.app](https://mi-abuelito.netlify.app) | 💻 **Repo:** [github.com/XIA01/mi-abuelito](https://github.com/XIA01/mi-abuelito)
* **Multiplataforma Flutter 3:** Construida con Flutter y sincronizada en tiempo real mediante Firebase Firestore sin necesidad de logins tediosos para adultos mayores.
* **Exportación Médica en PDF:** Motor de maquetación vectorial para generar y compartir planillas clínicas imprimibles de glucosa, presión y medicación en formato hospitalario.

### 6. Lazo Cuántico (Orion) — Transferencia Efímera Zero-Trace
*Herramienta instantánea para transferir enlaces, notas y archivos entre PC y celular sin sesiones personales.*  
🌐 **En Vivo:** [lazocuantico.netlify.app](https://lazocuantico.netlify.app) | 💻 **Repo:** [github.com/XIA01/orion](https://github.com/XIA01/orion)
* **Emparejamiento Efímero:** Basado en códigos temporales de 4 dígitos o QR instantáneo con autodestrucción inmediata.
* **Privacidad Total:** Evita tener que iniciar sesión en WhatsApp Web o Gmail en computadoras ajenas o de trabajo.

### 7. AINS Framework — Infraestructura de Sociedades Automatizadas (2025–2026)
*Infraestructura de software para despliegue de organizaciones y toma de decisiones operadas por IA.*
* Arquitectura 3 capas con aislamiento multi-tenant por instancia (Docker + PostgreSQL).
* **Libro Diario Criptográfico:** Árbol de Merkle con firma RSA-PSS 4096-bit y sellado forense.
* Sistema de consenso Multi-Critic (Conservador + Pragmático + Abogado del Diablo) con rollback transaccional y Prompt Vault AES-256-GCM.

---

## 🧪 Investigación, Experimentación & Prototipos de IA
*Prototipos técnicos desarrollados para explorar límites de arquitecturas generativas y agentes autónomos:*

* **FotoRopa AI:** Pipeline experimental con Vertex AI (Gemini Flash, Imagen 3, Virtual Try-On, Veo Fast) y Cloud Tasks para conversión automatizada de fotos de prendas en campañas comerciales.
* **Prospector AI:** Agente autónomo B2B implementado sobre grafos de estado en LangGraph (8 nodos), outreach multi-canal y monitoreo de eventos IMAP en tiempo real.
* **Proyecto Calamar:** Investigación en arquitecturas neuronales alternativas (HyperNetworks, Dynamic GNNs, LPPN e inferencia multimodal con ImageBind).
* **Pareja Virtual / VRM Real-Time:** Prototipo de agentes conversacionales Swarm con avatares 3D VRM interactivos, animación a 60 FPS y lip-sync sincronizado a baja latencia.

---

## 💼 Trayectoria Laboral

### Desarrollador de Software Independiente & Consultor
**2023 – Actualidad | Mar del Plata, Argentina**
* Diseño y desarrollo de soluciones web a medida, PWAs y herramientas de software libre para resolver problemas cotidianos de personas, profesionales y comercios.
* Arquitecturas orientadas a costo mínimo y rendimiento instantáneo (WebRTC, Cloudflare, PWA, Serverless).

### Policía de la Provincia de Buenos Aires / Policía Local
**2012 – 2023 (10 años de servicio) | Mar del Plata, Argentina**
* **Pericias Informáticas & Análisis Forense Digital:** Extracción y análisis pericial de dispositivos móviles, preservación de evidencia digital, cadena de custodia y elaboración de informes técnicos forenses para fiscalías y juzgados.
* **Innovación Tecnológica Aplicada:** Desarrollador y creador de la primera aplicación móvil de seguridad turística del municipio (premiado en 2015).

### Plataforma de Streaming de Video (Emprendimiento Temprano)
**2007 – 2010 | Argentina**
* Desarrollo y operación de una de las primeras plataformas de streaming de video en la región, alcanzando picos de 2.000 visitas diarias concurrentes.

---

## 🛠️ Stack Tecnológico

* **Frontend & Mobile:** JavaScript ES6+ (Vanilla), HTML5 Canvas API, Touch Events, Progressive Web Apps (PWA), Service Workers, CacheStorage, Flutter 3 (Dart), Leaflet.js, OpenStreetMap, Tailwind CSS.
* **Backend & APIs:** Python (FastAPI), Node.js, REST APIs, WebSockets, WebRTC (PeerJS), Cloudflare Quick Tunnels, RTSP / MJPEG.
* **Bases de Datos & Cloud:** Firebase (Firestore, Cloud Functions, Auth, Hosting), PostgreSQL, Redis, Vercel, Netlify.
* **Sistemas & Hardware:** Linux, WSL2, Windows Shell Scripting (.BAT híbrido), Git / GitHub, GPS Satelital (NMEA / Geolocation API), Sensores de Dispositivo (Giroscopio / Magnetómetro).
* **Inteligencia Artificial & Visión:** Homografía Proyectiva 2D (Bilinear Filtering), Google Gemini API, Vertex AI, LangGraph, LangChain, PyTorch, Ollama.
* **Criptografía & Seguridad:** Árboles de Merkle, RSA-PSS 4096-bit, AES-256-GCM, Análisis Forense Digital, Ofuscación Anti-Scraping.

---

## 🎓 Formación Académica

* **Ingeniería en Informática** — Universidad Nacional de Mar del Plata (UNMDP) *(En curso)*
* **Tecnicatura Universitaria en Protección de Datos (DPO)** — Facultad de Derecho, UNMDP *(En curso)*
* **Formación Continua Autodidacta:** Especialización en deep learning, sistemas distribuidos, visión por computadora y criptografía aplicada.

---
*Junio 2026 — Mar del Plata, Argentina*  
*Documento disponible en línea en [soriam.vercel.app](https://soriam.vercel.app)*
