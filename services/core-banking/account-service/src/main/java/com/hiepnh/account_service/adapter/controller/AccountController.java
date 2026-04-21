package com.hiepnh.account_service.adapter.controller;

import com.hiepnh.account_service.application.port.in.AccountInputPort;
import com.hiepnh.account_service.application.usecase.dto.AccountRequestDTO;
import com.hiepnh.account_service.application.usecase.dto.AccountResponseDTO;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/accounts")
public class AccountController {

    private final AccountInputPort accountInputPort;

    public AccountController(AccountInputPort accountInputPort) {
        this.accountInputPort = accountInputPort;
    }

    @GetMapping()
    public List<AccountResponseDTO> getAccounts(@RequestBody AccountRequestDTO requestDTO) {
        return accountInputPort.listAccounts(requestDTO);
    }

//    @GetMapping("/{accountId}")
//    public AccountResponseDTO getAccountDetails(@PathVariable String accountId) {
//        AccountRequestDTO requestDTO = new AccountRequestDTO(accountId);
//        return accountInputPort.getAccountDetails(requestDTO);
//    }

    @PostMapping("/list")
    public List<AccountResponseDTO> listAccounts(@RequestBody AccountRequestDTO requestDTO) {
        return accountInputPort.listAccounts(requestDTO);
    }
}
