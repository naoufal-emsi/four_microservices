package com.medical.medecinservice.service;

import com.medical.medecinservice.model.Medecin;
import com.medical.medecinservice.repository.MedecinRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class MedecinService {

    private final MedecinRepository medecinRepository;
    private final RestTemplate restTemplate;

    @Value("${service.rendezvous.url}")
    private String rendezvousServiceUrl;

    public MedecinService(MedecinRepository medecinRepository, RestTemplate restTemplate) {
        this.medecinRepository = medecinRepository;
        this.restTemplate = restTemplate;
    }

    public List<Medecin> findAll() {
        return medecinRepository.findAll();
    }

    public Medecin findById(Integer id) {
        return medecinRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Médecin introuvable avec l'id : " + id));
    }

    public Medecin save(Medecin medecin) {
        return medecinRepository.save(medecin);
    }

    public Medecin update(Integer id, Medecin updated) {
        Medecin existing = findById(id);
        existing.setNom(updated.getNom());
        existing.setPrenom(updated.getPrenom());
        existing.setEmail(updated.getEmail());
        existing.setTelephone(updated.getTelephone());
        existing.setDisponible(updated.isDisponible());
        existing.setSpecialite(updated.getSpecialite());
        return medecinRepository.save(existing);
    }

    public void delete(Integer id) {
        medecinRepository.deleteById(id);
    }

    public List<Medecin> findDisponibles() {
        return medecinRepository.findByDisponibleTrue();
    }

    public List<Medecin> findBySpecialite(Integer specialiteId) {
        return medecinRepository.findBySpecialiteId(specialiteId);
    }

    public boolean verifierDisponibilite(Integer medecinId) {
        Optional<Medecin> medecin = medecinRepository.findById(medecinId);
        return medecin.isPresent() && medecin.get().isDisponible();
    }

    public Medecin marquerOccupe(Integer id) {
        Medecin medecin = findById(id);
        medecin.setDisponible(false);
        return medecinRepository.save(medecin);
    }

    public Medecin marquerDisponible(Integer id) {
        Medecin medecin = findById(id);
        medecin.setDisponible(true);
        return medecinRepository.save(medecin);
    }

    // IA - Score de charge
    public Map<String, Object> calculerScoreCharge(Integer medecinId) {
        Medecin medecin = findById(medecinId);
        Integer nbRendezVous = 0;
        try {
            String url = rendezvousServiceUrl + "/compte/medecin/" + medecinId;
            nbRendezVous = restTemplate.getForObject(url, Integer.class);
            if (nbRendezVous == null) nbRendezVous = 0;
        } catch (Exception e) {
            nbRendezVous = 0;
        }

        String niveau;
        int score;
        if (nbRendezVous >= 15) {
            niveau = "SURCHARGE";
            score = 3;
        } else if (nbRendezVous >= 7) {
            niveau = "CHARGE_NORMALE";
            score = 2;
        } else {
            niveau = "DISPONIBLE";
            score = 1;
        }

        return Map.of(
            "medecinId", medecinId,
            "nom", medecin.getNom() + " " + medecin.getPrenom(),
            "nbRendezVous", nbRendezVous,
            "scoreCharge", score,
            "niveau", niveau,
            "recommandation", niveau.equals("SURCHARGE")
                ? "Éviter de planifier de nouveaux RDV"
                : "Médecin disponible pour de nouveaux RDV"
        );
    }

    // IA - Recommander médecin par spécialité
    public Map<String, Object> recommanderMedecin(Integer specialiteId) {
        List<Medecin> medecins = medecinRepository.findBySpecialiteId(specialiteId);
        if (medecins.isEmpty()) {
            return Map.of("message", "Aucun médecin trouvé pour cette spécialité");
        }

        Medecin recommande = medecins.stream()
                .filter(Medecin::isDisponible)
                .findFirst()
                .orElse(null);

        if (recommande == null) {
            return Map.of(
                "message", "Tous les médecins de cette spécialité sont occupés",
                "suggestion", "Réessayez plus tard ou choisissez une autre spécialité"
            );
        }

        return Map.of(
            "medecinRecommande", recommande,
            "raison", "Médecin disponible avec la spécialité demandée"
        );
    }

    // IA - Rapport d'analyse global
    public Map<String, Object> genererRapport() {
        List<Medecin> tous = medecinRepository.findAll();
        List<Medecin> disponibles = medecinRepository.findByDisponibleTrue();
        long occupes = tous.stream().filter(m -> !m.isDisponible()).count();
        double tauxDisponibilite = tous.isEmpty() ? 0 :
                (double) disponibles.size() / tous.size() * 100;

        String alerte;
        if (tauxDisponibilite < 30) {
            alerte = "CRITIQUE : moins de 30% des médecins sont disponibles";
        } else if (tauxDisponibilite < 60) {
            alerte = "ATTENTION : disponibilité réduite";
        } else {
            alerte = "NORMAL : bonne disponibilité";
        }

        return Map.of(
            "totalMedecins", tous.size(),
            "medecinsDisponibles", disponibles.size(),
            "medecinsOccupes", occupes,
            "tauxDisponibilite", String.format("%.1f%%", tauxDisponibilite),
            "alerte", alerte
        );
    }
}