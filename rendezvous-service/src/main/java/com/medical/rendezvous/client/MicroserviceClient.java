package com.medical.rendezvous.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Component
public class MicroserviceClient {

    private final RestTemplate restTemplate;

    @Value("${patients.service.url}")
    private String patientsUrl;

    @Value("${medecins.service.url}")
    private String medecinsUrl;

    @Value("${planning.service.url}")
    private String planningUrl;

    @Value("${notifications.service.url}")
    private String notificationsUrl;

    public MicroserviceClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public boolean patientExists(Long patientId) {
        try {
            restTemplate.getForObject(patientsUrl + "/patients/" + patientId, Object.class);
            return true;
        } catch (Exception e) {
            System.err.println("[WARN] patients-service unreachable, skipping validation: " + e.getMessage());
            return true;
        }
    }

    public boolean medecinExists(Long medecinId) {
        try {
            restTemplate.getForObject(medecinsUrl + "/medecins/" + medecinId, Object.class);
            return true;
        } catch (Exception e) {
            System.err.println("[WARN] medecins-service unreachable, skipping validation: " + e.getMessage());
            return true;
        }
    }

    public boolean creneauDisponible(Long creneauId) {
        try {
            Map response = restTemplate.getForObject(
                planningUrl + "/creneaux/" + creneauId, Map.class);
            return response != null && Boolean.TRUE.equals(response.get("disponible"));
        } catch (Exception e) {
            System.err.println("[WARN] planning-service unreachable, skipping validation: " + e.getMessage());
            return true;
        }
    }

    public void bloquerCreneau(Long creneauId) {
        try {
            restTemplate.put(planningUrl + "/creneaux/" + creneauId + "/bloquer", null);
        } catch (Exception e) {
            System.err.println("[WARN] planning-service unreachable, could not block creneau: " + e.getMessage());
        }
    }

    public void libererCreneau(Long creneauId) {
        try {
            restTemplate.put(planningUrl + "/creneaux/" + creneauId + "/liberer", null);
        } catch (Exception e) {
            System.err.println("[WARN] planning-service unreachable, could not free creneau: " + e.getMessage());
        }
    }

    public void occuperMedecin(Long medecinId) {
        try {
            restTemplate.put(medecinsUrl + "/medecins/" + medecinId + "/occuper", null);
        } catch (Exception e) {
            System.err.println("[WARN] medecins-service unreachable, could not mark medecin occupé: " + e.getMessage());
        }
    }

    public void libererMedecin(Long medecinId) {
        try {
            restTemplate.put(medecinsUrl + "/medecins/" + medecinId + "/liberer", null);
        } catch (Exception e) {
            System.err.println("[WARN] medecins-service unreachable, could not liberate medecin: " + e.getMessage());
        }
    }

    public void envoyerNotification(String type, String message, Long rendezVousId, Long patientId) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("type", type);
            payload.put("message", message);
            payload.put("rendezVousId", rendezVousId);
            payload.put("patientId", patientId);
            restTemplate.postForObject(notificationsUrl + "/notifications", payload, Object.class);
        } catch (Exception e) {
            System.err.println("[WARN] notifications-service unreachable: " + e.getMessage());
        }
    }
}
