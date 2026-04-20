package com.medical.rendezvous.web;

import com.medical.rendezvous.model.Rendezvous;
import com.medical.rendezvous.service.RendezvousService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rendezvous")
public class RendezvousController {

    private final RendezvousService service;

    public RendezvousController(RendezvousService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<?> creer(@RequestBody Rendezvous rdv) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(service.creer(rdv));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public List<Rendezvous> listerTous() {
        return service.listerTous();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> trouverParId(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(service.trouverParId(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/patient/{patientId}")
    public List<Rendezvous> trouverParPatient(@PathVariable Long patientId) {
        return service.trouverParPatient(patientId);
    }

    @GetMapping("/medecin/{medecinId}")
    public List<Rendezvous> trouverParMedecin(@PathVariable Long medecinId) {
        return service.trouverParMedecin(medecinId);
    }

    @GetMapping("/compte/medecin/{medecinId}")
    public int compterParMedecin(@PathVariable Long medecinId) {
        return service.trouverParMedecin(medecinId).size();
    }

    @PutMapping("/{id}/statut")
    public ResponseEntity<?> changerStatut(@PathVariable Long id,
                                           @RequestBody Map<String, String> body) {
        try {
            Rendezvous.StatutRendezvous statut = Rendezvous.StatutRendezvous.valueOf(body.get("statut"));
            return ResponseEntity.ok(service.changerStatut(id, statut));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/annuler")
    public ResponseEntity<?> annuler(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(service.annuler(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/notes")
    public ResponseEntity<?> modifierNotes(@PathVariable Long id,
                                           @RequestBody Map<String, String> body) {
        try {
            return ResponseEntity.ok(service.modifierNotes(id, body.get("notes")));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
