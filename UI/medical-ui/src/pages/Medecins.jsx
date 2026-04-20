import { useState, useEffect } from 'react';
import axios from 'axios';
import { useConfig } from '../config';
import Modal from '../components/Modal';
import { useToast, ToastContainer } from '../hooks/useToast';

const EMPTY_MED = { nom: '', prenom: '', email: '', telephone: '', disponible: true, specialite: { id: '', nom: '', description: '' } };
const EMPTY_SPEC = { nom: '', description: '' };

function initials(nom, prenom) {
  return `${(nom || '?')[0]}${(prenom || '?')[0]}`.toUpperCase();
}

export default function Medecins() {
  const [medecins, setMedecins] = useState([]);
  const [specialites, setSpecialites] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [filterSpec, setFilterSpec] = useState('');
  const [filterDispo, setFilterDispo] = useState('');
  const [tab, setTab] = useState('medecins'); // 'medecins' | 'specialites'
  const [modal, setModal] = useState(false);
  const [specModal, setSpecModal] = useState(false);
  const [viewModal, setViewModal] = useState(null);
  const [scoreModal, setScoreModal] = useState(null);
  const [rapportModal, setRapportModal] = useState(null);
  const [form, setForm] = useState(EMPTY_MED);
  const [specForm, setSpecForm] = useState(EMPTY_SPEC);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const { toasts, toast } = useToast();

  const { getApi } = useConfig();
  const api = (path = '') => getApi('medecins', path);
  // specialites lives at /specialites on the same host as medecins
  const apiSpec = (path = '') => {
    const base = getApi('medecins', ''); // e.g. /proxy/medecins/medecins or http://ip:port/medecins
    return base.replace(/\/medecins$/, '/specialites') + path;
  };

  useEffect(() => { loadMedecins(); loadSpecialites(); }, []);
  useEffect(() => {
    setFiltered(medecins.filter(m => {
      const matchSearch = `${m.nom} ${m.prenom} ${m.email} ${m.specialite?.nom || ''}`.toLowerCase().includes(search.toLowerCase());
      const matchSpec = filterSpec ? String(m.specialite?.id) === filterSpec : true;
      const matchDispo = filterDispo === '' ? true : filterDispo === 'true' ? m.disponible : !m.disponible;
      return matchSearch && matchSpec && matchDispo;
    }));
  }, [search, filterSpec, filterDispo, medecins]);

  async function loadMedecins() {
    try {
      const res = await axios.get(api());
      const data = Array.isArray(res.data) ? res.data : [];
      setMedecins(data);
    } catch { toast('Impossible de contacter medecins-service', 'error'); }
  }

  async function loadSpecialites() {
    try {
      const res = await axios.get(apiSpec());
      setSpecialites(Array.isArray(res.data) ? res.data : []);
    } catch { /* silent fail */ }
  }

  async function submitMedecin(e) {
    e.preventDefault(); setLoading(true);
    try {
      const payload = { ...form, disponible: form.disponible === true || form.disponible === 'true', specialite: form.specialite.id ? { id: Number(form.specialite.id), nom: form.specialite.nom, description: form.specialite.description } : null };
      if (editing) {
        await axios.put(api(`/${editing}`), payload);
        toast('Médecin modifié');
      } else {
        await axios.post(api(), payload);
        toast('Médecin ajouté');
      }
      setModal(false); setForm(EMPTY_MED); setEditing(null); loadMedecins();
    } catch (e) { toast(e.response?.data?.erreur || e.response?.data || 'Erreur', 'error'); }
    finally { setLoading(false); }
  }

  async function submitSpec(e) {
    e.preventDefault(); setLoading(true);
    try {
      await axios.post(apiSpec(), specForm);
      toast('Spécialité ajoutée'); setSpecModal(false); setSpecForm(EMPTY_SPEC); loadSpecialites();
    } catch (e) { toast(e.response?.data || 'Erreur', 'error'); }
    finally { setLoading(false); }
  }

  async function removeMedecin(id, nom) {
    if (!confirm(`Supprimer Dr. ${nom} ?`)) return;
    try { await axios.delete(api(`/${id}`)); toast('Médecin supprimé'); loadMedecins(); }
    catch { toast('Erreur suppression', 'error'); }
  }

  async function removeSpec(id, nom) {
    if (!confirm(`Supprimer la spécialité ${nom} ?`)) return;
    try { await axios.delete(apiSpec(`/${id}`)); toast('Spécialité supprimée'); loadSpecialites(); }
    catch { toast('Erreur suppression', 'error'); }
  }

  async function occuper(id) {
    try { await axios.put(api(`/${id}/occuper`)); toast('Médecin marqué occupé'); loadMedecins(); }
    catch (e) { toast(e.response?.data || 'Erreur', 'error'); }
  }

  async function liberer(id) {
    try { await axios.put(api(`/${id}/liberer`)); toast('Médecin libéré'); loadMedecins(); }
    catch (e) { toast(e.response?.data || 'Erreur', 'error'); }
  }

  async function getScore(m) {
    try {
      const res = await axios.get(api(`/${m.id}/score`));
      setScoreModal({ medecin: m, data: res.data });
    } catch { toast('Impossible de récupérer le score', 'error'); }
  }

  async function getRapport() {
    try {
      const res = await axios.get(api('/analyse/rapport'));
      setRapportModal(res.data);
    } catch { toast('Impossible de récupérer le rapport', 'error'); }
  }

  async function recommander(specId) {
    try {
      const res = await axios.get(api(`/recommander/${specId}`));
      toast(`Médecin recommandé: Dr. ${res.data.prenom} ${res.data.nom}`, 'info');
    } catch { toast('Aucun médecin disponible pour cette spécialité', 'error'); }
  }

  function openEdit(m) {
    setForm({ nom: m.nom || '', prenom: m.prenom || '', email: m.email || '', telephone: m.telephone || '', disponible: m.disponible, specialite: { id: m.specialite?.id || '', nom: m.specialite?.nom || '', description: m.specialite?.description || '' } });
    setEditing(m.id); setModal(true);
  }

  const f = v => v || '—';

  return (
    <div>
      <ToastContainer toasts={toasts} />
      <div className="page-header">
        <div className="page-title">
          <h1>Médecins</h1>
          <p>Gérer le corps médical et les spécialités</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-ghost" onClick={getRapport}>📊 Rapport</button>
          <button className="btn btn-ghost" onClick={loadMedecins}>🔄 Actualiser</button>
          {tab === 'medecins'
            ? <button className="btn btn-primary" onClick={() => { setForm(EMPTY_MED); setEditing(null); setModal(true); }}>+ Nouveau médecin</button>
            : <button className="btn btn-primary" onClick={() => { setSpecForm(EMPTY_SPEC); setSpecModal(true); }}>+ Nouvelle spécialité</button>
          }
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon green">🩺</div><div className="stat-info"><div className="stat-number">{medecins.length}</div><div className="stat-label">Total médecins</div></div></div>
        <div className="stat-card"><div className="stat-icon blue">✅</div><div className="stat-info"><div className="stat-number">{medecins.filter(m => m.disponible).length}</div><div className="stat-label">Disponibles</div></div></div>
        <div className="stat-card"><div className="stat-icon red">🔴</div><div className="stat-info"><div className="stat-number">{medecins.filter(m => !m.disponible).length}</div><div className="stat-label">Occupés</div></div></div>
        <div className="stat-card"><div className="stat-icon yellow">🏷️</div><div className="stat-info"><div className="stat-number">{specialites.length}</div><div className="stat-label">Spécialités</div></div></div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: 'white', padding: 6, borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', width: 'fit-content' }}>
        {['medecins', 'specialites'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', fontFamily: 'Inter,sans-serif', background: tab === t ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'transparent', color: tab === t ? 'white' : '#64748b', transition: 'all 0.2s' }}>
            {t === 'medecins' ? '🩺 Médecins' : '🏷️ Spécialités'}
          </button>
        ))}
      </div>

      {tab === 'medecins' && (
        <div className="card">
          <div className="toolbar">
            <div className="search-input-wrap">
              <span className="search-icon">🔍</span>
              <input placeholder="Rechercher par nom, prénom, spécialité..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="filter-select" value={filterSpec} onChange={e => setFilterSpec(e.target.value)}>
              <option value="">Toutes spécialités</option>
              {specialites.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
            </select>
            <select className="filter-select" value={filterDispo} onChange={e => setFilterDispo(e.target.value)}>
              <option value="">Tous</option>
              <option value="true">✅ Disponibles</option>
              <option value="false">🔴 Occupés</option>
            </select>
          </div>
          <div className="table-wrap">
            {filtered.length === 0 ? (
              <div className="empty-state"><div className="empty-icon">🩺</div><p>Aucun médecin trouvé</p></div>
            ) : (
              <table>
                <thead><tr><th>Médecin</th><th>Spécialité</th><th>Téléphone</th><th>Email</th><th>Disponibilité</th><th>Actions</th></tr></thead>
                <tbody>
                  {filtered.map(m => (
                    <tr key={m.id}>
                      <td>
                        <div className="name-cell">
                          <div className="avatar avatar-green">{initials(m.nom, m.prenom)}</div>
                          <div><div className="name">Dr. {m.prenom} {m.nom}</div><div className="sub">#{m.id}</div></div>
                        </div>
                      </td>
                      <td>{m.specialite ? <span className="badge badge-blue">{m.specialite.nom}</span> : '—'}</td>
                      <td>{f(m.telephone)}</td>
                      <td>{f(m.email)}</td>
                      <td><span className={`badge ${m.disponible ? 'badge-green' : 'badge-red'}`}>{m.disponible ? '✅ Disponible' : '🔴 Occupé'}</span></td>
                      <td>
                        <div className="actions-cell">
                          <button className="btn btn-ghost btn-sm" onClick={() => setViewModal(m)}>👁</button>
                          <button className="btn btn-info btn-sm" onClick={() => getScore(m)}>📊</button>
                          {m.disponible
                            ? <button className="btn btn-warning btn-sm" onClick={() => occuper(m.id)}>🔒</button>
                            : <button className="btn btn-success btn-sm" onClick={() => liberer(m.id)}>🔓</button>
                          }
                          <button className="btn btn-warning btn-sm" onClick={() => openEdit(m)}>✏️</button>
                          <button className="btn btn-danger btn-sm" onClick={() => removeMedecin(m.id, `${m.prenom} ${m.nom}`)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {tab === 'specialites' && (
        <div className="card">
          <div className="table-wrap">
            {specialites.length === 0 ? (
              <div className="empty-state"><div className="empty-icon">🏷️</div><p>Aucune spécialité</p></div>
            ) : (
              <table>
                <thead><tr><th>ID</th><th>Nom</th><th>Description</th><th>Médecins</th><th>Actions</th></tr></thead>
                <tbody>
                  {specialites.map(s => (
                    <tr key={s.id}>
                      <td className="td-id">#{s.id}</td>
                      <td><span className="badge badge-purple">{s.nom}</span></td>
                      <td>{f(s.description)}</td>
                      <td><span className="badge badge-blue">{medecins.filter(m => m.specialite?.id === s.id).length} médecins</span></td>
                      <td>
                        <div className="actions-cell">
                          <button className="btn btn-info btn-sm" onClick={() => recommander(s.id)}>⭐ Recommander</button>
                          <button className="btn btn-danger btn-sm" onClick={() => removeSpec(s.id, s.nom)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Medecin Modal */}
      {modal && (
        <Modal title={editing ? '✏️ Modifier le médecin' : '➕ Nouveau médecin'} onClose={() => setModal(false)}
          footer={<>
            <button className="btn btn-ghost" onClick={() => setModal(false)}>Annuler</button>
            <button className="btn btn-primary" form="medecin-form" type="submit" disabled={loading}>
              {loading ? <span className="loading-spinner" /> : (editing ? 'Enregistrer' : 'Ajouter')}
            </button>
          </>}
        >
          <form id="medecin-form" onSubmit={submitMedecin}>
            <div className="form-row">
              <div className="form-group"><label>Nom *</label><input required value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} placeholder="Dupont" /></div>
              <div className="form-group"><label>Prénom *</label><input required value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })} placeholder="Jean" /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="dr@hopital.fr" /></div>
              <div className="form-group"><label>Téléphone</label><input value={form.telephone} onChange={e => setForm({ ...form, telephone: e.target.value })} placeholder="0123456789" /></div>
            </div>
            <div className="form-group">
              <label>Spécialité</label>
              <select value={form.specialite.id} onChange={e => {
                const s = specialites.find(x => String(x.id) === e.target.value);
                setForm({ ...form, specialite: s ? { id: s.id, nom: s.nom, description: s.description } : { id: '', nom: '', description: '' } });
              }}>
                <option value="">Sélectionner une spécialité</option>
                {specialites.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Disponibilité</label>
              <select value={String(form.disponible)} onChange={e => setForm({ ...form, disponible: e.target.value === 'true' })}>
                <option value="true">✅ Disponible</option>
                <option value="false">🔴 Occupé</option>
              </select>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Specialite Modal */}
      {specModal && (
        <Modal title="➕ Nouvelle spécialité" onClose={() => setSpecModal(false)}
          footer={<>
            <button className="btn btn-ghost" onClick={() => setSpecModal(false)}>Annuler</button>
            <button className="btn btn-primary" form="spec-form" type="submit" disabled={loading}>
              {loading ? <span className="loading-spinner" /> : 'Ajouter'}
            </button>
          </>}
        >
          <form id="spec-form" onSubmit={submitSpec}>
            <div className="form-group"><label>Nom *</label><input required value={specForm.nom} onChange={e => setSpecForm({ ...specForm, nom: e.target.value })} placeholder="Cardiologie" /></div>
            <div className="form-group"><label>Description</label><textarea rows={3} value={specForm.description} onChange={e => setSpecForm({ ...specForm, description: e.target.value })} placeholder="Description de la spécialité..." /></div>
          </form>
        </Modal>
      )}

      {/* View Modal */}
      {viewModal && (
        <Modal title={`🩺 Dr. ${viewModal.prenom} ${viewModal.nom}`} onClose={() => setViewModal(null)}
          footer={<>
            <button className="btn btn-ghost" onClick={() => setViewModal(null)}>Fermer</button>
            <button className="btn btn-info" onClick={() => { getScore(viewModal); setViewModal(null); }}>📊 Score</button>
            <button className="btn btn-warning" onClick={() => { setViewModal(null); openEdit(viewModal); }}>✏️ Modifier</button>
          </>}
        >
          <div className="detail-grid">
            <div className="detail-item"><label>ID</label><span>#{viewModal.id}</span></div>
            <div className="detail-item"><label>Disponibilité</label><span><span className={`badge ${viewModal.disponible ? 'badge-green' : 'badge-red'}`}>{viewModal.disponible ? '✅ Disponible' : '🔴 Occupé'}</span></span></div>
            <div className="detail-item"><label>Nom</label><span>{viewModal.nom}</span></div>
            <div className="detail-item"><label>Prénom</label><span>{viewModal.prenom}</span></div>
            <div className="detail-item"><label>Email</label><span>{f(viewModal.email)}</span></div>
            <div className="detail-item"><label>Téléphone</label><span>{f(viewModal.telephone)}</span></div>
            <div className="detail-item"><label>Spécialité</label><span>{viewModal.specialite ? <span className="badge badge-blue">{viewModal.specialite.nom}</span> : '—'}</span></div>
            {viewModal.specialite?.description && <div className="detail-item"><label>Description spécialité</label><span>{viewModal.specialite.description}</span></div>}
          </div>
        </Modal>
      )}

      {/* Score Modal */}
      {scoreModal && (
        <Modal title={`📊 Score — Dr. ${scoreModal.medecin.prenom} ${scoreModal.medecin.nom}`} onClose={() => setScoreModal(null)}
          footer={<button className="btn btn-ghost" onClick={() => setScoreModal(null)}>Fermer</button>}
        >
          <pre style={{ background: '#f8fafc', padding: 16, borderRadius: 10, fontSize: '0.82rem', overflow: 'auto' }}>{JSON.stringify(scoreModal.data, null, 2)}</pre>
        </Modal>
      )}

      {/* Rapport Modal */}
      {rapportModal && (
        <Modal title="📊 Rapport d'analyse global" onClose={() => setRapportModal(null)}
          footer={<button className="btn btn-ghost" onClick={() => setRapportModal(null)}>Fermer</button>}
        >
          <pre style={{ background: '#f8fafc', padding: 16, borderRadius: 10, fontSize: '0.82rem', overflow: 'auto', maxHeight: 400 }}>{JSON.stringify(rapportModal, null, 2)}</pre>
        </Modal>
      )}
    </div>
  );
}
