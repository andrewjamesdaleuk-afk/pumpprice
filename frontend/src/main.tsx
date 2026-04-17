import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import BlogList from './pages/BlogList.tsx'
import BlogPost from './pages/BlogPost.tsx'
import About from './pages/About.tsx'
import LocalCity from './pages/LocalCity.tsx'
import LocationsIndex from './pages/LocationsIndex.tsx'
import Privacy from './pages/Privacy.tsx'
import Insights from './pages/Insights.tsx'


// Force PWA to auto-update on reload instead of sticking to cached versions
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) return;
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('New content is available; please refresh.');
            window.location.reload();
          }
        };
      };
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/about" element={<About />} />
        <Route path="/blog" element={<BlogList />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/city/:slug" element={<LocalCity />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/locations" element={<LocationsIndex />} />
        <Route path="/privacy" element={<Privacy />} />
        {/* Catch-all redirect for old URLs like /history so it doesn't blank out */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
