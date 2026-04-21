package com.hiepnh.transaction_service.application.port.out;

import com.hiepnh.transaction_service.application.usecase.dto.TransactionCreateRequestDTO;
import com.hiepnh.transaction_service.application.usecase.dto.TransactionCreateResponseDTO;
import com.hiepnh.transaction_service.application.usecase.dto.TransactionResponseDTO;
import com.hiepnh.transaction_service.domain.entity.Transaction;

import java.util.List;

public interface TransactionOutputPort {

    Transaction createTransaction(TransactionCreateRequestDTO transactionCreateRequestDTO);

    List<Transaction> getAllTransactions();
}
