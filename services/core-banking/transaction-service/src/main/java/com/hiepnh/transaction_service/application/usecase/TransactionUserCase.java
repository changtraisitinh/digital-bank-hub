package com.hiepnh.transaction_service.application.usecase;

import com.hiepnh.transaction_service.application.port.in.TransactionInputPort;
import com.hiepnh.transaction_service.application.port.out.TransactionOutputPort;
import org.springframework.stereotype.Service;

@Service
public class TransactionUserCase implements TransactionInputPort {
    private final TransactionOutputPort transactionOutputPort;

    public TransactionUserCase(TransactionOutputPort transactionOutputPort) {
        this.transactionOutputPort = transactionOutputPort;
    }


}
