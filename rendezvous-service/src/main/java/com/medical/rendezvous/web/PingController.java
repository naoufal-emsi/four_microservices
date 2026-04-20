package com.medical.rendezvous.web;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/ping")
public class PingController {

    private final RestTemplate restTemplate;

    public PingController(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> ping(@RequestParam String url) {
        Map<String, Object> result = new HashMap<>();
        long start = System.currentTimeMillis();
        try {
            restTemplate.getForObject(url, String.class);
            long latency = System.currentTimeMillis() - start;
            result.put("status", "ok");
            result.put("latency", latency);
            result.put("url", url);
        } catch (Exception e) {
            long latency = System.currentTimeMillis() - start;
            result.put("status", "error");
            result.put("latency", latency);
            result.put("url", url);
            result.put("error", e.getMessage());
        }
        return ResponseEntity.ok(result);
    }
}
