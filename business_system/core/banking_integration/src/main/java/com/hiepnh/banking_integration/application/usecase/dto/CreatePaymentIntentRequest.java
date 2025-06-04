package com.hiepnh.banking_integration.application.usecase.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
@Setter
@Getter
public class CreatePaymentIntentRequest {
    private String amount;
    private String currency;
    private String description;

}
