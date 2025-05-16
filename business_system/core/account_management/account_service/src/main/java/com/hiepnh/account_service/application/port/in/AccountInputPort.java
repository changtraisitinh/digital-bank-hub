package com.hiepnh.account_service.application.port.in;

import com.hiepnh.account_service.application.usecase.dto.AccountRequestDTO;
import com.hiepnh.account_service.application.usecase.dto.AccountResponseDTO;

import java.util.List;

public interface AccountInputPort {
    List<AccountResponseDTO> listAccounts(AccountRequestDTO requestDTO);
}