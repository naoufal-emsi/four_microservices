package com.medical.patientservice.model;

import java.util.List;

public class PatientDecision {

    private String decision;
    private String raisonPrincipale;
    private List<String> risques;
    private String actionRecommandee;

    public PatientDecision() {
    }

    public PatientDecision(String decision, String raisonPrincipale, List<String> risques, String actionRecommandee) {
        this.decision = decision;
        this.raisonPrincipale = raisonPrincipale;
        this.risques = risques;
        this.actionRecommandee = actionRecommandee;
    }

    public String getDecision() {
        return decision;
    }

    public void setDecision(String decision) {
        this.decision = decision;
    }

    public String getRaisonPrincipale() {
        return raisonPrincipale;
    }

    public void setRaisonPrincipale(String raisonPrincipale) {
        this.raisonPrincipale = raisonPrincipale;
    }

    public List<String> getRisques() {
        return risques;
    }

    public void setRisques(List<String> risques) {
        this.risques = risques;
    }

    public String getActionRecommandee() {
        return actionRecommandee;
    }

    public void setActionRecommandee(String actionRecommandee) {
        this.actionRecommandee = actionRecommandee;
    }
}