import { createRoot } from 'react-dom/client'
import './styles/global.css'
import App from './app/App.jsx'
import { StoreProvider } from './state/store.jsx'

createRoot(document.getElementById('root')).render(
  <StoreProvider>
    <App />
  </StoreProvider>
)
