package com.medical.dossiers.service;

import com.medical.dossiers.client.MicroserviceClient;
import com.medical.dossiers.model.CompteRendu;
import com.medical.dossiers.repository.CompteRenduRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CompteRenduService {

    private final CompteRenduRepository repository;
    private final MicroserviceClient client;

    public CompteRenduService(CompteRenduRepository repository, MicroserviceClient client) {
        this.repository = repository;
        this.client = client;
    }

    public CompteRendu creer(CompteRendu compteRendu) {
        if (!client.patientExists(compteRendu.getPatientId())) {
            throw new RuntimeException("Patient introuvable avec l'id: " + compteRendu.getPatientId());
        }
        if (!client.rendezvousExists(compteRendu.getRendezvousId())) {
            throw new RuntimeException("Rendez-vous introuvable avec l'id: " + compteRendu.getRendezvousId());
        }
        if (!client.medecinExists(compteRendu.getMedecinId())) {
            throw new RuntimeException("Médecin introuvable avec l'id: " + compteRendu.getMedecinId());
        }
        compteRendu.setDateRedaction(LocalDateTime.now());
        compteRendu.setStatut(CompteRendu.StatutCompteRendu.BROUILLON);
        CompteRendu saved = repository.save(compteRendu);
        client.envoyerNotification("COMPTE_RENDU_CREE",
                "Compte rendu créé pour le rendez-vous " + compteRendu.getRendezvousId(), saved.getId());
        return saved;
    }

    public List<CompteRendu> listerTous() {
        return repository.findAll();
    }

    public CompteRendu trouverParId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Compte rendu introuvable avec l'id: " + id));
    }

    public List<CompteRendu> trouverParPatient(Long patientId) {
        return repository.findByPatientId(patientId);
    }

    public List<CompteRendu> trouverParRendezvous(Long rendezvousId) {
        return repository.findByRendezvousId(rendezvousId);
    }

    public List<CompteRendu> trouverParMedecin(Long medecinId) {
        return repository.findByMedecinId(medecinId);
    }

    public CompteRendu modifier(Long id, CompteRendu modifie) {
        CompteRendu existant = trouverParId(id);
        existant.setContenu(modifie.getContenu());
        existant.setRemarques(modifie.getRemarques());
        existant.setPrescription(modifie.getPrescription());
        return repository.save(existant);
    }

    public CompteRendu finaliser(Long id) {
        CompteRendu existant = trouverParId(id);
        existant.setStatut(CompteRendu.StatutCompteRendu.FINALISE);
        CompteRendu saved = repository.save(existant);
        client.envoyerNotification("COMPTE_RENDU_FINALISE",
                "Compte rendu finalisé pour le rendez-vous " + existant.getRendezvousId(), saved.getId());
        return saved;
    }

    public void supprimer(Long id) {
        trouverParId(id);
        repository.deleteById(id);
    }
}
