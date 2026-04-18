package com.medical.dossiers.service;

import com.medical.dossiers.client.MicroserviceClient;
import com.medical.dossiers.model.DossierMedical;
import com.medical.dossiers.repository.DossierMedicalRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class DossierMedicalService {

    private final DossierMedicalRepository repository;
    private final MicroserviceClient client;

    public DossierMedicalService(DossierMedicalRepository repository, MicroserviceClient client) {
        this.repository = repository;
        this.client = client;
    }

    public DossierMedical creer(DossierMedical dossier) {
        if (!client.patientExists(dossier.getPatientId())) {
            throw new RuntimeException("Patient introuvable avec l'id: " + dossier.getPatientId());
        }
        if (repository.existsByPatientId(dossier.getPatientId())) {
            throw new RuntimeException("Un dossier médical existe déjà pour ce patient");
        }
        dossier.setDateCreation(LocalDate.now());
        DossierMedical saved = repository.save(dossier);
        client.envoyerNotification("DOSSIER_CREE", "Dossier médical créé pour le patient " + dossier.getPatientId(), saved.getId());
        return saved;
    }

    public List<DossierMedical> listerTous() {
        return repository.findAll();
    }

    public DossierMedical trouverParId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Dossier introuvable avec l'id: " + id));
    }

    public DossierMedical trouverParPatient(Long patientId) {
        return repository.findByPatientId(patientId)
                .orElseThrow(() -> new RuntimeException("Aucun dossier trouvé pour le patient: " + patientId));
    }

    public DossierMedical modifier(Long id, DossierMedical dossierModifie) {
        DossierMedical existant = trouverParId(id);
        existant.setGroupeSanguin(dossierModifie.getGroupeSanguin());
        existant.setAntecedents(dossierModifie.getAntecedents());
        existant.setAllergies(dossierModifie.getAllergies());
        existant.setObservations(dossierModifie.getObservations());
        return repository.save(existant);
    }

    public void supprimer(Long id) {
        trouverParId(id);
        repository.deleteById(id);
    }
}
