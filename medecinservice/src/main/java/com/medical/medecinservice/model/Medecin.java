package com.medical.medecinservice.model;

import jakarta.persistence.*;

@Entity
@Table(name = "medecins")
public class Medecin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private boolean disponible;

    @ManyToOne
    @JoinColumn(name = "specialite_id")
    private Specialite specialite;

    public Medecin() {}

    public Medecin(String nom, String prenom, String email, String telephone,
                   boolean disponible, Specialite specialite) {
        this.nom = nom;
        this.prenom = prenom;
        this.email = email;
        this.telephone = telephone;
        this.disponible = disponible;
        this.specialite = specialite;
    }

    public Integer getId() { return id; }
    public String getNom() { return nom; }
    public String getPrenom() { return prenom; }
    public String getEmail() { return email; }
    public String getTelephone() { return telephone; }
    public boolean isDisponible() { return disponible; }
    public Specialite getSpecialite() { return specialite; }

    public void setId(Integer id) { this.id = id; }
    public void setNom(String nom) { this.nom = nom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }
    public void setEmail(String email) { this.email = email; }
    public void setTelephone(String telephone) { this.telephone = telephone; }
    public void setDisponible(boolean disponible) { this.disponible = disponible; }
    public void setSpecialite(Specialite specialite) { this.specialite = specialite; }
}