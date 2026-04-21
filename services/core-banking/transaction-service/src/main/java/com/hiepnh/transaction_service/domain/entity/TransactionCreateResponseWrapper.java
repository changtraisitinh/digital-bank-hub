package com.hiepnh.transaction_service.domain.entity;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class TransactionCreateResponseWrapper {
    private String id;
    private String description;
    private String template;
    private Transaction.Status status;
    private String amount;
    private String amountScale;
    private String assetCode;
    private String chartOfAccountsGroupName;
    private List<String> source;
    private List<String> destination;
    private String pledgeId;
    private String organizationId;
    private String createdAt;
    private String updatedAt;
    private String deletedAt;
    private String from;
    private String to;
    private String asset;

    private String fee;
    private String scale;
    private String value;
    private String hash;
    private String errorMessage;
}
