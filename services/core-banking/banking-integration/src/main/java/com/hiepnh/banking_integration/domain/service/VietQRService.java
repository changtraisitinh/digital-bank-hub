package com.hiepnh.banking_integration.domain.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.Base64;

@Service
public class VietQRService {
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${vietqr.client_id}")
    private String clientId;

    @Value("${vietqr.api_key}")
    private String apiKey;

    @Value("${vietqr.url_gen_qr}")
    private String urlGenQr;

    public byte[] generateQRCode(String bankCode, String accountNumber, String accountName, int amount) {
        // Build request body
        Map<String, Object> body = new HashMap<>();
        body.put("accountNo", accountNumber);
        body.put("accountName", accountName);
        body.put("acqId", bankCode);
        body.put("addInfo", "Ung Ho Quy Vac Xin");
        body.put("amount", String.valueOf(amount));
        body.put("template", "compact");

        // Set headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-client-id", clientId);
        headers.set("x-api-key", apiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        // Send POST request
        ResponseEntity<Map> response = restTemplate.exchange(
                urlGenQr,
                HttpMethod.POST,
                entity,
                Map.class
        );

        // Extract image data (base64) from response
        if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
            Map data = (Map) response.getBody().get("data");
            String base64Image = (String) data.get("qrDataURL");
            if (base64Image != null && base64Image.startsWith("data:image")) {
                String base64 = base64Image.substring(base64Image.indexOf(",") + 1);
                return Base64.getDecoder().decode(base64);
            }
        }
        throw new RuntimeException("Failed to generate QR code from VietQR");
    }
}