package com.hiepnh.transaction_service.domain.model.create_transaction;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class To {
    private String account;
    private Amount amount;
}
