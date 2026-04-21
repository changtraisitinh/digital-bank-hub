package com.hiepnh.transaction_service.domain.model.transaction;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Amount {
    private String scale;
    private String value;
    private String asset;
}
