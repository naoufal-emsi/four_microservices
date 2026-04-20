import { useState, useEffect } from 'react';
import axios from 'axios';
import { useConfig } from '../config';
import Modal from '../components/Modal';
import { useToast, ToastContainer } from '../hooks/useToast';

const EMPTY = { medecinId: '', date: '', heureDebut: '', heureFin: '', disponible: true };

export default function Planning() {
  const [creneaux, setCreneaux] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filterDispo, setFilterDispo] = useState('');
  const [filterMedecin, setFilterMedecin] = useState('');
  const [modal, setModal] = useState(false);
  const [viewModal, setViewModal] = useState(null);
  const [statsModal, setStatsModal] = useState(null);
  const [statsYear, setStatsYear] = useState(new Date().getFullYear());
  const [statsMonth, setStatsMonth] = useState(new Date().getMonth() + 1);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const { toasts, toast } = useToast();

  const { getApi } = useConfig();
  const api = (path = '') => getApi('planning', path);

  useEffect(() => { load(); }, []);
  useEffect(() => {
    setFiltered(creneaux.filter(c => {
      const matchDispo = filterDispo === '' ? true : filterDispo === 'true' ? c.disponible : !c.disponible;
      const matchMedecin = filterMedecin ? String(c.medecinId) === filterMedecin : true;
      return matchDispo && matchMedecin;
    }));
  }, [filterDispo, filterMedecin, creneaux]);

  async function load() {
    try {
      const res = await axios.get(api());
      setCreneaux(Array.isArray(res.data) ? res.data : []);
    } catch { toast('Impossible de contacter planning-service', 'error'); }
  }

  async function loadDisponibles() {
    try {
      const res = await axios.get(api('/disponibles'));
      setCreneaux(Array.isArray(res.data) ? res.data : []);
      toast('Créneaux disponibles chargés', 'info');
    } catch { toast('Erreur', 'error'); }
  }

  async function submit(e) {
    e.preventDefault(); setLoading(true);
    try {
      await axios.post(api(), { ...form, medecinId: Number(form.medecinId), disponible: form.disponible === true || form.disponible === 'true' });
      toast('Créneau créé'); setModal(false); setForm(EMPTY); load();
    } catch (e) { toast(e.response?.data?.message || e.response?.data?.error || 'Erreur', 'error'); }
    finally { setLoading(false); }
  }

  async function bloquer(id) {
    try { await axios.put(api(`/${id}/bloquer`)); toast('Créneau bloqué'); load(); }
    catch (e) { toast(e.response?.data?.message || e.response?.data?.error || 'Erreur', 'error'); }
  }

  async function liberer(id) {
    try { await axios.put(api(`/${id}/liberer`)); toast('Créneau libéré'); load(); }
    catch (e) { toast(e.response?.data?.message || e.response?.data?.error || 'Erreur', 'error'); }
  }

  async function loadStats() {
    try {
      const res = await axios.get(api(`/stats/medecins?year=${statsYear}&month=${statsMonth}`));
      setStatsModal(res.data);
    } catch (e) { toast(e.response?.data?.message || 'Erreur stats', 'error'); }
  }

  async function loadByMedecin(medecinId) {
    try {
      const res = await axios.get(api(`/medecin/${medecinId}`));
      setCreneaux(Array.isArray(res.data) ? res.data : []);
      toast(`Planning du médecin #${medecinId} chargé`, 'info');
    } catch { toast('Erreur', 'error'); }
  }

  const disponibles = creneaux.filter(c => c.disponible).length;
  const occupes = creneaux.filter(c => !c.disponible).length;
  const medecinIds = [...new Set(creneaux.map(c => c.medecinId).filter(Boolean))];
  const f = v => v || '—';

  return (
    <div>
      <ToastContainer toasts={toasts} />
      <div className="page-header">
        <div className="page-title">
          <h1>Planning</h1>
          <p>Gérer les créneaux de consultation</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-ghost" onClick={loadDisponibles}>🟢 Disponibles</button>
          <button className="btn btn-ghost" onClick={load}>🔄 Tous</button>
          <button className="btn btn-primary" onClick={() => { setForm(EMPTY); setModal(true); }}>+ Nouveau créneau</button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon blue">📅</div><div className="stat-info"><div className="stat-number">{creneaux.length}</div><div className="stat-label">Total créneaux</div></div></div>
        <div className="stat-card"><div className="stat-icon green">🟢</div><div className="stat-info"><div className="stat-number">{disponibles}</div><div className="stat-label">Disponibles</div></div></div>
        <div className="stat-card"><div className="stat-icon red">🔴</div><div className="stat-info"><div className="stat-number">{occupes}</div><div className="stat-label">Réservés</div></div></div>
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setStatsModal([])}>
          <div className="stat-icon yellow">📊</div><div className="stat-info"><div className="stat-number">Stats</div><div className="stat-label">Par médecin</div></div>
        </div>
      </div>

      <div className="card">
        <div className="toolbar">
          <select className="filter-select" value={filterDispo} onChange={e => setFilterDispo(e.target.value)}>
            <option value="">Tous les créneaux</option>
            <option value="true">🟢 Disponibles</option>
            <option value="false">🔴 Réservés</option>
          </select>
          <select className="filter-select" value={filterMedecin} onChange={e => { setFilterMedecin(e.target.value); if (e.target.value) loadByMedecin(e.target.value); else load(); }}>
            <option value="">Tous les médecins</option>
            {medecinIds.map(id => <option key={id} value={id}>Médecin #{id}</option>)}
          </select>
        </div>
        <div className="table-wrap">
          {filtered.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">📅</div><p>Aucun créneau trouvé</p></div>
          ) : (
            <table>
              <thead><tr><th>ID</th><th>Médecin</th><th>Date</th><th>Début</th><th>Fin</th><th>Disponibilité</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id}>
                    <td className="td-id">#{c.id}</td>
                    <td><span className="badge badge-blue">Médecin #{c.medecinId}</span></td>
                    <td style={{ fontWeight: 500 }}>{f(c.date)}</td>
                    <td>{f(c.heureDebut)}</td>
                    <td>{f(c.heureFin)}</td>
                    <td><span className={`badge ${c.disponible ? 'badge-green' : 'badge-red'}`}>{c.disponible ? '🟢 Disponible' : '🔴 Réservé'}</span></td>
                    <td>
                      <div className="actions-cell">
                        <button className="btn btn-ghost btn-sm" onClick={() => setViewModal(c)}>👁</button>
                        {c.disponible
                          ? <button className="btn btn-warning btn-sm" onClick={() => bloquer(c.id)}>🔒 Bloquer</button>
                          : <button className="btn btn-success btn-sm" onClick={() => liberer(c.id)}>🔓 Libérer</button>
                        }
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {modal && (
        <Modal title="➕ Nouveau créneau" onClose={() => setModal(false)}
          footer={<>
            <button className="btn btn-ghost" onClick={() => setModal(false)}>Annuler</button>
            <button className="btn btn-primary" form="creneau-form" type="submit" disabled={loading}>
              {loading ? <span className="loading-spinner" /> : 'Créer'}
            </button>
          </>}
        >
          <form id="creneau-form" onSubmit={submit}>
            <div className="form-group"><label>ID Médecin *</label><input required type="number" min="1" value={form.medecinId} onChange={e => setForm({ ...form, medecinId: e.target.value })} placeholder="1" /></div>
            <div className="form-group"><label>Date *</label><input required type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
            <div className="form-row">
              <div className="form-group"><label>Heure début *</label><input required type="time" value={form.heureDebut} onChange={e => setForm({ ...form, heureDebut: e.target.value + ':00' })} /></div>
              <div className="form-group"><label>Heure fin *</label><input required type="time" value={form.heureFin} onChange={e => setForm({ ...form, heureFin: e.target.value + ':00' })} /></div>
            </div>
            <div className="form-group">
              <label>Disponibilité</label>
              <select value={String(form.disponible)} onChange={e => setForm({ ...form, disponible: e.target.value === 'true' })}>
                <option value="true">🟢 Disponible</option>
                <option value="false">🔴 Réservé</option>
              </select>
            </div>
          </form>
        </Modal>
      )}

      {/* View Modal */}
      {viewModal && (
        <Modal title={`📅 Créneau #${viewModal.id}`} onClose={() => setViewModal(null)}
          footer={<>
            <button className="btn btn-ghost" onClick={() => setViewModal(null)}>Fermer</button>
            {viewModal.disponible
              ? <button className="btn btn-warning" onClick={() => { bloquer(viewModal.id); setViewModal(null); }}>🔒 Bloquer</button>
              : <button className="btn btn-success" onClick={() => { liberer(viewModal.id); setViewModal(null); }}>🔓 Libérer</button>
            }
          </>}
        >
          <div className="detail-grid">
            <div className="detail-item"><label>ID</label><span>#{viewModal.id}</span></div>
            <div className="detail-item"><label>Médecin</label><span>#{viewModal.medecinId}</span></div>
            <div className="detail-item"><label>Date</label><span>{f(viewModal.date)}</span></div>
            <div className="detail-item"><label>Disponibilité</label><span><span className={`badge ${viewModal.disponible ? 'badge-green' : 'badge-red'}`}>{viewModal.disponible ? '🟢 Disponible' : '🔴 Réservé'}</span></span></div>
            <div className="detail-item"><label>Heure début</label><span>{f(viewModal.heureDebut)}</span></div>
            <div className="detail-item"><label>Heure fin</label><span>{f(viewModal.heureFin)}</span></div>
          </div>
        </Modal>
      )}

      {/* Stats Modal */}
      {statsModal !== null && (
        <Modal title="📊 Statistiques par médecin" onClose={() => setStatsModal(null)}
          footer={<button className="btn btn-ghost" onClick={() => setStatsModal(null)}>Fermer</button>}
        >
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'flex-end' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Année</label>
              <input type="number" value={statsYear} onChange={e => setStatsYear(e.target.value)} style={{ width: 100, padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: '0.875rem' }} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Mois</label>
              <input type="number" min="1" max="12" value={statsMonth} onChange={e => setStatsMonth(e.target.value)} style={{ width: 80, padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: '0.875rem' }} />
            </div>
            <button className="btn btn-primary" onClick={loadStats}>Charger</button>
          </div>
          {statsModal.length > 0 ? (
            <table>
              <thead><tr><th>Médecin ID</th><th>Créneaux réservés</th></tr></thead>
              <tbody>
                {statsModal.map((s, i) => (
                  <tr key={i}>
                    <td><span className="badge badge-blue">Médecin #{s.medecinId}</span></td>
                    <td><span className="badge badge-purple">{s.nbCreneauxReserves}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <div className="empty-state"><div className="empty-icon">📊</div><p>Cliquez sur Charger pour afficher les stats</p></div>}
        </Modal>
      )}
    </div>
  );
}
