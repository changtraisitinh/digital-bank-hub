package com.hiepnh.banking_integration.domain.entity;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class AccountResponseWrapper {
    private List<Account> items;
    private int page;
    private int limit;
}
