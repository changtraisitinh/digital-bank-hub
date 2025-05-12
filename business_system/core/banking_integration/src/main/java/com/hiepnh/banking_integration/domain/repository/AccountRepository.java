package com.hiepnh.banking_integration.domain.repository;

import com.hiepnh.banking_integration.domain.entity.Account;

public interface AccountRepository {
    Account findByAccountId(String accountId);
}
