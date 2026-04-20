import { useState, useEffect } from 'react';
import axios from 'axios';
import { useConfig } from '../config';
import Modal from '../components/Modal';
import { useToast, ToastContainer } from '../hooks/useToast';

const EMPTY = { patientId: '', medecinId: '', creneauId: '', dateHeureRendezvous: '', motif: '', notes: '' };

const STATUT_BADGE = { EN_ATTENTE: 'badge-yellow', CONFIRME: 'badge-blue', ANNULE: 'badge-red', TERMINE: 'badge-green' };
const STATUT_ICON  = { EN_ATTENTE: '⏳', CONFIRME: '✅', ANNULE: '❌', TERMINE: '🏁' };

export default function Rendezvous() {
  const [rdvs, setRdvs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filterStatut, setFilterStatut] = useState('');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [viewModal, setViewModal] = useState(null);
  const [statutModal, setStatutModal] = useState(null);
  const [notesModal, setNotesModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [newStatut, setNewStatut] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const { toasts, toast } = useToast();

  const { getApi } = useConfig();
  const api = (path = '') => getApi('rendezvous', path);

  useEffect(() => { load(); }, []);
  useEffect(() => {
    setFiltered(rdvs.filter(r => {
      const matchStatut = filterStatut ? r.statut === filterStatut : true;
      const matchSearch = search ? `${r.patientId} ${r.medecinId} ${r.motif||''}`.toLowerCase().includes(search.toLowerCase()) : true;
      return matchStatut && matchSearch;
    }));
  }, [filterStatut, search, rdvs]);

  async function load() {
    try {
      const res = await axios.get(api());
      setRdvs(Array.isArray(res.data) ? res.data : []);
    } catch { toast('Impossible de contacter rendezvous-service', 'error'); }
  }

  async function submit(e) {
    e.preventDefault(); setLoading(true);
    try {
      await axios.post(api(), {
        patientId: Number(form.patientId),
        medecinId: Number(form.medecinId),
        creneauId: Number(form.creneauId),
        dateHeureRendezvous: form.dateHeureRendezvous ? form.dateHeureRendezvous + ':00' : '',
        dateCreation: new Date().toISOString().slice(0,19),
        statut: 'EN_ATTENTE',
        motif: form.motif,
        notes: form.notes,
      });
      toast('Rendez-vous créé avec succès'); setModal(false); setForm(EMPTY); load();
    } catch (e) { toast(e.response?.data || 'Erreur lors de la création', 'error'); }
    finally { setLoading(false); }
  }

  async function annuler(id) {
    if (!confirm('Annuler ce rendez-vous ?')) return;
    try { await axios.put(api(`/${id}/annuler`)); toast('Rendez-vous annulé'); load(); }
    catch (e) { toast(e.response?.data || 'Erreur', 'error'); }
  }

  async function changerStatut() {
    setLoading(true);
    try {
      await axios.put(api(`/${statutModal}/statut`), { statut: newStatut });
      toast('Statut mis à jour'); setStatutModal(null); load();
    } catch (e) { toast(e.response?.data || 'Erreur', 'error'); }
    finally { setLoading(false); }
  }

  async function saveNotes() {
    setLoading(true);
    try {
      await axios.put(api(`/${notesModal.id}/notes`), { notes });
      toast('Notes mises à jour'); setNotesModal(null); load();
    } catch (e) { toast(e.response?.data || 'Erreur', 'error'); }
    finally { setLoading(false); }
  }

  const counts = { EN_ATTENTE: 0, CONFIRME: 0, ANNULE: 0, TERMINE: 0 };
  rdvs.forEach(r => { if (counts[r.statut] !== undefined) counts[r.statut]++; });
  const f = v => v || '—';

  return (
    <div>
      <ToastContainer toasts={toasts} />
      <div className="page-header">
        <div className="page-title">
          <h1>Rendez-vous</h1>
          <p>Gérer les consultations et leur suivi</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-ghost" onClick={load}>🔄 Actualiser</button>
          <button className="btn btn-primary" onClick={() => { setForm(EMPTY); setModal(true); }}>+ Nouveau RDV</button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon purple">📋</div><div className="stat-info"><div className="stat-number">{rdvs.length}</div><div className="stat-label">Total</div></div></div>
        <div className="stat-card"><div className="stat-icon yellow">⏳</div><div className="stat-info"><div className="stat-number">{counts.EN_ATTENTE}</div><div className="stat-label">En attente</div></div></div>
        <div className="stat-card"><div className="stat-icon blue">✅</div><div className="stat-info"><div className="stat-number">{counts.CONFIRME}</div><div className="stat-label">Confirmés</div></div></div>
        <div className="stat-card"><div className="stat-icon green">🏁</div><div className="stat-info"><div className="stat-number">{counts.TERMINE}</div><div className="stat-label">Terminés</div></div></div>
      </div>

      <div className="card">
        <div className="toolbar">
          <div className="search-input-wrap">
            <span className="search-icon">🔍</span>
            <input placeholder="Rechercher par patient, médecin, motif..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="filter-select" value={filterStatut} onChange={e => setFilterStatut(e.target.value)}>
            <option value="">Tous les statuts</option>
            <option value="EN_ATTENTE">⏳ En attente</option>
            <option value="CONFIRME">✅ Confirmé</option>
            <option value="ANNULE">❌ Annulé</option>
            <option value="TERMINE">🏁 Terminé</option>
          </select>
        </div>
        <div className="table-wrap">
          {filtered.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">📋</div><p>Aucun rendez-vous trouvé</p></div>
          ) : (
            <table>
              <thead><tr><th>ID</th><th>Patient</th><th>Médecin</th><th>Créneau</th><th>Date & Heure</th><th>Motif</th><th>Statut</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id}>
                    <td className="td-id">#{r.id}</td>
                    <td><span className="badge badge-purple">Patient #{r.patientId}</span></td>
                    <td><span className="badge badge-green">Médecin #{r.medecinId}</span></td>
                    <td><span className="badge badge-blue">Créneau #{r.creneauId}</span></td>
                    <td style={{fontWeight:500,whiteSpace:'nowrap'}}>{r.dateHeureRendezvous?.replace('T',' ').slice(0,16)||'—'}</td>
                    <td style={{maxWidth:140,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{f(r.motif)}</td>
                    <td><span className={`badge ${STATUT_BADGE[r.statut]||'badge-gray'}`}>{STATUT_ICON[r.statut]} {r.statut}</span></td>
                    <td>
                      <div className="actions-cell">
                        <button className="btn btn-ghost btn-sm" onClick={() => setViewModal(r)}>👁</button>
                        <button className="btn btn-info btn-sm" onClick={() => { setStatutModal(r.id); setNewStatut(r.statut); }}>🔄</button>
                        <button className="btn btn-success btn-sm" onClick={() => { setNotesModal(r); setNotes(r.notes||''); }}>📝</button>
                        {r.statut !== 'ANNULE' && r.statut !== 'TERMINE' && (
                          <button className="btn btn-danger btn-sm" onClick={() => annuler(r.id)}>❌</button>
                        )}
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
        <Modal title="➕ Nouveau rendez-vous" onClose={() => setModal(false)}
          footer={<>
            <button className="btn btn-ghost" onClick={() => setModal(false)}>Annuler</button>
            <button className="btn btn-primary" form="rdv-form" type="submit" disabled={loading}>
              {loading ? <span className="loading-spinner"/> : 'Créer le RDV'}
            </button>
          </>}
        >
          <form id="rdv-form" onSubmit={submit}>
            <div className="form-row">
              <div className="form-group"><label>ID Patient *</label><input required type="number" min="1" value={form.patientId} onChange={e => setForm({...form, patientId: e.target.value})} placeholder="1" /></div>
              <div className="form-group"><label>ID Médecin *</label><input required type="number" min="1" value={form.medecinId} onChange={e => setForm({...form, medecinId: e.target.value})} placeholder="1" /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>ID Créneau *</label><input required type="number" min="1" value={form.creneauId} onChange={e => setForm({...form, creneauId: e.target.value})} placeholder="1" /></div>
              <div className="form-group"><label>Date & Heure *</label><input required type="datetime-local" value={form.dateHeureRendezvous} onChange={e => setForm({...form, dateHeureRendezvous: e.target.value})} /></div>
            </div>
            <div className="form-group"><label>Motif</label><input value={form.motif} onChange={e => setForm({...form, motif: e.target.value})} placeholder="Consultation générale..." /></div>
            <div className="form-group"><label>Notes</label><textarea rows={3} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Notes additionnelles..." /></div>
          </form>
        </Modal>
      )}

      {/* View Modal */}
      {viewModal && (
        <Modal title={`📋 Rendez-vous #${viewModal.id}`} onClose={() => setViewModal(null)}
          footer={<>
            <button className="btn btn-ghost" onClick={() => setViewModal(null)}>Fermer</button>
            <button className="btn btn-info" onClick={() => { setStatutModal(viewModal.id); setNewStatut(viewModal.statut); setViewModal(null); }}>🔄 Statut</button>
            <button className="btn btn-success" onClick={() => { setNotesModal(viewModal); setNotes(viewModal.notes||''); setViewModal(null); }}>📝 Notes</button>
          </>}
        >
          <div className="detail-grid">
            <div className="detail-item"><label>ID</label><span>#{viewModal.id}</span></div>
            <div className="detail-item"><label>Statut</label><span><span className={`badge ${STATUT_BADGE[viewModal.statut]||'badge-gray'}`}>{STATUT_ICON[viewModal.statut]} {viewModal.statut}</span></span></div>
            <div className="detail-item"><label>Patient</label><span>#{viewModal.patientId}</span></div>
            <div className="detail-item"><label>Médecin</label><span>#{viewModal.medecinId}</span></div>
            <div className="detail-item"><label>Créneau</label><span>#{viewModal.creneauId}</span></div>
            <div className="detail-item"><label>Date & Heure</label><span>{viewModal.dateHeureRendezvous?.replace('T',' ')}</span></div>
            <div className="detail-item"><label>Date création</label><span>{viewModal.dateCreation?.replace('T',' ')}</span></div>
            <div className="detail-item"><label>Motif</label><span>{f(viewModal.motif)}</span></div>
          </div>
          {viewModal.notes && <><div className="divider"/><div className="detail-item"><label>Notes</label><span>{viewModal.notes}</span></div></>}
        </Modal>
      )}

      {/* Statut Modal */}
      {statutModal && (
        <Modal title="🔄 Changer le statut" onClose={() => setStatutModal(null)}
          footer={<>
            <button className="btn btn-ghost" onClick={() => setStatutModal(null)}>Annuler</button>
            <button className="btn btn-primary" onClick={changerStatut} disabled={loading}>
              {loading ? <span className="loading-spinner"/> : 'Confirmer'}
            </button>
          </>}
        >
          <div className="form-group">
            <label>Nouveau statut</label>
            <select value={newStatut} onChange={e => setNewStatut(e.target.value)}>
              <option value="EN_ATTENTE">⏳ EN_ATTENTE</option>
              <option value="CONFIRME">✅ CONFIRME</option>
              <option value="ANNULE">❌ ANNULE</option>
              <option value="TERMINE">🏁 TERMINE</option>
            </select>
          </div>
        </Modal>
      )}

      {/* Notes Modal */}
      {notesModal && (
        <Modal title={`📝 Notes — RDV #${notesModal.id}`} onClose={() => setNotesModal(null)}
          footer={<>
            <button className="btn btn-ghost" onClick={() => setNotesModal(null)}>Annuler</button>
            <button className="btn btn-primary" onClick={saveNotes} disabled={loading}>
              {loading ? <span className="loading-spinner"/> : 'Sauvegarder'}
            </button>
          </>}
        >
          <div className="form-group">
            <label>Notes médicales</label>
            <textarea rows={6} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Saisir les notes..." />
          </div>
        </Modal>
      )}
    </div>
  );
}
