import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './css/index.module.css'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'toastify-js/src/toastify.css';
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
