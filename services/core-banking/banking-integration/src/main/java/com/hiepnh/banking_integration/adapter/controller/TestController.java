package com.hiepnh.banking_integration.adapter.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;

@RestController
@RequestMapping("/test")
public class TestController {

    @GetMapping("/http-client-error")
    public String throwHttpClientError() {
        throw HttpClientErrorException.create(HttpStatus.BAD_REQUEST, "Bad Request", null, null, null);
    }

    @GetMapping("/rest-client-error")
    public String throwRestClientError() {
        throw new RestClientException("Simulated RestClientException");
    }

    @GetMapping("/generic-error")
    public String throwGenericError() {
        throw new RuntimeException("Simulated Generic Exception");
    }
}