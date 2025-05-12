package com.hiepnh.banking_integration.application.usecase.dto;

import com.hiepnh.banking_integration.domain.entity.Account;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class AccountResponseDTO {
    private String id;
    private String name;
    private String alias;
//    private String status;
    private String assetCode;
    private String type;

    public AccountResponseDTO(Account account) {
        // Default constructor
        this.id = account.getId();
        this.name = account.getName();
        this.alias = account.getAlias();
//        this.status = account.getStatus();
        this.assetCode = account.getAssetCode();
        this.type = account.getType();
    }
}
