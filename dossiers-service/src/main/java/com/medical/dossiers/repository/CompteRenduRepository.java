package com.medical.dossiers.repository;

import com.medical.dossiers.model.CompteRendu;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CompteRenduRepository extends JpaRepository<CompteRendu, Long> {
    List<CompteRendu> findByPatientId(Long patientId);
    List<CompteRendu> findByRendezvousId(Long rendezvousId);
    List<CompteRendu> findByMedecinId(Long medecinId);
}
