package com.hiepnh.account_service.application.usecase;

import com.hiepnh.account_service.application.port.in.AccountInputPort;
import com.hiepnh.account_service.application.port.out.AccountOutputPort;
import com.hiepnh.account_service.application.usecase.dto.AccountRequestDTO;
import com.hiepnh.account_service.application.usecase.dto.AccountResponseDTO;
import com.hiepnh.account_service.domain.entity.Account;
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