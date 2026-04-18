package com.medical.dossiers.client;

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

    @Value("${rendezvous.service.url}")
    private String rendezvousUrl;

    @Value("${medecins.service.url}")
    private String medecinsUrl;

    @Value("${notifications.service.url}")
    private String notificationsUrl;

    public MicroserviceClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public boolean patientExists(Long patientId) {
        try {
            restTemplate.getForObject(patientsUrl + "/api/patients/" + patientId, Object.class);
            return true;
        } catch (Exception e) {
            System.err.println("[WARN] patients-service unreachable, skipping validation: " + e.getMessage());
            return true; // fail open until service is available
        }
    }

    public boolean rendezvousExists(Long rendezvousId) {
        try {
            restTemplate.getForObject(rendezvousUrl + "/api/rendezvous/" + rendezvousId, Object.class);
            return true;
        } catch (Exception e) {
            System.err.println("[WARN] rendezvous-service unreachable, skipping validation: " + e.getMessage());
            return true;
        }
    }

    public boolean medecinExists(Long medecinId) {
        try {
            restTemplate.getForObject(medecinsUrl + "/api/medecins/" + medecinId, Object.class);
            return true;
        } catch (Exception e) {
            System.err.println("[WARN] medecins-service unreachable, skipping validation: " + e.getMessage());
            return true;
        }
    }

    public void envoyerNotification(String type, String message, Long referenceId) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("type", type);
            payload.put("message", message);
            payload.put("referenceId", referenceId);
            payload.put("source", "dossiers-service");
            restTemplate.postForObject(notificationsUrl + "/api/notifications", payload, Object.class);
        } catch (Exception e) {
            System.err.println("[WARN] notifications-service unreachable: " + e.getMessage());
        }
    }
}
