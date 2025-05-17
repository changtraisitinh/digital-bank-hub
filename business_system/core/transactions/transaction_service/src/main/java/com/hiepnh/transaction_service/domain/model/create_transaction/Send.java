package com.hiepnh.transaction_service.domain.model.create_transaction;

import com.hiepnh.transaction_service.domain.model.transaction.Source;
import lombok.Getter;
import lombok.Setter;

import javax.print.attribute.standard.Destination;

@Getter
@Setter
public class Send {

    private String scale;
    private String value;
    private String asset;
    private Source source;
    private Destination distribute;
}
