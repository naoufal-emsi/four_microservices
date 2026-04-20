package com.medical.medecinservice.web;

import com.medical.medecinservice.model.Medecin;
import com.medical.medecinservice.service.MedecinService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/medecins")
public class MedecinController {

    private final MedecinService medecinService;

    public MedecinController(MedecinService medecinService) {
        this.medecinService = medecinService;
    }

    // GET /medecins — Liste tous les médecins
    @GetMapping
    public List<Medecin> getAll() {
        return medecinService.findAll();
    }

    // GET /medecins/{id} — Détail d'un médecin
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(medecinService.findById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // POST /medecins — Ajouter un médecin
    @PostMapping
    public ResponseEntity<Medecin> create(@RequestBody Medecin medecin) {
        return ResponseEntity.status(HttpStatus.CREATED).body(medecinService.save(medecin));
    }

    // PUT /medecins/{id} — Modifier un médecin
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Integer id, @RequestBody Medecin medecin) {
        try {
            return ResponseEntity.ok(medecinService.update(id, medecin));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // DELETE /medecins/{id} — Supprimer un médecin
    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Integer id) {
        medecinService.delete(id);
        return ResponseEntity.ok("Médecin supprimé avec succès");
    }

    // GET /medecins/disponibles — Médecins disponibles
    @GetMapping("/disponibles")
    public List<Medecin> getDisponibles() {
        return medecinService.findDisponibles();
    }

    // GET /medecins/specialite/{specialiteId} — Médecins par spécialité
    @GetMapping("/specialite/{specialiteId}")
    public List<Medecin> getBySpecialite(@PathVariable Integer specialiteId) {
        return medecinService.findBySpecialite(specialiteId);
    }

    // GET /medecins/{id}/disponibilite — Vérifier disponibilité (pour microservice Rendez-vous)
    @GetMapping("/{id}/disponibilite")
    public ResponseEntity<Map<String, Object>> verifierDisponibilite(@PathVariable Integer id) {
        try {
            boolean dispo = medecinService.verifierDisponibilite(id);
            return ResponseEntity.ok(Map.of(
                "medecinId", id,
                "disponible", dispo
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("erreur", e.getMessage()));
        }
    }

    // PUT /medecins/{id}/occuper — Marquer occupé (appelé par Rendez-vous)
    @PutMapping("/{id}/occuper")
    public ResponseEntity<?> marquerOccupe(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(medecinService.marquerOccupe(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // PUT /medecins/{id}/liberer — Libérer (appelé après annulation)
    @PutMapping("/{id}/liberer")
    public ResponseEntity<?> marquerDisponible(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(medecinService.marquerDisponible(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
 // IA - Score de charge
    @GetMapping("/{id}/score")
    public ResponseEntity<?> getScore(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(medecinService.calculerScoreCharge(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // IA - Recommander médecin
    @GetMapping("/recommander/{specialiteId}")
    public ResponseEntity<?> recommander(@PathVariable Integer specialiteId) {
        return ResponseEntity.ok(medecinService.recommanderMedecin(specialiteId));
    }

    // IA - Rapport global
    @GetMapping("/analyse/rapport")
    public ResponseEntity<?> getRapport() {
        return ResponseEntity.ok(medecinService.genererRapport());
    }
}