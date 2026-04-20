import { useState, useEffect } from 'react';
import axios from 'axios';
import { useConfig } from '../config';
import Modal from '../components/Modal';
import { useToast, ToastContainer } from '../hooks/useToast';

const TYPE_BADGE = {
  CREATE: 'badge-green', CANCEL: 'badge-red', UPDATE: 'badge-blue',
  RDV_CREE: 'badge-green', RDV_ANNULE: 'badge-red',
  RDV_STATUT_CHANGE: 'badge-blue', RDV_NOTES_MODIFIEES: 'badge-purple'
};
const TYPE_ICON = {
  CREATE: '📅', CANCEL: '❌', UPDATE: '🔄',
  RDV_CREE: '📅', RDV_ANNULE: '❌',
  RDV_STATUT_CHANGE: '🔄', RDV_NOTES_MODIFIEES: '📝'
};
const TYPE_LABEL = {
  RDV_CREE: 'Création', RDV_ANNULE: 'Annulation',
  RDV_STATUT_CHANGE: 'Changement statut', RDV_NOTES_MODIFIEES: 'Notes modifiées',
  CREATE: 'Création', CANCEL: 'Annulation', UPDATE: 'Mise à jour'
};

export default function Notifications() {
  const [notifs, setNotifs] = useState([]);
  const [historique, setHistorique] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [tab, setTab] = useState('notifs');
  const [filterType, setFilterType] = useState('');
  const [search, setSearch] = useState('');
  const [viewModal, setViewModal] = useState(null);
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({ message: '', type: '' });
  const [rdvFilter, setRdvFilter] = useState('');
  const [patientFilter, setPatientFilter] = useState('');
  const [form, setForm] = useState({ message: '', type: 'CREATE', rendezVousId: '', patientId: '', medecinId: '' });
  const [loading, setLoading] = useState(false);
  const { toasts, toast } = useToast();
  const [patients, setPatients] = useState([]);
  const [medecins, setMedecins] = useState([]);
  const [rdvs, setRdvs] = useState([]);

  const { getApi } = useConfig();
  const api    = (path = '') => getApi('notifications', path);
  const apiPat = (path = '') => getApi('patients', path);
  const apiMed = (path = '') => getApi('medecins', path);
  const apiRdv = (path = '') => getApi('rendezvous', path);

  useEffect(() => {
    loadAll();
    axios.get(apiPat()).then(r => setPatients(Array.isArray(r.data) ? r.data : [])).catch(() => {});
    axios.get(apiMed()).then(r => setMedecins(Array.isArray(r.data) ? r.data : [])).catch(() => {});
    axios.get(apiRdv()).then(r => setRdvs(Array.isArray(r.data) ? r.data : [])).catch(() => {});
  }, []);
  useEffect(() => {
    const source = tab === 'notifs' ? notifs : historique;
    setFiltered(source.filter(n => {
      const matchType = filterType ? (n.type || n.action) === filterType : true;
      const matchSearch = search ? (n.message || n.action || '').toLowerCase().includes(search.toLowerCase()) : true;
      return matchType && matchSearch;
    }));
  }, [filterType, search, notifs, historique, tab]);

  async function loadAll() {
    try {
      const [notifRes, histRes] = await Promise.all([
        axios.get(api()),
        axios.get(api('/historique')).catch(() => ({ data: [] }))
      ]);
      setNotifs(Array.isArray(notifRes.data) ? notifRes.data : []);
      setHistorique(Array.isArray(histRes.data) ? histRes.data : []);
    } catch { toast('Impossible de contacter notifications-service', 'error'); }
  }

  async function testConnection() {
    try {
      await axios.get(api('/test'));
      toast('✅ notifications-service est en ligne', 'info');
    } catch { toast('❌ notifications-service hors ligne', 'error'); }
  }

  async function createNotif(e) {
    e.preventDefault(); setLoading(true);
    try {
      await axios.post(api(), {
        message: form.message,
        type: form.type,
        rendezVousId: form.rendezVousId ? Number(form.rendezVousId) : null,
        patientId: form.patientId ? Number(form.patientId) : null,
        medecinId: form.medecinId ? Number(form.medecinId) : null,
      });
      toast('Notification créée'); setCreateModal(false); setForm({ message: '', type: 'CREATE', rendezVousId: '', patientId: '', medecinId: '' }); loadAll();
    } catch (e) { toast(e.response?.data || 'Erreur', 'error'); }
    finally { setLoading(false); }
  }

  async function updateNotif(e) {
    e.preventDefault();
    setNotifs(prev => prev.map(n => n.id === editModal.id
      ? { ...n, message: editForm.message, type: editForm.type }
      : n
    ));
    toast('Notification modifiée'); setEditModal(null);
  }

  async function deleteNotif(id) {
    if (!confirm('Supprimer cette notification ?')) return;
    setNotifs(prev => prev.filter(n => n.id !== id));
    toast('Notification supprimée');
  }

  async function loadHistoriqueByRdv() {
    if (!rdvFilter) return;
    try {
      const res = await axios.get(api(`/rendezvous/${rdvFilter}`));
      setHistorique(Array.isArray(res.data) ? res.data : []);
      setTab('historique');
      toast(`Historique RDV #${rdvFilter} chargé`, 'info');
    } catch { toast('Aucun historique pour ce RDV', 'error'); }
  }

  async function loadNotifsByRdv() {
    if (!rdvFilter) return;
    try {
      const res = await axios.get(api(`/rendezvous/${rdvFilter}/notifications`));
      setNotifs(Array.isArray(res.data) ? res.data : []);
      setTab('notifs');
      toast(`Notifications RDV #${rdvFilter} chargées`, 'info');
    } catch { toast('Aucune notification pour ce RDV', 'error'); }
  }

  async function loadHistoriqueByPatient() {
    if (!patientFilter) return;
    try {
      const res = await axios.get(api(`/patient/${patientFilter}`));
      setHistorique(Array.isArray(res.data) ? res.data : []);
      setTab('historique');
      toast(`Historique patient #${patientFilter} chargé`, 'info');
    } catch { toast('Aucun historique pour ce patient', 'error'); }
  }

  const types = [...new Set([...notifs.map(n => n.type), ...historique.map(n => n.action)].filter(Boolean))];
  const f = v => v || '—';

  return (
    <div>
      <ToastContainer toasts={toasts} />
      <div className="page-header">
        <div className="page-title">
          <h1>Notifications & Historique</h1>
          <p>Traçabilité de toutes les actions du système</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-ghost" onClick={testConnection}>🔍 Test connexion</button>
          <button className="btn btn-ghost" onClick={loadAll}>🔄 Actualiser</button>
          <button className="btn btn-primary" onClick={() => setCreateModal(true)}>+ Créer notification</button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon purple">🔔</div><div className="stat-info"><div className="stat-number">{notifs.length}</div><div className="stat-label">Notifications</div></div></div>
        <div className="stat-card"><div className="stat-icon green">📅</div><div className="stat-info"><div className="stat-number">{notifs.filter(n => n.type === 'CREATE' || n.type === 'RDV_CREE').length}</div><div className="stat-label">Créations</div></div></div>
        <div className="stat-card"><div className="stat-icon red">❌</div><div className="stat-info"><div className="stat-number">{notifs.filter(n => n.type === 'CANCEL' || n.type === 'RDV_ANNULE').length}</div><div className="stat-label">Annulations</div></div></div>
        <div className="stat-card"><div className="stat-icon blue">📜</div><div className="stat-info"><div className="stat-number">{historique.length}</div><div className="stat-label">Historique</div></div></div>
      </div>

      {/* Search by reference */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header"><h3>🔎 Recherche par référence</h3></div>
        <div className="card-body">
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input style={{ padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: '0.875rem', width: 150 }} type="number" placeholder="ID Rendez-vous" value={rdvFilter} onChange={e => setRdvFilter(e.target.value)} />
              <button className="btn btn-info btn-sm" onClick={loadNotifsByRdv}>📋 Notifications</button>
              <button className="btn btn-ghost btn-sm" onClick={loadHistoriqueByRdv}>📜 Historique</button>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input style={{ padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: '0.875rem', width: 150 }} type="number" placeholder="ID Patient" value={patientFilter} onChange={e => setPatientFilter(e.target.value)} />
              <button className="btn btn-success btn-sm" onClick={loadHistoriqueByPatient}>📜 Historique patient</button>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => { setRdvFilter(''); setPatientFilter(''); loadAll(); setHistorique([]); setTab('notifs'); }}>✕ Réinitialiser</button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: 'white', padding: 6, borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', width: 'fit-content' }}>
        {[{ key: 'notifs', label: '🔔 Notifications' }, { key: 'historique', label: '📜 Historique' }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', fontFamily: 'Inter,sans-serif', background: tab === t.key ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'transparent', color: tab === t.key ? 'white' : '#64748b', transition: 'all 0.2s' }}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="toolbar">
          <div className="search-input-wrap">
            <span className="search-icon">🔍</span>
            <input placeholder="Rechercher dans les messages..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="filter-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="">Tous les types</option>
            {types.map(t => <option key={t} value={t}>{TYPE_ICON[t] || '📌'} {t}</option>)}
          </select>
        </div>
        <div className="table-wrap">
          {filtered.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">🔔</div><p>Aucune entrée trouvée</p></div>
          ) : tab === 'notifs' ? (
            <table>
              <thead><tr><th>ID</th><th>Type</th><th>Message</th><th>RDV</th><th>Date</th><th></th></tr></thead>
              <tbody>
                {filtered.map((n, i) => (
                  <tr key={n.id || i}>
                    <td className="td-id">#{n.id}</td>
                    <td><span className={`badge ${TYPE_BADGE[n.type] || 'badge-gray'}`}>{TYPE_ICON[n.type] || '📌'} {TYPE_LABEL[n.type] || n.type}</span></td>
                    <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.message}</td>
                    <td>{n.rendezVousId ? <span className="badge badge-purple">#{n.rendezVousId}</span> : '—'}</td>
                    <td style={{ fontSize: '0.8rem', color: '#64748b', whiteSpace: 'nowrap' }}>{n.date ? new Date(n.date).toLocaleString('fr-FR') : '—'}</td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => setViewModal({ ...n, _type: 'notif' })}>👁</button>
                      <button className="btn btn-warning btn-sm" onClick={() => { setEditModal(n); setEditForm({ message: n.message, type: n.type }); }}>✏️</button>
                      <button className="btn btn-danger btn-sm" onClick={() => deleteNotif(n.id)}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table>
              <thead><tr><th>ID</th><th>Action</th><th>RDV</th><th>Patient</th><th>Date</th><th></th></tr></thead>
              <tbody>
                {filtered.map((h, i) => (
                  <tr key={h.id || i}>
                    <td className="td-id">#{h.id}</td>
                    <td><span className={`badge ${TYPE_BADGE[h.action] || 'badge-gray'}`}>{TYPE_ICON[h.action] || '📌'} {TYPE_LABEL[h.action] || h.action}</span></td>
                    <td>{h.rendezVousId ? <span className="badge badge-purple">#{h.rendezVousId}</span> : '—'}</td>
                    <td>{h.patientId ? <span className="badge badge-blue">#{h.patientId}</span> : '—'}</td>
                    <td style={{ fontSize: '0.8rem', color: '#64748b', whiteSpace: 'nowrap' }}>{h.date ? new Date(h.date).toLocaleString('fr-FR') : '—'}</td>
                    <td><button className="btn btn-ghost btn-sm" onClick={() => setViewModal({ ...h, _type: 'historique' })}>👁</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {createModal && (
        <Modal title="➕ Créer une notification" onClose={() => setCreateModal(false)}
          footer={<>
            <button className="btn btn-ghost" onClick={() => setCreateModal(false)}>Annuler</button>
            <button className="btn btn-primary" form="notif-form" type="submit" disabled={loading}>
              {loading ? <span className="loading-spinner" /> : 'Créer'}
            </button>
          </>}
        >
          <form id="notif-form" onSubmit={createNotif}>
            <div className="form-group"><label>Message *</label><textarea required rows={3} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Message de la notification..." /></div>
            <div className="form-group">
              <label>Type *</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="CREATE">📅 CREATE</option>
                <option value="CANCEL">❌ CANCEL</option>
                <option value="UPDATE">🔄 UPDATE</option>
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Patient</label>
                <select value={form.patientId} onChange={e => setForm({ ...form, patientId: e.target.value })}>
                  <option value="">— Sélectionner un patient —</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Médecin</label>
                <select value={form.medecinId} onChange={e => setForm({ ...form, medecinId: e.target.value })}>
                  <option value="">— Sélectionner un médecin —</option>
                  {medecins.map(m => <option key={m.id} value={m.id}>Dr. {m.prenom} {m.nom}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Rendez-vous</label>
              <select value={form.rendezVousId} onChange={e => setForm({ ...form, rendezVousId: e.target.value })}>
                <option value="">— Sélectionner un RDV —</option>
                {rdvs.map(r => <option key={r.id} value={r.id}>RDV #{r.id} — {r.dateHeureRendezvous?.slice(0,16).replace('T',' ')}</option>)}
              </select>
            </div>
          </form>
        </Modal>
      )}

      {/* View Modal */}
      {viewModal && (
        <Modal title={`🔔 ${viewModal._type === 'notif' ? 'Notification' : 'Historique'} #${viewModal.id}`} onClose={() => setViewModal(null)}
          footer={<button className="btn btn-ghost" onClick={() => setViewModal(null)}>Fermer</button>}
        >
          <div className="detail-grid">
            <div className="detail-item"><label>ID</label><span>#{viewModal.id}</span></div>
            <div className="detail-item"><label>{viewModal._type === 'notif' ? 'Type' : 'Action'}</label><span><span className={`badge ${TYPE_BADGE[viewModal.type || viewModal.action] || 'badge-gray'}`}>{viewModal.type || viewModal.action}</span></span></div>
            <div className="detail-item"><label>Rendez-vous</label><span>{viewModal.rendezVousId ? `#${viewModal.rendezVousId}` : '—'}</span></div>
            <div className="detail-item"><label>Patient</label><span>{viewModal.patientId ? `#${viewModal.patientId}` : '—'}</span></div>
            <div className="detail-item"><label>Date</label><span>{viewModal.date ? new Date(viewModal.date).toLocaleString('fr-FR') : '—'}</span></div>
          </div>
          {viewModal.message && <><div className="divider" /><div className="detail-item"><label>Message</label><p style={{ marginTop: 6, fontSize: '0.9rem', lineHeight: 1.6 }}>{viewModal.message}</p></div></>}
        </Modal>
      )}
      {/* Edit Modal */}
      {editModal && (
        <Modal title={`✏️ Modifier notification #${editModal.id}`} onClose={() => setEditModal(null)}
          footer={<>
            <button className="btn btn-ghost" onClick={() => setEditModal(null)}>Annuler</button>
            <button className="btn btn-primary" form="edit-notif-form" type="submit" disabled={loading}>
              {loading ? <span className="loading-spinner" /> : 'Enregistrer'}
            </button>
          </>}
        >
          <form id="edit-notif-form" onSubmit={updateNotif}>
            <div className="form-group">
              <label>Message *</label>
              <textarea required rows={3} value={editForm.message} onChange={e => setEditForm({ ...editForm, message: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Type *</label>
              <select value={editForm.type} onChange={e => setEditForm({ ...editForm, type: e.target.value })}>
                <option value="CREATE">📅 CREATE</option>
                <option value="CANCEL">❌ CANCEL</option>
                <option value="UPDATE">🔄 UPDATE</option>
                <option value="RDV_CREE">📅 RDV_CREE</option>
                <option value="RDV_ANNULE">❌ RDV_ANNULE</option>
                <option value="RDV_STATUT_CHANGE">🔄 RDV_STATUT_CHANGE</option>
              </select>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
