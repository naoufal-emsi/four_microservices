package com.medical.notification.service;

import com.medical.notification.model.Notification;
import com.medical.notification.model.Historique;
import com.medical.notification.repository.NotificationRepository;
import com.medical.notification.repository.HistoriqueRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private HistoriqueRepository historiqueRepository;

    // 🔥 créer notification + historique
    public void createNotification(String message, String type, Long rdvId, Long patientId) {

        // Notification
        Notification n = new Notification();
        n.setMessage(message);
        n.setType(type);
        n.setDate(LocalDateTime.now());
        n.setRendezVousId(rdvId);

        notificationRepository.save(n);

        // Historique
        Historique h = new Historique();
        h.setAction(type);
        h.setDate(LocalDateTime.now());
        h.setRendezVousId(rdvId);
        h.setPatientId(patientId);

        historiqueRepository.save(h);
    }

    // récupérer toutes les notifications
    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll();
    }

    // récupérer historique par patient
    public List<Historique> getHistoriqueByPatient(Long patientId) {
        return historiqueRepository.findByPatientId(patientId);
    }
    
    public List<Notification> getNotificationsByRendezVous(Long id) {
        return notificationRepository.findByRendezVousId(id);
    } 
    
    public List<Historique> getHistoriqueByRendezVous(Long id) {
        return historiqueRepository.findByRendezVousId(id);
    }
}