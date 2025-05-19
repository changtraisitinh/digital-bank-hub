package com.hiepnh.banking_integration.application.port.out;

import com.hiepnh.banking_integration.application.usecase.dto.AccountResponseDTO;
import com.hiepnh.banking_integration.domain.entity.Account;

import java.util.List;

public interface AccountOutputPort {
    Account fetchAccountDetails(String accountId);
    List<Account> fetchAccounts();
}
