package com.medical.rendezvous.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "rendezvous")
@Data
public class Rendezvous {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long patientId;

    @Column(nullable = false)
    private Long medecinId;

    @Column(nullable = false)
    private Long creneauId;

    @Column(nullable = false)
    private LocalDateTime dateHeureRendezvous;

    @Column(nullable = false)
    private LocalDateTime dateCreation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutRendezvous statut;

    @Column(length = 500)
    private String motif;

    @Column(length = 500)
    private String notes;

    public enum StatutRendezvous {
        EN_ATTENTE, CONFIRME, ANNULE, TERMINE
    }
}
