import { createRoot } from 'react-dom/client'
import '@fontsource/newsreader/latin-400.css'
import '@fontsource/newsreader/latin-500.css'
import '@fontsource/dm-sans/latin-400.css'
import '@fontsource/dm-sans/latin-500.css'
import '@fontsource/dm-sans/latin-600.css'
import { Finance } from './Finance'
import './finance.css'

createRoot(document.getElementById('family-root')!).render(<Finance />)
