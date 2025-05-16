package com.hiepnh.account_service.application.port.out;

import com.hiepnh.account_service.domain.entity.Account;

import java.util.List;

public interface AccountOutputPort {
    Account fetchAccountDetails(String accountId);
    List<Account> fetchAccounts();
}
