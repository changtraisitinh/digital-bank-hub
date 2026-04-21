package com.hiepnh.banking_integration.domain.service;

import com.hiepnh.banking_integration.domain.entity.Account;

public interface AccountService {
    Account getAccountDetails(String accountId);

}
