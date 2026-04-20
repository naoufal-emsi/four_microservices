package com.medical.patientservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class PatientserviceApplication {

    public static void main(String[] args) {
        SpringApplication.run(PatientserviceApplication.class, args);
    }
}