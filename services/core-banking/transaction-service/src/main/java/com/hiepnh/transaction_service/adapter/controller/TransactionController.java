package com.hiepnh.transaction_service.adapter.controller;

import com.hiepnh.transaction_service.application.port.in.TransactionInputPort;
import com.hiepnh.transaction_service.application.port.out.TransactionOutputPort;
import com.hiepnh.transaction_service.application.usecase.dto.TransactionCreateRequestDTO;
import com.hiepnh.transaction_service.application.usecase.dto.TransactionCreateResponseDTO;
import com.hiepnh.transaction_service.application.usecase.dto.TransactionResponseDTO;
import com.hiepnh.transaction_service.domain.entity.Transaction;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/transactions")
public class TransactionController {

    private final TransactionInputPort transactionInputPort;
    private final TransactionOutputPort transactionOutputPort;

    public TransactionController(TransactionInputPort transactionInputPort, TransactionOutputPort transactionOutputPort) {
        this.transactionInputPort = transactionInputPort;
        this.transactionOutputPort = transactionOutputPort;
    }

    @GetMapping()
    public List<Transaction> getTransactions() {
        return transactionOutputPort.getAllTransactions();
    }

    @PostMapping(value = "/create", consumes = "application/json")
    public Transaction createTransaction(@RequestBody TransactionCreateRequestDTO transactionCreateRequestDTO) {
        return transactionOutputPort.createTransaction(transactionCreateRequestDTO);
    }
}
