package com.hiepnh.transaction_service.domain.entity;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Setter
@Getter
public class TransactionResponseWrapper {
    private List<Transaction> items;
    private int limit;
}
