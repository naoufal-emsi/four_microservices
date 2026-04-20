package com.medical.medecinservice.model;

import jakarta.persistence.*;

@Entity
@Table(name = "specialites")
public class Specialite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String nom;
    private String description;

    public Specialite() {}

    public Specialite(String nom, String description) {
        this.nom = nom;
        this.description = description;
    }

    public Integer getId() { return id; }
    public String getNom() { return nom; }
    public String getDescription() { return description; }

    public void setId(Integer id) { this.id = id; }
    public void setNom(String nom) { this.nom = nom; }
    public void setDescription(String description) { this.description = description; }
}