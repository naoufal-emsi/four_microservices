package com.medical.rendezvous.service;

import com.medical.rendezvous.client.MicroserviceClient;
import com.medical.rendezvous.model.Rendezvous;
import com.medical.rendezvous.repository.RendezvousRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class RendezvousService {

    private final RendezvousRepository repository;
    private final MicroserviceClient client;

    public RendezvousService(RendezvousRepository repository, MicroserviceClient client) {
        this.repository = repository;
        this.client = client;
    }

    public Rendezvous creer(Rendezvous rdv) {
        if (!client.patientExists(rdv.getPatientId()))
            throw new RuntimeException("Patient introuvable: " + rdv.getPatientId());

        if (!client.medecinExists(rdv.getMedecinId()))
            throw new RuntimeException("Médecin introuvable: " + rdv.getMedecinId());

        if (!client.creneauDisponible(rdv.getCreneauId()))
            throw new RuntimeException("Créneau indisponible ou introuvable: " + rdv.getCreneauId());

        if (repository.existsByCreneauIdAndStatutNotAndStatutNot(rdv.getCreneauId(),
                Rendezvous.StatutRendezvous.ANNULE, Rendezvous.StatutRendezvous.TERMINE))
            throw new RuntimeException("Ce créneau est déjà réservé");

        rdv.setDateCreation(LocalDateTime.now());
        rdv.setStatut(Rendezvous.StatutRendezvous.EN_ATTENTE);

        Rendezvous saved = repository.save(rdv);

        client.bloquerCreneau(rdv.getCreneauId());
        client.occuperMedecin(rdv.getMedecinId());
        client.envoyerNotification("RDV_CREE",
                "Rendez-vous créé pour le patient " + rdv.getPatientId() + " avec le médecin " + rdv.getMedecinId(),
                saved.getId(), rdv.getPatientId());

        return saved;
    }

    public List<Rendezvous> listerTous() {
        return repository.findAll();
    }

    public Rendezvous trouverParId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rendez-vous introuvable: " + id));
    }

    public List<Rendezvous> trouverParPatient(Long patientId) {
        return repository.findByPatientId(patientId);
    }

    public List<Rendezvous> trouverParMedecin(Long medecinId) {
        return repository.findByMedecinId(medecinId);
    }

    public Rendezvous changerStatut(Long id, Rendezvous.StatutRendezvous nouveauStatut) {
        Rendezvous rdv = trouverParId(id);
        Rendezvous.StatutRendezvous ancienStatut = rdv.getStatut();
        rdv.setStatut(nouveauStatut);
        Rendezvous saved = repository.save(rdv);

        boolean liberer = (nouveauStatut == Rendezvous.StatutRendezvous.ANNULE
                || nouveauStatut == Rendezvous.StatutRendezvous.TERMINE)
                && ancienStatut != Rendezvous.StatutRendezvous.ANNULE
                && ancienStatut != Rendezvous.StatutRendezvous.TERMINE;
        if (liberer) {
            client.libererCreneau(rdv.getCreneauId());
            client.libererMedecin(rdv.getMedecinId());
        }

        client.envoyerNotification("RDV_STATUT_CHANGE",
                "Rendez-vous " + id + " passé au statut " + nouveauStatut, id, rdv.getPatientId());
        return saved;
    }

    public Rendezvous annuler(Long id) {
        Rendezvous rdv = trouverParId(id);
        if (rdv.getStatut() == Rendezvous.StatutRendezvous.ANNULE)
            throw new RuntimeException("Ce rendez-vous est déjà annulé");

        rdv.setStatut(Rendezvous.StatutRendezvous.ANNULE);
        Rendezvous saved = repository.save(rdv);

        client.libererCreneau(rdv.getCreneauId());
        client.libererMedecin(rdv.getMedecinId());
        client.envoyerNotification("RDV_ANNULE",
                "Rendez-vous " + id + " annulé, créneau " + rdv.getCreneauId() + " libéré", id, rdv.getPatientId());

        return saved;
    }

    public Rendezvous modifierNotes(Long id, String notes) {
        Rendezvous rdv = trouverParId(id);
        rdv.setNotes(notes);
        Rendezvous saved = repository.save(rdv);
        client.envoyerNotification("RDV_NOTES_MODIFIEES",
                "Notes du rendez-vous " + id + " mises à jour", id, rdv.getPatientId());
        return saved;
    }
}
