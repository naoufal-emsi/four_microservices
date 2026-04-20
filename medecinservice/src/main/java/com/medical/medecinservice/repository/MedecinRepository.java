package com.medical.medecinservice.repository;

import com.medical.medecinservice.model.Medecin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedecinRepository extends JpaRepository<Medecin, Integer> {
    List<Medecin> findByDisponibleTrue();
    List<Medecin> findBySpecialiteId(Integer specialiteId);
}