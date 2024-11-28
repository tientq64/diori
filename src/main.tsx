import { createRoot } from 'react-dom/client'
import { App } from './App.tsx'
import './base.scss'
import './main.scss'

const root = createRoot(document.getElementById('root')!)
root.render(<App />)
