package com.medical.medecinservice;

import org.springframework.boot.SpringApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.boot.autoconfigure.SpringBootApplication;
@SpringBootApplication
@EnableScheduling
public class MedecinserviceApplication {

	public static void main(String[] args) {
        SpringApplication.run(MedecinserviceApplication.class, args);
    }
}
