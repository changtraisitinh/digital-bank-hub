package com.hiepnh.banking_integration.application.port.in;

import com.hiepnh.banking_integration.application.usecase.dto.AccountRequestDTO;
import com.hiepnh.banking_integration.application.usecase.dto.AccountResponseDTO;

import java.util.List;

public interface AccountInputPort {
    AccountResponseDTO processAccount(AccountRequestDTO requestDTO);
    List<AccountResponseDTO> listAccounts(AccountRequestDTO requestDTO);
}
