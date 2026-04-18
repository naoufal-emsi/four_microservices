package com.medical.dossiers.repository;

import com.medical.dossiers.model.DossierMedical;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface DossierMedicalRepository extends JpaRepository<DossierMedical, Long> {
    Optional<DossierMedical> findByPatientId(Long patientId);
    boolean existsByPatientId(Long patientId);
}
