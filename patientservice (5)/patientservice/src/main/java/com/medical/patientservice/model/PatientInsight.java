package com.medical.patientservice.model;

import java.util.List;

public class PatientInsight {

    private int score;
    private String niveau;
    private List<String> anomalies;
    private int nombreAnomalies;
    private String recommandation;

    public PatientInsight() {
    }

    public PatientInsight(int score, String niveau, List<String> anomalies, int nombreAnomalies, String recommandation) {
        this.score = score;
        this.niveau = niveau;
        this.anomalies = anomalies;
        this.nombreAnomalies = nombreAnomalies;
        this.recommandation = recommandation;
    }

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }

    public String getNiveau() {
        return niveau;
    }

    public void setNiveau(String niveau) {
        this.niveau = niveau;
    }

    public List<String> getAnomalies() {
        return anomalies;
    }

    public void setAnomalies(List<String> anomalies) {
        this.anomalies = anomalies;
    }

    public int getNombreAnomalies() {
        return nombreAnomalies;
    }

    public void setNombreAnomalies(int nombreAnomalies) {
        this.nombreAnomalies = nombreAnomalies;
    }

    public String getRecommandation() {
        return recommandation;
    }

    public void setRecommandation(String recommandation) {
        this.recommandation = recommandation;
    }
}