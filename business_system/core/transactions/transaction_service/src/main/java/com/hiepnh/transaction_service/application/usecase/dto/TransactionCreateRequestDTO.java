package com.hiepnh.transaction_service.application.usecase.dto;

import com.hiepnh.transaction_service.domain.model.create_transaction.Send;
import com.hiepnh.transaction_service.domain.model.transaction.Distribute;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class TransactionCreateRequestDTO {
    private String description;
    private Send send;

}
