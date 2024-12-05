import './utils/globalConfigs'
import { createRoot } from 'react-dom/client'
import { App } from './App.tsx'
import './style.scss'

const root = createRoot(document.getElementById('root')!)
root.render(<App />)
