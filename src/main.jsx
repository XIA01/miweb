import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

// Sin StrictMode: el doble montaje de desarrollo/producción deja vacía la primera
// raíz de <Html transform> de drei con React 19.
createRoot(document.getElementById('root')).render(<App />)
