import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Patients from './pages/Patients';
import Medecins from './pages/Medecins';
import Planning from './pages/Planning';
import Rendezvous from './pages/Rendezvous';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import { useConfig, SERVICE_PATHS } from './config';
import './App.css';

const NAV = [
  { to: '/patients',      icon: '👤', label: 'Patients',       service: 'patients' },
  { to: '/medecins',      icon: '🩺', label: 'Médecins',       service: 'medecins' },
  { to: '/planning',      icon: '📅', label: 'Planning',       service: 'planning' },
  { to: '/rendezvous',    icon: '📋', label: 'Rendez-vous',    service: 'rendezvous' },
  { to: '/notifications', icon: '🔔', label: 'Notifications',  service: 'notifications' },
];

function Sidebar() {
  const { config, configLoaded } = useConfig();
  const [status, setStatus] = useState({});

  useEffect(() => {
    if (!configLoaded) return;
    async function pingAll() {
      const results = {};
      await Promise.all(NAV.map(async n => {
        const s = config[n.service];
        if (!s?.ip || !s?.port) { results[n.service] = 'unknown'; return; }
        const url = `http://${s.ip}:${s.port}${SERVICE_PATHS[n.service]}`;
        try {
          await fetch(url, { method: 'GET', mode: 'no-cors', signal: AbortSignal.timeout(3000) });
          results[n.service] = 'ok';
        } catch { results[n.service] = 'error'; }
      }));
      setStatus(results);
    }
    pingAll();
    const interval = setInterval(pingAll, 30000);
    return () => clearInterval(interval);
  }, [config, configLoaded]);

  const allOk = NAV.every(n => status[n.service] === 'ok');
  const anyOk = NAV.some(n => status[n.service] === 'ok');

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">🏥</div>
        <h2>MedSystem</h2>
        <p>Gestion Médicale Distribuée</p>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-section-label">Navigation</div>
        {NAV.map(n => (
          <NavLink key={n.to} to={n.to}>
            <span className="nav-icon">{n.icon}</span>
            <span className="nav-label">{n.label}</span>
            <span className={`nav-dot ${status[n.service] === 'ok' ? 'dot-green' : status[n.service] === 'error' ? 'dot-red' : 'dot-gray'}`} />
          </NavLink>
        ))}
        <div className="nav-section-label" style={{marginTop:12}}>Système</div>
        <NavLink to="/settings">
          <span className="nav-icon">⚙️</span>
          <span className="nav-label">Paramètres</span>
        </NavLink>
      </nav>
      <div className="sidebar-footer">
        <div className="service-status-mini">
          <span className={`dot ${allOk ? 'dot-green' : anyOk ? 'dot-yellow' : 'dot-red'}`} />
          <span>{allOk ? 'Tous les services en ligne' : anyOk ? 'Services partiellement en ligne' : 'Services hors ligne'}</span>
        </div>
      </div>
    </aside>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Sidebar />
        <main className="content">
          <Routes>
            <Route path="/"             element={<Patients />} />
            <Route path="/patients"     element={<Patients />} />
            <Route path="/medecins"     element={<Medecins />} />
            <Route path="/planning"     element={<Planning />} />
            <Route path="/rendezvous"   element={<Rendezvous />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/settings"     element={<Settings />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
