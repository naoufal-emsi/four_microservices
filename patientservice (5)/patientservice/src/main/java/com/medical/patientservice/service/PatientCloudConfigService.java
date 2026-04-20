package com.medical.patientservice.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class PatientCloudConfigService {

    @Value("${service.rendezvous.url}")
    private String rendezvousServiceUrl;

    @Value("${service.history.url}")
    private String historyServiceUrl;

    @Value("${service.notification.url}")
    private String notificationServiceUrl;

    public Map<String, String> getExternalConfig() {
        return Map.of(
                "rendezvousServiceUrl", rendezvousServiceUrl,
                "historyServiceUrl", historyServiceUrl,
                "notificationServiceUrl", notificationServiceUrl
        );
    }
}