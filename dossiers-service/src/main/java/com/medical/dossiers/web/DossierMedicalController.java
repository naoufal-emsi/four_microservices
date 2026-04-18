package com.medical.dossiers.web;

import com.medical.dossiers.model.DossierMedical;
import com.medical.dossiers.service.DossierMedicalService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dossiers")
public class DossierMedicalController {

    private final DossierMedicalService service;

    public DossierMedicalController(DossierMedicalService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<?> creer(@RequestBody DossierMedical dossier) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(service.creer(dossier));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public List<DossierMedical> listerTous() {
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
    public ResponseEntity<?> trouverParPatient(@PathVariable Long patientId) {
        try {
            return ResponseEntity.ok(service.trouverParPatient(patientId));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> modifier(@PathVariable Long id, @RequestBody DossierMedical dossier) {
        try {
            return ResponseEntity.ok(service.modifier(id, dossier));
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
