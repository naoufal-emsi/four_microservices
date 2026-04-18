package com.medical.dossiers.web;

import com.medical.dossiers.model.CompteRendu;
import com.medical.dossiers.service.CompteRenduService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comptes-rendus")
public class CompteRenduController {

    private final CompteRenduService service;

    public CompteRenduController(CompteRenduService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<?> creer(@RequestBody CompteRendu compteRendu) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(service.creer(compteRendu));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public List<CompteRendu> listerTous() {
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
    public List<CompteRendu> trouverParPatient(@PathVariable Long patientId) {
        return service.trouverParPatient(patientId);
    }

    @GetMapping("/rendezvous/{rendezvousId}")
    public List<CompteRendu> trouverParRendezvous(@PathVariable Long rendezvousId) {
        return service.trouverParRendezvous(rendezvousId);
    }

    @GetMapping("/medecin/{medecinId}")
    public List<CompteRendu> trouverParMedecin(@PathVariable Long medecinId) {
        return service.trouverParMedecin(medecinId);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> modifier(@PathVariable Long id, @RequestBody CompteRendu compteRendu) {
        try {
            return ResponseEntity.ok(service.modifier(id, compteRendu));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/finaliser")
    public ResponseEntity<?> finaliser(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(service.finaliser(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        try {
            service.supprimer(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
