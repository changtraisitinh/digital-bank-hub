package com.hiepnh.transaction_service.domain.model.create_transaction;


import com.hiepnh.transaction_service.domain.entity.Transaction;
import com.hiepnh.transaction_service.domain.model.transaction.Amount;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Operation {
    private String id;
    private String transactionId;
    private String type;
    private String description;
    private String assetCode;
    private String chartOfAccounts;
    private Amount amount;
    private Balance balance;
    private Transaction.Status status;
    private String accountId;
    private String accountAlias;
    private String balanceId;
    private String pledgeId;
    private String organizationId;
    private String createdAt;
    private String updatedAt;
    private String deletedAt;
    private Metadata metadata;
}
