package com.medical.dossiers.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "comptes_rendus")
public class CompteRendu {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long rendezvousId;

    @Column(nullable = false)
    private Long patientId;

    @Column(nullable = false)
    private Long medecinId;

    @Column(nullable = false)
    private LocalDateTime dateRedaction;

    @Column(nullable = false, length = 2000)
    private String contenu;

    @Column(length = 1000)
    private String remarques;

    @Column(length = 500)
    private String prescription;

    @Enumerated(EnumType.STRING)
    private StatutCompteRendu statut;

    public enum StatutCompteRendu {
        BROUILLON, FINALISE
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getRendezvousId() { return rendezvousId; }
    public void setRendezvousId(Long rendezvousId) { this.rendezvousId = rendezvousId; }

    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }

    public Long getMedecinId() { return medecinId; }
    public void setMedecinId(Long medecinId) { this.medecinId = medecinId; }

    public LocalDateTime getDateRedaction() { return dateRedaction; }
    public void setDateRedaction(LocalDateTime dateRedaction) { this.dateRedaction = dateRedaction; }

    public String getContenu() { return contenu; }
    public void setContenu(String contenu) { this.contenu = contenu; }

    public String getRemarques() { return remarques; }
    public void setRemarques(String remarques) { this.remarques = remarques; }

    public String getPrescription() { return prescription; }
    public void setPrescription(String prescription) { this.prescription = prescription; }

    public StatutCompteRendu getStatut() { return statut; }
    public void setStatut(StatutCompteRendu statut) { this.statut = statut; }
}
