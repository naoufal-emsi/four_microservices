import { useState, useEffect } from 'react';
import axios from 'axios';
import { useConfig } from '../config';
import Modal from '../components/Modal';
import { useToast, ToastContainer } from '../hooks/useToast';

const EMPTY = { nom: '', prenom: '', telephone: '', email: '', adresse: '', statut: 'ACTIF' };

function initials(nom, prenom) {
  return `${(nom || '?')[0]}${(prenom || '?')[0]}`.toUpperCase();
}

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [viewModal, setViewModal] = useState(null);
  const [decisionModal, setDecisionModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [configModal, setConfigModal] = useState(null);
  const [loading, setLoading] = useState(false);
  const { toasts, toast } = useToast();
  const { getApi } = useConfig();

  // GET /patients
  async function load() {
    try {
      const res = await axios.get(getApi('patients'));
      setPatients(Array.isArray(res.data) ? res.data : []);
    } catch { toast('Impossible de contacter patients-service', 'error'); }
  }

  useEffect(() => {
    load();
    const interval = setInterval(() => load(), 5000);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    setFiltered(patients.filter(p =>
      `${p.nom} ${p.prenom} ${p.email} ${p.telephone} ${p.statut}`.toLowerCase().includes(search.toLowerCase())
    ));
  }, [search, patients]);

  // POST /patients  or  PUT /patients/{id}
  async function submit(e) {
    e.preventDefault(); setLoading(true);
    try {
      if (editing) {
        await axios.put(getApi('patients', `/${editing}`), form);
        toast('Patient modifié avec succès');
      } else {
        await axios.post(getApi('patients'), form);
        toast('Patient ajouté avec succès');
      }
      setModal(false); setForm(EMPTY); setEditing(null); load();
    } catch (e) { toast(e.response?.data?.message || e.response?.data || 'Erreur', 'error'); }
    finally { setLoading(false); }
  }

  // DELETE /patients/{id}
  async function remove(id, nom) {
    if (!confirm(`Supprimer le patient ${nom} ?`)) return;
    try {
      await axios.delete(getApi('patients', `/${id}`));
      toast('Patient supprimé'); load();
    } catch { toast('Erreur lors de la suppression', 'error'); }
  }

  // GET /patients/exists/{id}
  async function checkExists(id) {
    try {
      const res = await axios.get(getApi('patients', `/exists/${id}`));
      toast(`Patient #${id} — existe: ${res.data.exists}`, 'info');
    } catch { toast('Erreur vérification existence', 'error'); }
  }

  async function voirConfig() {
    try {
      const res = await axios.get(getApi('patients', '/config/external'));
      setConfigModal(res.data);
    } catch { toast('Impossible de récupérer la config externe', 'error'); }
  }

  // GET /patients/{id}/decision
  async function getDecision(p) {
    try {
      const res = await axios.get(getApi('patients', `/${p.id}/decision`));
      setDecisionModal({ patient: p, data: res.data });
    } catch { toast('Impossible de récupérer la décision IA', 'error'); }
  }

  function openEdit(p) {
    setForm({ nom: p.nom || '', prenom: p.prenom || '', telephone: p.telephone || '', email: p.email || '', adresse: p.adresse || '', statut: p.statut?.toUpperCase() || 'ACTIF' });
    setEditing(p.id); setModal(true);
  }

  const f = v => v || '—';
  const statutBadge = s => {
    const u = s?.toUpperCase();
    if (u === 'ACTIF') return 'badge-green';
    if (u === 'DOUBLON') return 'badge-red';
    if (u === 'INCOMPLET') return 'badge-yellow';
    return 'badge-gray';
  };

  return (
    <div>
      <ToastContainer toasts={toasts} />
      <div className="page-header">
        <div className="page-title"><h1>Patients</h1><p>Gérer les dossiers patients du système</p></div>
        <div className="header-actions">
          <button className="btn btn-ghost" onClick={voirConfig}>🔗 Config externe</button>
          <button className="btn btn-ghost" onClick={load}>🔄 Actualiser</button>
          <button className="btn btn-primary" onClick={() => { setForm(EMPTY); setEditing(null); setModal(true); }}>+ Nouveau patient</button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon purple">👤</div><div className="stat-info"><div className="stat-number">{patients.length}</div><div className="stat-label">Total patients</div></div></div>
        <div className="stat-card"><div className="stat-icon green">✅</div><div className="stat-info"><div className="stat-number">{patients.filter(p => p.statut?.toUpperCase() === 'ACTIF').length}</div><div className="stat-label">Actifs</div></div></div>
        <div className="stat-card"><div className="stat-icon red">🔴</div><div className="stat-info"><div className="stat-number">{patients.filter(p => ['DOUBLON','INCOMPLET','INACTIF'].includes(p.statut?.toUpperCase())).length}</div><div className="stat-label">Inactifs / Problèmes</div></div></div>
        <div className="stat-card"><div className="stat-icon blue">🔍</div><div className="stat-info"><div className="stat-number">{filtered.length}</div><div className="stat-label">Résultats</div></div></div>
      </div>

      <div className="card">
        <div className="toolbar">
          <div className="search-input-wrap">
            <span className="search-icon">🔍</span>
            <input placeholder="Rechercher par nom, prénom, email, téléphone..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="table-wrap">
          {filtered.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">👤</div><p>Aucun patient trouvé</p></div>
          ) : (
            <table>
              <thead><tr><th>Patient</th><th>Téléphone</th><th>Email</th><th>Adresse</th><th>Statut</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div className="name-cell">
                        <div className="avatar avatar-purple">{initials(p.nom, p.prenom)}</div>
                        <div><div className="name">{p.prenom} {p.nom}</div><div className="sub">#{p.id}</div></div>
                      </div>
                    </td>
                    <td>{f(p.telephone)}</td>
                    <td>{f(p.email)}</td>
                    <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f(p.adresse)}</td>
                    <td><span className={`badge ${statutBadge(p.statut)}`}>{f(p.statut)}</span></td>
                    <td>
                      <div className="actions-cell">
                        <button className="btn btn-ghost btn-sm" onClick={() => setViewModal(p)}>👁</button>
                        <button className="btn btn-info btn-sm" onClick={() => getDecision(p)}>🤖 IA</button>
                        <button className="btn btn-warning btn-sm" onClick={() => openEdit(p)}>✏️</button>
                        <button className="btn btn-danger btn-sm" onClick={() => remove(p.id, `${p.prenom} ${p.nom}`)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal && (
        <Modal title={editing ? '✏️ Modifier le patient' : '➕ Nouveau patient'} onClose={() => setModal(false)}
          footer={<>
            <button className="btn btn-ghost" onClick={() => setModal(false)}>Annuler</button>
            <button className="btn btn-primary" form="patient-form" type="submit" disabled={loading}>
              {loading ? <span className="loading-spinner" /> : (editing ? 'Enregistrer' : 'Ajouter')}
            </button>
          </>}
        >
          <form id="patient-form" onSubmit={submit}>
            <div className="form-row">
              <div className="form-group"><label>Nom *</label><input required value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} placeholder="Dupont" /></div>
              <div className="form-group"><label>Prénom *</label><input required value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })} placeholder="Jean" /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Téléphone</label><input value={form.telephone} onChange={e => setForm({ ...form, telephone: e.target.value })} placeholder="+33123456789" /></div>
              <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="jean@email.com" /></div>
            </div>
            <div className="form-group"><label>Adresse</label><input value={form.adresse} onChange={e => setForm({ ...form, adresse: e.target.value })} placeholder="123 Rue de la Santé, Paris" /></div>
            <div className="form-group">
              <label>Statut</label>
              <select value={form.statut} onChange={e => setForm({ ...form, statut: e.target.value })}>
                <option value="ACTIF">Actif</option>
                <option value="INACTIF">Inactif</option>
                <option value="DOUBLON">Doublon</option>
                <option value="INCOMPLET">Incomplet</option>
              </select>
            </div>
          </form>
        </Modal>
      )}

      {viewModal && (
        <Modal title={`👤 ${viewModal.prenom} ${viewModal.nom}`} onClose={() => setViewModal(null)}
          footer={<>
            <button className="btn btn-ghost" onClick={() => setViewModal(null)}>Fermer</button>
            <button className="btn btn-info" onClick={() => { checkExists(viewModal.id); }}>🔍 Vérifier existence</button>
            <button className="btn btn-warning btn-sm" onClick={() => getDecision(viewModal)}>🤖 Décision IA</button>
            <button className="btn btn-warning" onClick={() => { setViewModal(null); openEdit(viewModal); }}>✏️ Modifier</button>
          </>}
        >
          <div className="detail-grid">
            <div className="detail-item"><label>ID</label><span>#{viewModal.id}</span></div>
            <div className="detail-item"><label>Statut</label><span><span className={`badge ${statutBadge(viewModal.statut)}`}>{f(viewModal.statut)}</span></span></div>
            <div className="detail-item"><label>Nom</label><span>{viewModal.nom}</span></div>
            <div className="detail-item"><label>Prénom</label><span>{viewModal.prenom}</span></div>
            <div className="detail-item"><label>Téléphone</label><span>{f(viewModal.telephone)}</span></div>
            <div className="detail-item"><label>Email</label><span>{f(viewModal.email)}</span></div>
            <div className="detail-item" style={{ gridColumn: '1/-1' }}><label>Adresse</label><span>{f(viewModal.adresse)}</span></div>
          </div>
        </Modal>
      )}

      {decisionModal && (() => {
        const d = decisionModal.data;
        const configs = {
          RESERVABLE:  { bg: '#d1fae5', color: '#065f46', icon: '✅', label: 'Réservable' },
          A_VERIFIER:  { bg: '#fef3c7', color: '#92400e', icon: '⚠️', label: 'À vérifier' },
          BLOQUE:      { bg: '#fee2e2', color: '#991b1b', icon: '🚫', label: 'Bloqué' },
        };
        const cfg = configs[d.decision] || { bg: '#f1f5f9', color: '#475569', icon: 'ℹ️', label: d.decision };
        return (
          <Modal title={`🤖 Décision IA — ${decisionModal.patient.prenom} ${decisionModal.patient.nom}`} onClose={() => setDecisionModal(null)}
            footer={<button className="btn btn-ghost" onClick={() => setDecisionModal(null)}>Fermer</button>}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ background: cfg.bg, borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontSize: '2rem' }}>{cfg.icon}</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.2rem', color: cfg.color }}>{cfg.label}</div>
                  <div style={{ fontSize: '0.8rem', color: cfg.color, opacity: 0.8, marginTop: 2 }}>{d.decision}</div>
                </div>
              </div>
              <div style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 16px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', marginBottom: 4 }}>Raison principale</div>
                <div style={{ fontSize: '0.9rem', color: '#1e293b', fontWeight: 500 }}>{d.raisonPrincipale}</div>
              </div>
              {d.risques?.length > 0 && (
                <div style={{ background: '#fef2f2', borderRadius: 10, padding: '12px 16px', border: '1px solid #fecaca' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#991b1b', marginBottom: 8 }}>Risques identifiés</div>
                  {d.risques.map((r, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, fontSize: '0.875rem', color: '#7f1d1d' }}>
                      <span>⚠️</span> {r}
                    </div>
                  ))}
                </div>
              )}
              {d.risques?.length === 0 && (
                <div style={{ background: '#f0fdf4', borderRadius: 10, padding: '10px 16px', border: '1px solid #bbf7d0', fontSize: '0.875rem', color: '#065f46' }}>
                  ✅ Aucun risque identifié
                </div>
              )}
              <div style={{ background: '#eff6ff', borderRadius: 10, padding: '12px 16px', border: '1px solid #bfdbfe' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#1e40af', marginBottom: 4 }}>Action recommandée</div>
                <div style={{ fontSize: '0.875rem', color: '#1e293b' }}>{d.actionRecommandee}</div>
              </div>
              <details>
                <summary style={{ cursor: 'pointer', fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, userSelect: 'none' }}>Résultat JSON brut</summary>
                <pre style={{ background: '#0f172a', color: '#e2e8f0', padding: 14, borderRadius: 10, fontSize: '0.78rem', overflowX: 'auto', whiteSpace: 'pre-wrap', marginTop: 8 }}>{JSON.stringify(d, null, 2)}</pre>
              </details>
            </div>
          </Modal>
        );
      })()}
      {configModal && (
        <Modal title="🔗 Configuration externe" onClose={() => setConfigModal(null)}
          footer={<button className="btn btn-ghost" onClick={() => setConfigModal(null)}>Fermer</button>}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Object.entries(configModal).map(([key, val]) => (
              <div key={key} style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 14px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', marginBottom: 3 }}>{key}</div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', fontFamily: 'monospace' }}>{val}</div>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}
