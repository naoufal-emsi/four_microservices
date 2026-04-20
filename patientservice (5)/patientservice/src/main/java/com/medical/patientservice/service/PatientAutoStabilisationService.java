package com.medical.patientservice.service;

import com.medical.patientservice.model.Patient;
import com.medical.patientservice.repository.PatientRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class PatientAutoStabilisationService {

    private final PatientRepository patientRepository;

    public PatientAutoStabilisationService(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    @Scheduled(fixedRate = 15000)
    public void verifierEtCorriger() {
        List<Patient> patients = patientRepository.findAll();

        Set<String> emailsVus = new HashSet<>();
        Set<String> telephonesVus = new HashSet<>();

        for (Patient patient : patients) {
            boolean modifie = false;

            String emailNormalise = normaliserEmail(patient.getEmail());
            String telephoneNormalise = normaliserTelephone(patient.getTelephone());

            // 1) normalisation email
            if (patient.getEmail() != null && !patient.getEmail().equals(emailNormalise)) {
                patient.setEmail(emailNormalise);
                modifie = true;
            }

            // 2) normalisation téléphone
            if (patient.getTelephone() != null && !patient.getTelephone().equals(telephoneNormalise)) {
                patient.setTelephone(telephoneNormalise);
                modifie = true;
            }

            // 3) dossier incomplet
            if (estVide(emailNormalise) && estVide(telephoneNormalise)) {
                if (!"INCOMPLET".equals(patient.getStatut())) {
                    patient.setStatut("INCOMPLET");
                    modifie = true;
                }
            } else {
                boolean doublon = false;

                // 4) détection doublon email
                if (!estVide(emailNormalise)) {
                    if (emailsVus.contains(emailNormalise)) {
                        doublon = true;
                    } else {
                        emailsVus.add(emailNormalise);
                    }
                }

                // 5) détection doublon téléphone
                if (!estVide(telephoneNormalise)) {
                    if (telephonesVus.contains(telephoneNormalise)) {
                        doublon = true;
                    } else {
                        telephonesVus.add(telephoneNormalise);
                    }
                }

                if (doublon) {
                    if (!"DOUBLON".equals(patient.getStatut())) {
                        patient.setStatut("DOUBLON");
                        modifie = true;
                    }
                } else {
                    // 6) statut par défaut si dossier correct
                    if (patient.getStatut() == null ||
                        patient.getStatut().isBlank() ||
                        (!patient.getStatut().equals("ACTIF")
                                && !patient.getStatut().equals("INCOMPLET")
                                && !patient.getStatut().equals("DOUBLON"))) {

                        patient.setStatut("ACTIF");
                        modifie = true;
                    }
                }
            }

            if (modifie) {
                patientRepository.save(patient);
                System.out.println("Auto-correction appliquée au patient id = " + patient.getId()
                        + " | nouveau statut = " + patient.getStatut());
            }
        }
    }

    private String normaliserEmail(String email) {
        if (email == null) return null;
        return email.trim().toLowerCase();
    }

    private String normaliserTelephone(String telephone) {
        if (telephone == null) return null;
        return telephone.replace(" ", "").trim();
    }

    private boolean estVide(String valeur) {
        return valeur == null || valeur.isBlank();
    }
}