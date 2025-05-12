package com.hiepnh.banking_integration.application.usecase.dto;

import lombok.Getter;

public class AccountRequestDTO {
    @Getter
    private String accountId;

    public AccountRequestDTO() {}

    public AccountRequestDTO(String accountId) {
        this.accountId = accountId;
    }
}
