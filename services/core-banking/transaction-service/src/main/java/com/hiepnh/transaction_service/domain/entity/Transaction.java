package com.hiepnh.transaction_service.domain.entity;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class Transaction {
    private String id;
    private String description;
    private String template;
    private int amount;
    private int amountScale;
    private String assetCode;
    private String chartOfAccountsGroupName;
    private String createdAt;
    private String updatedAt;
    private String deletedAt;
    private Status status;
    private List<String> source;
    private List<String> destination;

    @Getter
    @Setter
    public static class Status {
        private String code;
        private String description;
    }
}
