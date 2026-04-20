package com.medical.notification.controller;

import com.medical.notification.model.Notification;
import com.medical.notification.model.Historique;
import com.medical.notification.service.NotificationService;
import com.medical.notification.dto.NotificationRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    @Autowired
    private NotificationService service;

    // 🔥 créer notification + historique
    @PostMapping
    public String createNotification(@RequestBody NotificationRequest request) {
        service.createNotification(
                request.getMessage(),
                request.getType(),
                request.getRendezVousId(),
                request.getPatientId()
        );
    return "Notification créée avec succès";
    }

    // récupérer toutes les notifications
    @GetMapping
    public List<Notification> getAllNotifications() {
        return service.getAllNotifications();
    }
    @GetMapping("/test")
    public String test() {
        return "OK";
    } 
    @GetMapping("/rendezvous/{id}")
    public List<Historique> getByRdv(@PathVariable Long id) {
        return service.getHistoriqueByRendezVous(id);
    }

    @GetMapping("/rendezvous/{id}/notifications")
    public List<Notification> getNotifByRdv(@PathVariable Long id) {
        return service.getNotificationsByRendezVous(id);
    }
    
    // historique par patient
    @GetMapping("/patient/{id}")
    public List<Historique> getHistoriqueByPatient(@PathVariable Long id) {
        return service.getHistoriqueByPatient(id);
    }
}