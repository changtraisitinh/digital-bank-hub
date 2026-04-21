package com.hiepnh.transaction_service.domain.model.transaction;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class From {
    private String account;
    private Amount amount;
}
