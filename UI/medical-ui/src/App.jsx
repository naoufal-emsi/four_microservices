import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Patients from './pages/Patients';
import Medecins from './pages/Medecins';
import Planning from './pages/Planning';
import Rendezvous from './pages/Rendezvous';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import './App.css';

const NAV = [
  { to: '/patients',      icon: '👤', label: 'Patients' },
  { to: '/medecins',      icon: '🩺', label: 'Médecins' },
  { to: '/planning',      icon: '📅', label: 'Planning' },
  { to: '/rendezvous',    icon: '📋', label: 'Rendez-vous' },
  { to: '/notifications', icon: '🔔', label: 'Notifications' },
];

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="logo-icon">🏥</div>
            <h2>MedSystem</h2>
            <p>Gestion Médicale</p>
          </div>
          <nav className="sidebar-nav">
            <div className="nav-section-label">Navigation</div>
            {NAV.map(n => (
              <NavLink key={n.to} to={n.to}>
                <span className="nav-icon">{n.icon}</span>
                {n.label}
              </NavLink>
            ))}
            <div className="nav-section-label" style={{marginTop:12}}>Système</div>
            <NavLink to="/settings">
              <span className="nav-icon">⚙️</span>
              Paramètres
            </NavLink>
          </nav>
          <div className="sidebar-footer">
            <div className="service-status-mini">
              <span className="dot dot-green"></span>
              Système opérationnel
            </div>
          </div>
        </aside>
        <main className="content">
          <Routes>
            <Route path="/" element={<Patients />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/medecins" element={<Medecins />} />
            <Route path="/planning" element={<Planning />} />
            <Route path="/rendezvous" element={<Rendezvous />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
