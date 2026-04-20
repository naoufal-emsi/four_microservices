package com.medical.patientservice.web;

import com.medical.patientservice.model.Patient;
import com.medical.patientservice.model.PatientDecision;
import com.medical.patientservice.service.PatientCloudConfigService;
import com.medical.patientservice.service.PatientService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/patients")
public class PatientController {

    private final PatientService patientService;
    private final PatientCloudConfigService patientCloudConfigService;

    public PatientController(PatientService patientService, PatientCloudConfigService patientCloudConfigService) {
        this.patientService = patientService;
        this.patientCloudConfigService = patientCloudConfigService;
    }

    @PostMapping
    public Patient ajouterPatient(@Valid @RequestBody Patient patient) {
        return patientService.ajouterPatient(patient);
    }

    @GetMapping
    public List<Patient> getAllPatients() {
        return patientService.getAllPatients();
    }

    @GetMapping("/{id}")
    public Patient getPatientById(@PathVariable Long id) {
        return patientService.getPatientById(id);
    }

    @PutMapping("/{id}")
    public Patient updatePatient(@PathVariable Long id, @Valid @RequestBody Patient patient) {
        return patientService.updatePatient(id, patient);
    }

    @DeleteMapping("/{id}")
    public Map<String, String> deletePatient(@PathVariable Long id) {
        patientService.deletePatient(id);
        return Map.of("message", "Patient supprimé avec succès");
    }

    @GetMapping("/exists/{id}")
    public Map<String, Boolean> existsById(@PathVariable Long id) {
        return Map.of("exists", patientService.existsById(id));
    }

    @GetMapping("/config/external")
    public Map<String, String> getExternalConfig() {
        return patientCloudConfigService.getExternalConfig();
    }

    @GetMapping("/{id}/decision")
    public PatientDecision getPatientDecision(@PathVariable Long id) {
        return patientService.analyserDecisionPatient(id);
    }
}