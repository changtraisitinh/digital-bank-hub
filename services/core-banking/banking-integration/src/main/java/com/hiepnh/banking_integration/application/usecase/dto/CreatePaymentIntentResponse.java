package com.hiepnh.banking_integration.application.usecase.dto;

import com.hiepnh.banking_integration.application.usecase.dto.common.BaseResponse;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class CreatePaymentIntentResponse {
    private int code;
    private String message;
    private String clientSecret;
}
