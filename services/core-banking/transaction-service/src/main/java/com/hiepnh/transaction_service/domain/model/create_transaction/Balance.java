package com.hiepnh.transaction_service.domain.model.create_transaction;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Balance {
    private String available;
    private String onHold;
    private String scale;
}
