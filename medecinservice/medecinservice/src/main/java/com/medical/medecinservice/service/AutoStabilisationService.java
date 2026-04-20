package com.medical.medecinservice.service;

import com.medical.medecinservice.model.Medecin;
import com.medical.medecinservice.repository.MedecinRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class AutoStabilisationService {

    private final MedecinRepository medecinRepository;
    private final RestTemplate restTemplate;

    @Value("${service.rendezvous.url}")
    private String rendezvousServiceUrl;

    public AutoStabilisationService(MedecinRepository medecinRepository,
                                     RestTemplate restTemplate) {
        this.medecinRepository = medecinRepository;
        this.restTemplate = restTemplate;
    }

    @Scheduled(fixedRate = 20000)
    public void verifierCoherenceMedecins() {
        List<Medecin> medecins = medecinRepository.findAll();

        for (Medecin medecin : medecins) {
            if (!medecin.isDisponible()) {
                try {
                    String url = rendezvousServiceUrl + "/actif/medecin/" + medecin.getId();
                    Map<?, ?> result = restTemplate.getForObject(url, Map.class);

                    if (result != null) {
                        Boolean hasActif = (Boolean) result.get("hasRendezVousActif");
                        if (hasActif != null && !hasActif) {
                            medecin.setDisponible(true);
                            medecinRepository.save(medecin);
                            System.out.println("[AUTO-STABILISATION] Médecin "
                                + medecin.getId() + " remis disponible automatiquement.");
                        }
                    }
                } catch (Exception e) {
                    System.out.println("[AUTO-STABILISATION] Rendez-vous injoignable, skip médecin "
                        + medecin.getId());
                }
            }
        }
    }
}