package com.medical.medecinservice.web;

import com.medical.medecinservice.model.Specialite;
import com.medical.medecinservice.repository.SpecialiteRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/specialites")
public class SpecialiteController {

    private final SpecialiteRepository specialiteRepository;

    public SpecialiteController(SpecialiteRepository specialiteRepository) {
        this.specialiteRepository = specialiteRepository;
    }

    @GetMapping
    public List<Specialite> getAll() {
        return specialiteRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Integer id) {
        return specialiteRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Specialite> create(@RequestBody Specialite specialite) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(specialiteRepository.save(specialite));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Integer id) {
        specialiteRepository.deleteById(id);
        return ResponseEntity.ok("Spécialité supprimée");
    }
}