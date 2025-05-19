package com.hiepnh.transaction_service.domain.model.create_transaction;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class Source {
    private List<From> from;
}
