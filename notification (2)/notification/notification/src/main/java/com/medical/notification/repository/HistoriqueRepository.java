package com.medical.notification.repository;

import com.medical.notification.model.Historique;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HistoriqueRepository extends JpaRepository<Historique, Long> {

    // pour filtrer par patient
    List<Historique> findByPatientId(Long patientId);

    // pour filtrer par rendez-vous
    List<Historique> findByRendezVousId(Long rendezVousId);
}