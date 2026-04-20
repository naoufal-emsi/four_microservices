package com.medical.patientservice.service;

import com.medical.patientservice.model.Patient;
import com.medical.patientservice.model.PatientDecision;
import com.medical.patientservice.repository.PatientRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class PatientService {

    private final PatientRepository patientRepository;

    public PatientService(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    public Patient ajouterPatient(Patient patient) {
        if (patient.getStatut() == null || patient.getStatut().isBlank()) {
            patient.setStatut("ACTIF");
        }
        return patientRepository.save(patient);
    }

    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    public Patient getPatientById(Long id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient introuvable avec l'id : " + id));
    }

    public Patient updatePatient(Long id, Patient patientDetails) {
        Patient patient = getPatientById(id);

        patient.setNom(patientDetails.getNom());
        patient.setPrenom(patientDetails.getPrenom());
        patient.setTelephone(patientDetails.getTelephone());
        patient.setEmail(patientDetails.getEmail());
        patient.setAdresse(patientDetails.getAdresse());
        patient.setStatut(patientDetails.getStatut());

        return patientRepository.save(patient);
    }

    public void deletePatient(Long id) {
        Patient patient = getPatientById(id);
        patientRepository.delete(patient);
    }

    public boolean existsById(Long id) {
        return patientRepository.existsById(id);
    }

    public PatientDecision analyserDecisionPatient(Long id) {
        Patient patient = getPatientById(id);
        List<Patient> tousLesPatients = patientRepository.findAll();
        List<String> risques = new ArrayList<>();

        boolean emailManquant = patient.getEmail() == null || patient.getEmail().isBlank();
        boolean telephoneManquant = patient.getTelephone() == null || patient.getTelephone().isBlank();
        boolean adresseManquante = patient.getAdresse() == null || patient.getAdresse().isBlank();

        String emailNormalise = patient.getEmail() == null ? "" : patient.getEmail().trim().toLowerCase();
        String telephoneNormalise = patient.getTelephone() == null ? "" : patient.getTelephone().replace(" ", "").trim();

        boolean doublonEmail = false;
        boolean doublonTelephone = false;

        for (Patient autre : tousLesPatients) {
            if (!autre.getId().equals(patient.getId())) {
                String autreEmail = autre.getEmail() == null ? "" : autre.getEmail().trim().toLowerCase();
                String autreTelephone = autre.getTelephone() == null ? "" : autre.getTelephone().replace(" ", "").trim();

                if (!emailNormalise.isBlank() && emailNormalise.equals(autreEmail)) {
                    doublonEmail = true;
                }

                if (!telephoneNormalise.isBlank() && telephoneNormalise.equals(autreTelephone)) {
                    doublonTelephone = true;
                }
            }
        }

        if (doublonEmail && doublonTelephone) {
            risques.add("Création de rendez-vous en double");
            risques.add("Historique patient incohérent");

            return new PatientDecision(
                    "BLOQUE",
                    "Doublon détecté sur l'email et le téléphone",
                    risques,
                    "Vérifier le dossier et fusionner ou désactiver le doublon"
            );
        }

        if (doublonEmail) {
            risques.add("Création de rendez-vous en double");
            risques.add("Confusion possible entre deux patients");

            return new PatientDecision(
                    "BLOQUE",
                    "Doublon détecté sur l'email",
                    risques,
                    "Vérifier les patients ayant le même email"
            );
        }

        if (doublonTelephone) {
            risques.add("Création de rendez-vous en double");
            risques.add("Confusion possible entre deux patients");

            return new PatientDecision(
                    "BLOQUE",
                    "Doublon détecté sur le téléphone",
                    risques,
                    "Vérifier les patients ayant le même téléphone"
            );
        }

        if (emailManquant && telephoneManquant) {
            risques.add("Impossible de contacter le patient");

            return new PatientDecision(
                    "A_VERIFIER",
                    "Dossier incomplet",
                    risques,
                    "Compléter les coordonnées avant la prise de rendez-vous"
            );
        }

        if (emailManquant || telephoneManquant || adresseManquante) {
            if (emailManquant) {
                risques.add("Email manquant");
            }
            if (telephoneManquant) {
                risques.add("Téléphone manquant");
            }
            if (adresseManquante) {
                risques.add("Adresse manquante");
            }

            return new PatientDecision(
                    "A_VERIFIER",
                    "Certaines informations patient sont incomplètes",
                    risques,
                    "Compléter le dossier avant utilisation"
            );
        }

        return new PatientDecision(
                "RESERVABLE",
                "Dossier cohérent et exploitable",
                risques,
                "Aucune action nécessaire"
        );
    }
}