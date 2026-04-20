package com.medical.notification.repository;

import com.medical.notification.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByRendezVousId(Long rendezVousId);
}