package com.hiepnh.transaction_service.domain.model.create_transaction;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Amount {
    private int scale;
    private int value;
    private String asset;
}
