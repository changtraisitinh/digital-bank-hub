package com.hiepnh.iam_service.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class AuthController {

    @GetMapping("/public")
    public String publicEndpoint() {
        return "This is a public endpoint.";
    }

    @GetMapping("/user")
    public String userEndpoint() {
        return "This endpoint is accessible by users with the USER role.";
    }

    @GetMapping("/admin")
    public String adminEndpoint() {
        return "This endpoint is accessible by users with the ADMIN role.";
    }
}