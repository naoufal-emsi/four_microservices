package com.medical.rendezvous.repository;

import com.medical.rendezvous.model.Rendezvous;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RendezvousRepository extends JpaRepository<Rendezvous, Long> {
    List<Rendezvous> findByPatientId(Long patientId);
    List<Rendezvous> findByMedecinId(Long medecinId);
    List<Rendezvous> findByStatut(Rendezvous.StatutRendezvous statut);
    boolean existsByCreneauIdAndStatutNot(Long creneauId, Rendezvous.StatutRendezvous statut);
    boolean existsByCreneauIdAndStatutNotAndStatutNot(Long creneauId, Rendezvous.StatutRendezvous statut1, Rendezvous.StatutRendezvous statut2);
}
