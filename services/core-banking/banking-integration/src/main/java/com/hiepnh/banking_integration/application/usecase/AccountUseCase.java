package com.hiepnh.banking_integration.application.usecase;

import com.hiepnh.banking_integration.application.port.in.AccountInputPort;
import com.hiepnh.banking_integration.application.port.out.AccountOutputPort;
import com.hiepnh.banking_integration.application.usecase.dto.AccountRequestDTO;
import com.hiepnh.banking_integration.application.usecase.dto.AccountResponseDTO;
import com.hiepnh.banking_integration.domain.entity.Account;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class AccountUseCase implements AccountInputPort {

    private final AccountOutputPort outputPort;

    public AccountUseCase(AccountOutputPort outputPort) {
        this.outputPort = outputPort;
    }

    @Override
    public AccountResponseDTO processAccount(AccountRequestDTO requestDTO) {
        Account account = outputPort.fetchAccountDetails(requestDTO.getAccountId());
        return new AccountResponseDTO(account);
    }

    @Override
    public List<AccountResponseDTO> listAccounts(AccountRequestDTO requestDTO) {
        // Implement the logic to list accounts
        // This is a placeholder implementation
        // In a real-world scenario, you would fetch the list of accounts from the database or another source
        List<Account> accounts = outputPort.fetchAccounts();
        List<AccountResponseDTO> accountResponseDTOs = new ArrayList<>();
        for (Account account : accounts) {
            accountResponseDTOs.add(new AccountResponseDTO(account));
        }
        return new ArrayList<>(accountResponseDTOs);
    }
}