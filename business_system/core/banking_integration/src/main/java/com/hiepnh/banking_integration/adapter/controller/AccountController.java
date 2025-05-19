package com.hiepnh.banking_integration.adapter.controller;

import com.hiepnh.banking_integration.application.port.in.AccountInputPort;
import com.hiepnh.banking_integration.application.usecase.dto.AccountRequestDTO;
import com.hiepnh.banking_integration.application.usecase.dto.AccountResponseDTO;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/accounts")
public class AccountController {

    private final AccountInputPort accountInputPort;

    public AccountController(AccountInputPort accountInputPort) {
        this.accountInputPort = accountInputPort;
    }

    @PostMapping("/process")
    public AccountResponseDTO processAccount(@RequestBody AccountRequestDTO requestDTO) {
        return accountInputPort.processAccount(requestDTO);
    }

    @PostMapping("/list")
    public List<AccountResponseDTO> listAccounts(@RequestBody AccountRequestDTO requestDTO) {
        return accountInputPort.listAccounts(requestDTO);
    }
}