package com.medical.medecinservice.config;

import com.medical.medecinservice.model.Medecin;
import com.medical.medecinservice.model.Specialite;
import com.medical.medecinservice.repository.MedecinRepository;
import com.medical.medecinservice.repository.SpecialiteRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final MedecinRepository medecinRepository;
    private final SpecialiteRepository specialiteRepository;

    public DataInitializer(MedecinRepository medecinRepository,
                           SpecialiteRepository specialiteRepository) {
        this.medecinRepository = medecinRepository;
        this.specialiteRepository = specialiteRepository;
    }

    @Override
    public void run(String... args) {
        Specialite cardio = specialiteRepository.save(
                new Specialite("Cardiologie", "Maladies du cœur"));
        Specialite dermato = specialiteRepository.save(
                new Specialite("Dermatologie", "Maladies de la peau"));
        Specialite general = specialiteRepository.save(
                new Specialite("Médecine générale", "Consultations générales"));

        medecinRepository.save(new Medecin("Benali", "Karim",
                "k.benali@medical.com", "0600000001", true, cardio));
        medecinRepository.save(new Medecin("Fassi", "Nadia",
                "n.fassi@medical.com", "0600000002", true, dermato));
        medecinRepository.save(new Medecin("Idrissi", "Youssef",
                "y.idrissi@medical.com", "0600000003", true, general));
    }
}