# ⚡ Soria Matias — Developer · Portafolio 3D (City 01)

> Portafolio interactivo en Three.js: una entidad IA holográfica flota sobre una metrópolis ciberpunk
> nocturna y presenta los proyectos reales en tarjetas holográficas flotantes.

🌐 **En Vivo:** [soriam.vercel.app](https://soriam.vercel.app) · Versión clásica: `/clasico.html`

---

## 🧱 Stack

- **Vite + React 19**
- **Three.js** vía `@react-three/fiber` + `@react-three/drei` (`<Html transform>`, `Line`, `Stars`)
- **Post-procesamiento:** `EffectComposer` + `UnrealBloomPass` + `OutputPass` (three/examples)
- **GSAP** para las transiciones cinemáticas de cámara y la entrada de paneles
- **Tailwind CSS v4** para la capa HTML superpuesta

## 📁 Estructura

```
├── index.html                  # Entrada Vite (fuentes, meta, contador de visitas)
├── public/clasico.html         # Portafolio anterior completo (formularios, contacto, API)
├── vercel.json                 # Build Vite → dist/
└── src/
    ├── main.jsx / App.jsx      # Estado global: hover, proyecto seleccionado, paneles
    ├── index.css               # Estética neón/holograma de la UI
    ├── data/projects.js        # Proyectos reales, perfil y servicios (fuente única)
    ├── hooks/useMediaQuery.js  # Detección móvil / reduced-motion
    ├── three/
    │   ├── Experience.jsx      # Canvas, luces, composición y plano detalle por proyecto
    │   ├── layout.js           # Distribución simétrica de tarjetas + poses de cámara
    │   ├── CameraRig.jsx       # Cámara GSAP (position + lookAt + fov) con paralaje
    │   ├── HoloAvatar.jsx      # Entidad IA procedural: ojos HDR, núcleo, orbes, chispas
    │   ├── shaders/hologram.js # ShaderMaterial: fresnel, scanlines, red neuronal, circuitos, glitch
    │   ├── City.jsx            # Rascacielos instanciados con ventanas procedurales, suelo, pedestal
    │   ├── Traffic.jsx         # Tráfico aéreo con estelas + drones con cono de luz
    │   ├── AmbientParticles.jsx
    │   ├── ProjectCards3D.jsx  # Tarjetas <Html transform> + marco neón con bloom + líneas a las manos
    │   └── PostFX.jsx          # UnrealBloomPass
    └── ui/                     # Header, menú hamburguesa, carrusel móvil, modal, paneles, footer
```

## 🎮 Interacciones

- **Idle:** levitación/respiración del avatar y de las tarjetas, circuitos y partículas titilando.
- **Hover:** borde neón intensificado (CSS + marco 3D con bloom), escalado suave y la cabeza del avatar gira hacia la tarjeta.
- **Click / VIEW PROJECT:** `gsap` lleva la cámara a un plano detalle y abre el panel con detalles, stack y enlaces. `VOLVER` (o `Esc`) regresa a la vista panorámica.
- **Móvil:** avatar en la mitad superior, carrusel táctil con scroll-snap y menú hamburguesa.

Las tarjetas se generan desde `src/data/projects.js`: agregar un proyecto ahí lo suma a la escena, al carrusel y al indicador lateral.

## 🚀 Desarrollo

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # genera dist/
```

## 📬 Contacto
- **GitHub:** [github.com/XIA01](https://github.com/XIA01)
- **LinkedIn:** [linkedin.com/in/desarrolladorsoria](https://linkedin.com/in/desarrolladorsoria)
