package com.hiepnh.banking_integration.application.usecase.dto.common;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
@Getter
@Setter
public class BaseResponse {
    private int code;
    private String message;
}
