package com.hiepnh.banking_integration.adapter.controller;

import com.hiepnh.banking_integration.domain.service.VietQRService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/qrcode")
public class QRCodeController {

    private final VietQRService vietQRService;

    public QRCodeController(VietQRService vietQRService) {
        this.vietQRService = vietQRService;
    }

    @GetMapping(value = "/generate", produces = MediaType.IMAGE_JPEG_VALUE)
    public ResponseEntity<byte[]> generateQRCode(
            @RequestParam String bankCode,
            @RequestParam String accountNumber,
            @RequestParam String accountName,
            @RequestParam int amount) {
        byte[] qrImage = vietQRService.generateQRCode(bankCode, accountNumber, accountName, amount);
        return ResponseEntity.ok().contentType(MediaType.IMAGE_JPEG).body(qrImage);
    }
}
