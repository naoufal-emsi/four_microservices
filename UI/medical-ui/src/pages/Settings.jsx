import { useState } from 'react';
import { useConfig, SERVICE_PATHS, DEFAULT_CONFIG } from '../config';
import { useToast, ToastContainer } from '../hooks/useToast';

const SERVICES = [
  { key: 'patients',      label: 'Patients Service',      icon: '👤', color: '#6366f1', bg: '#ede9fe' },
  { key: 'medecins',      label: 'Médecins Service',      icon: '🩺', color: '#10b981', bg: '#d1fae5' },
  { key: 'planning',      label: 'Planning Service',      icon: '📅', color: '#f59e0b', bg: '#fef3c7' },
  { key: 'rendezvous',    label: 'Rendez-vous Service',   icon: '📋', color: '#3b82f6', bg: '#dbeafe' },
  { key: 'notifications', label: 'Notifications Service', icon: '🔔', color: '#ef4444', bg: '#fee2e2' },
];

export default function Settings() {
  const { config, updateConfig } = useConfig();
  const [local, setLocal] = useState(() => JSON.parse(JSON.stringify(config)));
  const [pings, setPings] = useState({});
  const { toasts, toast } = useToast();

  function update(service, field, value) {
    setLocal(prev => ({ ...prev, [service]: { ...prev[service], [field]: value } }));
  }

  async function save() {
    await updateConfig(local);
    toast('✅ Config sauvegardée dans proxy-config.json. Redémarrez npm run dev pour appliquer les nouveaux IPs au proxy.');
  }

  async function reset() {
    await updateConfig(DEFAULT_CONFIG);
    setLocal(JSON.parse(JSON.stringify(DEFAULT_CONFIG)));
    toast('Configuration réinitialisée aux valeurs par défaut');
  }

  // Uses fetch with no-cors — exactly like curl, bypasses CORS completely
  async function ping(key) {
    const { ip, port } = local[key];
    if (!ip || !port) { toast(`IP ou port manquant pour ${key}`, 'error'); return; }

    const targetUrl = `http://${ip}:${port}${SERVICE_PATHS[key]}`;
    setPings(p => ({ ...p, [key]: { status: 'loading', url: targetUrl, latency: null, error: null } }));

    const start = Date.now();
    try {
      // no-cors = browser sends request without caring about CORS headers, just like curl
      await fetch(targetUrl, {
        method: 'GET',
        mode: 'no-cors',
        signal: AbortSignal.timeout(5000),
      });
      const latency = Date.now() - start;
      setPings(p => ({ ...p, [key]: { status: 'ok', url: targetUrl, latency, error: null } }));
    } catch (e) {
      const latency = Date.now() - start;
      const isTimeout = e.name === 'TimeoutError' || latency >= 4900;
      setPings(p => ({
        ...p,
        [key]: {
          status: isTimeout ? 'timeout' : 'error',
          url: targetUrl,
          latency,
          error: isTimeout ? 'Timeout — service hors ligne ou IP incorrecte' : 'Inaccessible — vérifiez IP et port',
        }
      }));
    }
  }

  async function pingAll() {
    for (const s of SERVICES) ping(s.key);
  }

  function PingResult({ k }) {
    const p = pings[k];
    if (!p) return null;
    if (p.status === 'loading') return (
      <div style={{ marginTop: 10, padding: '8px 12px', background: '#f8fafc', borderRadius: 8, fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className="loading-spinner" style={{ borderColor: 'rgba(0,0,0,0.1)', borderTopColor: '#6366f1', width: 14, height: 14 }} /> Test en cours...
      </div>
    );
    const isOk = p.status === 'ok';
    const isTimeout = p.status === 'timeout';
    return (
      <div style={{ marginTop: 10, padding: '10px 14px', background: isOk ? '#f0fdf4' : isTimeout ? '#fffbeb' : '#fef2f2', borderRadius: 8, border: `1px solid ${isOk ? '#bbf7d0' : isTimeout ? '#fde68a' : '#fecaca'}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: '0.82rem', color: isOk ? '#065f46' : isTimeout ? '#92400e' : '#991b1b' }}>
            {isOk ? '✅ En ligne' : isTimeout ? '⚠️ Timeout' : '❌ Hors ligne'}
          </span>
          {p.latency != null && <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.latency}ms</span>}
        </div>
        {p.error && <div style={{ fontSize: '0.75rem', color: isTimeout ? '#92400e' : '#991b1b', marginTop: 3 }}>{p.error}</div>}
        <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 4, fontFamily: 'monospace', wordBreak: 'break-all' }}>{p.url}</div>
      </div>
    );
  }

  const onlineCount = Object.values(pings).filter(p => p?.status === 'ok').length;
  const testedCount = Object.values(pings).filter(p => p?.status && p.status !== 'loading').length;

  return (
    <div>
      <ToastContainer toasts={toasts} />
      <div className="page-header">
        <div className="page-title">
          <h1>Paramètres</h1>
          <p>Configurer les IPs et ports de chaque microservice</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-ghost" onClick={pingAll}>🔍 Tester tous</button>
          <button className="btn btn-primary" onClick={save}>💾 Appliquer</button>
        </div>
      </div>

      {testedCount > 0 && (
        <div style={{ background: onlineCount === testedCount ? '#f0fdf4' : '#fef2f2', border: `1px solid ${onlineCount === testedCount ? '#bbf7d0' : '#fecaca'}`, borderRadius: 12, padding: '12px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '1.2rem' }}>{onlineCount === testedCount ? '✅' : '⚠️'}</span>
          <span style={{ fontWeight: 600, fontSize: '0.9rem', color: onlineCount === testedCount ? '#065f46' : '#991b1b' }}>
            {onlineCount}/{testedCount} services en ligne
          </span>
        </div>
      )}

      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: '12px 18px', marginBottom: 24, fontSize: '0.85rem', color: '#1e40af' }}>
        ℹ️ Le bouton <strong>Tester</strong> envoie une requête directe (comme curl) sans CORS. Modifiez les IPs/ports puis cliquez <strong>Appliquer</strong>.
      </div>

      <div className="settings-grid">
        {SERVICES.map(s => (
          <div key={s.key} className="service-config-card" style={{ borderTopColor: s.color }}>
            <div className="service-config-header">
              <div className="service-config-title">
                <div className="service-config-icon" style={{ background: s.bg }}>{s.icon}</div>
                <div>
                  <h3 style={{ color: s.color }}>{s.label}</h3>
                  <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 2, fontFamily: 'monospace' }}>
                    {SERVICE_PATHS[s.key]}
                  </p>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Adresse IP</label>
                <input
                  value={local[s.key].ip}
                  onChange={e => update(s.key, 'ip', e.target.value)}
                  placeholder="192.168.1.10"
                  style={{ fontFamily: 'monospace' }}
                />
              </div>
              <div className="form-group">
                <label>Port</label>
                <input
                  value={local[s.key].port}
                  onChange={e => update(s.key, 'port', e.target.value)}
                  placeholder="8081"
                  style={{ fontFamily: 'monospace' }}
                />
              </div>
            </div>

            <div className="url-preview">
              🌐 http://{local[s.key].ip}:{local[s.key].port}{SERVICE_PATHS[s.key]}
            </div>

            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => ping(s.key)}>
                🔍 Tester
              </button>
            </div>

            <PingResult k={s.key} />
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <div className="card-header"><h3>🖥️ Votre machine</h3></div>
        <div className="card-body">
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 14 }}>
            {[
              { label: 'rendezvous-service', value: `${local.rendezvous?.ip}:${local.rendezvous?.port}` },
              { label: 'notifications-service', value: `${local.notifications?.ip}:${local.notifications?.port}` },
              { label: 'patients-service', value: `${local.patients?.ip}:${local.patients?.port}` },
              { label: 'medecins-service', value: `${local.medecins?.ip}:${local.medecins?.port}` },
              { label: 'UI React', value: `${local.rendezvous?.ip}:5173` },
            ].map(item => (
              <div key={item.label}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: 4 }}>{item.label}</div>
                <code style={{ background: '#f1f5f9', padding: '5px 10px', borderRadius: 7, fontSize: '0.875rem', fontWeight: 600 }}>{item.value}</code>
              </div>
            ))}
          </div>
          <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: 10, fontSize: '0.82rem', color: '#64748b' }}>
            💡 Partagez <strong>http://{local.rendezvous?.ip}:5173</strong> avec vos coéquipiers.
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-header"><h3>⚠️ Réinitialiser</h3></div>
        <div className="card-body">
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: 14 }}>Remet toutes les IPs et ports aux valeurs par défaut.</p>
          <button className="btn btn-danger" onClick={reset}>🔄 Réinitialiser</button>
        </div>
      </div>
    </div>
  );
}
